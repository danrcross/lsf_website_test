<?php
// LOCAL LOGIN — no email confirmation required

session_set_cookie_params([
  'lifetime' => 0,
  'path' => '/',
  'secure' => false, // Localhost doesn't support HTTPS
  'httponly' => true,
  'samesite' => 'Lax'
]);
session_start();

require_once __DIR__ . '/../dev/config.php';

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

    // No is_confirmed check here for local use

    $_SESSION['user_id']   = $user['id'];
    $_SESSION['username']  = $user['username'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['user_role'] = $user['role'];

    if ($remember) {
        setcookie(session_name(), session_id(), [
            'expires'  => time() + 60 * 60 * 24 * 30,
            'path'     => '/',
            'secure'   => false,
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
    }

    echo "<p style='text-align:center;'>✅ Logged in as <strong>" . htmlspecialchars($user['username']) . "</strong></p>";
    echo "<script>
      if (window.parent && typeof window.parent.updateAuthUI === 'function') {
        window.parent.updateAuthUI({
          logged_in: true,
          username: " . json_encode($user['username']) . ",
          role: " . json_encode($user['role']) . "
        });
      }
    </script>";

} catch (Exception $e) {
    echo "<p style='color:red; text-align:center;'>" . htmlspecialchars($e->getMessage()) . "</p>";
}
