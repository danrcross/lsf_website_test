<?php
header("Content-Type: application/json");
require_once "../includes/config.php"; // Ensure this points to the correct database config file

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    $filters = [
        "ID" => "id",
        "LSF_Number" => "LSF_Number",
        "First_Name" => "First_Name",
        "Last_Name" => "Last_Name",
        "Address" => "Address",
        "City" => "City",
        "Zip" => "Zip",
        "Email" => "email",
        "AMA_Number" => "AMA_Number",
        "Miscellaneous" => "Miscellaneous",
        "State" => "State",
        "Country" => "Country",
        "Country_Coordinator" => "Country_Coordinator",
        "SAPAspFilt" => "SAP_Aspirant",
        "eSAPAspFilt" => "eSAP_Aspirant",
        "deceasedFilt" => "Deceased",
        "dupFilt" => "Duplicate",
        "hiSAPFilt" => "SAP_Level",
        "hiESAPFilt" => "eSAP_Level"
    ];

    $filterOptions = [];

    foreach ($filters as $key => $column) {
        if (in_array($column, ["State", "Country", "Country_Coordinator", "SAP_Level", "eSAP_Level"])) {
            // Dropdown filters (get distinct values)
            $stmt = $conn->prepare("SELECT DISTINCT $column FROM members WHERE $column IS NOT NULL ORDER BY $column ASC");
            $stmt->execute();
            $values = $stmt->fetchAll(PDO::FETCH_COLUMN);
            array_unshift($values, "All");
            $filterOptions[$key] = $values;
        } elseif (in_array($column, ["SAP_Aspirant", "eSAP_Aspirant", "Deceased", "Duplicate"])) {
            // Yes/No dropdowns
            $filterOptions[$key] = ["All", "Yes", "No"];
        } else {
            // Search inputs for text fields
            $filterOptions[$key] = "search";
        }
    }

    echo json_encode(["status" => "success", "filterOptions" => $filterOptions]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
