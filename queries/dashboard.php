<?php
session_start();

// Redirect to login if not authenticated
if (!isset($_SESSION['user_id'])) {
  header("Location: login.htm");
  exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Dashboard – League of Silent Flight</title>
  <link rel="stylesheet" href="site.css" />
</head>
<body>
  <div class="dashboard-container">
    <h1>Welcome to Your Dashboard</h1>
    <p>Logged in as: <strong><?= htmlspecialchars($_SESSION['username']) ?></strong></p>
    <p>Your role: <strong><?= htmlspecialchars($_SESSION['user_role']) ?></strong></p>

    <p>This is a protected page only visible to logged-in users.</p>

    <!-- You can add more features here -->
    <ul>
      <li>View submissions</li>
      <li>Update profile</li>
      <li>Admin tools (if applicable)</li>
    </ul>
  </div>
</body>
</html>
