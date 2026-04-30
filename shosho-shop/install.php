<?php
require 'config/database.php';

$queries = [
    "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(100),
        role ENUM('admin','cashier') DEFAULT 'cashier',
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uuid VARCHAR(36) NOT NULL UNIQUE,
        serial_code VARCHAR(20),
        name VARCHAR(100) NOT NULL,
        image_path VARCHAR(255) DEFAULT NULL,
        category VARCHAR(50),
        subcategory VARCHAR(50),
        unit_type ENUM('single','pack','bulk') DEFAULT 'single',
        pack_size INT DEFAULT NULL,
        cost_price DECIMAL(10,2) NOT NULL,
        selling_price DECIMAL(10,2) NOT NULL,
        profit_margin DECIMAL(10,2) GENERATED ALWAYS AS (selling_price - cost_price) STORED,
        quantity INT DEFAULT 0,
        min_threshold INT DEFAULT 10,
        expiry_date DATE DEFAULT NULL,
        supplier VARCHAR(100),
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS price_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT,
        old_price DECIMAL(10,2),
        new_price DECIMAL(10,2),
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )",
    "CREATE TABLE IF NOT EXISTS purchase_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT,
        quantity INT,
        cost_price DECIMAL(10,2),
        supplier VARCHAR(100),
        purchase_date DATE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )",
    "CREATE TABLE IF NOT EXISTS sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sale_uuid VARCHAR(36) NOT NULL UNIQUE,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_method ENUM('cash','mobile_money') NOT NULL,
        cash_received DECIMAL(10,2) DEFAULT 0,
        change_given DECIMAL(10,2) DEFAULT 0,
        status ENUM('synced','pending') DEFAULT 'synced',
        sold_by INT,
        sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sold_by) REFERENCES users(id) ON DELETE SET NULL
    )",
    "CREATE TABLE IF NOT EXISTS sale_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sale_id INT NOT NULL,
        product_id INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )",
    "CREATE TABLE IF NOT EXISTS wholesale_sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sale_uuid VARCHAR(36) NOT NULL UNIQUE,
        buyer_name VARCHAR(100),
        total_amount DECIMAL(10,2),
        amount_paid DECIMAL(10,2) DEFAULT 0,
        payment_status ENUM('paid','partial','pending') DEFAULT 'pending',
        status ENUM('synced','pending') DEFAULT 'synced',
        sold_by INT,
        sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sold_by) REFERENCES users(id) ON DELETE SET NULL
    )",
    "CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(255)
    )",
    "CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        description VARCHAR(255),
        expense_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS wholesale_sale_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        wholesale_sale_id INT NOT NULL,
        product_id INT NOT NULL,
        unit_price DECIMAL(10,2),
        quantity INT,
        total DECIMAL(10,2),
        FOREIGN KEY (wholesale_sale_id) REFERENCES wholesale_sales(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )"
];

foreach ($queries as $sql) {
    $pdo->exec($sql);
}
echo "All tables created successfully! You can now delete install.php for security.";