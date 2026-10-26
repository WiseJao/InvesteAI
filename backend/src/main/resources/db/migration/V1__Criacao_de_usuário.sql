CREATE TABLE usuario (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);

INSERT INTO usuario (nome, email)
VALUES ('gustavo', 'teste@gmail.com');