CREATE DATABASE `test`;
USE `test`;

CREATE TABLE `user`(
    `username` varchar(32) NOT NULL,
    `password_hash` text(60) NOT NULL,
    PRIMARY KEY(`username`)
);
