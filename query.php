<?php
header("Content-Type: application/json");
require_once "includes/config.php"; // Secure DB connection

// Number of rows to return (default 10)
$limit = $_POST['limit'] ?? 10;

// Updated allowed columns array based on the new table structure
$allowed_columns = [
    'id',
    'LSF_Number',
    'First_Name',
    'Last_Name',
    'Address',
    'City',
    'State',
    'Zip',
    'Country',
    'Country_Coordinator',
    'email',
    'Last_Contact',
    'AMA_Number',
    'SAP_Aspirant',
    'SAP_Level_1',
    'SAP_Level_2',
    'SAP_Level_3',
    'SAP_Level_4',
    'SAP_Level_5',
    'eSAP_Aspirant',
    'eSAP_Level_1',
    'eSAP_Level_2',
    'eSAP_Level_3',
    'eSAP_Level_4',
    'eSAP_Level_5',
    'SAP_Level',
    'eSAP_Level',
    'Miscellaneous',
    'Deceased',
    'Duplicate'
];

// Filter values are already an array, no need for json_decode
$filter_values = $_POST['filterVals'] ?? null;

// Debugging the filter values
error_log("Filter Values: " . print_r($filter_values, true));

// List of allowed column names
$columns = (count($_POST['columns'] ?? []) === 0) ? ['*'] : $_POST['columns'];

// Validate/Filter columns (make sure they are allowed)
$columns = array_filter($columns, function($col) use ($allowed_columns) {
    return in_array($col, $allowed_columns);
});

// If no valid columns are provided, default to all columns
$columns_sql = empty($columns) ? '*' : implode(',', $columns);

// Base SQL query; adjust table name if needed (here assuming table name is "members")
$sql = "SELECT $columns_sql FROM members WHERE 1=1";
$params = [];

// Loop through the filters and append them to the SQL query
if (!empty($filter_values) && is_array($filter_values)) {
    foreach ($filter_values as $key => $value) {
        if ($value !== "All" && $value !== null) {  // Skip filters with value 'All' or null
            switch ($key) {
                case 'hiSAPFilt':
                    // Use new computed column SAP_Level for filtering
                    if ($value === "None") {
                        $sql .= " AND SAP_Level IS NULL";
                    } else {
                        $sql .= " AND SAP_Level = :hiSAPFilt";
                        $params[':hiSAPFilt'] = $value;
                    }
                    break;
                case 'hiESAPFilt':
                    // Use new computed column eSAP_Level for filtering
                    if ($value === "None") {
                        $sql .= " AND eSAP_Level IS NULL";
                    } else {
                        $sql .= " AND eSAP_Level = :hiESAPFilt";
                        $params[':hiESAPFilt'] = $value;
                    }
                    break;
                case 'SAPAspFilt':
                    // Use new computed column SAP_Aspirant for filtering
                    if ($value === "Yes") {
                        $sql .= " AND SAP_Aspirant IS NOT NULL";
                    } if ($value === "No") {
                        $sql .= " AND SAP_Aspirant IS NULL";
                    } 
                    break;
                case 'eSAPAspFilt':
                    // Use new computed column eSAP_Aspirant for filtering
                    if ($value === "Yes") {
                        $sql .= " AND eSAP_Aspirant IS NOT NULL";
                    } if ($value === "No") {
                        $sql .= " AND eSAP_Aspirant IS NULL";
                    } 
                    break;
               
                // Add additional cases for other filters if needed.
            }
        }
    }
}

// Add limit to the SQL query (casting to integer for security)
$sql .= " LIMIT " . (int)$limit;

error_log("SQL Query: " . $sql);

// Prepare and execute the SQL query
$stmt = $conn->prepare($sql);

// Bind the filter parameters dynamically
foreach ($params as $param => $val) {
    $stmt->bindValue($param, $val, PDO::PARAM_STR);
}

$stmt->execute();

// Fetch the results
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Return the results as a JSON response
echo json_encode([
    "status" => "success",
    "query" => $sql,
    "parameters" => $params,
    "members" => $results
]);
?>
