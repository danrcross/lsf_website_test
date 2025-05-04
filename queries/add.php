<?php
header("Content-Type: application/json");
require_once "../includes/config.php";

try {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        throw new Exception("Invalid request method.");
    }

    // 1) Decode incoming JSON
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        throw new Exception("No data received.");
    }

    // 2) If they provided an LSF_Number, ensure it’s not already in use
    if (isset($data['LSF_Number']) && trim($data['LSF_Number']) !== '') {
        $lsf = trim($data['LSF_Number']);
        $stmt = $conn->prepare(
            "SELECT COUNT(*) FROM members WHERE LSF_Number = :lsf"
        );
        $stmt->execute([':lsf' => $lsf]);
        if ($stmt->fetchColumn() > 0) {
            echo json_encode([
                'success' => false,
                'message' => "LSF Number {$lsf} is already in use."
            ]);
            exit;
        }
    }

    // 3) Build dynamic INSERT (skipping id, computed columns, etc.)
    $nonEditable = ['id', 'SAP_Level', 'eSAP_Level'];
    $cols = $placeholders = $values = [];
    foreach ($data as $key => $val) {
        if (in_array($key, $nonEditable)) continue;
        $cols[]         = "`$key`";
        $placeholders[] = "?";
        $values[]       = ($val === "" ? null : $val);
    }

    if (empty($cols)) {
        throw new Exception("No valid fields to insert.");
    }

    $sql = "INSERT INTO members (" . implode(", ", $cols) . ")
            VALUES (" . implode(", ", $placeholders) . ")";
    $stmt = $conn->prepare($sql);

    // 4) Bind & execute
    foreach ($values as $i => $v) {
        $stmt->bindValue($i+1, $v, is_null($v) ? PDO::PARAM_NULL : PDO::PARAM_STR);
    }
    $stmt->execute();

    echo json_encode([
        'success' => true,
        'message' => "Member added successfully.",
        'inserted_id' => $conn->lastInsertId()
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
