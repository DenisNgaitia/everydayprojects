const Dashboard = {
    render() {
        return `
            <div class="container-fluid pb-5">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 class="fw-bold mb-1">Habari, ${App.user.display_name}!</h2>
                        <p class="text-muted">Here's what's happening in your shop today.</p>
                    </div>
                    <div class="theme-toggle shadow-sm" onclick="Dashboard.toggleTheme()">
                        <i class="fa fa-moon"></i>
                    </div>
                </div>

                <div class="row g-4 mb-5">
                    <div class="col-12 col-md-3">
                        <div class="kpi-card animate-scale" style="animation-delay: 0.1s">
                            <span class="small fw-bold text-muted text-uppercase">Today's Sales</span>
                            <div class="kpi-value text-primary" id="dashSales">0 KSh</div>
                            <div class="small text-success"><i class="fa fa-chart-line me-1"></i> +12% from yesterday</div>
                        </div>
                    </div>
                    <div class="col-12 col-md-3">
                        <div class="kpi-card animate-scale" style="animation-delay: 0.2s">
                            <span class="small fw-bold text-muted text-uppercase">Net Profit</span>
                            <div class="kpi-value text-success" id="dashProfit">0 KSh</div>
                            <div class="small text-muted">After expenses</div>
                        </div>
                    </div>
                    <div class="col-12 col-md-3">
                        <div class="kpi-card animate-scale" style="animation-delay: 0.3s">
                            <span class="small fw-bold text-muted text-uppercase">Active Stock</span>
                            <div class="kpi-value" id="dashStock">0</div>
                            <div class="small text-muted">Items in inventory</div>
                        </div>
                    </div>
                    <div class="col-12 col-md-3">
                        <div class="kpi-card animate-scale" style="animation-delay: 0.4s">
                            <span class="small fw-bold text-muted text-uppercase">Low Stock</span>
                            <div class="kpi-value text-danger" id="dashAlerts">0</div>
                            <div class="small text-muted">Needs attention</div>
                        </div>
                    </div>
                </div>

                <div class="row g-4">
                    <div class="col-12 col-lg-8">
                        <div class="glass-card p-4 h-100">
                            <h5 class="fw-bold mb-4">Sales Overview</h5>
                            <div style="height: 300px;">
                                <canvas id="dashChart"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-lg-4">
                        <div class="glass-card p-4 h-100">
                            <h5 class="fw-bold mb-4">Quick Actions</h5>
                            <div class="d-grid gap-3">
                                <button class="btn btn-primary py-3 rounded-3" onclick="App.navigate('pos')">
                                    <i class="fa fa-plus-circle me-2"></i> New Sale
                                </button>
                                <button class="btn btn-outline-primary py-3 rounded-3" onclick="App.navigate('inventory')">
                                    <i class="fa fa-boxes me-2"></i> Manage Stock
                                </button>
                                <button class="btn btn-outline-primary py-3 rounded-3" onclick="App.navigate('expenses')">
                                    <i class="fa fa-receipt me-2"></i> Log Expense
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    async init() {
        const res = await fetch('api/analytics.php');
        const data = await res.json();
        
        const todayStr = new Date().toISOString().split('T')[0];
        const todayData = data.daily.find(d => d.day === todayStr) || { total: 0 };
        
        document.getElementById('dashSales').textContent = fmtCurrency(todayData.total);
        document.getElementById('dashStock').textContent = data.top_items.length;
        document.getElementById('dashAlerts').textContent = data.low_stock.length;
        
        // Mock profit calculation (Total revenue * 0.25 margin)
        document.getElementById('dashProfit').textContent = fmtCurrency(todayData.total * 0.25);

        this.renderChart(data.daily);
    },
    renderChart(daily) {
        const ctx = document.getElementById('dashChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: daily.map(d => d.day.split('-').slice(1).join('/')),
                datasets: [{
                    label: 'Sales',
                    data: daily.map(d => d.total),
                    backgroundColor: '#7c3aed',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { display: false } },
                    x: { grid: { display: false } }
                }
            }
        });
    },
    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        const icon = document.querySelector('.theme-toggle i');
        icon.className = next === 'light' ? 'fa fa-moon' : 'fa fa-sun';
        showToast(`Switched to ${next} mode`, 'info');
    }
};
