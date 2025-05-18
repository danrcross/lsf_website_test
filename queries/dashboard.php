<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
    exit;
}

try {
    $userId = $_SESSION['user_id'];
    $userRole = $_SESSION['user_role'];

    // Get the user's email from the users table
    $stmt = $conn->prepare("SELECT email FROM users WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $userId]);
    $email = $stmt->fetchColumn();

    if (!$email) {
        throw new Exception("Email not found for user.");
    }

    // Fetch the corresponding member record
    $stmt = $conn->prepare("SELECT * FROM members WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $email]);
    $member = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$member) {
        throw new Exception("No member record found for this email.");
    }

    // Handle update via POST
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents("php://input"), true);
        if (!is_array($input)) {
            throw new Exception("Invalid input.");
        }

        // Determine editable fields
        $editable = ['First_Name', 'Last_Name', 'Address', 'City', 'State', 'Zip', 'Country', 'email'];
        if ($userRole === 'admin') {
            // Allow all fields except ID for admin
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

        // Refresh member data
        $stmt = $conn->prepare("SELECT * FROM members WHERE id = :id");
        $stmt->execute([':id' => $member['id']]);
        $member = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    echo json_encode(['success' => true, 'member' => $member, 'role' => $userRole]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
