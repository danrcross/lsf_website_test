<?php
session_start();

header("Content-Type: application/json");
require_once __DIR__ . '../includes/config.php';

try {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        throw new Exception("Invalid request method.");
    }

    // 1) Get POSTed JSON
    $input = json_decode(file_get_contents("php://input"), true);
    if (!$input || !is_array($input)) {
        throw new Exception("Invalid input data.");
    }

    $memberId = $input['id'] ?? null;
    if (!$memberId || !is_numeric($memberId)) {
        throw new Exception("Valid member ID is required.");
    }

    unset($input['id']); // Remove 'id' from update set
    $updateData = $input;



    if (empty($updateData)) {
        throw new Exception("No data provided to update.");
    }

    // 2) Permission check
    $userId   = $_SESSION['user_id'] ?? null;
    $userRole = $_SESSION['user_role'] ?? 'user';

    $stmt = $conn->prepare("SELECT email FROM users WHERE id = :id");
    $stmt->execute([':id' => $userId]);
    $userEmail = $stmt->fetchColumn();

    $stmt = $conn->prepare("SELECT email FROM members WHERE id = :id");
    $stmt->execute([':id' => $memberId]);
    $memberEmail = $stmt->fetchColumn();

    if ($userRole !== 'admin' && strtolower($userEmail) !== strtolower($memberEmail)) {
        throw new Exception("Permission denied.");
    }

// Fetch current LSF_Number for this member
$stmt = $conn->prepare("SELECT LSF_Number FROM members WHERE id = :id");
$stmt->execute([':id' => $memberId]);
$currentLSF = $stmt->fetchColumn();

// 3) Check for duplicate LSF number if it's being changed
if (
    isset($updateData['LSF_Number']) &&
    trim($updateData['LSF_Number']) !== '' &&
    trim($updateData['LSF_Number']) !== $currentLSF
) {
    $lsf = trim($updateData['LSF_Number']);
    $stmt = $conn->prepare(
        "SELECT COUNT(*) FROM members 
         WHERE LSF_Number = :lsf 
           AND id          != :id"
    );
    $stmt->execute([
        ':lsf' => $lsf,
        ':id'  => $memberId
    ]);
    if ($stmt->fetchColumn() > 0) {
        throw new Exception("LSF Number {$lsf} is already in use by another member.");
    }
}



    // 4) Build dynamic update
    $nonEditable = ['SAP_Level', 'eSAP_Level'];
    $sets = [];
    $values = [];

    foreach ($updateData as $col => $val) {
        if (in_array($col, $nonEditable)) continue;
        $sets[] = "`$col` = ?";
        $values[] = $val === "" ? null : $val;
    }

    if (empty($sets)) {
        throw new Exception("No updatable fields provided.");
    }

    $sql = "UPDATE members SET " . implode(", ", $sets) . " WHERE id = ?";
    $stmt = $conn->prepare($sql);

    foreach ($values as $i => $v) {
        $stmt->bindValue($i + 1, $v, is_null($v) ? PDO::PARAM_NULL : PDO::PARAM_STR);
    }
    $stmt->bindValue(count($values) + 1, $memberId, PDO::PARAM_INT);

    $stmt->execute();

    echo json_encode(['success' => true, 'message' => "Member updated successfully."]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
