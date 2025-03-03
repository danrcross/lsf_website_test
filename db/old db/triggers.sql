DELIMITER $$

CREATE TRIGGER before_insert_highest_achievements
BEFORE INSERT ON members
FOR EACH ROW
BEGIN
    SET NEW.HighestSAPAchievement = 
        CASE 
            WHEN NEW.SAPLevel5 IS NOT NULL THEN 'SAP 5'
            WHEN NEW.SAPLevel4 IS NOT NULL THEN 'SAP 4'
            WHEN NEW.SAPLevel3 IS NOT NULL THEN 'SAP 3'
            WHEN NEW.SAPLevel2 IS NOT NULL THEN 'SAP 2'
            WHEN NEW.SAPLevel1 IS NOT NULL THEN 'SAP 1'
            ELSE NULL
        END;

    SET NEW.HighestESAPAchievement = 
        CASE 
            WHEN NEW.eSAPLevel5 IS NOT NULL THEN 'eSAP 5'
            WHEN NEW.eSAPLevel4 IS NOT NULL THEN 'eSAP 4'
            WHEN NEW.eSAPLevel3 IS NOT NULL THEN 'eSAP 3'
            WHEN NEW.eSAPLevel2 IS NOT NULL THEN 'eSAP 2'
            WHEN NEW.eSAPLevel1 IS NOT NULL THEN 'eSAP 1'
            ELSE NULL
        END;
END $$

DELIMITER ;

-- Create trigger for UPDATE
DELIMITER $$

CREATE TRIGGER before_update_highest_achievements
BEFORE UPDATE ON members
FOR EACH ROW
BEGIN
    SET NEW.HighestSAPAchievement = 
        CASE 
            WHEN NEW.SAPLevel5 IS NOT NULL THEN 'SAP 5'
            WHEN NEW.SAPLevel4 IS NOT NULL THEN 'SAP 4'
            WHEN NEW.SAPLevel3 IS NOT NULL THEN 'SAP 3'
            WHEN NEW.SAPLevel2 IS NOT NULL THEN 'SAP 2'
            WHEN NEW.SAPLevel1 IS NOT NULL THEN 'SAP 1'
            ELSE NULL
        END;

    SET NEW.HighestESAPAchievement = 
        CASE 
            WHEN NEW.eSAPLevel5 IS NOT NULL THEN 'eSAP 5'
            WHEN NEW.eSAPLevel4 IS NOT NULL THEN 'eSAP 4'
            WHEN NEW.eSAPLevel3 IS NOT NULL THEN 'eSAP 3'
            WHEN NEW.eSAPLevel2 IS NOT NULL THEN 'eSAP 2'
            WHEN NEW.eSAPLevel1 IS NOT NULL THEN 'eSAP 1'
            ELSE NULL
        END;
END $$

DELIMITER ;