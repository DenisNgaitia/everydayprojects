const Analytics = {
    async render() {
        return `
            <h5>Analytics</h5>
            <div class="row">
                <div class="col-12"><canvas id="revenueChart"></canvas></div>
            </div>
            <div class="mt-3" id="alerts"></div>
            <div class="mt-3" id="topItems"></div>
        `;
    },
    async init() {
        const res = await fetch('api/analytics.php');
        const data = await res.json();
        this.drawChart(data.daily);
        this.showAlerts(data.low_stock);
        this.showTop(data.top_items);
    },
    drawChart(daily) {
        const ctx = document.getElementById('revenueChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: daily.map(d => d.day),
                datasets: [{ label: 'Revenue (TZS)', data: daily.map(d => d.total), backgroundColor: '#007bff' }]
            }
        });
    },
    showAlerts(low) {
        const div = document.getElementById('alerts');
        if (low.length) {
            div.innerHTML = `<div class="alert alert-warning">Low stock: ${low.map(p => p.name + '(' + p.quantity + ')').join(', ')}</div>`;
        } else {
            div.innerHTML = '<div class="alert alert-success">All stock levels OK</div>';
        }
    },
    showTop(top) {
        const div = document.getElementById('topItems');
        div.innerHTML = '<h6>Top Selling Items</h6><ul>' + top.map(i => `<li>${i.name} - ${i.sold} sold</li>`).join('') + '</ul>';
    }
};