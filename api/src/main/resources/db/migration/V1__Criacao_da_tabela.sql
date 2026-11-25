CREATE TABLE users
(
    id            UUID         NOT NULL DEFAULT uuidv7(),
    email         VARCHAR(255) NOT NULL,
    cpf           VARCHAR(11)  NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status        VARCHAR(35)  NOT NULL DEFAULT 'ACTIVE',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT uq_users_cpf UNIQUE (cpf),
    CONSTRAINT ck_users_cpf_format CHECK (cpf ~ '^[0-9]{11}$'),
    CONSTRAINT ck_users_status CHECK (status IN ('ACTIVE', 'DISABLED'))
);

CREATE TABLE profiles
(
    profile_id  UUID         NOT NULL DEFAULT uuidv7(),
    user_id     UUID         NOT NULL,
    name        VARCHAR(255) NOT NULL,
    nickname    VARCHAR(255),
    occupation  TEXT,
    salary      NUMERIC(19, 2),
    salary_date DATE,

    CONSTRAINT pk_profiles PRIMARY KEY (profile_id),
    CONSTRAINT uq_profiles_user UNIQUE (user_id),
    CONSTRAINT fk_profiles_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT ck_profiles_salary CHECK (salary IS NULL OR salary >= 0)
);

CREATE TABLE form
(
    form_id          UUID    NOT NULL DEFAULT uuidv7(),
    profile_id       UUID    NOT NULL,
    hear_about_us    TEXT,
    how_wants_to_use TEXT,
    open_finance     BOOLEAN NOT NULL DEFAULT false,
    current_banks    TEXT,

    CONSTRAINT pk_forms PRIMARY KEY (form_id),
    CONSTRAINT fk_forms_profile FOREIGN KEY (profile_id)
        REFERENCES profiles (profile_id) ON DELETE CASCADE
);

CREATE TABLE profile_images
(
    profile_id   UUID         NOT NULL,
    image_data   BYTEA        NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_profile_images PRIMARY KEY (profile_id),
    CONSTRAINT fk_profile_images_profile FOREIGN KEY (profile_id)
        REFERENCES profiles (profile_id) ON DELETE CASCADE
);

-- remaining_quantity is stored separately from transaction history; no SQL trigger
-- synchronizes the two or prevents overselling across multiple transaction rows.
CREATE TABLE investment
(
    investment_id       UUID           NOT NULL DEFAULT uuidv7(),
    user_id             UUID           NOT NULL,
    name                VARCHAR(380)   NOT NULL,
    symbol              VARCHAR(25)    NOT NULL,
    purchase_date       DATE           NOT NULL,
    purchase_unit_price NUMERIC(24, 10) NOT NULL,
    original_quantity   NUMERIC(24, 10) NOT NULL,
    remaining_quantity  NUMERIC(24, 10) NOT NULL,
    current_price       NUMERIC(24, 10),
    -- This is unrealized profit only; it remains NULL until a current price exists.
    profit              NUMERIC(49, 20) GENERATED ALWAYS AS
        ((current_price - purchase_unit_price) * remaining_quantity) STORED,

    CONSTRAINT pk_investment PRIMARY KEY (investment_id),
    CONSTRAINT fk_investment_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT ck_investment_purchase_price CHECK (purchase_unit_price >= 0),
    CONSTRAINT ck_investment_quantities CHECK (
        original_quantity > 0
        AND remaining_quantity >= 0
        AND remaining_quantity <= original_quantity
    ),
    CONSTRAINT ck_investment_current_price CHECK (current_price IS NULL OR current_price >= 0)
);

CREATE TABLE cash_flow
(
    cash_flow_id   UUID           NOT NULL DEFAULT uuidv7(),
    user_id        UUID           NOT NULL,
    flow_date      DATE           NOT NULL,
    amount         NUMERIC(19, 2) NOT NULL,
    direction      VARCHAR(3)     NOT NULL,
    description    TEXT,
    category       VARCHAR(100),
    classification VARCHAR(8),

    CONSTRAINT pk_cash_flow PRIMARY KEY (cash_flow_id),
    CONSTRAINT fk_cash_flow_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT ck_cash_flow_amount CHECK (amount > 0),
    CONSTRAINT ck_cash_flow_direction CHECK (direction IN ('IN', 'OUT')),
    CONSTRAINT ck_cash_flow_classification CHECK (
        classification IS NULL OR classification IN ('FIXED', 'VARIABLE')
    ),
    CONSTRAINT ck_cash_flow_out_classification CHECK (
        direction <> 'OUT' OR classification IS NOT NULL
    )
);

CREATE INDEX idx_cash_flow_user_date ON cash_flow (user_id, flow_date);

CREATE TABLE goal
(
    goal_id       UUID           NOT NULL DEFAULT uuidv7(),
    user_id       UUID           NOT NULL,
    name          VARCHAR(255)   NOT NULL,
    start_date    DATE           NOT NULL,
    description   TEXT,
    current_value NUMERIC(19, 2) NOT NULL,
    target_value  NUMERIC(19, 2) NOT NULL,
    end_date      DATE,

    CONSTRAINT pk_goal PRIMARY KEY (goal_id),
    CONSTRAINT fk_goal_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT ck_goal_values CHECK (current_value >= 0 AND target_value > 0),
    CONSTRAINT ck_goal_end_date CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Each row belongs to one purchase; a sale spanning purchases uses one row per purchase.
CREATE TABLE "transaction"
(
    transaction_id UUID           NOT NULL DEFAULT uuidv7(),
    investment_id  UUID           NOT NULL,
    direction      VARCHAR(4)     NOT NULL,
    quantity       NUMERIC(24, 10) NOT NULL,
    unit_price     NUMERIC(24, 10) NOT NULL,
    executed_at    TIMESTAMPTZ    NOT NULL,
    fee            NUMERIC(24, 10) NOT NULL DEFAULT 0,

    CONSTRAINT pk_transaction PRIMARY KEY (transaction_id),
    CONSTRAINT fk_transaction_investment FOREIGN KEY (investment_id)
        REFERENCES investment (investment_id) ON DELETE RESTRICT,
    CONSTRAINT ck_transaction_direction CHECK (direction IN ('BUY', 'SELL')),
    CONSTRAINT ck_transaction_quantity CHECK (quantity > 0),
    CONSTRAINT ck_transaction_unit_price CHECK (unit_price >= 0),
    CONSTRAINT ck_transaction_fee CHECK (fee >= 0)
);

CREATE INDEX idx_transaction_investment_id ON "transaction" (investment_id);