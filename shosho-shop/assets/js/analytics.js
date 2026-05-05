const Analytics = {
    render() {
        return `
            <div class="row g-4 mb-4">
                <div class="col-12 col-md-4">
                    <div class="stat-card">
                        <span class="label">Today's Revenue</span>
                        <div class="value" id="todayRevenue">0 KSh</div>
                        <div class="small text-success mt-2"><i class="fa fa-arrow-up me-1"></i> Live tracking</div>
                    </div>
                </div>
                <div class="col-12 col-md-4">
                    <div class="stat-card">
                        <span class="label">Items Sold</span>
                        <div class="value" id="itemsSold">0</div>
                        <div class="small text-muted mt-2">Units across all products</div>
                    </div>
                </div>
                <div class="col-12 col-md-4">
                    <div class="stat-card">
                        <span class="label">Low Stock Items</span>
                        <div class="value text-danger" id="lowStockCount">0</div>
                        <div class="small text-muted mt-2">Needs immediate restock</div>
                    </div>
                </div>
            </div>

            <div class="row g-4">
                <div class="col-12 col-lg-8">
                    <div class="glass-card p-4">
                        <h5 class="fw-bold mb-4">Revenue Trend</h5>
                        <div style="height: 300px;">
                            <canvas id="revenueChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-lg-4">
                    <div class="glass-card p-4 h-100">
                        <h5 class="fw-bold mb-4">Top Selling Items</h5>
                        <div id="topItems" class="d-flex flex-column gap-3">
                            <!-- Top items will be injected here -->
                        </div>
                    </div>
                </div>
            </div>

            <div class="glass-card p-4 mt-4" id="alertsSection">
                <h5 class="fw-bold mb-3">Critical Alerts</h5>
                <div id="alertsList"></div>
            </div>
        `;
    },
    async init() {
        const res = await fetch('api/analytics.php');
        const data = await res.json();
        
        // Summary stats
        const todayStr = new Date().toISOString().split('T')[0];
        const todayData = data.daily.find(d => d.day === todayStr) || { total: 0 };
        document.getElementById('todayRevenue').textContent = fmtCurrency(todayData.total);
        document.getElementById('itemsSold').textContent = data.top_items.reduce((sum, i) => sum + parseInt(i.sold), 0);
        document.getElementById('lowStockCount').textContent = data.low_stock.length;

        this.drawChart(data.daily);
        this.showTop(data.top_items);
        this.showAlerts(data.low_stock);
    },
    drawChart(daily) {
        const ctx = document.getElementById('revenueChart').getContext('2d');
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(79, 70, 229, 0.2)');
        gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: daily.map(d => {
                    const date = new Date(d.day);
                    return date.toLocaleDateString('sw-TZ', { weekday: 'short' });
                }),
                datasets: [{
                    label: 'Revenue',
                    data: daily.map(d => d.total),
                    borderColor: '#4f46e5',
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointBackgroundColor: '#4f46e5',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: { callback: value => fmtCurrency(value) }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    },
    showTop(top) {
        const div = document.getElementById('topItems');
        if (top.length === 0) {
            div.innerHTML = '<p class="text-center text-muted py-4">No data available</p>';
            return;
        }

        div.innerHTML = top.map((i, index) => `
            <div class="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light-subtle border">
                <div class="d-flex align-items-center">
                    <div class="fw-bold me-3 text-muted" style="width: 20px;">#${index + 1}</div>
                    <div>
                        <div class="fw-bold small">${i.name}</div>
                        <div class="small text-muted">${i.sold} units sold</div>
                    </div>
                </div>
                <div class="badge bg-primary-subtle text-primary rounded-pill">
                    ${Math.round((i.sold / top[0].sold) * 100)}%
                </div>
            </div>
        `).join('');
    },
    showAlerts(low) {
        const list = document.getElementById('alertsList');
        if (low.length === 0) {
            list.innerHTML = `
                <div class="alert alert-success border-0 bg-success-subtle text-success mb-0">
                    <i class="fa fa-check-circle me-2"></i> All inventory levels are healthy.
                </div>
            `;
            return;
        }

        list.innerHTML = low.map(p => `
            <div class="alert alert-warning border-0 bg-warning-subtle text-warning d-flex justify-content-between align-items-center mb-2">
                <span><i class="fa fa-exclamation-triangle me-2"></i> <strong>${p.name}</strong> is running low (${p.quantity} remaining)</span>
                <button class="btn btn-sm btn-warning" onclick="App.navigate('inventory')">Restock</button>
            </div>
        `).join('');
    }
};