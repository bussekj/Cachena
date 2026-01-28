-- User Creation -- 
CREATE USER IF NOT EXISTS root@localhost IDENTIFIED BY 'duck6887';
SET PASSWORD FOR root@localhost = PASSWORD('duck6887');
GRANT ALL ON *.* TO root@localhost WITH GRANT OPTION;
CREATE USER IF NOT EXISTS root@'%' IDENTIFIED BY 'duck6887';
SET PASSWORD FOR root@'%' = PASSWORD('duck6887');
GRANT ALL ON *.* TO root@'%' WITH GRANT OPTION;
CREATE USER IF NOT EXISTS guest@'%' IDENTIFIED BY 'duck6887';
SET PASSWORD FOR guest@'%' = PASSWORD('duck6887');
CREATE DATABASE IF NOT EXISTS db;
GRANT ALL PRIVILEGES ON db.* TO guest@'%';

USE db;

-- Data tables-- 
CREATE TABLE trackers (
    id SERIAL NOT NULL PRIMARY KEY,
    loc VARCHAR(255) NULL,
    ts timestamp NOT NULL 
    );

CREATE TABLE users (
    id SERIAL NOT NULL PRIMARY KEY,
    role VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
    );

CREATE TABLE tags (
    id SERIAL NOT NULL PRIMARY KEY,
    color VARCHAR(255) NULL,
    description VARCHAR(255) NOT NULL
    );

CREATE TABLE trackedUserObjects (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    is_locked BOOLEAN,
    tracker_id BIGINT UNSIGNED NOT NULL,
    FOREIGN KEY fk_tracker (tracker_id) REFERENCES trackers (id)
    );

-- Connection Tables --
CREATE TABLE trackerUsers (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    tracker_id BIGINT UNSIGNED NOT NULL,
    FOREIGN KEY fk_user (user_id) REFERENCES users (id) ON UPDATE CASCADE,
    FOREIGN KEY fk_tracker (tracker_id) REFERENCES trackers (id) ON UPDATE CASCADE
    );

CREATE TABLE trackerTags (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    tag_id BIGINT UNSIGNED NOT NULL,
    tracker_id BIGINT UNSIGNED NOT NULL,
    FOREIGN KEY fk_tag (tag_id) REFERENCES tags (id) ON UPDATE CASCADE,
    FOREIGN KEY fk_tracker (tracker_id) REFERENCES trackers (id) ON UPDATE CASCADE
    );