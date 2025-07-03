<?php
header("Content-Type: application/json");
require_once "../includes/config.php"; // Database connection

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "Access denied. Admins only."
    ]);
    exit;
}
try {
    //  Ensure the request method is POST
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        throw new Exception("Invalid request method.");
    }

    //  Get the ID from the POST request
    $id = $_POST['id'] ?? null;

    //  Validate ID
    if (!$id || !filter_var($id, FILTER_VALIDATE_INT)) {
        throw new Exception("Valid member ID is required.");
    }

    //  Prepare the DELETE query
    $query = "DELETE FROM members WHERE id = :id";
    $stmt = $conn->prepare($query);
    $stmt->bindValue(":id", $id, PDO::PARAM_INT);

    //  Execute the query
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Member deleted successfully."]);
    } else {
        throw new Exception("Failed to delete member.");
    }

} catch (Exception $e) {
    //  Return JSON error response
    echo json_encode(["success" => false, "message" => $e->getMessage()]);

    //  Log the error for debugging
    error_log("Delete Error: " . $e->getMessage());
}
?>
