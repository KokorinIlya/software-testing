CREATE EXTENSION pgcrypto;

--- CMD

CREATE TABLE Users
(
    login          VARCHAR(255) NOT NULL PRIMARY KEY,
    encrypted_pass TEXT         NOT NULL
);

--- CMD

CREATE TABLE Chats
(
    chat_id       UUID    NOT NULL PRIMARY KEY,
    participant_a UUID    NOT NULL,
    participant_b UUID,
    finished      BOOLEAN NOT NULL DEFAULT FALSE
);

--- CMD

CREATE INDEX single_participant_idx ON Chats USING btree (participant_b NULLS FIRST);

--- CMD

CREATE TABLE ChatMessages
(
    chat_id           UUID      NOT NULL REFERENCES Chats (chat_id),
    author_id         UUID      NOT NULL,
    message_timestamp TIMESTAMP NOT NULL DEFAULT now(),
    message_text      TEXT      NOT NULL,

    PRIMARY KEY (chat_id, message_timestamp)
);