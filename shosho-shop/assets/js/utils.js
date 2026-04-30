// Notification helper
function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'alert alert-info position-fixed bottom-0 start-50 translate-middle-x';
    toast.style.zIndex = 9999;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Format number as currency (TZS)
function fmtCurrency(num) {
    return parseFloat(num).toLocaleString('sw-TZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TZS';
}