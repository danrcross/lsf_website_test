<?php
// Include the database configuration file
require_once '../includes/config.php'; // Update this path to the actual location of your config.php

try {
    // Define the query to select certain members
    $query = "SELECT
    m.First_Name,
    m.Last_Name,
    m.LSF_Number,
    m.State,
    m.Country,
    -- SAP result
    sap.latest_sap_level,
    sap.latest_sap_date,
    -- eSAP result
    esap.latest_esap_level,
    esap.latest_esap_date
FROM
    members m
-- Subquery to get latest SAP level and date
LEFT JOIN (
    SELECT
        id,
        CASE
            WHEN SAP_Level_5 IS NOT NULL THEN 'SAP Level 5'
            WHEN SAP_Level_4 IS NOT NULL THEN 'SAP Level 4'
            WHEN SAP_Level_3 IS NOT NULL THEN 'SAP Level 3'
            WHEN SAP_Level_2 IS NOT NULL THEN 'SAP Level 2'
            WHEN SAP_Level_1 IS NOT NULL THEN 'SAP Level 1'
            WHEN SAP_Aspirant IS NOT NULL THEN 'SAP Aspirant'
            ELSE NULL
        END AS latest_sap_level,
        GREATEST(
            COALESCE(SAP_Level_5, '0000-00-00'),
            COALESCE(SAP_Level_4, '0000-00-00'),
            COALESCE(SAP_Level_3, '0000-00-00'),
            COALESCE(SAP_Level_2, '0000-00-00'),
            COALESCE(SAP_Level_1, '0000-00-00'),
            COALESCE(SAP_Aspirant, '0000-00-00')
        ) AS latest_sap_date
    FROM members
) sap ON m.id = sap.id
-- Subquery to get latest eSAP level and date
LEFT JOIN (
    SELECT
        id,
        CASE
            WHEN eSAP_Level_5 IS NOT NULL THEN 'eSAP Level 5'
            WHEN eSAP_Level_4 IS NOT NULL THEN 'eSAP Level 4'
            WHEN eSAP_Level_3 IS NOT NULL THEN 'eSAP Level 3'
            WHEN eSAP_Level_2 IS NOT NULL THEN 'eSAP Level 2'
            WHEN eSAP_Level_1 IS NOT NULL THEN 'eSAP Level 1'
            WHEN eSAP_Aspirant IS NOT NULL THEN 'eSAP Aspirant'
            ELSE NULL
        END AS latest_esap_level,
        GREATEST(
            COALESCE(eSAP_Level_5, '0000-00-00'),
            COALESCE(eSAP_Level_4, '0000-00-00'),
            COALESCE(eSAP_Level_3, '0000-00-00'),
            COALESCE(eSAP_Level_2, '0000-00-00'),
            COALESCE(eSAP_Level_1, '0000-00-00'),
            COALESCE(eSAP_Aspirant, '0000-00-00')
        ) AS latest_esap_date
    FROM members
) esap ON m.id = esap.id
-- Only show members who advanced in SAP or eSAP in 2024
WHERE
    (YEAR(sap.latest_sap_date) = 2024 OR YEAR(esap.latest_esap_date) = 2024);

";

    // Prepare the statement
    $stmt = $conn->prepare($query);


    // Execute the query
    $stmt->execute();

    // Fetch the results
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if ($members) {
        // Output the results as JSON
        header('Content-Type: application/json');
        echo json_encode($members);
    } else {
        // No members found
        echo json_encode(["message" => "No members found"]);
    }
} catch (PDOException $e) {
    // Handle connection or query errors
    echo "Error: " . $e->getMessage();
}
?>