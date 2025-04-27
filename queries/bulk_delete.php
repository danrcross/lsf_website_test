<?php
header("Content-Type: application/json");
require_once "../includes/config.php";

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
    // ensure every ID is an integer
    foreach ($ids as $id) {
        if (filter_var($id, FILTER_VALIDATE_INT) === false) {
            throw new Exception("All IDs must be integers.");
        }
    }

    // 3) Build and execute the DELETE query
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $sql = "DELETE FROM members WHERE id IN ($placeholders)";
    $stmt = $conn->prepare($sql);
    foreach ($ids as $i => $id) {
        $stmt->bindValue($i+1, $id, PDO::PARAM_INT);
    }

    if ($stmt->execute()) {
        echo json_encode([
          "success"       => true,
          "deleted_count" => $stmt->rowCount()
        ]);
    } else {
        throw new Exception("Failed to delete members.");
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
      "success" => false,
      "message" => $e->getMessage()
    ]);
}
