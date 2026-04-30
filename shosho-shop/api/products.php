<?php
header('Content-Type: application/json');
require '../config/database.php';
session_start();
if (!isset($_SESSION['user_id'])) { http_response_code(401); die('{"error":"Unauth"}'); }

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM products WHERE is_active = 1 ORDER BY name");
    echo json_encode($stmt->fetchAll());
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("INSERT INTO products (uuid, serial_code, name, category, subcategory, unit_type, pack_size, cost_price, selling_price, quantity, min_threshold, expiry_date, supplier)
            VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['serial_code'] ?? null,
            $data['name'],
            $data['category'],
            $data['subcategory'] ?? '',
            $data['unit_type'] ?? 'single',
            $data['pack_size'] ?? null,
            $data['cost_price'],
            $data['selling_price'],
            $data['quantity'] ?? 0,
            $data['min_threshold'] ?? 10,
            $data['expiry_date'] ?? null,
            $data['supplier'] ?? ''
        ]);
        $productId = $pdo->lastInsertId();
        if ($data['quantity'] > 0) {
            $stmt2 = $pdo->prepare("INSERT INTO purchase_history (product_id, quantity, cost_price, supplier, purchase_date) VALUES (?, ?, ?, ?, NOW())");
            $stmt2->execute([$productId, $data['quantity'], $data['cost_price'], $data['supplier'] ?? '']);
        }
        $pdo->commit();
        $uuid = $pdo->query("SELECT uuid FROM products WHERE id=$productId")->fetchColumn();
        echo json_encode(['id' => $productId, 'uuid' => $uuid]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

if ($method === 'PUT') {
    parse_str(file_get_contents('php://input'), $putData);
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); die('{"error":"Missing ID"}'); }
    $data = json_decode(file_get_contents('php://input'), true);
    $fields = [];
    $params = [];
    foreach (['name','category','subcategory','unit_type','pack_size','cost_price','selling_price','quantity','min_threshold','expiry_date','supplier'] as $col) {
        if (isset($data[$col])) {
            $fields[] = "$col = ?";
            $params[] = $data[$col];
        }
    }
    if ($fields) {
        $params[] = $id;
        $stmt = $pdo->prepare("UPDATE products SET ".implode(', ',$fields)." WHERE id = ?");
        $stmt->execute($params);
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'No fields to update']);
    }
    exit;
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("UPDATE products SET is_active = 0 WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }
    exit;
}