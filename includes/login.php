<?php
session_set_cookie_params([
  'lifetime' => 0,
  'path' => '/',
  'secure' => true,
  'httponly' => true,
  'samesite' => 'None'
]);
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
        "SELECT id, username, email, password_hash, is_confirmed, role
         FROM users
         WHERE username = :u OR email = :u
         LIMIT 1"
    );
    $stmt->execute([':u' => $username]);
    $user = $stmt->fetch();

    if (! $user || ! password_verify($password, $user['password_hash'])) {
        throw new Exception("Invalid credentials.");
    }

    if (! $user['is_confirmed']) {
    throw new Exception("Please confirm your email address before logging in.");
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
            'samesite' => 'None',
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

