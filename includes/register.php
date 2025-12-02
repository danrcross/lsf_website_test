<?php
session_start();
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/src/sendMail.php'; // <-- make sure this file contains sendConfirmationMail()

// Verify reCAPTCHA v2
$captcha = $_POST['g-recaptcha-response'] ?? '';

if (!$captcha) {
    exit("<p style='color:red; text-align:center;'>Please complete the CAPTCHA.</p>");
}

$secretKey = '6LeoIR8sAAAAAKKnG3LDan1vCe4nTrSEvbpk6jEW';
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
        echo "<p style='text-align:center;'>✅ Registration successful! <br><br> Please check your email to confirm your account.<br><br> If you cannot find your confirmation email, please check your spam/junk folder.<br><br> If you continue to encounter any issues, you may contact support @ <a href='mailto:webmaster@silentflight.org'>webmaster@silentflight.org</a>.</p>";
    } else {
        echo "<p style='color:red; text-align:center;'>❌ Registration saved, but the confirmation email could not be sent. <br><br> Please contact support @ <a href='mailto:webmaster@silentflight.org'>webmaster@silentflight.org</a>.</p>";
    }

} catch (Exception $e) {
    echo "<p style='color:red; text-align:center;'>An error occurred: " . htmlspecialchars($e->getMessage()) . "</p>";
}
