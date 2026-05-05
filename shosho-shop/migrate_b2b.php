<?php
require 'config/database.php';

$queries = [
    "CREATE TABLE IF NOT EXISTS b2b_clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        contact_person VARCHAR(100),
        phone VARCHAR(30),
        email VARCHAR(100),
        address TEXT,
        notes TEXT,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",

    "CREATE TABLE IF NOT EXISTS b2b_dispatches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dispatch_ref VARCHAR(20) NOT NULL UNIQUE,
        client_id INT NOT NULL,
        total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
        payment_status ENUM('pending','partial','paid') DEFAULT 'pending',
        notes TEXT,
        dispatched_by INT,
        dispatch_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES b2b_clients(id) ON DELETE CASCADE,
        FOREIGN KEY (dispatched_by) REFERENCES users(id) ON DELETE SET NULL
    )",

    "CREATE TABLE IF NOT EXISTS b2b_dispatch_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dispatch_id INT NOT NULL,
        product_id INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (dispatch_id) REFERENCES b2b_dispatches(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )",

    "CREATE TABLE IF NOT EXISTS b2b_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        dispatch_id INT DEFAULT NULL,
        amount DECIMAL(12,2) NOT NULL,
        payment_method VARCHAR(30) DEFAULT 'cash',
        reference_note VARCHAR(100),
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        recorded_by INT,
        FOREIGN KEY (client_id) REFERENCES b2b_clients(id) ON DELETE CASCADE,
        FOREIGN KEY (dispatch_id) REFERENCES b2b_dispatches(id) ON DELETE SET NULL,
        FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
    )"
];

foreach ($queries as $sql) {
    try {
        $pdo->exec($sql);
        echo "OK: Table created.\n";
    } catch (PDOException $e) {
        echo "Note: " . $e->getMessage() . "\n";
    }
}
echo "\nB2B schema migration complete!\n";
