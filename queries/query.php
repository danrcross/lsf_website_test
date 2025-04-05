<?php
header("Content-Type: application/json");
require_once "../includes/config.php";

// Get the limit, filters, selected columns, and sort options from POST request
$limit = isset($_POST['limit']) ? (int) $_POST['limit'] : 10;
$filter_values = $_POST['filterVals'] ?? null;
$selected_columns = isset($_POST['columns']) && is_array($_POST['columns']) ? $_POST['columns'] : ['*'];
$sortColumn = $_POST['sortColumn'] ?? null;
$sortOrder = strtoupper($_POST['sortOrder'] ?? 'ASC'); // Default to ASC

// Define allowed columns to prevent SQL injection
$allowed_columns = [
    'id', 'LSF_Number', 'First_Name', 'Last_Name', 'Address', 'City', 'State', 'Zip', 'Country',
    'Country_Coordinator', 'email', 'Last_Contact', 'AMA_Number', 'SAP_Aspirant', 'SAP_Level_1', 
    'SAP_Level_2', 'SAP_Level_3', 'SAP_Level_4', 'SAP_Level_5', 'eSAP_Aspirant', 'eSAP_Level_1', 
    'eSAP_Level_2', 'eSAP_Level_3', 'eSAP_Level_4', 'eSAP_Level_5', 'SAP_Level', 'eSAP_Level', 
    'Miscellaneous', 'Deceased', 'Duplicate'
];

// Fetch the total count of members in the database
$totalCountQuery = "SELECT COUNT(*) as total FROM members";
$totalCountStmt = $conn->prepare($totalCountQuery);
$totalCountStmt->execute();
$totalCount = $totalCountStmt->fetch(PDO::FETCH_ASSOC)['total'];

// Ensure limit does not exceed total members
$limit = min($limit, $totalCount);

// Validate and clean selected columns
$columns = array_intersect($selected_columns, $allowed_columns);
$columns_sql = !empty($columns) ? implode(", ", $columns) : "*";

// Base SQL query
$sql = "SELECT $columns_sql FROM members WHERE 1=1";
$params = [];

// Handle filters
// Handle filters
if (!empty($filter_values) && is_array($filter_values)) {
    foreach ($filter_values as $key => $value) {
        if ($value !== "All" && $value !== null && $value !== "") {

            // ✅ NEW: Range-based LSF_Number
           if ($key === 'LSF_Number_range' && is_array($value)) {
    $sql .= " AND LSF_Number BETWEEN :lsf_min AND :lsf_max";
    $params[':lsf_min'] = (int)$value['min'];
    $params[':lsf_max'] = (int)$value['max'];
    continue; // Skip default handling
}

            // existing cases...
            switch ($key) {
                case 'id':
                case 'LSF_Number':
    $sql .= " AND CAST(LSF_Number AS UNSIGNED) = :$key";
    $params[":$key"] = (int)$value;
    break;
                case 'Zip':
                case 'AMA_Number':
                    $sql .= " AND $key = :$key";
                    $params[":$key"] = (int) $value;
                    break;

                case 'State':
                case 'Country':
                case 'Country_Coordinator':
                case 'SAP_Level':
                case 'eSAP_Level':
                    $sql .= " AND $key = :$key";
                    $params[":$key"] = $value;
                    break;

                case 'Deceased':
                case 'Duplicate':
                    if ($value === "1") {
                        $sql .= " AND $key = 1";
                    } elseif ($value === "0") {
                        $sql .= " AND ($key = 0 OR $key IS NULL)";
                    }
                    break;

                case 'SAP_Aspirant':
                case 'eSAP_Aspirant':
                    $sql .= " AND $key = :$key";
                    $params[":$key"] = $value;
                    break;

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


// Validate and apply sorting
if (in_array($sortColumn, $allowed_columns)) {
    $sortOrder = ($sortOrder === "DESC") ? "DESC" : "ASC"; // Ensure only ASC or DESC is allowed
    $sql .= " ORDER BY $sortColumn $sortOrder";
}

// Add LIMIT clause
$sql .= " LIMIT :limit";
$params[':limit'] = $limit;

// Prepare statement
$stmt = $conn->prepare($sql);

// Bind parameters
foreach ($params as $param => $val) {
    $stmt->bindValue($param, $val, is_int($val) ? PDO::PARAM_INT : PDO::PARAM_STR);
}

// Debugging logs (useful for troubleshooting)
error_log("Executing SQL: " . $sql);
error_log("Bound Parameters: " . print_r($params, true));

// Execute query and fetch results
$stmt->execute();
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Return JSON response
echo json_encode(["status" => "success", "members" => $results, "totalCount" => $totalCount]);
?>

