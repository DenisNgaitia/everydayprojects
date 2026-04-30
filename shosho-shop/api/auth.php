<?php
header('Content-Type: application/json');
require '../config/database.php';
session_start();

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($action === 'register') {
        $hash = password_hash($data['password'], PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, display_name, role, phone) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$data['email'], $hash, $data['name'] ?? '', 'cashier', $data['phone'] ?? '']);
        echo json_encode(['success' => true]);
        exit;
    }
    if ($action === 'login') {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch();
        if ($user && password_verify($data['password'], $user['password_hash'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];
            echo json_encode([
                'success' => true,
                'user' => ['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role'], 'name' => $user['display_name']]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
        }
        exit;
    }
}
if ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true]);
    exit;
}
if ($action === 'me') {
    if (isset($_SESSION['user_id'])) {
        $stmt = $pdo->prepare("SELECT id, email, display_name, role FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        echo json_encode($user ?: ['authenticated' => false]);
    } else {
        echo json_encode(['authenticated' => false]);
    }
    exit;
}