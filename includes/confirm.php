<?php
require_once __DIR__ . '/config.php';

$token = $_GET['token'] ?? '';

if (!$token) {
    exit("<p style='color:red; text-align:center;'>Missing confirmation token.</p>");
}

try {
    $stmt = $conn->prepare("SELECT id FROM users WHERE confirmation_token = :token AND is_confirmed = 0");
    $stmt->execute([':token' => $token]);
    $user = $stmt->fetch();

    if ($user) {
        $stmt = $conn->prepare("UPDATE users SET is_confirmed = 1, confirmation_token = NULL WHERE id = :id");
        $stmt->execute([':id' => $user['id']]);
        echo "<p style='text-align:center;'>✅ Your account has been confirmed. You may now log in.</p>";
    } else {
        echo "<p style='color:red; text-align:center;'>Invalid or expired token.</p>";
    }
} catch (Exception $e) {
    echo "<p style='color:red; text-align:center;'>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
}