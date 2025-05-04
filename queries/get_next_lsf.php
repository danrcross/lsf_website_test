<?php
header("Content-Type: application/json");
require_once "../includes/config.php";

try {
    // 1) Pull all distinct, non-empty, numeric LSF_Number values in ascending order
    $sql = "
      SELECT DISTINCT CAST(LSF_Number AS UNSIGNED) AS num
      FROM members
      WHERE LSF_Number IS NOT NULL 
        AND LSF_Number != '' 
        AND LSF_Number REGEXP '^[0-9]+$'
      ORDER BY num ASC
    ";
    $stmt = $conn->query($sql);

    // 2) Walk the list looking for the first “gap”
    $nextLSF = 1;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $n = (int)$row['num'];
        if ($n === $nextLSF) {
            // this slot is taken, bump up our candidate
            $nextLSF++;
        } elseif ($n > $nextLSF) {
            // we found a number bigger than our candidate → gap!
            break;
        }
        // if somehow $n < $nextLSF (duplicates), just continue
    }

    // 3) Return JSON
    echo json_encode([
      "success" => true,
      "nextLSF" => $nextLSF
    ]);

} catch (Exception $e) {
    // on error, report back
    echo json_encode([
      "success" => false,
      "message" => $e->getMessage()
    ]);
}
