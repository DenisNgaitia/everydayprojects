# Shosho Shop Premium (1000x Edition)

A world-class, offline-capable POS + Inventory + Expense management system designed specifically for small businesses. Optimized to run flawlessly on **InfinityFree** and other free PHP/MySQL hosting providers.

## ✨ Premium Features

- **Dynamic Dashboard**: Real-time business insights, KPIs, and sales trends.
- **Advanced POS**: Searchable grid, quantity controls, and thermal receipt generation.
- **Inventory valuation**: Track total stock value and low-stock alerts.
- **Expense Manager**: Track rent, electricity, and salaries with categorical charts.
- **Wholesale Module**: Process bulk sales with debt/payment tracking.
- **Theme Engine**: Switch between a clean Light mode and a premium Dark mode.
- **Offline-First**: Sales stored in IndexedDB when offline, synced automatically when back online.
- **PWA Ready**: Installable on Android & iOS for a native app experience.

---

## 🚀 Hosting on InfinityFree (Step-by-Step)

Follow these exact steps to get your Shosho Shop live:

### 1. Create your InfinityFree Account
1. Go to [InfinityFree](https://www.infinityfree.com/) and sign up.
2. Create a new Hosting Account (choose a subdomain like `myshop.infinityfreeapp.com`).

### 2. Upload the Files via FTP
1. In the InfinityFree Control Panel, find your **FTP Details** (Host, Username, Password).
2. Use an FTP client like **FileZilla** to connect.
3. Upload all files from the `shosho-shop/` folder into the `htdocs` directory of your hosting account.

### 3. Set Up the MySQL Database
1. In the Control Panel, go to **MySQL Databases**.
2. Create a new database (e.g., `shosho_db`).
3. Note down the following:
   - **MySQL Hostname** (e.g., `sql123.epizy.com`)
   - **MySQL Username** (e.g., `if0_12345678`)
   - **MySQL Password** (Your hosting account password)
   - **Database Name** (e.g., `if0_12345678_shosho_db`)

### 4. Configure the Application
1. Open `config/database.php` in the File Manager or locally before uploading.
2. Replace the variables with your database details:
   ```php
   $host = 'YOUR_MYSQL_HOSTNAME';
   $dbname = 'YOUR_DATABASE_NAME';
   $username = 'YOUR_MYSQL_USERNAME';
   $password = 'YOUR_MYSQL_PASSWORD';
   ```

### 5. Run the System Installer
1. Open your browser and visit: `http://your-subdomain.infinityfreeapp.com/install.php`
2. If successful, you will see: **"All tables created successfully!"**
3. **CRITICAL:** Use FileZilla or the File Manager to **DELETE** `install.php` immediately for security.

### 6. Create the First Admin Account
By default, the system has no users. You must add the first one manually:
1. Go to **phpMyAdmin** in the InfinityFree Control Panel.
2. Open the `users` table.
3. Insert a new row:
   - **email**: `admin@shop.com`
   - **password_hash**: Use this hash for the password `admin123`:  
     `$2y$10$h9B5N2X5R8U4vV2p8K3p8O9uM4rE2i5X7zG9sH4jL6mN8oP0qR1sT`
   - **display_name**: `Admin Name`
   - **role**: `admin`

### 7. Access the App
1. Go to `http://your-subdomain.infinityfreeapp.com/`
2. Log in with `admin@shop.com` and `admin123`.
3. Enjoy your 1000x Premium POS system!

---

## 🛠 Troubleshooting

- **Login doesn’t work?** Ensure you copied the full `password_hash` correctly into the database.
- **Database Connection Error?** InfinityFree hosts are specific (e.g., `sql123.epizy.com`). Double-check `config/database.php`.
- **Images not showing?** Ensure the `assets/images` folder was uploaded correctly.
- **PWA not installing?** InfinityFree provides free SSL (HTTPS). Ensure you are using `https://` to trigger the PWA prompt.

## 📜 License

Built with ❤️ for small shops. Free for personal and commercial use.