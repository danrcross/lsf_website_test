<?php
header("Content-Type: application/json");
require_once "../includes/config.php";

// Inputs
$limit = isset($_POST['limit']) ? (int) $_POST['limit'] : 10;
$filter_values = $_POST['filterVals'] ?? [];
$selected_columns = isset($_POST['columns']) && is_array($_POST['columns']) ? $_POST['columns'] : ['*'];
$sortColumn = $_POST['sortColumn'] ?? null;
$sortOrder = strtoupper($_POST['sortOrder'] ?? 'ASC');

// Allowed columns (SQL safety)
$allowed_columns = [
    'id', 'LSF_Number', 'First_Name', 'Last_Name', 'Address', 'City', 'State', 'Zip', 'Country',
    'Country_Coordinator', 'email', 'Last_Contact', 'AMA_Number',
    'SAP_Aspirant', 'SAP_Level_1', 'SAP_Level_2', 'SAP_Level_3',
    'SAP_Level_4', 'SAP_Level_5',
    'eSAP_Aspirant', 'eSAP_Level_1', 'eSAP_Level_2',
    'eSAP_Level_3', 'eSAP_Level_4', 'eSAP_Level_5',
    'SAP_Level', 'eSAP_Level',
    'Miscellaneous', 'Deceased', 'Duplicate', 'Bad_Email'
];

// Total count
$totalCountStmt = $conn->query("SELECT COUNT(*) FROM members");
$totalCount = (int) $totalCountStmt->fetchColumn();
$limit = min($limit, $totalCount);

// Selected columns
$columns = array_intersect($selected_columns, $allowed_columns);

// Ensure Bad_Email appears right after email
if (in_array('email', $columns) && in_array('Bad_Email', $columns)) {
    $emailIndex = array_search('email', $columns);
    $badEmailIndex = array_search('Bad_Email', $columns);
    if ($badEmailIndex !== $emailIndex + 1) {
        unset($columns[$badEmailIndex]);
        $columns = array_merge(
            array_slice($columns, 0, $emailIndex + 1),
            ['Bad_Email'],
            array_slice($columns, $emailIndex + 1)
        );
    }
}

$columns_sql = !empty($columns) ? implode(", ", $columns) : "*";

// Base query
$sql = "SELECT $columns_sql FROM members WHERE 1=1";
$params = [];

/* ---------------- FILTER HANDLING ---------------- */

foreach ($filter_values as $key => $value) {

    // Ignore empty values
    if ($value === "" || $value === null || $value === "All") continue;

    switch ($key) {

        // Numeric exact match
        case 'LSF_Number':
        case 'Zip':
        case 'AMA_Number':
            $sql .= " AND CAST($key AS UNSIGNED) = :$key";
            $params[":$key"] = (int)$value;
            break;

        // Numeric range
        case 'LSF_Number_range':
            if (is_array($value) && isset($value['min'], $value['max'])) {
                $sql .= " AND CAST(LSF_Number AS UNSIGNED) BETWEEN :lsf_min AND :lsf_max";
                $params[':lsf_min'] = (int)$value['min'];
                $params[':lsf_max'] = (int)$value['max'];
            }
            break;

        // String exact match
        case 'State':
        case 'Country':
        case 'Country_Coordinator':
        case 'SAP_Level':
        case 'eSAP_Level':
        case 'SAP_Aspirant':
        case 'eSAP_Aspirant':
            $sql .= " AND $key = :$key";
            $params[":$key"] = $value;
            break;

        // Checkbox / boolean
        case 'Deceased':
        case 'Duplicate':
        case 'Bad_Email':
            if ($value === true || $value === "true" || $value === 1 || $value === "1") {
                $sql .= " AND $key = 1";
            }
            break;

        // Text search (LIKE)
        case 'First_Name':
        case 'Last_Name':
        case 'Address':
        case 'City':
        case 'email':
        case 'Miscellaneous':
            $sql .= " AND $key LIKE :$key";
            $params[":$key"] = "%$value%";
            break;

        default:
            // ignore unknown keys
            break;
    }
}

/* ---------------- SORTING ---------------- */
if (in_array($sortColumn, $allowed_columns)) {
    $sortOrder = ($sortOrder === "DESC") ? "DESC" : "ASC";
    $sql .= " ORDER BY $sortColumn $sortOrder";
}

/* ---------------- LIMIT ---------------- */
$sql .= " LIMIT :limit";
$params[':limit'] = $limit;

/* ---------------- EXECUTE ---------------- */
$stmt = $conn->prepare($sql);

foreach ($params as $param => $val) {
    $stmt->bindValue($param, $val, is_int($val) ? PDO::PARAM_INT : PDO::PARAM_STR);
}

error_log("SQL: $sql");
error_log("Params: " . print_r($params, true));

$stmt->execute();
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "status" => "success",
    "members" => $results,
    "totalCount" => $totalCount
]);
