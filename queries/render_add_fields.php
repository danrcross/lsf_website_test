<?php
header("Content-Type: application/json");
require_once "../includes/config.php"; // Database connection

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    // Fetch column names and their data types
    $stmt = $conn->query("SHOW COLUMNS FROM members");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fields to exclude
    $nonEditableFields = ["id", "SAP_Level", "eSAP_Level"];

    // Format the response
    $fields = [];
    foreach ($columns as $column) {
        if (!in_array($column["Field"], $nonEditableFields)) {
            $fields[] = [
                "name" => $column["Field"],
                "type" => $column["Type"]
            ];
        }
    }

    echo json_encode(["status" => "success", "fields" => $fields]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
