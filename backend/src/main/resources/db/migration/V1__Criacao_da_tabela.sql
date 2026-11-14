CREATE TABLE profiles
(
    profile_ID  UUID         NOT NULL DEFAULT uuidv7(),
    salary_date DATE         NOT NULL,
    salary      DECIMAL      NOT NULL,
    occupation  TEXT,
    name        VARCHAR(255) NOT NULL,
    nickname    VARCHAR(255),

    CONSTRAINT pk_profiles PRIMARY KEY (profile_ID)
);

CREATE TABLE accounts
(
    account_ID    UUID                                  NOT NULL DEFAULT uuidv7(),
    idProfile     UUID REFERENCES profiles (profile_ID) NOT NULL,
    email         VARCHAR(255)                          NOT NULL,
    cpf           VARCHAR(255)                          NOT NULL UNIQUE,
    status        VARCHAR(35)                           NOT NULL,
    password_hash VARCHAR(255)                          NOT NULL,
    created_at    TIMESTAMPTZ                           NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ                           NOT NULL DEFAULT now(),

    CONSTRAINT pk_users PRIMARY KEY (account_ID),
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE TABLE form
(
    form_ID       UUID NOT NULL DEFAULT uuidv7(),
    idProfile     UUID NOT NULL REFERENCES profiles (profile_ID),
    hearAboutUs   TEXT,
    howWantsToUse TEXT,
    openFinance   BOOLEAN       DEFAULT false,
    currentBanks  TEXT,

    CONSTRAINT pk_forms PRIMARY KEY (form_ID)
);

CREATE TABLE profile_images
(
    idAccount    UUID PRIMARY KEY REFERENCES accounts (account_ID) ON DELETE CASCADE,
    image_data   BYTEA        NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    created_at   timestamptz  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);


CREATE TABLE investment
(
    investment_ID UUID         NOT NULL DEFAULT uuidv7(),
    idAccount     UUID REFERENCES accounts (account_ID),
    name          VARCHAR(380) NOT NULL,
    symbol        VARCHAR(25)  NOT NULL,
    originalValue DECIMAL      NOT NULL,
    currentValue  DECIMAL      NOT NULL,
    amount        DECIMAL      NOT NULL,
    profit        DECIMAL GENERATED ALWAYS AS ( (currentValue - originalValue) * amount ),

    CONSTRAINT pk_investment PRIMARY KEY (investment_ID)
);

CREATE TABLE expense
(
    expense_ID            UUID        NOT NULL DEFAULT uuidv7(),
    idAccount             UUID REFERENCES accounts (account_ID),
    consumptionPercentage DECIMAL,
    expenseDate           DATE        NOT NULL,
    value                 DECIMAL     NOT NULL,
    type                  VARCHAR(35) NOT NULL,
    endDate               DATE,

    CONSTRAINT pk_expense PRIMARY KEY (expense_ID)
);

CREATE TABLE goal
(
    goal_ID      UUID         NOT NULL DEFAULT uuidv7(),
    idAccount    UUID         NOT NULL REFERENCES accounts (account_ID),
    name         VARCHAR(255) NOT NULL,
    startDate    DATE         NOT NULL,
    description  TEXT,
    currentValue DECIMAL      NOT NULL,
    targetValue  DECIMAL      NOT NULL,
    endDate      DATE,

    CONSTRAINT pk_goal PRIMARY KEY (goal_ID)
);

CREATE TABLE transaction
(
    movement_ID UUID        NOT NULL DEFAULT uuidv7(),
    idInvestment UUID NOT NULL REFERENCES investment (investment_ID),
    type        VARCHAR(35) NOT NULL,
    quantity    DECIMAL     NOT NULL,
    value       DECIMAL     NOT NULL,
    date        DATE        NOT NULL,
    fee         DECIMAL,

    CONSTRAINT pk_transaction PRIMARY KEY (movement_ID)
);



INSERT INTO users (name, email, password_hash)
VALUES ('gustavo', 'teste@gmail.com', '123456');