<?php
header('Content-Type: application/json');
require '../config/database.php';
session_start();
if (!isset($_SESSION['user_id'])) { http_response_code(401); die('{"error":"Unauth"}'); }

$data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$saleId = $data['sale_id'] ?? null;

if (!$saleId) {
    http_response_code(400);
    die(json_encode(['error' => 'Missing sale_id']));
}

try {
    $pdo->beginTransaction();
    
    // Check if it's pending
    $stmt = $pdo->prepare("SELECT id FROM sales WHERE id = ? AND payment_status = 'pending'");
    $stmt->execute([$saleId]);
    $sale = $stmt->fetch();
    
    if (!$sale) {
        $pdo->rollBack();
        http_response_code(400);
        die(json_encode(['error' => 'Sale not found or not pending']));
    }

    // Set status to failed
    $updateStmt = $pdo->prepare("UPDATE sales SET payment_status = 'failed' WHERE id = ?");
    $updateStmt->execute([$saleId]);

    // Restore stock
    $itemsStmt = $pdo->prepare("SELECT product_id, quantity FROM sale_items WHERE sale_id = ?");
    $itemsStmt->execute([$saleId]);
    $items = $itemsStmt->fetchAll();

    foreach ($items as $item) {
        $restoreStmt = $pdo->prepare("UPDATE products SET quantity = quantity + ? WHERE id = ?");
        $restoreStmt->execute([$item['quantity'], $item['product_id']]);
    }

    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
