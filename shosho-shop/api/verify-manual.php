<?php
header('Content-Type: application/json');
require '../config/database.php';
session_start();
if (!isset($_SESSION['user_id'])) { http_response_code(401); die('{"error":"Unauth"}'); }

$data = json_decode(file_get_contents('php://input'), true) ?: $_POST;

$saleId = $data['sale_id'] ?? null;
$transactionId = $data['mpesa_transaction_id'] ?? null;
$customerPhone = $data['customer_phone'] ?? null;

if (!$saleId || !$transactionId) {
    http_response_code(400);
    die(json_encode(['error' => 'Missing sale_id or mpesa_transaction_id']));
}

try {
    $stmt = $pdo->prepare("
        UPDATE sales 
        SET payment_status = 'confirmed',
            mpesa_transaction_id = ?,
            customer_phone = COALESCE(NULLIF(?, ''), customer_phone),
            payment_verified_at = NOW()
        WHERE id = ? AND payment_status = 'pending'
    ");
    $stmt->execute([$transactionId, $customerPhone, $saleId]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Sale not found or already verified']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
