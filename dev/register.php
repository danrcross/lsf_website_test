<?php
session_start();
require_once __DIR__ . '/config.php';
// reCAPTCHA validation
$captcha = $_POST['g-recaptcha-response'] ?? '';

if (!$captcha) {
    exit("<p style='color:red; text-align:center;'>Please complete the CAPTCHA.</p>");
}

$secretKey = '6LcV_R4sAAAAAHeKrPTFgUiKUoMcKaeefqE7qeQt';
$response = file_get_contents(
    "https://www.google.com/recaptcha/api/siteverify?secret={$secretKey}&response={$captcha}"
);
$responseData = json_decode($response);

if (!$responseData->success) {
    exit("<p style='color:red; text-align:center;'>CAPTCHA verification failed. Try again.</p>");
}
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

    // Hash password
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    // Insert user into database
    $stmt = $conn->prepare("
        INSERT INTO users (username, email, password_hash, role)
        VALUES (:username, :email, :password, 'user')
    ");
    $stmt->execute([
        ':username' => $username,
        ':email'    => $email,
        ':password' => $passwordHash
    ]);

    echo "<p style='text-align:center;'>✅ Registration successful! You may now log in.</p>";

} catch (Exception $e) {
    echo "<p style='color:red; text-align:center;'>An error occurred: " . htmlspecialchars($e->getMessage()) . "</p>";
}
