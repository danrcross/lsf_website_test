<?php
header("Content-Type: application/json");
require_once "../includes/config.php"; // Include database connection

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    // Define column groups
    $columnGroups = [
        "LSF Number" => ["LSF_Number"],
        "AMA Number" => ["AMA_Number"],
        "Name" => ["First_Name", "Last_Name"],
        "Location" => ["Address", "City", "State", "Zip", "Country", "Country_Coordinator"],
        "SAP Data" => ["SAP_Aspirant", "SAP_Level_1", "SAP_Level_2", "SAP_Level_3", "SAP_Level_4", "SAP_Level_5", "SAP_Level"],
        "eSAP Data" => ["eSAP_Aspirant", "eSAP_Level_1", "eSAP_Level_2", "eSAP_Level_3", "eSAP_Level_4", "eSAP_Level_5", "eSAP_Level"],
        "Miscellaneous" => ["Miscellaneous", "Deceased", "Duplicate"]
    ];

    echo json_encode(["status" => "success", "columnGroups" => $columnGroups]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
