<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
    exit;
}

try {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!$input || !is_array($input)) {
        throw new Exception("Invalid input data.");
    }

    $userId   = $_SESSION['user_id'];
    $updates  = [];
    $params   = [':id' => $userId];

    if (!empty($input['username'])) {
        $updates[] = "username = :username";
        $params[':username'] = $input['username'];
    }

    if (!empty($input['password'])) {
        $updates[] = "password_hash = :password";
        $params[':password'] = password_hash($input['password'], PASSWORD_DEFAULT);
    }

    if (empty($updates)) {
        throw new Exception("No changes submitted.");
    }

    $sql = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

