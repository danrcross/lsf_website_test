<?php
header("Content-Type: application/json");
require_once "../includes/config.php"; // Include database connection

try {
    // Check if POST data is received
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        throw new Exception("Invalid request method.");
    }

    // Get JSON input and decode it
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        throw new Exception("No data received.");
    }

    // Define non-editable columns
    $nonEditableColumns = ["id", "SAP_Level", "eSAP_Level"];

    // Separate columns and values
    $columns = [];
    $values = [];
    $placeholders = [];

    foreach ($data as $key => $value) {
        if (in_array($key, $nonEditableColumns)) {
            continue; // Skip auto-generated and computed columns
        }

        if ($value === "" || $value === null) {
            $value = null; // Ensure empty values are NULL
        }

        $columns[] = "`$key`";
        $values[] = $value;
        $placeholders[] = "?";
    }

    if (empty($columns)) {
        throw new Exception("No valid fields to insert.");
    }

    // Build dynamic SQL query
    $query = "INSERT INTO members (" . implode(", ", $columns) . ") VALUES (" . implode(", ", $placeholders) . ")";
    $stmt = $conn->prepare($query);

    // Bind values dynamically
    foreach ($values as $i => $value) {
        $paramType = is_null($value) ? PDO::PARAM_NULL : PDO::PARAM_STR;
        $stmt->bindValue($i + 1, $value, $paramType);
    }

    // Execute query
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Member added successfully", "inserted_data" => $data]);
    } else {
        throw new Exception("Failed to add member.");
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
