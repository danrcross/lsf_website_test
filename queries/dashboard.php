<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
    exit;
}

try {
    $userId   = $_SESSION['user_id'];
    $userRole = $_SESSION['user_role'] ?? 'user';

    // Attempt to get username and email from session
    $userName = $_SESSION['username'] ?? '';
    $userEmail = $_SESSION['email'] ?? '';

    // Fallback: fetch username/email from users table if not in session
    if (empty($userName) || empty($userEmail)) {
        $stmt = $conn->prepare("SELECT username, email FROM users WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        $userName = $user['username'] ?? $userName;
        $userEmail = $user['email'] ?? $userEmail;
    }

    // Try to get member record based on email
    $member = null;
    if ($userEmail) {
        $stmt = $conn->prepare("SELECT * FROM members WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $userEmail]);
        $member = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Handle POST update if a member record exists
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $member) {
        $input = json_decode(file_get_contents("php://input"), true);
        if (!is_array($input)) {
            throw new Exception("Invalid input.");
        }

        // Define editable fields
        $editable = ['First_Name', 'Last_Name', 'Address', 'City', 'State', 'Zip', 'Country', 'email'];
        if ($userRole === 'admin') {
            $editable = array_keys($member);
            $editable = array_filter($editable, fn($f) => $f !== 'id');
        }

        $updates = [];
        $params = [':id' => $member['id']];
        foreach ($editable as $field) {
            if (array_key_exists($field, $input)) {
                $updates[] = "$field = :$field";
                $params[":$field"] = $input[$field] === '' ? null : $input[$field];
            }
        }

        if (!empty($updates)) {
            $sql = "UPDATE members SET " . implode(", ", $updates) . " WHERE id = :id";
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
        }

        // Re-fetch updated member
        $stmt = $conn->prepare("SELECT * FROM members WHERE id = :id");
        $stmt->execute([':id' => $member['id']]);
        $member = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Build response
    $response = [
        'success'  => true,
        'role'     => $userRole,
        'username' => $userName,
        'email'    => $userEmail,
    ];

    if ($member) {
        $response['member'] = $member;
    } else {
        $response['no_member'] = true;
        $response['message']   = 'No member record found for your email.';
    }

    echo json_encode($response);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
