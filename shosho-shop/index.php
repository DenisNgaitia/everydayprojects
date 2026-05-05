<!DOCTYPE html>
<html lang="sw" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#7c3aed">
    <title>Shosho Shop Premium</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="assets/css/style.css?v=5">
    <link rel="manifest" href="manifest.json">
    <link rel="icon" href="assets/images/logo.png">
</head>
<body>
    <div id="splash">
        <div class="loader mb-3"></div>
        <h4 class="fw-bold text-primary">Shosho Shop</h4>
    </div>

    <div id="app"></div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <script src="assets/js/utils.js"></script>
    <script src="assets/js/db.js"></script>
    <script src="assets/js/auth.js"></script>
    <script src="assets/js/dashboard.js"></script>
    <script src="assets/js/inventory.js"></script>
    <script src="assets/js/pos.js"></script>
    <script src="assets/js/wholesale.js"></script>
    <script src="assets/js/expenses.js"></script>
    <script src="assets/js/analytics.js"></script>
    <script src="assets/js/b2b.js"></script>
    <script src="assets/js/app.js"></script>
    
    <script>
        // Global Theme Handler
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);

        window.addEventListener('load', () => {
            setTimeout(() => {
                const splash = document.getElementById('splash');
                splash.style.opacity = '0';
                setTimeout(() => splash.remove(), 500);
            }, 800);
        });

        if ('serviceWorker' in navigator) {
            // Purge all old caches first
            if ('caches' in window) {
                caches.keys().then(names => names.forEach(name => caches.delete(name)));
            }
            navigator.serviceWorker.getRegistrations().then(regs => {
                regs.forEach(r => r.unregister());
            });
            // Re-register updated SW after purge
            setTimeout(() => navigator.serviceWorker.register('sw.js'), 1000);
        }
    </script>
</body>
</html>