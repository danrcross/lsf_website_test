<?php
//create connection to database
$servername = "localhost";
$username = "root"; // Set this in cPanel
$password = "PASSWORD"; // Set this in cPanel
$dbname = "lsf_db"; // Set this in cPanel

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>