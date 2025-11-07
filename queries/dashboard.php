<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/config.php';

try {
    // 1) Check authentication
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
        exit;
    }

    $userId   = $_SESSION['user_id'];
    $userRole = $_SESSION['user_role'] ?? 'user';

    // 2) Get username/email from session or DB fallback
    $userName  = $_SESSION['username'] ?? '';
    $userEmail = $_SESSION['email'] ?? '';

    if (empty($userName) || empty($userEmail)) {
        $stmt = $conn->prepare("SELECT username, email FROM users WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        $userName  = $user['username'] ?? $userName;
        $userEmail = $user['email'] ?? $userEmail;
    }

    // 3) Fetch member record
    $stmt = $conn->prepare("SELECT * FROM members WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $userEmail]);
    $member = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$member) {
        echo json_encode([
            'success' => true,
            'no_member' => true,
            'message' => 'No member record found for your email.',
            'role' => $userRole,
            'username' => $userName,
            'email' => $userEmail
        ]);
        exit;
    }

    // 4) Handle POST update
    $message = '';
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents("php://input"), true);
        if (!is_array($input)) {
            throw new Exception("Invalid input data.");
        }

        // 5) Define editable fields
        $restrictedFields = ['id', 'password', 'LSF_Number', 'SAP_Level', 'eSAP_Level']; // never editable by admin or user
        if ($userRole === 'admin') {
            $editable = array_diff(array_keys($member), $restrictedFields);
        } else {
            $editable = ['First_Name', 'Last_Name', 'Address', 'City', 'State', 'Zip', 'Country', 'email'];
        }

        // 6) Prepare update
        $updates = [];
        $params  = [':id' => $member['id']];
        foreach ($editable as $field) {
            if (isset($input[$field])) {
                $updates[] = "`$field` = :$field";
                $params[":$field"] = trim($input[$field]) === '' ? null : trim($input[$field]);
            }
        }

        if (!empty($updates)) {
            $sql = "UPDATE members SET " . implode(", ", $updates) . " WHERE id = :id";
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            $message = "Member updated successfully.";
        } else {
            $message = "No changes to update.";
        }

        // Re-fetch updated member
        $stmt = $conn->prepare("SELECT * FROM members WHERE id = :id");
        $stmt->execute([':id' => $member['id']]);
        $member = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // 7) Build response
    $response = [
        'success'  => true,
        'role'     => $userRole,
        'username' => $userName,
        'email'    => $userEmail,
        'member'   => $member,
        'message'  => $message
    ];

    echo json_encode($response);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
