CREATE TABLE user
(
    username       VARCHAR(32) NOT NULL,
    password_hash  CHAR(60) NOT NULL,
    PRIMARY KEY (username)
) ENGINE = InnoDB;

CREATE TABLE result
(
    id       INT UNSIGNED NOT NULL AUTO_INCREMENT,
    game_id  INT UNSIGNED NOT NULL,
    username VARCHAR(32) NOT NULL,
    won      BOOLEAN NOT NULL,
    PRIMARY KEY (id)
) ENGINE = InnoDB;

CREATE TABLE game
(
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    game_id    CHAR(6) NOT NULL,
    scenario   CHAR(64) NOT NULL,
    timestamp  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    completion TIMESTAMP NULL,
    PRIMARY KEY (id)
) ENGINE = InnoDB;

CREATE TABLE scenario
(
    hash        CHAR(64) NOT NULL,
    builtin     BOOLEAN NOT NULL DEFAULT FALSE,
    author      TINYTEXT NOT NULL,
    name        TINYTEXT NOT NULL,
    description TEXT NOT NULL,
    PRIMARY KEY (hash)
) ENGINE = InnoDB;

ALTER TABLE result ADD CONSTRAINT fk_result_game_id FOREIGN KEY (game_id) REFERENCES game (id);
ALTER TABLE result ADD CONSTRAINT fk_result_username FOREIGN KEY (username) REFERENCES user (username);
ALTER TABLE game ADD CONSTRAINT fk_game_scenario FOREIGN KEY (scenario) REFERENCES scenario (hash);
