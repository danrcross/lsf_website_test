<?php
session_start();
require_once __DIR__ . '/../includes/config.php';

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    echo "<p style='color:red; text-align:center;'>Access denied.</p>";
    exit;
}

$alert = '';

// Handle form actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $userId = (int)($_POST['user_id'] ?? 0);

    if ($userId > 0 && $action) {
        try {
            if ($action === 'delete') {
                $stmt = $conn->prepare("DELETE FROM users WHERE id = :id");
                $stmt->execute([':id' => $userId]);
                $alert = "User ID $userId deleted.";
            } elseif ($action === 'promote') {
                $stmt = $conn->prepare("UPDATE users SET role = 'admin' WHERE id = :id");
                $stmt->execute([':id' => $userId]);
                $alert = "User ID $userId promoted to admin.";
            } elseif ($action === 'demote') {
                $stmt = $conn->prepare("UPDATE users SET role = 'user' WHERE id = :id");
                $stmt->execute([':id' => $userId]);
                $alert = "User ID $userId demoted to user.";
            } elseif ($action === 'edit') {
                $newUsername = trim($_POST['new_username']);
                $newEmail = trim($_POST['new_email']);
                $stmt = $conn->prepare("UPDATE users SET username = :username, email = :email WHERE id = :id");
                $stmt->execute([':username' => $newUsername, ':email' => $newEmail, ':id' => $userId]);
                $alert = "User ID $userId updated.";
            }
        } catch (Exception $e) {
            $alert = "Action error: " . htmlspecialchars($e->getMessage());
        }
    }
    header("Location: " . $_SERVER['PHP_SELF'] . '?' . http_build_query($_GET) . "&alert=" . urlencode($alert));
    exit;
}

if (isset($_GET['alert'])) {
    $alert = htmlspecialchars($_GET['alert']);
}

$page = max(1, (int)($_GET['page'] ?? 1));
$limit = 10;
$offset = ($page - 1) * $limit;

$sort = $_GET['sort'] ?? 'created_at';
$dir = strtolower($_GET['dir'] ?? 'desc') === 'asc' ? 'ASC' : 'DESC';
$role = $_GET['role'] ?? '';
$search = trim($_GET['search'] ?? '');

$validSorts = ['id', 'username', 'email', 'role', 'created_at'];
if (!in_array($sort, $validSorts)) $sort = 'created_at';

$where = [];
$params = [];
if ($role === 'admin' || $role === 'user') {
    $where[] = "role = :role";
    $params[':role'] = $role;
}
if ($search !== '') {
    $where[] = "(username LIKE :search OR email LIKE :search)";
    $params[':search'] = "%$search%";
}
$whereClause = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

$totalStmt = $conn->prepare("SELECT COUNT(*) FROM users $whereClause");
$totalStmt->execute($params);
$totalUsers = $totalStmt->fetchColumn();
$totalPages = ceil($totalUsers / $limit);

$sql = "SELECT id, username, email, role, created_at FROM users $whereClause ORDER BY $sort $dir LIMIT :limit OFFSET :offset";
$stmt = $conn->prepare($sql);
foreach ($params as $k => $v) {
    $stmt->bindValue($k, $v);
}
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

function sortLink($label, $column, $currentSort, $currentDir, $extraParams) {
    $dir = ($currentSort === $column && $currentDir === 'asc') ? 'desc' : 'asc';
    $query = http_build_query(array_merge($extraParams, ['sort' => $column, 'dir' => $dir]));
    return "<a href=\"?{$query}\">$label</a>";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>User Manager – LSF</title>
  <link rel="stylesheet" href="../site.css" />
  <style>
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; }
    th { background-color: #f4f4f4; }
    .admin-badge { color: white; background: #3b82f6; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; }
    form.filter-bar { margin-bottom: 20px; }
    form.action-form { display: inline; }
    .alert { background: #e0ffe0; color: #006600; padding: 8px; margin-bottom: 16px; border: 1px solid #8bc34a; }
  </style>
</head>
<body>
  <div class="dashboard-container">
    <h1>User Manager</h1>

    <?php if ($alert): ?>
      <div class="alert"><?= $alert ?></div>
    <?php endif; ?>

    <form method="get" class="filter-bar">
      <label>Role:
        <select name="role">
          <option value="">All</option>
          <option value="user" <?= $role === 'user' ? 'selected' : '' ?>>User</option>
          <option value="admin" <?= $role === 'admin' ? 'selected' : '' ?>>Admin</option>
        </select>
      </label>
      <label>Search:
        <input type="text" name="search" value="<?= htmlspecialchars($search) ?>" />
      </label>
      <button type="submit">Filter</button>
    </form>

    <p>Total users: <strong><?= $totalUsers ?></strong></p>

    <table>
      <thead>
        <tr>
          <th><?= sortLink('ID', 'id', $sort, $dir, $_GET) ?></th>
          <th><?= sortLink('Username', 'username', $sort, $dir, $_GET) ?></th>
          <th><?= sortLink('Email', 'email', $sort, $dir, $_GET) ?></th>
          <th><?= sortLink('Role', 'role', $sort, $dir, $_GET) ?></th>
          <th><?= sortLink('Created', 'created_at', $sort, $dir, $_GET) ?></th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($users as $u): ?>
          <tr>
            <td><?= $u['id'] ?></td>
            <td>
              <form method="post" class="action-form">
                <input type="hidden" name="action" value="edit">
                <input type="hidden" name="user_id" value="<?= $u['id'] ?>">
                <input type="text" name="new_username" value="<?= htmlspecialchars($u['username']) ?>" size="12">
            </td>
            <td>
                <input type="text" name="new_email" value="<?= htmlspecialchars($u['email']) ?>" size="22">
            </td>
            <td>
              <?= htmlspecialchars($u['role']) ?>
              <?php if ($u['role'] === 'admin'): ?>
                <span class="admin-badge">Admin</span>
              <?php endif; ?>
            </td>
            <td><?= $u['created_at'] ?></td>
            <td>
                <button type="submit">Update</button>
              </form>
              <?php if ($u['role'] === 'user'): ?>
                <form method="post" class="action-form">
                  <input type="hidden" name="user_id" value="<?= $u['id'] ?>">
                  <input type="hidden" name="action" value="promote">
                  <button type="submit">Promote</button>
                </form>
              <?php elseif ($u['role'] === 'admin' && $u['id'] != $_SESSION['user_id']): ?>
                <form method="post" class="action-form">
                  <input type="hidden" name="user_id" value="<?= $u['id'] ?>">
                  <input type="hidden" name="action" value="demote">
                  <button type="submit">Demote</button>
                </form>
              <?php endif; ?>
              <?php if ($u['id'] != $_SESSION['user_id']): ?>
                <form method="post" class="action-form" onsubmit="return confirm('Are you sure you want to delete this user?');">
                  <input type="hidden" name="user_id" value="<?= $u['id'] ?>">
                  <input type="hidden" name="action" value="delete">
                  <button type="submit">Delete</button>
                </form>
              <?php endif; ?>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>

    <div style="margin-top:20px;">
      <?php for ($p = 1; $p <= $totalPages; $p++): ?>
        <?php
          $query = http_build_query(array_merge($_GET, ['page' => $p]));
          echo "<a href=\"?$query\">Page $p</a> ";
        ?>
      <?php endfor; ?>
    </div>
  </div>
</body>
</html>
