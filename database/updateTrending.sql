DELIMITER //
DROP PROCEDURE IF EXISTS ArtLock.UpdateTrendingScore //
CREATE PROCEDURE ArtLock.UpdateTrendingScore()
BEGIN
    DECLARE AlbumId VARCHAR(32);
    DECLARE newMax FLOAT;
    DECLARE oldMax FLOAT;

    DECLARE done INT DEFAULT FALSE;
    DECLARE curAlbums CURSOR FOR SELECT(Aid) FROM Album;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done=TRUE;

    OPEN curAlbums;

    read_loop: LOOP
        FETCH curAlbums INTO AlbumId;
        IF done THEN
            LEAVE read_loop;
        END IF;
        SELECT AVG(Stars) FROM Review WHERE Album=AlbumId INTO newMax;
        IF(newMax IS NULL) THEN
            SET newMax = 0.0;
        END IF;
        SELECT(LastReviewAverage) FROM Album WHERE Aid=AlbumId INTO oldMax;
        UPDATE Album SET TrendScore=newMax-oldMax, LastReviewAverage=newMax WHERE Aid=AlbumId LIMIT 1;
    END LOOP;


    CLOSE curAlbums;
END //

DELIMITER ;
