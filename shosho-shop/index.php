<!DOCTYPE html>
<html lang="sw">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#007bff">
    <title>Shosho Shop</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="manifest" href="manifest.json">
    <link rel="icon" href="assets/images/placeholder.png">
    <style>
        body { padding-bottom: 70px; }
        .product-card img { width:100%; aspect-ratio:1; object-fit:cover; border-radius:8px; }
        .cart-item { border-bottom:1px solid #eee; padding:8px 0; }
        .nav-bottom { position:fixed; bottom:0; width:100%; background:white; border-top:1px solid #ddd; z-index:1000; }
    </style>
</head>
<body>
    <div id="app"></div>

    <script src="assets/js/utils.js"></script>
    <script src="assets/js/db.js"></script>
    <script src="assets/js/auth.js"></script>
    <script src="assets/js/inventory.js"></script>
    <script src="assets/js/pos.js"></script>
    <script src="assets/js/wholesale.js"></script>
    <script src="assets/js/analytics.js"></script>
    <script src="assets/js/app.js"></script>
    <script>
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js');
        }
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</body>
</html>