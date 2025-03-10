<?php
header("Content-Type: application/json");
require_once "includes/config.php";

// gets the limit, filter values, selected columns, and sort column/order from the POST request
$limit = isset($_POST['limit']) ? (int) $_POST['limit'] : 10;
$filter_values = $_POST['filterVals'] ?? null;
$selected_columns = isset($_POST['columns'])&& is_array($_POST['columns']) ? $_POST['columns'] : ['*'];
$sortColumn = $_POST['sortColumn'] ?? null;
$sortOrder = strtoupper($_POST['sortOrder'] ?? 'ASC'); // Default to ASC

// validate selected columns to prevent SQL injection
$allowed_columns = [
    'id', 'LSF_Number', 'First_Name', 'Last_Name', 'Address', 'City', 'State', 'Zip', 'Country',
    'Country_Coordinator', 'email', 'Last_Contact', 'AMA_Number', 'SAP_Aspirant', 'SAP_Level_1', 
    'SAP_Level_2', 'SAP_Level_3', 'SAP_Level_4', 'SAP_Level_5', 'eSAP_Aspirant', 'eSAP_Level_1', 
    'eSAP_Level_2', 'eSAP_Level_3', 'eSAP_Level_4', 'eSAP_Level_5', 'SAP_Level', 'eSAP_Level', 
    'Miscellaneous', 'Deceased', 'Duplicate'
];
$columns= array_intersect($selected_columns, $allowed_columns);
$columns_sql= !empty($columns) ? implode(", ", $columns) : "*";
$sql = "SELECT $columns_sql FROM members WHERE 1=1";
$params = [];

if (!empty($filter_values) && is_array($filter_values)) {
    foreach ($filter_values as $key => $value) {
        if ($value !== "All" && $value !== null && $value !== "") {  
            switch ($key) {
                // Numeric Exact Match (IDs)
                case 'id':
                case 'LSF_Number':
                case 'Zip':
                case 'AMA_Number':
                    $sql .= " AND $key = :$key";
                    $params[":$key"] = (int) $value;
                    break;

                // Dropdown Exact Match
                case 'State':
                case 'Country':
                case 'Country_Coordinator':
                case 'SAP_Level':
                case 'eSAP_Level':
                    $sql .= " AND $key = :$key";
                    $params[":$key"] = $value;
                    break;

                // Binary Yes/No (NULL or NOT NULL check)
                case 'SAP_Aspirant':
                case 'eSAP_Aspirant':
                case 'Deceased':
                case 'Duplicate':
                    if ($value === "Yes") {
                        $sql .= " AND $key IS NOT NULL";
                    } elseif ($value === "No") {
                        $sql .= " AND $key IS NULL";
                    }
                    break;

                // General Search (LIKE for partial matches)
                case 'First_Name':
                case 'Last_Name':
                case 'Address':
                case 'City':
                case 'email':
                case 'Miscellaneous':
                    $sql .= " AND $key LIKE :$key";
                    $params[":$key"] = "%$value%";
                    break;
            }
        }
    }
}


// Validate and apply sorting if a valid column is provided
if (in_array($sortColumn, $allowed_columns)) {
    $sortOrder = ($sortOrder === "DESC") ? "DESC" : "ASC"; // Ensure only ASC or DESC is allowed
    $sql .= " ORDER BY $sortColumn $sortOrder";
}
// Add LIMIT clause
$sql .= " LIMIT :limit";
$params[':limit'] = $limit;

$stmt = $conn->prepare($sql);

// Bind parameters correctly
foreach ($params as $param => $val) {
    $stmt->bindValue($param, $val, is_int($val) ? PDO::PARAM_INT : PDO::PARAM_STR);
}

// Log SQL query and bound parameters for debugging
error_log("Executing SQL: " . $sql);
error_log("Bound Parameters: " . print_r($params, true));

$stmt->execute();
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Return JSON response
echo json_encode(["status" => "success", "members" => $results]);
?>
