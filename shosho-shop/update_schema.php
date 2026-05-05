<?php
require 'config/database.php';

try {
    // 1. Add parent_id column if it doesn't exist
    $pdo->exec("ALTER TABLE products ADD COLUMN parent_id INT DEFAULT NULL");
    echo "Added parent_id column successfully.\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "parent_id column already exists.\n";
    } else {
        echo "Error adding parent_id: " . $e->getMessage() . "\n";
    }
}

// 2. Inject Carrier Bags if they don't exist
$bags = [
    ['name' => 'Small Bag', 'selling_price' => 10],
    ['name' => 'Medium Bag', 'selling_price' => 20],
    ['name' => 'Large Bag', 'selling_price' => 30]
];

foreach ($bags as $bag) {
    $stmt = $pdo->prepare("SELECT id FROM products WHERE name = ?");
    $stmt->execute([$bag['name']]);
    if (!$stmt->fetch()) {
        $insert = $pdo->prepare("INSERT INTO products (uuid, name, category, selling_price, cost_price, quantity, is_active) VALUES (UUID(), ?, 'System-Bags', ?, 0, 1000, 1)");
        $insert->execute([$bag['name'], $bag['selling_price']]);
        echo "Inserted {$bag['name']}.\n";
    } else {
        echo "{$bag['name']} already exists.\n";
    }
}

echo "Schema update completed.\n";
