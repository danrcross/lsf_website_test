<?php
session_start();
require_once __DIR__ . '/config.php';
header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Invalid request method.");
    }

    $token    = trim($_POST['token'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm  = $_POST['confirm'] ?? '';

    if (!$token || strlen($token) < 10) {
        throw new Exception("Invalid token.");
    }

    if ($password !== $confirm) {
        throw new Exception("Passwords do not match.");
    }

    if (strlen($password) < 6) {
        throw new Exception("Password must be at least 6 characters.");
    }

    // Find matching token
    $stmt = $conn->prepare("
        SELECT id FROM users
        WHERE reset_token = :token AND token_expires > NOW()
    ");
    $stmt->execute([':token' => $token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception("Invalid or expired reset link.");
    }

    // Update password and clear token
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("
        UPDATE users
        SET password_hash = :password, reset_token = NULL, token_expires = NULL
        WHERE id = :id
    ");
    $stmt->execute([
        ':password' => $passwordHash,
        ':id'       => $user['id']
    ]);

    echo json_encode(["success" => true, "message" => "Password updated successfully."]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
