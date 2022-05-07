<<<<<<< HEAD
CREATE  BASE IF NOT EXISTS Dev;
USE Dev;

CREATE TABLE IF NOT EXISTS Package(
    Title (Primary Key)
    On_Text 
    On_Dev varchar
    Type
);

CREATE Table IF NOT EXIST Package
    Context Foreign Keys
    Tid varchar(32)

);

CREATE TABLE IF NOT EXISTS Album(
     Aid varchar(32) NOT NULL, 
     AlbumArt varchar(255),
     AlbumName varchar(255), 
     Artist varchar(255),
     ArtistName varchar(255),
     LastReviewAverage float DEFAULT 0.0,
     PRIMARY KEY(Aid)
        );

=======
CREATE DATABASE IF NOT EXISTS Deployment;
USE Deployment;

CREATE TABLE IF NOT EXISTS Package(
    Title varchar(60),
    Deployed boolean NOT NULL DEFAULT 0,
    Testing boolean NOT NULL DEFAULT 0,
    Type varchar(60),
    PRIMARY KEY(Title)
);

CREATE TABLE IF NOT EXISTS File(
    Fid int NOT NULL AUTO_INCREMENT,
    FileName varchar(60),
    FileIn varchar(60),
    content blob,
    FOREIGN KEY(FileIn) REFERENCES Package(Title) ON DELETE CASCADE,
    PRIMARY KEY(Fid)
);
>>>>>>> 9eb247f5dd641407de3fd04b825f3d8b26761c8d
