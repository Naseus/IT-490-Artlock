-- USAGE:
-- from cmd run `sudo mysql < db.sql`
-- This requires the user to have a defaults-file for the use, one can be used
-- for root with `sudo mysql --defaults-file=/etc/mysql/debian.cnf` on Unbuntu.

CREATE DATABASE IF NOT EXISTS ArtLock;
USE ArtLock;

CREATE TABLE IF NOT EXISTS ALUser(
    UserId int NOT NULL AUTO_INCREMENT,
    Username varchar(255),
    Password varchar(255),
    UNIQUE(Username),
    PRIMARY KEY(Userid)
);

CREATE TABLE IF NOT EXISTS Token(
    Token varchar(255),
    AuthUser int NOT NULL,
    ExpireDate Date,
    FOREIGN KEY(AuthUser) REFERENCES ALUser(UserId),
    UNIQUE (AuthUser),
    PRIMARY KEY(Token)
);

CREATE TABLE IF NOT EXISTS Album(
    Aid int NOT NULL AUTO_INCREMENT,
    EmbedLink varchar(255),
    AlbumArt varchar(255),
    Genre varchar(255),
    TrendScore float,
    LastScore float,
    PRIMARY KEY(Aid)
);

CREATE TABLE IF NOT EXISTS Review(
    Rid int NOT NULL AUTO_INCREMENT,
    ReviewText text,
    ArtStars int,
    Stars int,
    Reviewer int NOT NULL,
    Album int NOT NULL,
    FOREIGN KEY(Reviewer) REFERENCES ALUser(UserId),
    FOREIGN KEY(Album) REFERENCES Album(Aid),
    PRIMARY KEY(Rid)
);

CREATE TABLE IF NOT EXISTS AlbumStack(
    Sid int NOT NULL AUTO_INCREMENT,
    CreatedBy int NOT NULL,
    FOREIGN KEY(CreatedBy) REFERENCES ALUser(UserId),
    PRIMARY KEY(Sid)
);

CREATE TABLE IF NOT EXISTS AlbumIn(
    Stack int NOT NULL,
    Album int NOT NULL,
    FOREIGN KEY(Stack) REFERENCES AlbumStack(Sid),
    FOREIGN KEY(Album) REFERENCES Album(Aid)
);

CREATE TABLE IF NOT EXISTS Comment(
    Cid int NOT NULL,
    CommentOn int NOT NULL,
    CommentText text,
    FOREIGN KEY(CommentOn) REFERENCES Review(Rid),
    PRIMARY KEY(Cid)
);


CREATE EVENT IF NOT EXISTS ClearTokens
    ON SCHEDULE
        EVERY 1 DAY
    COMMENT 'Clearing old tokens'
    DO
        DELETE FROM Token WHERE ExpireDate <= NOW();
