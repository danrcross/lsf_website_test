<?php
header("Content-Type: application/json");
require_once "../includes/config.php"; // Include database connection

try {
    // Query to fetch column names from the 'members' table
    $stmt = $conn->query("SHOW COLUMNS FROM members");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN); // Fetch column names

    // Return JSON response
    echo json_encode(["status" => "success", "columns" => $columns]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
