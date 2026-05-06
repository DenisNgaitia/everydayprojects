<?php
require 'config/database.php';

try {
    // 1. Add columns to sales table if they don't exist
    $pdo->exec("
        ALTER TABLE sales
        ADD COLUMN IF NOT EXISTS mpesa_transaction_id VARCHAR(50) NULL AFTER change_given,
        ADD COLUMN IF NOT EXISTS payment_status ENUM('pending','confirmed','failed') DEFAULT 'pending' AFTER mpesa_transaction_id,
        ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMP NULL DEFAULT NULL AFTER payment_status
    ");

    // 2. Create mpesa_callbacks table
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

    echo "Database schema updated successfully for M-Pesa integration.";
} catch (PDOException $e) {
    echo "Error updating schema: " . $e->getMessage();
}
