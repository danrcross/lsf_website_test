USE lsf_db;

LOAD DATA LOCAL INFILE 'db/LSF_upDate.csv' INTO TABLE Members FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n' IGNORE 1 ROWS (
    LSF_Number,
    First_name,
    Last_name,
    City,
    State,
    Country,
    SAPLevel1,
    SAPLevel2,
    SAPLevel3,
    SAPLevel4,
    SAPLevel5,
    eSAPLevel1,
    eSAPLevel2,
    eSAPLevel3,
    eSAPLevel4,
    eSAPLevel5,
    Deceased,
    Duplicate,
    email
);