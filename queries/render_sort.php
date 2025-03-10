<?php
header("Content-Type: application/json");
require_once "../includes/config.php"; // Ensure this points to the correct database config file

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }
    $testResponse = "Test response";

    echo json_encode(["status" => "success", "testResponse" => $testResponse]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>