<?php
session_start();

header('Content-Type: application/json');
echo json_encode([
  'logged_in' => isset($_SESSION['user_id']),
  'username'  => $_SESSION['username'] ?? null,
  'role'      => $_SESSION['user_role'] ?? null
]);
