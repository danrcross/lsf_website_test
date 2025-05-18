<?php
// LOCAL REGISTER — skips email confirmation

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
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = :username OR email = :email");
    $stmt->execute([':username' => $username, ':email' => $email]);
    if ($stmt->fetch()) {
        exit("<p style='color:red; text-align:center;'>Username or email already taken.</p>");
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("
        INSERT INTO users (username, email, password_hash, role)
        VALUES (:username, :email, :password, 'user')
    ");
    $stmt->execute([
        ':username' => $username,
        ':email'    => $email,
        ':password' => $hash
    ]);

    echo "<p style='text-align:center;'>✅ Registration successful! You may now log in.</p>";

} catch (Exception $e) {
    echo "<p style='color:red; text-align:center;'>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
}

