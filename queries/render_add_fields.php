<?php
header("Content-Type: application/json");
require_once "../includes/config.php"; // Include database connection

try {
    // Get column metadata from 'members' table
    $query = "DESCRIBE members";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $fields = [];

    // Process columns
    foreach ($columns as $column) {
        $fields[] = [
            "name" => $column["Field"],
            "type" => $column["Type"]
        ];
    }

    echo json_encode(["status" => "success", "fields" => $fields]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>