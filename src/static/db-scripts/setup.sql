CREATE TABLE `user`
(
    `username`        VARCHAR(32) NOT NULL,
    `password_hash`   CHAR(60) NOT NULL,
    PRIMARY KEY (`username`)
) ENGINE = InnoDB;

CREATE TABLE `result`
(
    `id`      INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `game_id` INT UNSIGNED NOT NULL,
    `username` VARCHAR(32) NOT NULL,
    `won` BOOLEAN NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE `game`
(
    `id`        INT UNSIGNED NULL AUTO_INCREMENT,
    `game_id`   VARCHAR(6)   NOT NULL,
    `scenario`  INT UNSIGNED NOT NULL,
    `timestamp` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    `complete`  BOOLEAN      NOT NULL DEFAULT FALSE,
    `duration`  TIME,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE `scenario`
(
    `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `builtin`     BOOLEAN      NOT NULL DEFAULT FALSE,
    `name`        TINYTEXT     NOT NULL,
    `description` TEXT         NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

ALTER TABLE `result`
    ADD CONSTRAINT `fk_result_game_id` FOREIGN KEY (`game_id`) REFERENCES `game` (`id`);
ALTER TABLE `result`
    ADD CONSTRAINT `fk_result_username` FOREIGN KEY (`username`) REFERENCES `user` (`username`);
ALTER TABLE `game`
    ADD CONSTRAINT `fk_game_scenario` FOREIGN KEY (`scenario`) REFERENCES `scenario` (`id`);
