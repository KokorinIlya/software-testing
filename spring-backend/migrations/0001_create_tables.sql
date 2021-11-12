CREATE EXTENSION pgcrypto;

CREATE TABLE Users
(
    login          VARCHAR(255) NOT NULL PRIMARY KEY,
    encrypted_pass TEXT         NOT NULL
);