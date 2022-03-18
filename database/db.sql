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
    Aid varchar(32) NOT NULL,
    AlbumArt varchar(255),
    Artist varchar(255),
    ArtistName varchar(255),
    TrendScore float,
    LastReviewAverage float,
    PRIMARY KEY(Aid)
);

CREATE TABLE IF NOT EXISTS Review(
    Rid int NOT NULL AUTO_INCREMENT,
    ReviewText text,
    ArtStars int CHECK(ArtStars <= 5),
    Stars int CHECK(Stars <= 5),
    Reviewer int NOT NULL,
    Album varchar(32) NOT NULL,
    FOREIGN KEY(Reviewer) REFERENCES ALUser(UserId),
    FOREIGN KEY(Album) REFERENCES Album(Aid),
    PRIMARY KEY(Rid),
    UNIQUE reviewerOnAlbum(Reviewer, Album)
);

CREATE TABLE IF NOT EXISTS AlbumStack(
    Sid int NOT NULL AUTO_INCREMENT,
    CreatedBy int NOT NULL,
    FOREIGN KEY(CreatedBy) REFERENCES ALUser(UserId),
    PRIMARY KEY(Sid)
);

CREATE TABLE IF NOT EXISTS AlbumIn(
    Stack int NOT NULL,
    Album varchar(32) NOT NULL,
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

CREATE EVENT IF NOT EXISTS CallUpdatetrending
    ON SCHEDULE
        EVERY 1 WEEK
    COMMENT 'Update the trending page'
    DO
        CALL UpdateTrendingScore()
