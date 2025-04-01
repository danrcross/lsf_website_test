<?php
header("Content-Type: application/json");
require_once "../includes/config.php";

try {
    $stmt = $conn->query("SELECT MAX(CAST(LSF_Number AS UNSIGNED)) AS max_lsf FROM members WHERE LSF_Number IS NOT NULL AND LSF_Number != ''");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $nextLSF = isset($result['max_lsf']) ? ((int)$result['max_lsf'] + 1) : 1;

    echo json_encode(["status" => "success", "nextLSF" => $nextLSF]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>