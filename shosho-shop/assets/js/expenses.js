const Expenses = {
    expenses: [],
    render() {
        return `
            <div class="container-fluid">
                <div class="glass-card p-4 mb-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h3 class="fw-bold mb-0">Expense Manager</h3>
                        <p class="text-muted mb-0">Track your shop's operational costs</p>
                    </div>
                    <button class="btn btn-primary px-4 py-2" id="addExpenseBtn">
                        <i class="fa fa-plus me-2"></i> Log Expense
                    </button>
                </div>

                <div class="row g-4">
                    <div class="col-12 col-lg-8">
                        <div class="glass-card overflow-hidden">
                            <table class="table table-hover align-middle mb-0" id="expenseTable">
                                <thead class="bg-light">
                                    <tr>
                                        <th class="ps-4">Date</th>
                                        <th>Category</th>
                                        <th>Description</th>
                                        <th>Amount</th>
                                        <th class="text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Expenses injected here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="col-12 col-lg-4">
                        <div class="glass-card p-4">
                            <h5 class="fw-bold mb-4">Expense Breakdown</h5>
                            <div style="height: 250px;">
                                <canvas id="expenseChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Expense Modal -->
            <div class="modal fade" id="expenseModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content glass-card border-0">
                        <div class="modal-header border-0 p-4">
                            <h5 class="fw-bold mb-0">Log New Expense</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4 pt-0">
                            <div class="mb-3">
                                <label class="form-label small fw-bold text-muted text-uppercase">Category</label>
                                <select id="expCategory" class="form-select">
                                    <option value="Rent">Rent</option>
                                    <option value="Electricity">Electricity</option>
                                    <option value="Water">Water</option>
                                    <option value="Transport">Transport</option>
                                    <option value="Salaries">Salaries</option>
                                    <option value="Packaging">Packaging</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold text-muted text-uppercase">Amount (TZS)</label>
                                <input type="number" id="expAmount" class="form-control" placeholder="0.00">
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold text-muted text-uppercase">Description</label>
                                <textarea id="expDesc" class="form-control" placeholder="What was this for?"></textarea>
                            </div>
                            <div class="mb-4">
                                <label class="form-label small fw-bold text-muted text-uppercase">Date</label>
                                <input type="date" id="expDate" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            <button id="saveExpenseBtn" class="btn btn-primary w-100 py-3 shadow">
                                Save Expense Record
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    async init() {
        await this.loadExpenses();
        document.getElementById('addExpenseBtn').onclick = () => {
            new bootstrap.Modal(document.getElementById('expenseModal')).show();
        };
        document.getElementById('saveExpenseBtn').onclick = () => this.saveExpense();
    },
    async loadExpenses() {
        const res = await fetch('api/expenses.php');
        this.expenses = await res.json();
        this.renderTable();
        this.renderChart();
    },
    renderTable() {
        const tbody = document.querySelector('#expenseTable tbody');
        if (this.expenses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-5 text-muted">No expenses recorded yet</td></tr>';
            return;
        }

        tbody.innerHTML = this.expenses.map(e => `
            <tr>
                <td class="ps-4 small">${e.expense_date}</td>
                <td><span class="badge bg-light text-primary border">${e.category}</span></td>
                <td class="small text-muted text-truncate" style="max-width: 200px;">${e.description || '-'}</td>
                <td class="fw-bold">${fmtCurrency(e.amount)}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-link text-danger" onclick="Expenses.deleteExpense(${e.id})">
                        <i class="fa fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },
    renderChart() {
        const categories = {};
        this.expenses.forEach(e => {
            categories[e.category] = (categories[e.category] || 0) + parseFloat(e.amount);
        });

        const ctx = document.getElementById('expenseChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: ['#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#64748b', '#ec4899']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, usePointStyle: true } } }
            }
        });
    },
    async saveExpense() {
        const data = {
            category: document.getElementById('expCategory').value,
            amount: document.getElementById('expAmount').value,
            description: document.getElementById('expDesc').value,
            expense_date: document.getElementById('expDate').value
        };

        if (!data.amount) return showToast('Please enter an amount', 'error');

        const res = await fetch('api/expenses.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            bootstrap.Modal.getInstance(document.getElementById('expenseModal')).hide();
            showToast('Expense saved', 'success');
            this.loadExpenses();
        }
    },
    async deleteExpense(id) {
        if (!confirm('Delete this record?')) return;
        const res = await fetch(`api/expenses.php?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Record deleted', 'success');
            this.loadExpenses();
        }
    }
};
