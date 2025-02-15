<?php
header("Content-Type: application/json");
require_once "includes/config.php"; // Secure DB connection

$limit = $_POST['limit'] ?? 10;
$allowed_columns = ['id', 'LSF_Number', 'First_name', 'Last_name', 'City', 'State', 'Country', 'SAPLevel1', 'SAPLevel2', 'SAPLevel3', 'SAPLevel4', 'SAPLevel5', 'eSAPLevel1', 'eSAPLevel2', 'eSAPLevel3', 'eSAPLevel4', 'eSAPLevel5', 'Deceased', 'Duplicate', 'email', 'HighestSAPAchievement', 'HighestESAPAchievement']; 

// List of allowed column names (add more as necessary)
$columns = (count($_POST['columns']?? []) === 0) ? ['*'] : $_POST['columns'];
// If no columns are specified, select all

// validates/filters columns
$columns = array_filter($columns, function($col) use ($allowed_columns) {
    return in_array($col, $allowed_columns);
});

// If no valid columns are provided, default to all columns
// if empty, then all; if columns, then convert array to string separated by commas
$columns_sql = empty($columns) ? '*' : implode(',', $columns);

// selects all members who have achieved level 5 
$sql = "SELECT $columns_sql FROM members LIMIT :limit;";


$stmt = $conn->prepare($sql);
$stmt->bindValue(":limit", (int)$limit, PDO::PARAM_INT);

$stmt->execute();

// Return the results as a JSON response

echo json_encode(["status" => "success", "members" => $stmt->fetchAll()]);
?>