<?php
header('Content-Type: application/json');
require '../config/database.php';
session_start();
if (!isset($_SESSION['user_id'])) { http_response_code(401); die('{"error":"Unauth"}'); }

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM expenses ORDER BY expense_date DESC LIMIT 100");
    echo json_encode($stmt->fetchAll());
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("INSERT INTO expenses (category, amount, description, expense_date) VALUES (?, ?, ?, ?)");
    $stmt->execute([
        $data['category'],
        $data['amount'],
        $data['description'] ?? '',
        $data['expense_date']
    ]);
    echo json_encode(['success' => true]);
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("DELETE FROM expenses WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }
}
