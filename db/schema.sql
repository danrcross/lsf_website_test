-- Drop the table if it already exists
DROP TABLE IF EXISTS members;

-- Create the table structure for CSV upload
CREATE TABLE members (
    id INT NOT NULL AUTO_INCREMENT,
    LSF_Number VARCHAR(50),
    First_Name VARCHAR(100),
    Last_Name VARCHAR(100),
    Address VARCHAR(255),
    City VARCHAR(100),
    State VARCHAR(50),
    Zip VARCHAR(20),
    Country VARCHAR(50),
    Country_Coordinator VARCHAR(100),
    email VARCHAR(150),
    Last_Contact DATE,
    AMA_Number VARCHAR(50),
    SAP_Aspirant DATE,
    SAP_Level_1 DATE,
    SAP_Level_2 DATE,
    SAP_Level_3 DATE,
    SAP_Level_4 DATE,
    SAP_Level_5 DATE,
    eSAP_Aspirant DATE,
    eSAP_Level_1 DATE,
    eSAP_Level_2 DATE,
    eSAP_Level_3 DATE,
    eSAP_Level_4 DATE,
    eSAP_Level_5 DATE,
    -- Computed column for highest SAP level achieved (1-5)
    SAP_Level INT AS (
        GREATEST(
            IF(SAP_Level_1 IS NOT NULL, 1, 0),
            IF(SAP_Level_2 IS NOT NULL, 2, 0),
            IF(SAP_Level_3 IS NOT NULL, 3, 0),
            IF(SAP_Level_4 IS NOT NULL, 4, 0),
            IF(SAP_Level_5 IS NOT NULL, 5, 0)
        )
    ) STORED,
    -- Computed column for highest eSAP level achieved (1-5)
    eSAP_Level INT AS (
        GREATEST(
            IF(eSAP_Level_1 IS NOT NULL, 1, 0),
            IF(eSAP_Level_2 IS NOT NULL, 2, 0),
            IF(eSAP_Level_3 IS NOT NULL, 3, 0),
            IF(eSAP_Level_4 IS NOT NULL, 4, 0),
            IF(eSAP_Level_5 IS NOT NULL, 5, 0)
        )
    ) STORED,
    Miscellaneous VARCHAR(255),
    Deceased TINYINT(1),
    Duplicate TINYINT(1),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Load CSV data into the table.
-- Update the file path below to point to your CSV file.
-- This command assumes the CSV columns are in the following order:
--   LSF_Number, First_Name, Last_Name, Address, City, State, Zip, Country,
--   Country_Coordinator, email, Last_Contact, AMA_Number, SAP_Aspirant,
--   SAP_Level_1, SAP_Level_2, SAP_Level_3, SAP_Level_4, SAP_Level_5,
--   eSAP_Aspirant, eSAP_Level_1, eSAP_Level_2, eSAP_Level_3, eSAP_Level_4, eSAP_Level_5,
--   SAP_Level, eSAP_Level, Miscellaneous, `Deceased (1/0)`, `Duplicate (1/0)`
-- The first row is assumed to be headers.
LOAD DATA LOCAL INFILE 'db/LSF03-1-25.csv'
INTO TABLE members
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(
    LSF_Number,
    First_name,
    Last_name,
    Address,
    City,
    State,
    Zip,
    Country,
    Country_Coordinator,
    email,
    @Last_Contact,
    AMA_Number,
    @SAP_Aspirant,
    @SAP_Level_1,
    @SAP_Level_2,
    @SAP_Level_3,
    @SAP_Level_4,
    @SAP_Level_5,
    @eSAP_Aspirant,
    @eSAP_Level_1,
    @eSAP_Level_2,
    @eSAP_Level_3,
    @eSAP_Level_4,
    @eSAP_Level_5,
    @dummy_SAP_Level,   -- Ignored: CSV column for SAP_Level
    @dummy_eSAP_Level,  -- Ignored: CSV column for eSAP_Level
    Miscellaneous,
    Deceased,
    Duplicate
)
SET 
    Last_Contact   = IF(@Last_Contact = '', NULL, STR_TO_DATE(@Last_Contact, '%m/%d/%Y')),
    SAP_Aspirant   = IF(@SAP_Aspirant = '', NULL, STR_TO_DATE(@SAP_Aspirant, '%m/%d/%Y')),
    SAP_Level_1    = IF(@SAP_Level_1 = '', NULL, STR_TO_DATE(@SAP_Level_1, '%m/%d/%Y')),
    SAP_Level_2    = IF(@SAP_Level_2 = '', NULL, STR_TO_DATE(@SAP_Level_2, '%m/%d/%Y')),
    SAP_Level_3    = IF(@SAP_Level_3 = '', NULL, STR_TO_DATE(@SAP_Level_3, '%m/%d/%Y')),
    SAP_Level_4    = IF(@SAP_Level_4 = '', NULL, STR_TO_DATE(@SAP_Level_4, '%m/%d/%Y')),
    SAP_Level_5    = IF(@SAP_Level_5 = '', NULL, STR_TO_DATE(@SAP_Level_5, '%m/%d/%Y')),
    eSAP_Aspirant  = IF(@eSAP_Aspirant = '', NULL, STR_TO_DATE(@eSAP_Aspirant, '%m/%d/%Y')),
    eSAP_Level_1   = IF(@eSAP_Level_1 = '', NULL, STR_TO_DATE(@eSAP_Level_1, '%m/%d/%Y')),
    eSAP_Level_2   = IF(@eSAP_Level_2 = '', NULL, STR_TO_DATE(@eSAP_Level_2, '%m/%d/%Y')),
    eSAP_Level_3   = IF(@eSAP_Level_3 = '', NULL, STR_TO_DATE(@eSAP_Level_3, '%m/%d/%Y')),
    eSAP_Level_4   = IF(@eSAP_Level_4 = '', NULL, STR_TO_DATE(@eSAP_Level_4, '%m/%d/%Y')),
    eSAP_Level_5   = IF(@eSAP_Level_5 = '', NULL, STR_TO_DATE(@eSAP_Level_5, '%m/%d/%Y'));
