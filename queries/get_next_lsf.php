<?php
header("Content-Type: application/json");
require_once "../includes/config.php";

try {
    $stmt = $conn->query("SELECT MAX(CAST(LSF_Number AS UNSIGNED)) AS maxLSF FROM members WHERE LSF_Number IS NOT NULL AND LSF_Number != ''");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $nextLSF = $result && $result['maxLSF'] !== null ? (int)$result['maxLSF'] + 1 : 1;

    echo json_encode(["success" => true, "nextLSF" => $nextLSF]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
