package com.InvesteAI.backend.schema;

import com.InvesteAI.backend.model.Profile;
import com.InvesteAI.backend.model.User;
import org.flywaydb.core.Flyway;
import org.hibernate.boot.MetadataSources;
import org.hibernate.boot.registry.StandardServiceRegistry;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * PostgreSQL 18 integration checks for the fresh V1 migration, Hibernate schema
 * validation, user/profile/image ownership, financial and cash-flow constraints,
 * generated unrealized profit, and transaction history. Configure
 * POSTGRES_TEST_URL, POSTGRES_TEST_USER, and POSTGRES_TEST_PASSWORD for a disposable
 * PostgreSQL database; the test creates and drops only its own randomly named
 * schema and never calls Flyway clean.
 */
@EnabledIfEnvironmentVariable(named = "POSTGRES_TEST_URL", matches = "jdbc:postgresql:.*")
class PostgresV1SchemaTest {

    private static String jdbcUrl;
    private static String username;
    private static String password;
    private static String schemaName;

    @BeforeAll
    static void migrateFreshSchemaAndValidateMappings() {
        jdbcUrl = System.getenv("POSTGRES_TEST_URL");
        username = System.getenv("POSTGRES_TEST_USER");
        password = System.getenv("POSTGRES_TEST_PASSWORD");
        Assumptions.assumeTrue(username != null && !username.isBlank()
                        && password != null,
                "PostgreSQL test URL, user and password must all be configured");

        schemaName = "investeai_test_" + UUID.randomUUID().toString().replace("-", "");
        Flyway.configure()
                .dataSource(jdbcUrl, username, password)
                .defaultSchema(schemaName)
                .schemas(schemaName)
                .locations("classpath:db/migration")
                .cleanDisabled(true)
                .load()
                .migrate();

        validateUserAndProfileMappings();
    }

    @AfterAll
    static void dropTemporarySchema() throws SQLException {
        if (schemaName == null) {
            return;
        }

        try (Connection connection = DriverManager.getConnection(jdbcUrl, username, password);
             Statement statement = connection.createStatement()) {
            statement.execute("DROP SCHEMA IF EXISTS \"" + schemaName + "\" CASCADE");
        }
    }

    /**
     * Intent: a purchase must remain distinct from another purchase of the same
     * stock, and missing quote data must produce unknown rather than zero profit.
     * Setup: insert two same-symbol purchases, one without a current price and one
     * with a current price and fewer remaining shares.
     * Expected: both rows coexist; the first profit is SQL NULL and the second is
     * (12.75 - 10.25) * 4 = 10.00.
     */
    @Test
    void storesSeparatePurchasesAndCalculatesNullableUnrealizedProfit() throws SQLException {
        try (Connection connection = connection()) {
            UUID userId = createUser(connection, "52998224725");
            Purchase withoutQuote = insertPurchase(connection, userId,
                    new BigDecimal("10.25"), new BigDecimal("4"), new BigDecimal("4"), null);
            Purchase withQuote = insertPurchase(connection, userId,
                    new BigDecimal("10.25"), new BigDecimal("5"), new BigDecimal("4"),
                    new BigDecimal("12.75"));

            assertNotNull(withoutQuote.id());
            assertNull(withoutQuote.profit());
            assertNotNull(withQuote.id());
            assertEquals(0, new BigDecimal("10.00").compareTo(withQuote.profit()));
            assertEquals(2, countPurchasesForSymbol(connection, userId));

            assertConstraintViolation("23514", () -> insertPurchase(connection, userId,
                    new BigDecimal("10.25"), new BigDecimal("5"), new BigDecimal("6"), null));
        }
    }

    /**
     * Intent: buy/sell history must reference a purchase, carry valid execution
     * snapshots, and remain protected from deletion of its investment.
     * Setup: add two purchases and one BUY/SELL pair for each, then try invalid rows
     * and deleting a purchase with linked history.
     * Expected: each sale belongs to its own purchase, invalid direction/quantity
     * and a history-erasing delete are rejected by PostgreSQL.
     */
    @Test
    void enforcesTransactionSnapshotsAndRetainsLinkedHistory() throws SQLException {
        try (Connection connection = connection()) {
            UUID userId = createUser(connection, "11144477735");
            UUID investmentId = insertPurchase(connection, userId,
                    new BigDecimal("10.00"), new BigDecimal("3"), new BigDecimal("3"),
                    new BigDecimal("12.00")).id();
            UUID secondInvestmentId = insertPurchase(connection, userId,
                    new BigDecimal("11.00"), new BigDecimal("2"), new BigDecimal("2"),
                    new BigDecimal("12.00")).id();

            assertConstraintViolation("23514", () -> insertTransaction(connection, investmentId,
                    "BUY", BigDecimal.ZERO, new BigDecimal("10.00"), BigDecimal.ZERO));
            insertTransaction(connection, investmentId, "BUY",
                    new BigDecimal("3"), new BigDecimal("10.00"), new BigDecimal("0.10"));
            insertTransaction(connection, investmentId, "SELL",
                    new BigDecimal("1"), new BigDecimal("12.00"), new BigDecimal("0.10"));
            insertTransaction(connection, secondInvestmentId, "BUY",
                    new BigDecimal("2"), new BigDecimal("11.00"), BigDecimal.ZERO);
            insertTransaction(connection, secondInvestmentId, "SELL",
                    BigDecimal.ONE, new BigDecimal("12.00"), BigDecimal.ZERO);
            assertConstraintViolation("23514", () -> insertTransaction(connection, investmentId,
                    "NOPE", BigDecimal.ONE, new BigDecimal("12.00"), BigDecimal.ZERO));
            assertConstraintViolation("23514", () -> insertTransaction(connection, investmentId,
                    "SELL", BigDecimal.ONE, new BigDecimal("12.00"), new BigDecimal("-0.01")));
            assertEquals(2, countTransactions(connection, investmentId));
            assertEquals(2, countTransactions(connection, secondInvestmentId));
            assertConstraintViolation("23001", () -> deletePurchase(connection, investmentId));
            assertEquals(2, countTransactions(connection, investmentId));
        }
    }

    /**
     * Intent: a profile owns at most one image, images cannot exist without their
     * profile, and deleting the profile removes its image bytes.
     * Setup: create a user/profile/image, then attempt duplicate and orphan images
     * before deleting the profile.
     * Expected: uniqueness and foreign-key violations are rejected and profile
     * deletion cascades only through profile-owned image data.
     */
    @Test
    void enforcesProfileImageOwnershipAndCascade() throws SQLException {
        try (Connection connection = connection()) {
            UUID userId = createUser(connection, "12345678909");
            UUID profileId = insertProfile(connection, userId, "Profile owner");
            insertProfileImage(connection, profileId);

            assertConstraintViolation("23505", () -> insertProfileImage(connection, profileId));
            assertConstraintViolation("23503", () -> insertProfileImage(connection, UUID.randomUUID()));
            assertConstraintViolation("23505", () -> insertProfile(connection, userId, "Duplicate profile"));
            assertEquals(1, countProfileImages(connection, profileId));

            deleteProfile(connection, profileId);
            assertEquals(0, countProfileImages(connection, profileId));
        }
    }

    /**
     * Intent: every cash-flow row is one real occurrence with a positive amount and
     * an explicit money direction; outgoing rows must be classified.
     * Setup: insert an incoming row without classification and fixed/variable
     * outgoing rows, then attempt invalid amounts, directions and missing classes.
     * Expected: the three valid occurrences persist and each invalid row violates
     * its named PostgreSQL check constraint.
     */
    @Test
    void enforcesActualCashFlowDirectionAmountAndExpenseClassification() throws SQLException {
        try (Connection connection = connection()) {
            UUID userId = createUser(connection, "93541134780");
            insertCashFlow(connection, userId, new BigDecimal("2500.00"), "IN", null);
            insertCashFlow(connection, userId, new BigDecimal("900.00"), "OUT", "FIXED");
            insertCashFlow(connection, userId, new BigDecimal("75.50"), "OUT", "VARIABLE");

            assertEquals(3, countCashFlows(connection, userId));
            assertConstraintViolation("23514", () -> insertCashFlow(connection, userId,
                    BigDecimal.ZERO, "IN", null));
            assertConstraintViolation("23514", () -> insertCashFlow(connection, userId,
                    BigDecimal.ONE, "BAD", null));
            assertConstraintViolation("23514", () -> insertCashFlow(connection, userId,
                    BigDecimal.ONE, "OUT", null));
            assertConstraintViolation("23514", () -> insertCashFlow(connection, userId,
                    BigDecimal.ONE, "OUT", "OTHER"));
            assertConstraintViolation("23503", () -> insertCashFlow(connection, UUID.randomUUID(),
                    BigDecimal.ONE, "IN", null));
            assertEquals(3, countCashFlows(connection, userId));
        }
    }

    /**
     * Intent: a goal must have a positive target, non-negative progress, and an end
     * date no earlier than its start date.
     * Setup: insert a valid goal and then submit invalid values and date ordering.
     * Expected: PostgreSQL accepts the valid goal and rejects each invalid case.
     */
    @Test
    void enforcesGoalValueAndDateRanges() throws SQLException {
        try (Connection connection = connection()) {
            UUID userId = createUser(connection, "98765432100");
            insertGoal(connection, userId, BigDecimal.ZERO, new BigDecimal("100.00"),
                    LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31));

            assertConstraintViolation("23514", () -> insertGoal(connection, userId,
                    new BigDecimal("-1.00"), new BigDecimal("100.00"),
                    LocalDate.of(2026, 1, 1), null));
            assertConstraintViolation("23514", () -> insertGoal(connection, userId,
                    BigDecimal.ZERO, BigDecimal.ZERO,
                    LocalDate.of(2026, 1, 1), null));
            assertConstraintViolation("23514", () -> insertGoal(connection, userId,
                    BigDecimal.ZERO, new BigDecimal("100.00"),
                    LocalDate.of(2026, 6, 1), LocalDate.of(2026, 5, 31)));
        }
    }

    /**
     * Intent: PostgreSQL must enforce the stored CPF format and uniqueness even if
     * a request bypasses the Java validator.
     * Setup: create one valid user, then try a duplicate and a non-digit CPF.
     * Expected: duplicate and malformed values are rejected by database constraints.
     */
    @Test
    void enforcesCpfDatabaseConstraints() throws SQLException {
        try (Connection connection = connection()) {
            createUser(connection, "24681357928");

            assertConstraintViolation("23505", () -> createUser(connection, "24681357928"));
            assertConstraintViolation("23514", () -> createUser(connection, "1234567890A"));
        }
    }

    private static void validateUserAndProfileMappings() {
        StandardServiceRegistry registry = new StandardServiceRegistryBuilder()
                .applySetting("hibernate.connection.url", schemaScopedJdbcUrl())
                .applySetting("hibernate.connection.username", username)
                .applySetting("hibernate.connection.password", password)
                .applySetting("hibernate.connection.driver_class", "org.postgresql.Driver")
                .applySetting("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect")
                .applySetting("hibernate.hbm2ddl.auto", "validate")
                .build();
        try {
            new MetadataSources(registry)
                    .addAnnotatedClass(User.class)
                    .addAnnotatedClass(Profile.class)
                    .addAnnotatedClass(com.InvesteAI.backend.model.Form.class)
                    .buildMetadata()
                    .buildSessionFactory()
                    .close();
        } finally {
            StandardServiceRegistryBuilder.destroy(registry);
        }
    }

    @Test
    void materializesMonthlyOccurrencesOnceAndRetainsDeletedOccurrence() throws Exception {
        var source = new org.springframework.jdbc.datasource.DriverManagerDataSource(
                jdbcUrl + (jdbcUrl.contains("?") ? "&" : "?") + "currentSchema=" + schemaName, username, password);
        var jdbc = org.springframework.jdbc.core.simple.JdbcClient.create(source);
        var transactions = new org.springframework.transaction.support.TransactionTemplate(
                new org.springframework.jdbc.datasource.DataSourceTransactionManager(source));
        var service = new com.InvesteAI.backend.service.CashFlowRecurrenceService(jdbc);
        UUID user;
        try (var connection = connection()) {
            user = createUser(connection, "56789012341");
        }
        var currentMonth = java.time.YearMonth.now(java.time.ZoneId.of("America/Sao_Paulo"));
        var first = currentMonth.minusMonths(3).atDay(1);
        var input = new com.InvesteAI.backend.service.CashFlowRecurrenceService.Input(
                "Aluguel", "Moradia", new BigDecimal("1200"), first, currentMonth.minusMonths(1).atEndOfMonth(), null);
        var rule = transactions.execute(status -> service.create(user, input));
        try (var workers = java.util.concurrent.Executors.newFixedThreadPool(2)) {
            var firstRead = workers.submit(() -> transactions.executeWithoutResult(status -> service.materialize(user)));
            var secondRead = workers.submit(() -> transactions.executeWithoutResult(status -> service.materialize(user)));
            firstRead.get();
            secondRead.get();
        }
        var flows = jdbc.sql("SELECT cash_flow_id FROM cash_flow_occurrence WHERE recurrence_id = :id ORDER BY period")
                .param("id", rule.id()).query(UUID.class).list();
        assertEquals(3, flows.size());
        jdbc.sql("DELETE FROM cash_flow WHERE cash_flow_id = :id").param("id", flows.getFirst()).update();
        transactions.executeWithoutResult(status -> service.materialize(user));
        assertEquals(2L, jdbc.sql("SELECT COUNT(*) FROM cash_flow WHERE user_id = :id")
                .param("id", user).query(Long.class).single());
        assertEquals(LocalDate.of(2024, 2, 29),
                com.InvesteAI.backend.service.CashFlowRecurrenceService.dueDate(java.time.YearMonth.of(2024, 2), 31));
        assertEquals(LocalDate.of(2024, 3, 31),
                com.InvesteAI.backend.service.CashFlowRecurrenceService.dueDate(java.time.YearMonth.of(2024, 3), 31));
    }

    private static Connection connection() throws SQLException {
        return DriverManager.getConnection(schemaScopedJdbcUrl(), username, password);
    }

    private static String schemaScopedJdbcUrl() {
        return jdbcUrl + (jdbcUrl.contains("?") ? "&" : "?") + "currentSchema=" + schemaName;
    }

    private static UUID createUser(Connection connection, String cpf) throws SQLException {
        String sql = "INSERT INTO users (email, cpf, password_hash) VALUES (?, ?, ?) RETURNING id";
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, UUID.randomUUID() + "@example.com");
            statement.setString(2, cpf);
            statement.setString(3, "test-hash");
            try (ResultSet result = statement.executeQuery()) {
                result.next();
                return result.getObject("id", UUID.class);
            }
        }
    }

    private static UUID insertProfile(Connection connection, UUID userId, String name) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO profiles (user_id, name) VALUES (?, ?) RETURNING profile_id")) {
            statement.setObject(1, userId);
            statement.setString(2, name);
            try (ResultSet result = statement.executeQuery()) {
                result.next();
                return result.getObject("profile_id", UUID.class);
            }
        }
    }

    private static void insertProfileImage(Connection connection, UUID profileId) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO profile_images (profile_id, image_data, content_type) VALUES (?, ?, ?)")) {
            statement.setObject(1, profileId);
            statement.setBytes(2, new byte[]{1, 2, 3});
            statement.setString(3, "image/png");
            statement.executeUpdate();
        }
    }

    private static int countProfileImages(Connection connection, UUID profileId) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT count(*) FROM profile_images WHERE profile_id = ?")) {
            statement.setObject(1, profileId);
            try (ResultSet result = statement.executeQuery()) {
                result.next();
                return result.getInt(1);
            }
        }
    }

    private static void deleteProfile(Connection connection, UUID profileId) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "DELETE FROM profiles WHERE profile_id = ?")) {
            statement.setObject(1, profileId);
            statement.executeUpdate();
        }
    }

    private static void insertCashFlow(
            Connection connection,
            UUID userId,
            BigDecimal amount,
            String direction,
            String classification
    ) throws SQLException {
        String sql = """
                INSERT INTO cash_flow (user_id, flow_date, amount, direction, classification)
                VALUES (?, ?, ?, ?, ?)
                """;
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setObject(1, userId);
            statement.setObject(2, LocalDate.of(2026, 1, 20));
            statement.setBigDecimal(3, amount);
            statement.setString(4, direction);
            if (classification == null) {
                statement.setNull(5, Types.VARCHAR);
            } else {
                statement.setString(5, classification);
            }
            statement.executeUpdate();
        }
    }

    private static int countCashFlows(Connection connection, UUID userId) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT count(*) FROM cash_flow WHERE user_id = ?")) {
            statement.setObject(1, userId);
            try (ResultSet result = statement.executeQuery()) {
                result.next();
                return result.getInt(1);
            }
        }
    }

    private static void insertGoal(
            Connection connection,
            UUID userId,
            BigDecimal currentValue,
            BigDecimal targetValue,
            LocalDate startDate,
            LocalDate endDate
    ) throws SQLException {
        String sql = """
                INSERT INTO goal (user_id, name, start_date, current_value, target_value, end_date)
                VALUES (?, 'Example goal', ?, ?, ?, ?)
                """;
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setObject(1, userId);
            statement.setObject(2, startDate);
            statement.setBigDecimal(3, currentValue);
            statement.setBigDecimal(4, targetValue);
            if (endDate == null) {
                statement.setNull(5, Types.DATE);
            } else {
                statement.setObject(5, endDate);
            }
            statement.executeUpdate();
        }
    }

    private static Purchase insertPurchase(
            Connection connection,
            UUID userId,
            BigDecimal purchasePrice,
            BigDecimal originalQuantity,
            BigDecimal remainingQuantity,
            BigDecimal currentPrice
    ) throws SQLException {
        String sql = """
                INSERT INTO investment
                    (user_id, name, symbol, purchase_date, purchase_unit_price,
                     original_quantity, remaining_quantity, current_price)
                VALUES (?, 'Example stock', 'EXM', ?, ?, ?, ?, ?)
                RETURNING investment_id, profit
                """;
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setObject(1, userId);
            statement.setObject(2, LocalDate.of(2026, 1, 15));
            statement.setBigDecimal(3, purchasePrice);
            statement.setBigDecimal(4, originalQuantity);
            statement.setBigDecimal(5, remainingQuantity);
            if (currentPrice == null) {
                statement.setNull(6, java.sql.Types.NUMERIC);
            } else {
                statement.setBigDecimal(6, currentPrice);
            }
            try (ResultSet result = statement.executeQuery()) {
                result.next();
                return new Purchase(result.getObject("investment_id", UUID.class),
                        result.getBigDecimal("profit"));
            }
        }
    }

    private static int countPurchasesForSymbol(Connection connection, UUID userId) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT count(*) FROM investment WHERE user_id = ? AND symbol = 'EXM'")) {
            statement.setObject(1, userId);
            try (ResultSet result = statement.executeQuery()) {
                result.next();
                return result.getInt(1);
            }
        }
    }

    private static void insertTransaction(
            Connection connection,
            UUID investmentId,
            String direction,
            BigDecimal quantity,
            BigDecimal unitPrice,
            BigDecimal fee
    ) throws SQLException {
        String sql = """
                INSERT INTO "transaction"
                    (investment_id, direction, quantity, unit_price, executed_at, fee)
                VALUES (?, ?, ?, ?, ?, ?)
                """;
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setObject(1, investmentId);
            statement.setString(2, direction);
            statement.setBigDecimal(3, quantity);
            statement.setBigDecimal(4, unitPrice);
            statement.setTimestamp(5, Timestamp.from(Instant.parse("2026-01-16T12:00:00Z")));
            statement.setBigDecimal(6, fee);
            statement.executeUpdate();
        }
    }

    private static int countTransactions(Connection connection, UUID investmentId) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT count(*) FROM \"transaction\" WHERE investment_id = ?")) {
            statement.setObject(1, investmentId);
            try (ResultSet result = statement.executeQuery()) {
                result.next();
                return result.getInt(1);
            }
        }
    }

    private static void deletePurchase(Connection connection, UUID investmentId) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "DELETE FROM investment WHERE investment_id = ?")) {
            statement.setObject(1, investmentId);
            statement.executeUpdate();
        }
    }

    private static void assertConstraintViolation(String sqlState, SqlAction action) {
        SQLException exception = assertThrows(SQLException.class, action::run);
        assertEquals(sqlState, exception.getSQLState());
    }

    private record Purchase(UUID id, BigDecimal profit) {
    }

    @FunctionalInterface
    private interface SqlAction {
        void run() throws SQLException;
    }
}