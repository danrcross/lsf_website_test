<?php
session_start();
require_once __DIR__ . '/config.php';

$username = trim($_POST['username'] ?? '');
$email    = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$confirm  = $_POST['confirm'] ?? '';

if ($password !== $confirm) {
    exit("<p style='color:red; text-align:center;'>Passwords do not match.</p>");
}

if (strlen($password) < 6) {
    exit("<p style='color:red; text-align:center;'>Password must be at least 6 characters.</p>");
}

try {
    // Check for duplicates
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = :username OR email = :email");
    $stmt->execute([':username' => $username, ':email' => $email]);
    if ($stmt->fetch()) {
        exit("<p style='color:red; text-align:center;'>Username or email already taken.</p>");
    }

    $hash  = password_hash($password, PASSWORD_DEFAULT);
    $token = bin2hex(random_bytes(32));

    // Insert new user
    $stmt = $conn->prepare("
        INSERT INTO users (username, email, password_hash, role, confirmation_token, is_confirmed)
        VALUES (:username, :email, :password, 'user', :token, 0)
    ");
    $stmt->execute([
        ':username' => $username,
        ':email'    => $email,
        ':password' => $hash,
        ':token'    => $token
    ]);

    // Confirmation email setup
    $confirmUrl = "https://kml.b15.mytemp.website/includes/confirm.php?token=$token";
    $subject = "Confirm your League of Silent Flight account";
    $message = "Hi $username,\n\nPlease confirm your account by clicking the link below:\n\n$confirmUrl\n\nThank you!\nLSF Web Team";
    $headers = "From: no-reply@silentflight.org\r\n";
    $headers .= "Reply-To: support@silentflight.org\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    $mailSuccess = mail($email, $subject, $message, $headers);

    if ($mailSuccess) {
        echo "<p style='text-align:center;'>✅ Registration successful! Please check your email to confirm your account.</p>";
    } else {
        echo "<p style='color:red; text-align:center;'>❌ Registration saved, but the confirmation email failed to send.</p>";
    }

    // Optional: uncomment to debug mail content
    /*
    echo "<pre>";
    echo "TO: $email\n";
    echo "SUBJECT: $subject\n";
    echo "MESSAGE:\n$message\n";
    echo "HEADERS:\n$headers\n";
    echo "</pre>";
    */

} catch (Exception $e) {
    echo "<p style='color:red; text-align:center;'>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
}
