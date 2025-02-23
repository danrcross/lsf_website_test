<?php
header("Content-Type: application/json");
require_once "includes/config.php"; // Secure DB connection

$limit = $_POST['limit'] ?? 10;
$allowed_columns = ['id', 'LSF_Number', 'First_name', 'Last_name', 'City', 'State', 'Country', 'SAPLevel1', 'SAPLevel2', 'SAPLevel3', 'SAPLevel4', 'SAPLevel5', 'eSAPLevel1', 'eSAPLevel2', 'eSAPLevel3', 'eSAPLevel4', 'eSAPLevel5', 'Deceased', 'Duplicate', 'email', 'HighestSAPAchievement', 'HighestESAPAchievement']; 

// Filter values are already an array, no need for json_decode
$filter_values = $_POST['filterVals'] ?? null;

// Debugging the filter values
error_log("Filter Values: " . print_r($filter_values, true));

// List of allowed column names (add more as necessary)
$columns = (count($_POST['columns'] ?? []) === 0) ? ['*'] : $_POST['columns'];

// Validate/Filter columns
$columns = array_filter($columns, function($col) use ($allowed_columns) {
    return in_array($col, $allowed_columns);
});

// If no valid columns are provided, default to all columns
$columns_sql = empty($columns) ? '*' : implode(',', $columns);

// Base SQL query
$sql = "SELECT $columns_sql FROM members WHERE 1=1";
$params = [];

// Loop through the filters and append them to the SQL query
foreach ($filter_values as $key => $value) {
    if ($value !== "All" && $value !== null) {  // Skip 'All' values
        switch ($key) {
             case 'hiSAPFilt':
                // If the filter value is 'NULL', we add a condition to check for NULL in the column
                if ($value === "None") {
                    $sql .= " AND HighestSAPAchievement IS NULL";
                } else {
                    $sql .= " AND HighestSAPAchievement = :hiSAPFilt";
                    $params[':hiSAPFilt'] = $value;
                }
                break;
            case 'hiESAPFilt':
                // If the filter value is 'NULL', we add a condition to check for NULL in the column
                if ($value === "None") {
                    $sql .= " AND HighestESAPAchievement IS NULL";
                } else {
                    $sql .= " AND HighestESAPAchievement = :hiESAPFilt";
                    $params[':hiESAPFilt'] = $value;
                }
                break;
            // Add more cases as needed for other filters
        }
    }
}

// Add limit to the SQL query directly (no need to bind)
$sql .= " LIMIT " . (int)$limit; // Ensure the limit is an integer
error_log("SQL Query: " . $sql);
// Prepare and execute the SQL query
$stmt = $conn->prepare($sql);

// Bind the filter parameters dynamically
foreach ($params as $param => $val) {
    $stmt->bindValue($param, $val, PDO::PARAM_STR);  // Bind the values (or PDO::PARAM_INT if needed)
}

$stmt->execute();

// Fetch the results
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Return the results as a JSON response
echo json_encode(["status" => "success", "members" => $results]);
?>
