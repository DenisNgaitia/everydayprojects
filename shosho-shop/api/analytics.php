<?php
header('Content-Type: application/json');
require '../config/database.php';
session_start();
if (!isset($_SESSION['user_id'])) { http_response_code(401); die('{"error":"Unauth"}'); }

// Return various aggregated data
$output = [];

// Daily revenue last 30 days
$daily = $pdo->query("SELECT DATE(sale_date) as day, SUM(total_amount) as total FROM sales WHERE sale_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY day ORDER BY day")->fetchAll();
$output['daily'] = $daily;

// Low stock alerts
$low = $pdo->query("SELECT name, quantity, min_threshold FROM products WHERE is_active = 1 AND quantity <= min_threshold")->fetchAll();
$output['low_stock'] = $low;

// Top 5 best selling items
$top = $pdo->query("SELECT p.name, SUM(si.quantity) as sold FROM sale_items si JOIN products p ON si.product_id = p.id GROUP BY p.id ORDER BY sold DESC LIMIT 5")->fetchAll();
$output['top_items'] = $top;

echo json_encode($output);