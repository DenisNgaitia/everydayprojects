<?php
header('Content-Type: application/json');
require '../config/database.php';

// Check HTTP method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['error' => 'Method not allowed']));
}

// Load token
$expectedToken = require '../config/token.php';

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

// Extract SMS and token depending on format (JSON or Form Data)
$smsContent = '';
$token = '';

if ($data) {
    $smsContent = $data['sms_content'] ?? ($data['msg'] ?? '');
    $token = $data['token'] ?? '';
} else {
    $smsContent = $_POST['sms_content'] ?? ($_POST['msg'] ?? '');
    $token = $_POST['token'] ?? '';
}

// Validate token
if ($token !== $expectedToken) {
    http_response_code(403);
    die(json_encode(['error' => 'Forbidden']));
}

if (empty($smsContent)) {
    http_response_code(400);
    die(json_encode(['error' => 'No SMS content provided']));
}

// ---------------------------------------------------------
// POCHI LA BIASHARA PARSING LOGIC
// ---------------------------------------------------------

// Reject if not Pochi La Biashara
if (stripos($smsContent, 'Pochi La Biashara') === false) {
    echo json_encode(['status' => 'ignored', 'reason' => 'not plb']);
    exit;
}

$amount = null;
$phone = null;
$transactionId = null;

// Extract amount: e.g. Ksh 500.00
if (preg_match('/Ksh\s*([\d,]+\.?\d*)/i', $smsContent, $matches)) {
    $amount = (float) str_replace(',', '', $matches[1]);
}

// Extract sender phone number (12 digits starting with 254)
// "from JOHN DOE 254712345678"
if (preg_match('/(?:from\s+.*?|from\s+)(254\d{9})/i', $smsContent, $matches)) {
    $phone = $matches[1];
}

// Extract transaction code
// "Transaction code: QGK7X5FGH2" or "Transaction code- QG..."
if (preg_match('/Transaction code[:\-]?\s*([A-Z0-9]{10})/i', $smsContent, $matches)) {
    $transactionId = $matches[1];
}

try {
    $pdo->beginTransaction();
    $matchedSaleId = null;

    if ($amount && $transactionId) {
        $sale = null;

        // MATCHING STRATEGY 1: Exact Phone AND Amount Match (Tightest)
        if ($phone) {
            $stmt = $pdo->prepare("
                SELECT id FROM sales 
                WHERE payment_status = 'pending' 
                  AND payment_method = 'mobile_money'
                  AND customer_phone = ?
                  AND ABS(total_amount - ?) <= 1.00
                  AND sale_date >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)
                ORDER BY sale_date DESC LIMIT 1
            ");
            $stmt->execute([$phone, $amount]);
            $sale = $stmt->fetch();
        }

        // MATCHING STRATEGY 2: Strict Amount Match (No phone provided)
        if (!$sale) {
            $stmt = $pdo->prepare("
                SELECT id FROM sales 
                WHERE payment_status = 'pending' 
                  AND payment_method = 'mobile_money'
                  AND ABS(total_amount - ?) <= 1.00
                  AND (customer_phone IS NULL OR customer_phone = '')
                  AND sale_date >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)
                ORDER BY sale_date DESC LIMIT 1
            ");
            $stmt->execute([$amount]);
            $sale = $stmt->fetch();
        }

        if ($sale) {
            $matchedSaleId = $sale['id'];
            $updateStmt = $pdo->prepare("
                UPDATE sales 
                SET payment_status = 'confirmed',
                    mpesa_transaction_id = ?,
                    payment_verified_at = NOW()
                WHERE id = ?
            ");
            $updateStmt->execute([$transactionId, $matchedSaleId]);
        }
    }

    // Log the callback
    $logStmt = $pdo->prepare("
        INSERT INTO mpesa_callbacks (raw_sms, parsed_amount, parsed_transaction_id, parsed_phone, matched_sale_id)
        VALUES (?, ?, ?, ?, ?)
    ");
    $logStmt->execute([$smsContent, $amount, $transactionId, $phone, $matchedSaleId]);

    $pdo->commit();

    if ($matchedSaleId) {
        echo json_encode(['status' => 'ok', 'matched' => true, 'sale_id' => $matchedSaleId]);
    } else {
        echo json_encode(['status' => 'ok', 'matched' => false]);
    }
} catch (Exception $e) {
    $pdo->rollBack();
    error_log("M-Pesa Callback Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
