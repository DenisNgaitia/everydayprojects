<?php
require 'config/database.php';

try {
    $pdo->exec("
        ALTER TABLE sales
        ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20) NULL AFTER mpesa_transaction_id
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS mpesa_callbacks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            raw_sms TEXT NOT NULL,
            parsed_amount DECIMAL(10,2),
            parsed_transaction_id VARCHAR(50),
            parsed_phone VARCHAR(20),
            matched_sale_id INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_transaction_id (parsed_transaction_id)
        )
    ");
    echo "Pochi La Biashara Schema Updated.";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
