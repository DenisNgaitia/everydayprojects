<?php
header('Content-Type: application/json');
require '../config/database.php';
session_start();
if (!isset($_SESSION['user_id'])) { http_response_code(401); die('{"error":"Unauth"}'); }

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ========== CLIENTS ==========
if ($action === 'clients') {
    if ($method === 'GET') {
        $id = $_GET['id'] ?? null;
        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM b2b_clients WHERE id = ?");
            $stmt->execute([$id]);
            $client = $stmt->fetch();
            // Compute outstanding balance
            $bal = $pdo->prepare("SELECT COALESCE(SUM(total_amount),0) - COALESCE(SUM(amount_paid),0) AS balance FROM b2b_dispatches WHERE client_id = ?");
            $bal->execute([$id]);
            $client['outstanding_balance'] = $bal->fetchColumn();
            echo json_encode($client);
        } else {
            // All clients with their balances
            $stmt = $pdo->query("
                SELECT c.*,
                    COALESCE(SUM(d.total_amount),0) AS total_dispatched,
                    COALESCE(SUM(d.amount_paid),0) AS total_paid,
                    COALESCE(SUM(d.total_amount),0) - COALESCE(SUM(d.amount_paid),0) AS outstanding_balance
                FROM b2b_clients c
                LEFT JOIN b2b_dispatches d ON d.client_id = c.id
                WHERE c.is_active = 1
                GROUP BY c.id
                ORDER BY c.name
            ");
            echo json_encode($stmt->fetchAll());
        }
        exit;
    }
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO b2b_clients (name, contact_person, phone, email, address, notes) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['name'],
            $data['contact_person'] ?? '',
            $data['phone'] ?? '',
            $data['email'] ?? '',
            $data['address'] ?? '',
            $data['notes'] ?? ''
        ]);
        echo json_encode(['id' => $pdo->lastInsertId()]);
        exit;
    }
    if ($method === 'PUT') {
        $id = $_GET['id'] ?? null;
        if (!$id) { http_response_code(400); die('{"error":"Missing ID"}'); }
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("UPDATE b2b_clients SET name=?, contact_person=?, phone=?, email=?, address=?, notes=? WHERE id=?");
        $stmt->execute([$data['name'], $data['contact_person']??'', $data['phone']??'', $data['email']??'', $data['address']??'', $data['notes']??'', $id]);
        echo json_encode(['success' => true]);
        exit;
    }
    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if ($id) {
            $pdo->prepare("UPDATE b2b_clients SET is_active = 0 WHERE id = ?")->execute([$id]);
            echo json_encode(['success' => true]);
        }
        exit;
    }
}

// ========== DISPATCHES ==========
if ($action === 'dispatches') {
    if ($method === 'GET') {
        $clientId = $_GET['client_id'] ?? null;
        if ($clientId) {
            $stmt = $pdo->prepare("
                SELECT d.*, u.display_name AS dispatched_by_name
                FROM b2b_dispatches d
                LEFT JOIN users u ON d.dispatched_by = u.id
                WHERE d.client_id = ?
                ORDER BY d.dispatch_date DESC
            ");
            $stmt->execute([$clientId]);
            $dispatches = $stmt->fetchAll();
            // Attach items to each dispatch
            foreach ($dispatches as &$disp) {
                $items = $pdo->prepare("
                    SELECT di.*, p.name AS product_name
                    FROM b2b_dispatch_items di
                    JOIN products p ON di.product_id = p.id
                    WHERE di.dispatch_id = ?
                ");
                $items->execute([$disp['id']]);
                $disp['items'] = $items->fetchAll();
            }
            echo json_encode($dispatches);
        }
        exit;
    }
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $pdo->beginTransaction();
        try {
            // Generate dispatch reference: DSP-YYYYMMDD-XXX
            $today = date('Ymd');
            $countStmt = $pdo->query("SELECT COUNT(*) FROM b2b_dispatches WHERE DATE(dispatch_date) = CURDATE()");
            $seq = intval($countStmt->fetchColumn()) + 1;
            $ref = "DSP-{$today}-" . str_pad($seq, 3, '0', STR_PAD_LEFT);

            $totalAmount = 0;
            foreach ($data['items'] as $item) {
                $totalAmount += $item['unit_price'] * $item['quantity'];
            }

            $stmt = $pdo->prepare("INSERT INTO b2b_dispatches (dispatch_ref, client_id, total_amount, dispatched_by, notes) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$ref, $data['client_id'], $totalAmount, $_SESSION['user_id'], $data['notes'] ?? '']);
            $dispatchId = $pdo->lastInsertId();

            foreach ($data['items'] as $item) {
                $lineTotal = $item['unit_price'] * $item['quantity'];
                $itemStmt = $pdo->prepare("INSERT INTO b2b_dispatch_items (dispatch_id, product_id, unit_price, quantity, total) VALUES (?, ?, ?, ?, ?)");
                $itemStmt->execute([$dispatchId, $item['product_id'], $item['unit_price'], $item['quantity'], $lineTotal]);

                // Deduct from main inventory
                $deduct = $pdo->prepare("UPDATE products SET quantity = quantity - ? WHERE id = ? AND quantity >= ?");
                $deduct->execute([$item['quantity'], $item['product_id'], $item['quantity']]);
                if ($deduct->rowCount() === 0) {
                    throw new Exception("Insufficient stock for product ID {$item['product_id']}");
                }
            }
            $pdo->commit();
            echo json_encode(['dispatch_id' => $dispatchId, 'dispatch_ref' => $ref]);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        exit;
    }
}

// ========== PAYMENTS ==========
if ($action === 'payments') {
    if ($method === 'GET') {
        $clientId = $_GET['client_id'] ?? null;
        if ($clientId) {
            $stmt = $pdo->prepare("
                SELECT p.*, u.display_name AS recorded_by_name, d.dispatch_ref
                FROM b2b_payments p
                LEFT JOIN users u ON p.recorded_by = u.id
                LEFT JOIN b2b_dispatches d ON p.dispatch_id = d.id
                WHERE p.client_id = ?
                ORDER BY p.payment_date DESC
            ");
            $stmt->execute([$clientId]);
            echo json_encode($stmt->fetchAll());
        }
        exit;
    }
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $pdo->beginTransaction();
        try {
            $amount = floatval($data['amount']);
            $clientId = $data['client_id'];

            // Record the payment
            $stmt = $pdo->prepare("INSERT INTO b2b_payments (client_id, amount, payment_method, reference_note, recorded_by) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$clientId, $amount, $data['payment_method'] ?? 'cash', $data['reference_note'] ?? '', $_SESSION['user_id']]);

            // Auto-allocate payment to oldest pending dispatches (FIFO)
            $pending = $pdo->prepare("SELECT id, total_amount, amount_paid FROM b2b_dispatches WHERE client_id = ? AND payment_status != 'paid' ORDER BY dispatch_date ASC");
            $pending->execute([$clientId]);
            $remaining = $amount;

            while ($remaining > 0 && ($dispatch = $pending->fetch())) {
                $owed = $dispatch['total_amount'] - $dispatch['amount_paid'];
                if ($owed <= 0) continue;

                $applied = min($remaining, $owed);
                $newPaid = $dispatch['amount_paid'] + $applied;
                $status = ($newPaid >= $dispatch['total_amount']) ? 'paid' : 'partial';

                $upd = $pdo->prepare("UPDATE b2b_dispatches SET amount_paid = ?, payment_status = ? WHERE id = ?");
                $upd->execute([$newPaid, $status, $dispatch['id']]);

                // Link payment to dispatch
                $pdo->prepare("UPDATE b2b_payments SET dispatch_id = ? WHERE id = LAST_INSERT_ID()")->execute([$dispatch['id']]);

                $remaining -= $applied;
            }

            $pdo->commit();
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        exit;
    }
}

http_response_code(400);
echo json_encode(['error' => 'Unknown action']);
