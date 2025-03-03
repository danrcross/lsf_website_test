-- Initializes database and creates table templates!
-- if lsf_db database already exists, it is deleted
DROP DATABASE IF EXISTS lsf_db;

-- creates new database 'lsf_db'
CREATE DATABASE lsf_db;

-- enters into lsf_db
USE lsf_db;

-- creates new table for 'Members', with multiple columns and parameters for data types for each column
CREATE TABLE
    Members (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        LSF_Number VARCHAR(30) NOT NULL,
        First_name VARCHAR(50) NOT NULL,
        Last_name VARCHAR(50) NOT NULL,
        City VARCHAR(50),
        State VARCHAR(50),
        Country VARCHAR(50),
        SAPLevel1 DATE,
        SAPLevel2 DATE,
        SAPLevel3 DATE,
        SAPLevel4 DATE,
        SAPLevel5 DATE,
        eSAPLevel1 DATE,
        eSAPLevel2 DATE,
        eSAPLevel3 DATE,
        eSAPLevel4 DATE,
        eSAPLevel5 DATE,
        Deceased TINYINT(1) DEFAULT 0,
        Duplicate TINYINT(1) DEFAULT 0,
        email VARCHAR(100)
    );