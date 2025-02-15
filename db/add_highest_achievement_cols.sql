-- Add new columns for highest achievements
ALTER TABLE members 
ADD COLUMN HighestSAPAchievement VARCHAR(10) DEFAULT NULL,
ADD COLUMN HighestESAPAchievement VARCHAR(10) DEFAULT NULL;

-- Update existing records
UPDATE members
SET HighestSAPAchievement = 
    CASE 
        WHEN SAPLevel5 IS NOT NULL THEN 'SAP 5'
        WHEN SAPLevel4 IS NOT NULL THEN 'SAP 4'
        WHEN SAPLevel3 IS NOT NULL THEN 'SAP 3'
        WHEN SAPLevel2 IS NOT NULL THEN 'SAP 2'
        WHEN SAPLevel1 IS NOT NULL THEN 'SAP 1'
        ELSE NULL
    END,
    HighestESAPAchievement = 
    CASE 
        WHEN eSAPLevel5 IS NOT NULL THEN 'eSAP 5'
        WHEN eSAPLevel4 IS NOT NULL THEN 'eSAP 4'
        WHEN eSAPLevel3 IS NOT NULL THEN 'eSAP 3'
        WHEN eSAPLevel2 IS NOT NULL THEN 'eSAP 2'
        WHEN eSAPLevel1 IS NOT NULL THEN 'eSAP 1'
        ELSE NULL
    END;

-- Create a trigger to maintain highest achievements automatically
DELIMITER $$
CREATE TRIGGER update_highest_achievements
BEFORE INSERT OR UPDATE ON members
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