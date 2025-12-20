<?php
header("Content-Type: application/json");
require_once "../includes/config.php";

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success"=>false,"message"=>"Access denied. Admins only."]);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') throw new Exception("Invalid request method.");
    $payload = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) throw new Exception("Invalid JSON payload.");

    $ids = $payload['ids'] ?? null;
    if (!is_array($ids) || empty($ids)) throw new Exception("Array of IDs is required.");
    foreach ($ids as $id) if (!filter_var($id, FILTER_VALIDATE_INT)) throw new Exception("All IDs must be integers.");

    $updates = $payload['updates'] ?? null;
    if (!is_array($updates) || empty($updates)) throw new Exception("Updates object is required.");

    $allowed = [
      'LSF_Number','First_Name','Last_Name','Address','City','State','Zip','Country',
      'Country_Coordinator','email','Last_Contact','AMA_Number','SAP_Aspirant',
      'SAP_Level_1','SAP_Level_2','SAP_Level_3','SAP_Level_4','SAP_Level_5',
      'eSAP_Aspirant','eSAP_Level_1','eSAP_Level_2','eSAP_Level_3','eSAP_Level_4','eSAP_Level_5',
      'Miscellaneous','Deceased','Duplicate','Bad_Email'
    ];

    $setParts = [];
    $values   = [];
    foreach ($updates as $col => $val) {
        if (!in_array($col, $allowed, true)) continue;

        if (in_array($col, ['Deceased','Duplicate','Bad_Email'], true)) {
            $val = (int)$val; // ensure integer 0/1
        } elseif ($val === "") {
            $val = null;
        }

        $setParts[] = "`$col` = ?";
        $values[] = $val;
    }

    if (empty($setParts)) throw new Exception("No valid columns to update.");

    $inClause = implode(',', array_fill(0, count($ids), '?'));
    $sql = "UPDATE members SET " . implode(', ', $setParts) . " WHERE id IN ($inClause)";
    $stmt = $conn->prepare($sql);

    $param = 1;
    foreach ($values as $v) $stmt->bindValue($param++, $v, is_null($v)?PDO::PARAM_NULL:PDO::PARAM_STR);
    foreach ($ids as $id) $stmt->bindValue($param++, $id, PDO::PARAM_INT);

    if ($stmt->execute()) {
        echo json_encode(["success"=>true,"updated_count"=>$stmt->rowCount()]);
    } else {
        throw new Exception("Failed to perform bulk update.");
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["success"=>false,"message"=>$e->getMessage()]);
}
