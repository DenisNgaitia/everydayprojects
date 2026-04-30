# Shosho Shop System

A complete, offline‑capable POS + inventory system for small shops. Built with PHP, MySQL, and vanilla JavaScript (PWA). Runs on InfinityFree free hosting.

## Features

- **POS** grid with product images, search, cart, cash & mobile money payments
- **Inventory** with stock alerts, purchase history, price tracking
- **Wholesale** module with buyer name, credit tracking (paid/partial/pending)
- **Analytics** with daily revenue chart, top items, low stock alerts
- **Offline-first** – sales stored in IndexedDB when offline, synced automatically
- **User roles** (admin / cashier) with session‑based authentication
- Installable as PWA on Android & iOS (works offline after caching)

## Requirements

- PHP 8.x (InfinityFree provides 8.1)
- MySQL 5.6+ (provided)
- File manager access + phpMyAdmin

## Installation Steps

1. **Download / upload the code**  
   Extract this entire `shosho-shop/` folder and upload its contents to your InfinityFree `htdocs` folder (or a subdomain).

2. **Create a MySQL database**  
   In the InfinityFree control panel, go to **MySQL Databases** → create a new database. Note the database name, username, password, and host (usually `sql123.infinityfree.com`).

3. **Edit the database configuration**  
   Open `config/database.php` and replace the values:
   ```php
   $host = 'sql123.infinityfree.com';         // your MySQL host
   $dbname = 'if0_12345678_shosho';          // your database name
   $username = 'if0_12345678';               // your database user
   $password = 'YOUR_DB_PASSWORD';           // your database password
   ```

4. **Run the installer**  
   Visit `http://yourdomain.infinityfreeapp.com/install.php` (or wherever you uploaded). This will create all required tables.  
   **Important:** After successful creation, **delete** `install.php` for security.

5. **Set up the first admin (manual, via database)**  
   Go to phpMyAdmin, open the `users` table, and insert an admin user:
   ```sql
   INSERT INTO users (email, password_hash, display_name, role) 
   VALUES ('admin@example.com', '$2y$10$...', 'Admin', 'admin');
   ```
   To generate the hash, use an online bcrypt tool or run a small PHP script:
   ```php
   <?php echo password_hash('yourPassword', PASSWORD_BCRYPT); ?>
   ```
   Then log in at your site.

6. **Enjoy** – visit your site, log in, and start using Shosho Shop.

## Offline Usage

- The POS and inventory pages will cache after the first visit (service worker).
- When offline, sales are saved in the browser’s IndexedDB.
- After internet is restored, pending sales are synchronised automatically.
- For manual sync, just open the app while online; it will trigger the sync.

## Customisation

- Change the app name / icons in `manifest.json` and `index.php`.
- Add your own product placeholder image: `assets/images/placeholder.png` (200×200 px).
- Extend API endpoints under `api/` for extra features.

## Troubleshooting

- **Login doesn’t work?** Ensure the `users` table has a valid bcrypt hash.
- **Database connection error?** Double‑check `config/database.php` credentials.
- **Install.php gives an error?** Make sure the database user has full privileges (InfinityFree usually grants them).
- **Offline sync not working?** Check browser console for service worker registration. Some ad‑blockers may block service workers.

## Security

- Always delete `install.php` after use.
- Use strong passwords and HTTPS (InfinityFree provides free SSL via cPanel).
- For production, consider adding a CSRF token layer to API endpoints.

## License

This project is free for personal and commercial use. Modify and distribute as needed.

Built with ❤️ for small shops (dukas/kiosks).