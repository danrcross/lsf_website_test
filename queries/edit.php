<?php
header("Content-Type: application/json");
require_once "../includes/config.php"; // Include database connection

try {
    // Check if POST data is received
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        throw new Exception("Invalid request method.");
    }
    $id= $_POST['id'] ?? null;
    $updateData= $_POST['data'] ?? [];

    if (!$id) {
        throw new Exception("ID is required.");
    }

    if (empty($updateData)) {
        throw new Exception("Data is required.");
    }

    //Build dynamic query...
    $columns=[];
    $values=[];
    // loop through data, separate keys and values into two arrays
    $nonEditableColumns = ["SAP_Level", "eSAP_Level"]; // Exclude computed columns
foreach ($updateData as $key => $value) {
    if (in_array($key, $nonEditableColumns)) {
        continue; // Skip computed columns
    }
    $columns[] = "`$key` = ?";
    $values[] = ($value === "") ? null : $value; // Convert empty string to NULL
}

    // Build query string from the keys. .implode will join the keys with a comma and space, as required by SQL syntax
    $query= "UPDATE members SET " .implode(", ", $columns). " WHERE id= ?";
    // Prepare the query. $conn is the database connection object, prepare() is a PDO method that prepares the query
    $stmt= $conn-> prepare($query);
    // Bind the values to the query. The bindValues() method binds the values to the query. The first argument is the position of the value in the query, and the second argument is the value itself
    foreach ($values as $i => $value) {
        $paramType = is_null($value) ? PDO::PARAM_NULL : PDO::PARAM_STR;
        $stmt->bindValue($i + 1, $value, $paramType);
    }
    // Bind the ID to the query. since the ID is the last value in the query, we can bind it using the count() function to get the number of values in the $values array (equal to number of columns). thus, +1 would take us to the ID position (last ? in the query)
    $stmt->bindValue(count($values) + 1, $id, PDO::PARAM_INT);

    //execute the query
    if( $stmt->execute() ) {
        echo json_encode(["success"=> true, "message"=> "Member updated successfully", "updated_data"=> $updateData]);
    } else {
        throw new Exception("Failed to update member.");
    }

}catch (Exception $e) {
    echo json_encode(["success"=> false, "message"=> $e->getMessage()]);
}

?>
