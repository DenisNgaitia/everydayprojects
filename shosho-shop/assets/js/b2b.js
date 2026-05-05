const B2B = {
    clients: [],
    products: [],
    currentClient: null,
    dispatchCart: [],

    render() {
        return `
            <div id="b2bContainer">
                <div class="d-flex justify-content-between align-items-center mb-4 animate-up">
                    <div>
                        <h4 class="fw-bold mb-1">B2B Ledger</h4>
                        <p class="text-muted mb-0 small">Institutional accounts &amp; dispatch tracking</p>
                    </div>
                    <button id="addClientBtn" class="btn btn-primary shadow rounded-pill px-4">
                        <i class="fa fa-plus me-2"></i>New Client
                    </button>
                </div>

                <div id="b2bContent">
                    <!-- Client list or detail view injected here -->
                </div>

                <!-- Client Modal -->
                <div class="modal fade" id="clientModal" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content glass-card border-0 p-0" id="clientFormContainer"></div>
                    </div>
                </div>

                <!-- Dispatch Modal -->
                <div class="modal fade" id="dispatchModal" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered modal-lg">
                        <div class="modal-content glass-card border-0 p-0" id="dispatchFormContainer"></div>
                    </div>
                </div>

                <!-- Payment Modal -->
                <div class="modal fade" id="paymentModal_b2b" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content glass-card border-0 p-0" id="paymentFormContainer"></div>
                    </div>
                </div>
            </div>
        `;
    },

    async init() {
        document.body.appendChild(document.getElementById('clientModal'));
        document.body.appendChild(document.getElementById('dispatchModal'));
        document.body.appendChild(document.getElementById('paymentModal_b2b'));

        const [clientsRes, productsRes] = await Promise.all([
            fetch('api/b2b.php?action=clients'),
            fetch('api/products.php')
        ]);
        this.clients = await clientsRes.json();
        this.products = await productsRes.json();

        document.getElementById('addClientBtn').onclick = () => this.openClientForm();
        this.showClientList();
    },

    // =================== CLIENT LIST ===================
    showClientList() {
        this.currentClient = null;
        const container = document.getElementById('b2bContent');

        if (this.clients.length === 0) {
            container.innerHTML = `
                <div class="glass-card p-5 text-center animate-up">
                    <i class="fa fa-building text-muted mb-3" style="font-size:3rem; opacity:0.3;"></i>
                    <h5 class="text-muted">No institutional clients yet</h5>
                    <p class="text-muted small">Click "New Client" to add your first B2B account.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="row g-3 animate-up">
                ${this.clients.map(c => {
                    const bal = parseFloat(c.outstanding_balance) || 0;
                    const badgeClass = bal <= 0 ? 'bg-success-subtle text-success' : bal > 5000 ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning';
                    return `
                        <div class="col-12 col-md-6 col-lg-4">
                            <div class="glass-card p-4 b2b-client-card" onclick="B2B.openClientDetail(${c.id})" style="cursor:pointer;">
                                <div class="d-flex align-items-start justify-content-between mb-3">
                                    <div class="b2b-avatar">
                                        <i class="fa fa-building"></i>
                                    </div>
                                    <span class="badge ${badgeClass} rounded-pill px-3 py-2 small fw-bold">
                                        ${bal <= 0 ? 'Cleared' : fmtCurrency(bal) + ' due'}
                                    </span>
                                </div>
                                <h6 class="fw-bold mb-1">${c.name}</h6>
                                <p class="text-muted small mb-2">${c.contact_person || 'No contact'} ${c.phone ? '· ' + c.phone : ''}</p>
                                <div class="d-flex gap-3 small text-muted">
                                    <span><i class="fa fa-truck me-1"></i>${fmtCurrency(c.total_dispatched || 0)}</span>
                                    <span><i class="fa fa-check-circle me-1 text-success"></i>${fmtCurrency(c.total_paid || 0)}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    // =================== CLIENT DETAIL / LEDGER ===================
    async openClientDetail(clientId) {
        const clientRes = await fetch(`api/b2b.php?action=clients&id=${clientId}`);
        this.currentClient = await clientRes.json();

        const [dispatchesRes, paymentsRes] = await Promise.all([
            fetch(`api/b2b.php?action=dispatches&client_id=${clientId}`),
            fetch(`api/b2b.php?action=payments&client_id=${clientId}`)
        ]);
        const dispatches = await dispatchesRes.json();
        const payments = await paymentsRes.json();

        const bal = parseFloat(this.currentClient.outstanding_balance) || 0;

        const container = document.getElementById('b2bContent');
        container.innerHTML = `
            <div class="animate-up">
                <button class="btn btn-light rounded-pill mb-3 px-3" onclick="B2B.backToList()">
                    <i class="fa fa-arrow-left me-2"></i>All Clients
                </button>

                <div class="glass-card p-4 mb-4">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <div class="d-flex align-items-center gap-3">
                                <div class="b2b-avatar b2b-avatar-lg"><i class="fa fa-building"></i></div>
                                <div>
                                    <h4 class="fw-bold mb-1">${this.currentClient.name}</h4>
                                    <p class="text-muted mb-0 small">${this.currentClient.contact_person || ''} ${this.currentClient.phone ? '· ' + this.currentClient.phone : ''}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 text-md-end mt-3 mt-md-0">
                            <span class="text-muted small d-block mb-1">Outstanding Balance</span>
                            <h3 class="fw-bold ${bal > 0 ? 'text-danger' : 'text-success'} mb-2">${fmtCurrency(bal)}</h3>
                            <div class="d-flex gap-2 justify-content-md-end">
                                <button class="btn btn-primary rounded-pill px-3 btn-sm" onclick="B2B.openDispatchForm(${clientId})">
                                    <i class="fa fa-truck me-1"></i>New Dispatch
                                </button>
                                <button class="btn btn-success rounded-pill px-3 btn-sm" onclick="B2B.openPaymentForm(${clientId})">
                                    <i class="fa fa-money-bill me-1"></i>Record Payment
                                </button>
                                <button class="btn btn-outline-secondary rounded-pill px-3 btn-sm" onclick="B2B.openClientForm(B2B.currentClient)">
                                    <i class="fa fa-edit me-1"></i>Edit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Ledger -->
                <h5 class="fw-bold mb-3"><i class="fa fa-book me-2 text-primary"></i>Ledger</h5>
                <div class="glass-card p-0 mb-4 overflow-hidden">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th class="ps-4">Date</th>
                                    <th>Type</th>
                                    <th>Reference</th>
                                    <th>Details</th>
                                    <th class="text-end">Amount</th>
                                    <th class="text-end pe-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.buildLedgerRows(dispatches, payments)}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Dispatch Details -->
                <h5 class="fw-bold mb-3"><i class="fa fa-boxes me-2 text-primary"></i>Dispatch Records</h5>
                ${dispatches.length === 0 ? '<div class="glass-card p-4 text-center text-muted small">No dispatches yet</div>' :
                    dispatches.map(d => `
                        <div class="glass-card p-4 mb-3 b2b-dispatch-card">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h6 class="fw-bold mb-1">${d.dispatch_ref}</h6>
                                    <span class="text-muted small">${new Date(d.dispatch_date).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'})}</span>
                                </div>
                                ${this.statusBadge(d.payment_status)}
                            </div>
                            <div class="table-responsive">
                                <table class="table table-sm mb-0 small">
                                    <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th class="text-end">Total</th></tr></thead>
                                    <tbody>
                                        ${(d.items || []).map(it => `
                                            <tr>
                                                <td>${it.product_name}</td>
                                                <td>${it.quantity}</td>
                                                <td>${fmtCurrency(it.unit_price)}</td>
                                                <td class="text-end">${fmtCurrency(it.total)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            <div class="d-flex justify-content-between mt-3 pt-2 border-top small">
                                <span class="text-muted">Paid: ${fmtCurrency(d.amount_paid)}</span>
                                <span class="fw-bold">Total: ${fmtCurrency(d.total_amount)}</span>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        `;
    },

    buildLedgerRows(dispatches, payments) {
        const rows = [];
        dispatches.forEach(d => {
            rows.push({
                date: d.dispatch_date,
                type: 'dispatch',
                ref: d.dispatch_ref,
                detail: `${(d.items||[]).length} items dispatched`,
                amount: d.total_amount,
                status: d.payment_status
            });
        });
        payments.forEach(p => {
            rows.push({
                date: p.payment_date,
                type: 'payment',
                ref: p.reference_note || '—',
                detail: `Via ${p.payment_method}`,
                amount: p.amount,
                status: 'paid'
            });
        });
        rows.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (rows.length === 0) return '<tr><td colspan="6" class="text-center text-muted py-4">No transactions yet</td></tr>';

        return rows.map(r => {
            const isPayment = r.type === 'payment';
            return `
                <tr>
                    <td class="ps-4 small">${new Date(r.date).toLocaleDateString('en-GB', {day:'numeric', month:'short'})}</td>
                    <td>
                        <span class="badge ${isPayment ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'} rounded-pill small">
                            <i class="fa ${isPayment ? 'fa-arrow-down' : 'fa-truck'} me-1"></i>${isPayment ? 'Payment' : 'Dispatch'}
                        </span>
                    </td>
                    <td class="small fw-bold">${r.ref}</td>
                    <td class="small text-muted">${r.detail}</td>
                    <td class="text-end small fw-bold ${isPayment ? 'text-success' : ''}">${isPayment ? '- ' : ''}${fmtCurrency(r.amount)}</td>
                    <td class="text-end pe-4">${this.statusBadge(r.status)}</td>
                </tr>
            `;
        }).join('');
    },

    statusBadge(status) {
        const map = {
            paid: '<span class="badge bg-success-subtle text-success rounded-pill px-2 py-1 small">Paid</span>',
            partial: '<span class="badge bg-warning-subtle text-warning rounded-pill px-2 py-1 small">Partial</span>',
            pending: '<span class="badge bg-danger-subtle text-danger rounded-pill px-2 py-1 small">Pending</span>'
        };
        return map[status] || map.pending;
    },

    async backToList() {
        const res = await fetch('api/b2b.php?action=clients');
        this.clients = await res.json();
        this.showClientList();
    },

    // =================== CLIENT FORM ===================
    openClientForm(client = null) {
        const html = `
            <div class="modal-header border-0 p-4 pb-0">
                <h5 class="fw-bold mb-0">${client ? 'Edit Client' : 'New Institutional Client'}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4">
                <div class="row g-3">
                    <div class="col-12">
                        <label class="form-label small fw-bold text-muted text-uppercase">Business / Institution Name *</label>
                        <input id="clientName" class="form-control" value="${client?.name || ''}" placeholder="e.g. Company Hotel">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-bold text-muted text-uppercase">Contact Person</label>
                        <input id="clientContact" class="form-control" value="${client?.contact_person || ''}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-bold text-muted text-uppercase">Phone</label>
                        <input id="clientPhone" class="form-control" value="${client?.phone || ''}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-bold text-muted text-uppercase">Email</label>
                        <input id="clientEmail" class="form-control" type="email" value="${client?.email || ''}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-bold text-muted text-uppercase">Address</label>
                        <input id="clientAddress" class="form-control" value="${client?.address || ''}">
                    </div>
                    <div class="col-12">
                        <label class="form-label small fw-bold text-muted text-uppercase">Notes</label>
                        <textarea id="clientNotes" class="form-control" rows="2">${client?.notes || ''}</textarea>
                    </div>
                    <div class="col-12 mt-3">
                        <button id="saveClientBtn" class="btn btn-primary w-100 py-3 rounded-3 shadow">
                            ${client ? 'Update Client' : 'Add Client'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('clientFormContainer').innerHTML = html;
        bootstrap.Modal.getOrCreateInstance(document.getElementById('clientModal')).show();

        document.getElementById('saveClientBtn').onclick = async () => {
            const data = {
                name: document.getElementById('clientName').value,
                contact_person: document.getElementById('clientContact').value,
                phone: document.getElementById('clientPhone').value,
                email: document.getElementById('clientEmail').value,
                address: document.getElementById('clientAddress').value,
                notes: document.getElementById('clientNotes').value
            };
            if (!data.name.trim()) return showToast('Client name is required', 'error');

            const method = client ? 'PUT' : 'POST';
            const url = client ? `api/b2b.php?action=clients&id=${client.id}` : 'api/b2b.php?action=clients';
            const res = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });

            if (res.ok) {
                bootstrap.Modal.getInstance(document.getElementById('clientModal')).hide();
                showToast(client ? 'Client updated!' : 'Client added!', 'success');
                this.clients = await (await fetch('api/b2b.php?action=clients')).json();
                if (this.currentClient) {
                    this.openClientDetail(this.currentClient.id);
                } else {
                    this.showClientList();
                }
            }
        };
    },

    // =================== DISPATCH FORM ===================
    openDispatchForm(clientId) {
        this.dispatchCart = [];
        const html = `
            <div class="modal-header border-0 p-4 pb-0">
                <h5 class="fw-bold mb-0"><i class="fa fa-truck me-2"></i>New Dispatch</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4">
                <div class="mb-3">
                    <label class="form-label small fw-bold text-muted text-uppercase">Search & Add Products</label>
                    <input id="dispatchSearch" class="form-control" placeholder="Type to search inventory..." list="dispatchProductOptions">
                    <datalist id="dispatchProductOptions">
                        ${this.products.filter(p => !['Small Bag','Medium Bag','Large Bag'].includes(p.name) && p.category !== 'System-Bags').map(p => `<option value="${p.name}" data-id="${p.id}">`).join('')}
                    </datalist>
                </div>
                <div id="dispatchCartItems" class="mb-3" style="min-height:80px; max-height:260px; overflow-y:auto;"></div>
                <div class="d-flex justify-content-between fw-bold border-top pt-3 mb-3">
                    <span>Total</span>
                    <span id="dispatchTotal" class="text-primary">0 KSh</span>
                </div>
                <div class="mb-3">
                    <label class="form-label small fw-bold text-muted text-uppercase">Notes</label>
                    <input id="dispatchNotes" class="form-control" placeholder="e.g. Delivered to kitchen">
                </div>
                <button id="confirmDispatchBtn" class="btn btn-primary w-100 py-3 rounded-3 shadow">
                    <i class="fa fa-paper-plane me-2"></i>Confirm Dispatch
                </button>
            </div>
        `;
        document.getElementById('dispatchFormContainer').innerHTML = html;
        bootstrap.Modal.getOrCreateInstance(document.getElementById('dispatchModal')).show();

        const searchInput = document.getElementById('dispatchSearch');
        searchInput.addEventListener('change', () => {
            const name = searchInput.value;
            const product = this.products.find(p => p.name === name);
            if (product) {
                const existing = this.dispatchCart.find(i => i.id == product.id);
                if (existing) {
                    existing.quantity += 1;
                } else {
                    this.dispatchCart.push({ ...product, quantity: 1, dispatch_price: parseFloat(product.selling_price) });
                }
                searchInput.value = '';
                this.renderDispatchCart();
            }
        });

        document.getElementById('confirmDispatchBtn').onclick = async () => {
            if (this.dispatchCart.length === 0) return showToast('Add at least one item', 'error');

            const data = {
                client_id: clientId,
                notes: document.getElementById('dispatchNotes').value,
                items: this.dispatchCart.map(i => ({
                    product_id: i.id,
                    unit_price: i.dispatch_price,
                    quantity: i.quantity
                }))
            };

            const res = await fetch('api/b2b.php?action=dispatches', {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(data)
            });

            if (res.ok) {
                bootstrap.Modal.getInstance(document.getElementById('dispatchModal')).hide();
                showToast('Dispatch recorded! Inventory updated.', 'success');
                this.products = await (await fetch('api/products.php')).json();
                this.openClientDetail(clientId);
            } else {
                const err = await res.json();
                showToast(err.error || 'Dispatch failed', 'error');
            }
        };

        this.renderDispatchCart();
    },

    renderDispatchCart() {
        const div = document.getElementById('dispatchCartItems');
        if (this.dispatchCart.length === 0) {
            div.innerHTML = '<div class="text-center text-muted py-4 small">Search and add products above</div>';
            document.getElementById('dispatchTotal').textContent = '0 KSh';
            return;
        }
        let total = 0;
        div.innerHTML = this.dispatchCart.map(i => {
            const lineTotal = i.dispatch_price * i.quantity;
            total += lineTotal;
            return `
                <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                    <div class="flex-grow-1">
                        <div class="fw-bold small">${i.name}</div>
                        <div class="d-flex align-items-center gap-2 mt-1">
                            <button class="btn btn-xs btn-light rounded-circle" onclick="B2B.changeDispatchQty(${i.id}, -1)">-</button>
                            <span class="small fw-bold">${i.quantity}</span>
                            <button class="btn btn-xs btn-light rounded-circle" onclick="B2B.changeDispatchQty(${i.id}, 1)">+</button>
                            <span class="text-muted small ms-2">@ ${fmtCurrency(i.dispatch_price)}</span>
                        </div>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold small">${fmtCurrency(lineTotal)}</div>
                        <button class="btn btn-link text-danger p-0 small" onclick="B2B.removeDispatchItem(${i.id})"><i class="fa fa-trash-alt"></i></button>
                    </div>
                </div>
            `;
        }).join('');
        document.getElementById('dispatchTotal').textContent = fmtCurrency(total);
    },

    changeDispatchQty(id, delta) {
        const item = this.dispatchCart.find(i => i.id == id);
        if (item) {
            item.quantity = Math.max(1, item.quantity + delta);
            this.renderDispatchCart();
        }
    },
    removeDispatchItem(id) {
        this.dispatchCart = this.dispatchCart.filter(i => i.id != id);
        this.renderDispatchCart();
    },

    // =================== PAYMENT FORM ===================
    openPaymentForm(clientId) {
        const bal = parseFloat(this.currentClient.outstanding_balance) || 0;
        const html = `
            <div class="modal-header border-0 p-4 pb-0">
                <h5 class="fw-bold mb-0"><i class="fa fa-money-bill me-2 text-success"></i>Record Payment</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4">
                <div class="text-center mb-4">
                    <span class="text-muted small d-block">Outstanding Balance</span>
                    <h3 class="fw-bold text-danger mb-0">${fmtCurrency(bal)}</h3>
                </div>
                <div class="row g-3">
                    <div class="col-12">
                        <label class="form-label small fw-bold text-muted text-uppercase">Payment Amount *</label>
                        <input id="payAmount" class="form-control form-control-lg" type="number" placeholder="0" max="${bal}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-bold text-muted text-uppercase">Method</label>
                        <select id="payMethod" class="form-select">
                            <option value="cash">Cash</option>
                            <option value="mobile_money">Mobile Money</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cheque">Cheque</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-bold text-muted text-uppercase">Reference / Note</label>
                        <input id="payRef" class="form-control" placeholder="e.g. Mpesa XXXX">
                    </div>
                    <div class="col-12 mt-3">
                        <button id="confirmPayBtn" class="btn btn-success w-100 py-3 rounded-3 shadow">
                            <i class="fa fa-check me-2"></i>Confirm Payment
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('paymentFormContainer').innerHTML = html;
        bootstrap.Modal.getOrCreateInstance(document.getElementById('paymentModal_b2b')).show();

        document.getElementById('confirmPayBtn').onclick = async () => {
            const amount = parseFloat(document.getElementById('payAmount').value);
            if (!amount || amount <= 0) return showToast('Enter a valid amount', 'error');

            const data = {
                client_id: clientId,
                amount,
                payment_method: document.getElementById('payMethod').value,
                reference_note: document.getElementById('payRef').value
            };

            const res = await fetch('api/b2b.php?action=payments', {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(data)
            });

            if (res.ok) {
                bootstrap.Modal.getInstance(document.getElementById('paymentModal_b2b')).hide();
                showToast('Payment recorded!', 'success');
                this.openClientDetail(clientId);
            } else {
                showToast('Failed to record payment', 'error');
            }
        };
    }
};
