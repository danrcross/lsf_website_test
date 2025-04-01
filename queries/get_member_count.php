<?php
header('Content-Type: application/json');
require_once "../includes/config.php";

try {
    $stmt = $conn->query("SELECT COUNT(*) AS total FROM members");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(["status" => "success", "total" => (int)$result['total']]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
