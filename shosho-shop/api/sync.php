<?php
// Same as sales.php but accepts array of sales
header('Content-Type: application/json');
require '../config/database.php';
session_start();
if (!isset($_SESSION['user_id'])) { http_response_code(401); die('{"error":"Unauth"}'); }
$sales = json_decode(file_get_contents('php://input'), true);
if (!is_array($sales)) $sales = [$sales];
$synced = 0;
foreach ($sales as $sale) {
    // process each sale similarly to sales.php POST logic
    try {
        $pdo->beginTransaction();
        $paymentStatus = ($sale['payment_method'] === 'mobile_money') ? 'pending' : 'confirmed';
        $mpesaTransactionId = $sale['mpesa_transaction_id'] ?? null;
        $customerPhone = $sale['customer_phone'] ?? null;

        $stmt = $pdo->prepare("INSERT INTO sales (sale_uuid, total_amount, payment_method, cash_received, change_given, status, sold_by, payment_status, mpesa_transaction_id, customer_phone) VALUES (UUID(), ?, ?, ?, ?, 'synced', ?, ?, ?, ?)");
        $stmt->execute([$sale['total_amount'], $sale['payment_method'], $sale['cash_received'] ?? 0, $sale['change_given'] ?? 0, $_SESSION['user_id'], $paymentStatus, $mpesaTransactionId, $customerPhone]);
        $saleId = $pdo->lastInsertId();
        foreach ($sale['items'] as $item) {
            $itemStmt = $pdo->prepare("INSERT INTO sale_items (sale_id, product_id, unit_price, quantity, total) VALUES (?, ?, ?, ?, ?)");
            $itemStmt->execute([$saleId, $item['product_id'], $item['unit_price'], $item['quantity'], $item['total']]);
            $deduct = $pdo->prepare("UPDATE products SET quantity = quantity - ? WHERE id = ?");
            $deduct->execute([$item['quantity'], $item['product_id']]);
        }
        $pdo->commit();
        $synced++;
    } catch (Exception $e) {
        $pdo->rollBack();
    }
}
echo json_encode(['synced' => $synced]);