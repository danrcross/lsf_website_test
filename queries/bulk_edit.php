<?php
header("Content-Type: application/json");
require_once "../includes/config.php";

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "Access denied. Admins only."
    ]);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Invalid request method.");
    }

    // 1) Decode JSON payload
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON payload.");
    }

    // 2) Validate IDs
    $ids = $payload['ids'] ?? null;
    if (!is_array($ids) || empty($ids)) {
        throw new Exception("Array of IDs is required.");
    }
    foreach ($ids as $id) {
        if (filter_var($id, FILTER_VALIDATE_INT) === false) {
            throw new Exception("All IDs must be integers.");
        }
    }

    // 3) Validate updates
    $updates = $payload['updates'] ?? null;
    if (!is_array($updates) || empty($updates)) {
        throw new Exception("Updates object is required.");
    }

    // 4) Whitelist & build SET clause
    // same allowed columns as in query.php (minus computed columns)
    $allowed = [
      'LSF_Number','First_Name','Last_Name','Address','City','State','Zip','Country',
      'Country_Coordinator','email','Last_Contact','AMA_Number','SAP_Aspirant',
      'SAP_Level_1','SAP_Level_2','SAP_Level_3','SAP_Level_4','SAP_Level_5',
      'eSAP_Aspirant','eSAP_Level_1','eSAP_Level_2','eSAP_Level_3','eSAP_Level_4','eSAP_Level_5',
      'Miscellaneous','Deceased','Duplicate'
    ];
    $setParts = [];
    $values   = [];
    foreach ($updates as $col => $val) {
        if (!in_array($col, $allowed, true)) {
            continue; // skip disallowed / computed columns
        }
        $setParts[] = "`$col` = ?";
        // convert empty string → NULL
        $values[] = ($val === "") ? null : $val;
    }
    if (empty($setParts)) {
        throw new Exception("No valid columns to update.");
    }

    // 5) Build and execute UPDATE … WHERE id IN (...)
    $inClause    = implode(',', array_fill(0, count($ids), '?'));
    $sql         = "UPDATE members SET " . implode(', ', $setParts)
                 . " WHERE id IN ($inClause)";
    $stmt        = $conn->prepare($sql);

    // bind SET values
    $param = 1;
    foreach ($values as $v) {
        $type = is_null($v) ? PDO::PARAM_NULL : PDO::PARAM_STR;
        $stmt->bindValue($param++, $v, $type);
    }
    // bind IDs
    foreach ($ids as $id) {
        $stmt->bindValue($param++, $id, PDO::PARAM_INT);
    }

    if ($stmt->execute()) {
        echo json_encode([
          "success"       => true,
          "updated_count" => $stmt->rowCount()
        ]);
    } else {
        throw new Exception("Failed to perform bulk update.");
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
      "success" => false,
      "message" => $e->getMessage()
    ]);
}
