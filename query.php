<?php
header("Content-Type: application/json");
require_once "includes/config.php";

$limit = isset($_POST['limit']) ? (int) $_POST['limit'] : 10;
$filter_values = $_POST['filterVals'] ?? null;

$sql = "SELECT * FROM members WHERE 1=1";
$params = [];

if (!empty($filter_values) && is_array($filter_values)) {
    foreach ($filter_values as $key => $value) {
        if ($value !== "All" && $value !== null && $value !== "") {  
            switch ($key) {
                // Numeric Exact Match (IDs)
                case 'ID':
                case 'LSF_Number':
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
                default:
                    $sql .= " AND $key LIKE :$key";
                    $params[":$key"] = "%$value%";
                    break;
            }
        }
    }
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
