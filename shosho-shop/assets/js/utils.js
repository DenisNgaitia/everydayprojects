// Ultimate Utility Suite
function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `custom-toast shadow-lg animate-up border-0`;
    
    const colors = {
        success: 'var(--success)',
        error: 'var(--danger)',
        info: 'var(--primary)',
        warning: 'var(--warning)'
    };
    
    toast.style.backgroundColor = colors[type] || colors.info;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    
    toast.innerHTML = `<div class="d-flex align-items-center gap-2"><i class="fa ${icon}"></i> <span>${msg}</span></div>`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 40px)';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

function fmtCurrency(num) {
    if (isNaN(num)) return '0 KSh';
    return new Intl.NumberFormat('en-US', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num) + ' KSh';
}

// Global State Manager (Simple)
const State = {
    cache: {},
    set(key, val) { this.cache[key] = val; },
    get(key) { return this.cache[key]; }
};

// InfinityFree Friendly Fetch
async function safeFetch(url, options = {}) {
    try {
        const res = await fetch(url, options);
        if (res.status === 401) {
            App.showLogin();
            throw new Error("Session Expired");
        }
        return res;
    } catch (e) {
        showToast("Connection Interrupted", "error");
        throw e;
    }
}