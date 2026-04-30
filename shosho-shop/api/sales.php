<?php
header('Content-Type: application/json');
require '../config/database.php';
session_start();
if (!isset($_SESSION['user_id'])) { http_response_code(401); die('{"error":"Unauth"}'); }

$data = json_decode(file_get_contents('php://input'), true);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("INSERT INTO sales (sale_uuid, total_amount, payment_method, cash_received, change_given, status, sold_by)
            VALUES (UUID(), ?, ?, ?, ?, 'synced', ?)");
        $stmt->execute([
            $data['total_amount'],
            $data['payment_method'],
            $data['cash_received'] ?? 0,
            $data['change_given'] ?? 0,
            $_SESSION['user_id']
        ]);
        $saleId = $pdo->lastInsertId();

        foreach ($data['items'] as $item) {
            $itemStmt = $pdo->prepare("INSERT INTO sale_items (sale_id, product_id, unit_price, quantity, total) VALUES (?, ?, ?, ?, ?)");
            $itemStmt->execute([$saleId, $item['product_id'], $item['unit_price'], $item['quantity'], $item['total']]);

            $deduct = $pdo->prepare("UPDATE products SET quantity = quantity - ? WHERE id = ? AND quantity >= ?");
            $deduct->execute([$item['quantity'], $item['product_id'], $item['quantity']]);
            if ($deduct->rowCount() === 0) {
                throw new Exception("Insufficient stock for product ID {$item['product_id']}");
            }
        }
        $pdo->commit();
        echo json_encode(['sale_id' => $saleId]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

if ($method === 'GET') {
    // For analytics or sync, return recent sales? For simplicity return all
    $stmt = $pdo->query("SELECT s.*, u.display_name as seller FROM sales s LEFT JOIN users u ON s.sold_by = u.id ORDER BY sale_date DESC LIMIT 50");
    echo json_encode($stmt->fetchAll());
    exit;
}