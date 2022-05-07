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
