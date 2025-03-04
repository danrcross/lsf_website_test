<?php
// Set the content type to JSON for proper API response format
header("Content-Type: application/json");

// Include the database configuration file to establish a secure DB connection
require_once "includes/config.php"; 

// Get the number of rows to return, defaulting to 10 if not provided
$limit = $_POST['limit'] ?? 10;

// Define a list of allowed column names to prevent SQL injection or invalid queries
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

// Retrieve filter values from the request (filters are expected to be in an array format)
$filter_values = $_POST['filterVals'] ?? null;

// Retrieve requested columns; if empty, default to selecting all columns
$columns = (count($_POST['columns'] ?? []) === 0) ? ['*'] : $_POST['columns'];

// Validate the requested columns against the allowed list
$columns = array_filter($columns, function($col) use ($allowed_columns) {
    return in_array($col, $allowed_columns);
});

// If no valid columns are provided, default to selecting all columns
$columns_sql = empty($columns) ? '*' : implode(',', $columns);

// Initialize base SQL query (assuming table name is "members")
$sql = "SELECT $columns_sql FROM members WHERE 1=1";
$params = [];

// Apply filters if provided
if (!empty($filter_values) && is_array($filter_values)) {
    foreach ($filter_values as $key => $value) {
        // Skip filters that are 'All' or NULL (meaning no filter is applied for that field)
        if ($value !== "All" && $value !== null) {  
            switch ($key) {
                case 'SAPAspFilt': 
                    // Filter based on SAP_Aspirant column (checking for NULL or NOT NULL values)
                    if ($value === "Yes") {
                        $sql .= " AND SAP_Aspirant IS NOT NULL";
                    } elseif ($value === "No") {
                        $sql .= " AND SAP_Aspirant IS NULL";
                    } 
                    break;
                
                case 'eSAPAspFilt': 
                    // Filter based on eSAP_Aspirant column
                    if ($value === "Yes") {
                        $sql .= " AND eSAP_Aspirant IS NOT NULL";
                    } elseif ($value === "No") {
                        $sql .= " AND eSAP_Aspirant IS NULL";
                    } 
                    break;
                
                case 'deceasedFilt': 
                    // Filter members who are marked as deceased
                    if ($value === "Yes") {
                        $sql .= " AND Deceased IS NOT NULL";
                    } elseif ($value === "No") {
                        $sql .= " AND Deceased IS NULL";
                    } 
                    break;
                
                case 'dupFilt': 
                    // Filter members who are marked as duplicates
                    if ($value === "Yes") {
                        $sql .= " AND Duplicate IS NOT NULL";
                    } elseif ($value === "No") {
                        $sql .= " AND Duplicate IS NULL";
                    } 
                    break;
                
                case 'hiSAPFilt': 
                    // Filter by the highest SAP level (NULL means no level assigned)
                    if ($value === "None") {
                        $sql .= " AND SAP_Level IS NULL";
                    } else {
                        $sql .= " AND SAP_Level = :hiSAPFilt";
                        $params[':hiSAPFilt'] = $value; // Store parameter for prepared statement
                    }
                    break;
                
                case 'hiESAPFilt': 
                    // Filter by the highest eSAP level (NULL means no level assigned)
                    if ($value === "None") {
                        $sql .= " AND eSAP_Level IS NULL";
                    } else {
                        $sql .= " AND eSAP_Level = :hiESAPFilt";
                        $params[':hiESAPFilt'] = $value;
                    }
                    break;

                // Additional cases for new filters can be added here if needed.
            }
        }
    }
}

// Add a LIMIT clause to restrict the number of rows returned (casted to integer for security)
$sql .= " LIMIT " . (int)$limit;

// Prepare the SQL query
$stmt = $conn->prepare($sql);

// Bind dynamic filter parameters (if any) using prepared statements to prevent SQL injection
foreach ($params as $param => $val) {
    $stmt->bindValue($param, $val, PDO::PARAM_STR);
}

// Execute the query
$stmt->execute();

// Fetch the results as an associative array
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Return the results as a JSON response
echo json_encode([
    "status" => "success",     // Indicate that the query was successful
    "query" => $sql,           // Return the generated SQL query for debugging
    "parameters" => $params,   // Show applied filter parameters
    "members" => $results      // The retrieved member records
]);
?>
