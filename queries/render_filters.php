<?php
header("Content-Type: application/json");
require_once "../includes/config.php"; // Ensure this points to the correct database config file

try {
    // Ensure the database connection is established
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    // Define filterable columns and how to query them
    $filters = [
        "SAPAspFilt" => "SAP_Aspirant",
        "eSAPAspFilt" => "eSAP_Aspirant",
        "deceasedFilt" => "Deceased",
        "dupFilt" => "Duplicate",
        "hiSAPFilt" => "SAP_Level",
        "hiESAPFilt" => "eSAP_Level"
    ];

    $filterOptions = [];

    foreach ($filters as $key => $column) {
        // Special handling for binary (NULL/NOT NULL) columns
        if (in_array($column, ["SAP_Aspirant", "eSAP_Aspirant", "Deceased", "Duplicate"])) {
            $filterOptions[$key] = ["All", "Yes", "No"];
        } else {
            // Fetch distinct numeric values for SAP/eSAP levels
            $stmt = $conn->prepare("SELECT DISTINCT $column FROM members WHERE $column IS NOT NULL ORDER BY $column ASC");
            $stmt->execute();
            $values = $stmt->fetchAll(PDO::FETCH_COLUMN);

            // Include "All" and "None" as default options
            array_unshift($values, "None");
            array_unshift($values, "All");

            $filterOptions[$key] = $values;
        }
    }

    // Return JSON response
    echo json_encode(["status" => "success", "filterOptions" => $filterOptions]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
