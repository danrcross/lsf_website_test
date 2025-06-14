<?php
session_start();
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/src/sendMail.php'; // <-- make sure this file contains sendConfirmationMail()

// Sanitize and validate input
$username = trim($_POST['username'] ?? '');
$email    = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$confirm  = $_POST['confirm'] ?? '';

// Validate passwords
if ($password !== $confirm) {
    exit("<p style='color:red; text-align:center;'>Passwords do not match.</p>");
}

if (strlen($password) < 6) {
    exit("<p style='color:red; text-align:center;'>Password must be at least 6 characters.</p>");
}

try {
    // Check for duplicate username or email
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = :username OR email = :email");
    $stmt->execute([
        ':username' => $username,
        ':email'    => $email
    ]);

    if ($stmt->fetch()) {
        exit("<p style='color:red; text-align:center;'>Username or email already taken.</p>");
    }

    // Hash password and generate token
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $token = bin2hex(random_bytes(32));

    // Insert user into database
    $stmt = $conn->prepare("
        INSERT INTO users (username, email, password_hash, role, confirmation_token, is_confirmed)
        VALUES (:username, :email, :password, 'user', :token, 0)
    ");
    $stmt->execute([
        ':username' => $username,
        ':email'    => $email,
        ':password' => $passwordHash,
        ':token'    => $token
    ]);

    // Use PHPMailer to send confirmation
    $mailSent = sendConfirmationMail($email, $username, $token);

    if ($mailSent) {
        echo "<p style='text-align:center;'>✅ Registration successful! Please check your email to confirm your account.</p>";
    } else {
        echo "<p style='color:red; text-align:center;'>❌ Registration saved, but the confirmation email could not be sent. Please contact support.</p>";
    }

} catch (Exception $e) {
    echo "<p style='color:red; text-align:center;'>An error occurred: " . htmlspecialchars($e->getMessage()) . "</p>";
}
