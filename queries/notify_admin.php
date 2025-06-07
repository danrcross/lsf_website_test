<?php
require_once __DIR__ . '../includes/config.php';
header("Content-Type: application/json");

try {
    $data      = json_decode(file_get_contents("php://input"), true);
    $fullName  = trim($data['full_name'] ?? '');
    $email     = trim($data['email'] ?? '');
    $note      = trim($data['note'] ?? '');

    if (empty($fullName)) {
        throw new Exception("Full name is required.");
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email address.");
    }

    $stmt = $conn->prepare("INSERT INTO admin_requests (full_name, email, note) VALUES (:full_name, :email, :note)");
    $stmt->execute([
        ':full_name' => $fullName,
        ':email'     => $email,
        ':note'      => $note
    ]);

    echo json_encode(['success' => true, 'message' => 'Your request has been logged.']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
