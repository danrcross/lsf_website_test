<?php
header("Content-Type: application/json");
require_once "../includes/config.php";

try {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        throw new Exception("Invalid request method.");
    }

    // 1) Pull in your POSTed fields
    $id         = $_POST['id']   ?? null;
    $updateData = $_POST['data'] ?? [];

    file_put_contents('/tmp/edit_debug.log', date('c')." POST: ".print_r($_POST, true)."\n", FILE_APPEND);


    if (!$id) {
        throw new Exception("Valid member ID is required.");
    }
    if (empty($updateData)) {
        throw new Exception("No data provided to update.");
    }
// Fetch existing LSF number
$stmt = $conn->prepare("SELECT LSF_Number FROM members WHERE id = :id");
$stmt->execute([':id' => $id]);
$currentLSF = $stmt->fetchColumn();

    // 2) If LSF_Number is being changed, ensure uniqueness
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
            ':id'  => $id
        ]);
        if ($stmt->fetchColumn() > 0) {
            echo json_encode([
                'success' => false,
                'message' => "LSF Number {$lsf} is already in use by another member."
            ]);
            exit;
        }
    }
    

    // 3) Build dynamic UPDATE (skip computed columns)
    $nonEditable = ['SAP_Level', 'eSAP_Level'];
    $sets   = [];
    $values = [];

    foreach ($updateData as $col => $val) {
        if (in_array($col, $nonEditable)) continue;
        $sets[]   = "`$col` = ?";
        $values[] = ($val === "" ? null : $val);
    }

    if (empty($sets)) {
        throw new Exception("No updatable fields provided.");
    }

    $sql = "UPDATE members 
            SET " . implode(", ", $sets) . " 
            WHERE id = ?";
    $stmt = $conn->prepare($sql);

    // 4) Bind all the values + the id
    foreach ($values as $i => $v) {
        $stmt->bindValue($i+1, $v, is_null($v) ? PDO::PARAM_NULL : PDO::PARAM_STR);
    }
    // last placeholder is the ID
    $stmt->bindValue(count($values)+1, $id, PDO::PARAM_INT);

    $stmt->execute();

    echo json_encode([
        'success' => true,
        'message' => "Member updated successfully."
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
