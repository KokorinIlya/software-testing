CREATE EXTENSION pgcrypto;

CREATE TABLE Users
(
    login          VARCHAR(255) NOT NULL PRIMARY KEY,
    encrypted_pass TEXT         NOT NULL
);

CREATE TABLE Chats
(
    chat_id       UUID NOT NULL PRIMARY KEY,
    participant_a UUID NOT NULL,
    participant_b UUID
);

CREATE INDEX single_participant_idx ON Chats USING btree (participant_b NULLS FIRST);