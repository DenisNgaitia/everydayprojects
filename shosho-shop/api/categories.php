<?php
header('Content-Type: application/json');
require '../config/database.php';
session_start();
if (!isset($_SESSION['user_id'])) { http_response_code(401); die('{"error":"Unauth"}'); }

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM categories ORDER BY name");
    echo json_encode($stmt->fetchAll());
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("INSERT INTO categories (name) VALUES (?)");
    $stmt->execute([$data['name']]);
    echo json_encode(['success' => true]);
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }
}
