CREATE TABLE users
(
    id            UUID         NOT NULL DEFAULT uuidv7(),
    email         VARCHAR(255) NOT NULL,
    name          VARCHAR(35)  NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url    TEXT,
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ    NOT NULL DEFAULT now(),

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE INDEX idx_users_email ON users (email);

INSERT INTO users (name, email, password_hash)
VALUES ('gustavo', 'teste@gmail.com', '123456');