<?php
header('Content-Type: application/json');
require '../config/database.php';
session_start();
if (!isset($_SESSION['user_id'])) { http_response_code(401); die('{"error":"Unauth"}'); }

$saleId = $_GET['sale_id'] ?? ($_POST['sale_id'] ?? null);

if (!$saleId) {
    http_response_code(400);
    die(json_encode(['error' => 'Missing sale_id']));
}

try {
    $stmt = $pdo->prepare("SELECT payment_status, mpesa_transaction_id FROM sales WHERE id = ?");
    $stmt->execute([$saleId]);
    $sale = $stmt->fetch();

    if ($sale) {
        echo json_encode([
            'payment_status' => $sale['payment_status'],
            'mpesa_transaction_id' => $sale['mpesa_transaction_id']
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Sale not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
