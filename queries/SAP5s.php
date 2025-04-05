<?php
// Include the database configuration file
require_once '../includes/config.php'; // Update this path to the actual location of your config.php

try {
    // Define the query to select certain members
    $query = "SELECT LSF_Number, First_Name, Last_Name, SAP_Level_5, State, Country FROM members WHERE SAP_Level_5 IS NOT NULL ORDER BY SAP_Level_5 ASC";

    // Prepare the statement
    $stmt = $conn->prepare($query);


    // Execute the query
    $stmt->execute();

    // Fetch the results
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if ($members) {
        // Output the results as JSON
        header('Content-Type: application/json');
        echo json_encode($members);
    } else {
        // No members found
        echo json_encode(["message" => "No members found"]);
    }
} catch (PDOException $e) {
    // Handle connection or query errors
    echo "Error: " . $e->getMessage();
}
?>
