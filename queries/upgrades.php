<?php
header('Content-Type: application/json');

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$year = isset($_GET['year']) ? intval($_GET['year']) : date("Y");

require_once '../includes/config.php'; // should define $conn (PDO)

$query = "
SELECT
    id,
    First_Name,
    Last_Name,
    LSF_Number,
    State,
    Country,
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
    ) AS latest_sap_date,
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
";

$stmt = $conn->query($query);

$filtered = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $sapYear = substr($row['latest_sap_date'], 0, 4);
    $esapYear = substr($row['latest_esap_date'], 0, 4);
    if ($sapYear == $year || $esapYear == $year) {
        $filtered[] = $row;
    }
}

echo json_encode($filtered);
?>

