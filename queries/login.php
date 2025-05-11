<?php
session_start();

require_once __DIR__ . '/../includes/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo "Access denied.";
    exit;
}

$username = trim($_POST['username']);
$password = $_POST['password'];
$remember = isset($_POST['remember']);

try {
    $stmt = $conn->prepare(
        "SELECT id, username, email, password_hash, role
         FROM users
         WHERE username = :u OR email = :u
         LIMIT 1"
    );
    $stmt->execute([':u' => $username]);
    $user = $stmt->fetch();

    if (! $user || ! password_verify($password, $user['password_hash'])) {
        throw new Exception("Invalid credentials.");
    }

    $_SESSION['user_id']   = $user['id'];
    $_SESSION['username']  = $user['username'];
    $_SESSION['user_role'] = $user['role'];

    if ($remember) {
        setcookie(session_name(), session_id(), [
            'expires'  => time() + 60 * 60 * 24 * 30,
            'path'     => '/',
            'secure'   => true,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }

    echo "<p style='text-align:center;'>✅ Logged in as <strong>" . htmlspecialchars($user['username']) . "</strong></p>";

} catch (Exception $e) {
    echo "<p style='color:red; text-align:center;'>" . htmlspecialchars($e->getMessage()) . "</p>";
}

