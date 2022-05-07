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

