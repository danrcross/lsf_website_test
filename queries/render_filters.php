<?php
header("Content-Type: application/json");
require_once "../includes/config.php";

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    $filters = [
        "LSF_Number" => "LSF_Number",
        "First_Name" => "First_Name",
        "Last_Name" => "Last_Name",
        "Address" => "Address",
        "City" => "City",
        "Zip" => "Zip",
        "email" => "email",
        "AMA_Number" => "AMA_Number",
        "Miscellaneous" => "Miscellaneous",
        "State" => "State",
        "Country" => "Country",
        "Country_Coordinator" => "Country_Coordinator",
        "SAP_Aspirant" => "SAP_Aspirant",
        "eSAP_Aspirant" => "eSAP_Aspirant",
        "Deceased" => "Deceased",
        "Duplicate" => "Duplicate",
        "Bad_Email" => "Bad_Email",
        "SAP_Level" => "SAP_Level",
        "eSAP_Level" => "eSAP_Level"
    ];

    $filterOptions = [];

    foreach ($filters as $key => $column) {

        if ($column === "LSF_Number") {
            // Range filter for LSF_Number
            $stmt = $conn->query("
                SELECT 
                    MIN(CAST(LSF_Number AS UNSIGNED)) AS minVal, 
                    MAX(CAST(LSF_Number AS UNSIGNED)) AS maxVal 
                FROM members 
                WHERE LSF_Number IS NOT NULL AND LSF_Number != ''
            ");
            $range = $stmt->fetch(PDO::FETCH_ASSOC);

            $filterOptions[$key] = [
                "type" => "range",
                "min"  => (int) $range['minVal'],
                "max"  => (int) $range['maxVal'],
            ];

        } elseif (in_array($column, ["State", "Country", "Country_Coordinator", "SAP_Level", "eSAP_Level"])) {
            // Dropdown filters
            $stmt = $conn->prepare("
                SELECT DISTINCT $column 
                FROM members 
                WHERE $column IS NOT NULL AND $column != '' 
                ORDER BY $column ASC
            ");
            $stmt->execute();
            $values = $stmt->fetchAll(PDO::FETCH_COLUMN);
            array_unshift($values, "All");
            $filterOptions[$key] = $values;

        } elseif (in_array($column, ["SAP_Aspirant", "eSAP_Aspirant"])) {
            // Yes/No dropdowns
            $filterOptions[$key] = ["All", "Yes", "No"];

        } elseif (in_array($column, ["Deceased", "Duplicate", "Bad_Email"])) {
            // Boolean checkbox filters
            $filterOptions[$key] = ["type" => "boolean"];

        } else {
            // Text search inputs
            $filterOptions[$key] = "search";
        }
    }

    echo json_encode([
        "status" => "success",
        "filterOptions" => $filterOptions
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>