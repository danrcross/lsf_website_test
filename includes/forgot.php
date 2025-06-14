<?php
session_start();
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/src/sendMail.php'; // ✅ Correct relative path
header('Content-Type: application/json');

try {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        throw new Exception("Invalid request method.");
    }

    $email = trim($_POST['email'] ?? '');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email format.");
    }

    // Check for existing user
    $stmt = $conn->prepare("SELECT id, username FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception("No account found with that email.");
    }

    // Generate reset token and expiration (1 hour)
    $token = bin2hex(random_bytes(32));
    $expires = date("Y-m-d H:i:s", time() + 3600);

    // Store token in database
    $stmt = $conn->prepare("UPDATE users SET reset_token = :token, token_expires = :expires WHERE id = :id");
    $stmt->execute([
        ':token' => $token,
        ':expires' => $expires,
        ':id' => $user['id']
    ]);

    // Build reset link
    $resetLink = "https://" . $_SERVER['HTTP_HOST'] . "/pages/reset.htm?token=" . urlencode($token);

    // Send reset email
    $mailSent = sendResetMail($email, $user['username'], $resetLink);

    if ($mailSent) {
        echo json_encode(["success" => true, "message" => "A reset link has been sent to your email. Allow up to 5 minutes for delivery."]);
    } else {
        echo json_encode(["success" => false, "message" => "Could not send email. Please try again later."]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}