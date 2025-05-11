<?php
require_once __DIR__ . '/../includes/config.php';

$users = [
  ['username'=>'admin',  'email'=>'admin@example.com',  'password'=>'AdminPass1!',  'role'=>'admin'],
  ['username'=>'johndoe','email'=>'john@example.com',  'password'=>'UserPass1!',   'role'=>'user'],
];

foreach ($users as $u) {
  $hash = password_hash($u['password'], PASSWORD_DEFAULT);
  $stmt = $conn->prepare(
    "INSERT INTO users (username, email, password_hash, role)
     VALUES (:u, :e, :p, :r)"
  );
  $stmt->execute([
    ':u' => $u['username'],
    ':e' => $u['email'],
    ':p' => $hash,
    ':r' => $u['role'],
  ]);
  echo "Created {$u['username']} ({$u['role']})\n";
}
