<?php
header('Content-Type: application/json');
require '../config/database.php';
session_start();
if (!isset($_SESSION['user_id'])) { http_response_code(401); die('{"error":"Unauth"}'); }

$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $total = $data['total_amount'];
    $paid = $data['amount_paid'] ?? 0;
    $status = 'pending';
    if ($paid >= $total) $status = 'paid';
    elseif ($paid > 0) $status = 'partial';

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("INSERT INTO wholesale_sales (sale_uuid, buyer_name, total_amount, amount_paid, payment_status, status, sold_by)
            VALUES (UUID(), ?, ?, ?, ?, 'synced', ?)");
        $stmt->execute([
            $data['buyer_name'],
            $total,
            $paid,
            $status,
            $_SESSION['user_id']
        ]);
        $saleId = $pdo->lastInsertId();
        foreach ($data['items'] as $item) {
            $itemStmt = $pdo->prepare("INSERT INTO wholesale_sale_items (wholesale_sale_id, product_id, unit_price, quantity, total) VALUES (?, ?, ?, ?, ?)");
            $itemStmt->execute([$saleId, $item['product_id'], $item['unit_price'], $item['quantity'], $item['total']]);
            $deduct = $pdo->prepare("UPDATE products SET quantity = quantity - ? WHERE id = ? AND quantity >= ?");
            $deduct->execute([$item['quantity'], $item['product_id'], $item['quantity']]);
        }
        $pdo->commit();
        echo json_encode(['sale_id' => $saleId]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}