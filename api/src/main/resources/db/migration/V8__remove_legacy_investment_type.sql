UPDATE investment
SET investment_type = 'VARIABLE_INCOME'
WHERE investment_type = 'LEGACY';

ALTER TABLE investment
    ALTER COLUMN investment_type DROP DEFAULT,
    DROP CONSTRAINT ck_investment_type,
    ADD CONSTRAINT ck_investment_type
        CHECK (investment_type IN ('FIXED_INCOME', 'VARIABLE_INCOME'));
