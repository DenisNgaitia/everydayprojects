const Wholesale = {
    products: [],
    cart: [],
    render() {
        return `
            <div class="row g-4">
                <div class="col-12 col-lg-8">
                    <div class="glass-card p-4 mb-4">
                        <h5 class="fw-bold mb-3"><i class="fa fa-truck me-2 text-primary"></i> Bulk Sales</h5>
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-muted text-uppercase">Buyer Name / Business</label>
                                <input type="text" id="buyerName" class="form-control" placeholder="e.g. Mama Mboga Shop">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-muted text-uppercase">Search Items</label>
                                <input type="text" id="searchWholesale" class="form-control" placeholder="Search bulk items...">
                            </div>
                        </div>
                    </div>
                    <div id="wholesaleGrid" class="row g-3" style="max-height: 500px; overflow-y: auto;">
                        <!-- Bulk items -->
                    </div>
                </div>
                <div class="col-12 col-lg-4">
                    <div class="cart-panel glass-card">
                        <h5 class="fw-bold mb-3">Order Summary</h5>
                        <div id="wholesaleCart" style="min-height: 200px;">
                            <div class="text-center py-5 text-muted" id="emptyWholesaleMsg">
                                <p>No items selected for bulk sale</p>
                            </div>
                        </div>
                        <div class="mt-4 pt-4 border-top">
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted">Total Bulk Price</span>
                                <h4 class="fw-bold text-primary mb-0" id="wholesaleTotal">0 KSh</h4>
                            </div>
                            <div class="mb-4 mt-3">
                                <label class="form-label small fw-bold text-muted text-uppercase">Initial Deposit (Optional)</label>
                                <input type="number" id="amountPaid" class="form-control" placeholder="0.00">
                            </div>
                            <button id="processWholesaleBtn" class="btn btn-primary w-100 py-3 shadow">
                                <i class="fa fa-file-invoice me-2"></i> Process Bulk Sale
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    async init() {
        const res = await fetch('api/products.php');
        this.products = await res.json();
        this.cart = [];
        this.updateCart();
        this.displayItems();

        document.getElementById('searchWholesale').addEventListener('input', (e) => this.displayItems(e.target.value));
        document.getElementById('processWholesaleBtn').onclick = () => this.processSale();
    },
    displayItems(filter = '') {
        const grid = document.getElementById('wholesaleGrid');
        const filtered = this.products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
        
        grid.innerHTML = filtered.map(p => `
            <div class="col-md-6">
                <div class="glass-card p-3 d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                        <div class="bg-light rounded-3 p-1 me-3" style="width: 50px; height: 50px;">
                            <img src="${p.image_path || 'assets/images/placeholder.png'}" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                        <div>
                            <h6 class="mb-0 fw-bold">${p.name}</h6>
                            <span class="small text-primary">${fmtCurrency(p.selling_price)}/unit</span>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline-primary" onclick="Wholesale.addToCart(${p.id})">
                        <i class="fa fa-plus"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },
    addToCart(id) {
        const product = this.products.find(p => p.id == id);
        const existing = this.cart.find(i => i.id == id);
        if (existing) {
            existing.quantity += 10; // Default bulk increment
        } else {
            this.cart.push({ ...product, quantity: 10 });
        }
        showToast(`Added 10 units of ${product.name}`, 'info');
        this.updateCart();
    },
    updateCart() {
        const cartDiv = document.getElementById('wholesaleCart');
        const totalSpan = document.getElementById('wholesaleTotal');
        
        if (this.cart.length === 0) {
            cartDiv.innerHTML = '<div class="text-center py-5 text-muted">No items selected</div>';
            totalSpan.textContent = '0 KSh';
            return;
        }

        const total = this.cart.reduce((sum, i) => sum + (i.selling_price * i.quantity), 0);
        totalSpan.textContent = fmtCurrency(total);

        cartDiv.innerHTML = this.cart.map(i => `
            <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                <div class="flex-grow-1">
                    <div class="fw-bold small">${i.name}</div>
                    <div class="d-flex align-items-center mt-1">
                        <button class="btn btn-xs btn-light px-2" onclick="Wholesale.changeQty(${i.id}, -1)">-</button>
                        <span class="mx-2 small fw-bold">${i.quantity} units</span>
                        <button class="btn btn-xs btn-light px-2" onclick="Wholesale.changeQty(${i.id}, 1)">+</button>
                    </div>
                </div>
                <div class="text-end">
                    <div class="fw-bold small">${fmtCurrency(i.selling_price * i.quantity)}</div>
                    <button class="btn btn-link btn-sm text-danger p-0" onclick="Wholesale.removeItem(${i.id})"><i class="fa fa-times"></i></button>
                </div>
            </div>
        `).join('');
    },
    changeQty(id, delta) {
        const item = this.cart.find(i => i.id == id);
        if (item) {
            item.quantity = Math.max(1, item.quantity + delta);
            this.updateCart();
        }
    },
    removeItem(id) {
        this.cart = this.cart.filter(i => i.id != id);
        this.updateCart();
    },
    async processSale() {
        const buyer = document.getElementById('buyerName').value;
        const deposit = parseFloat(document.getElementById('amountPaid').value) || 0;
        const total = this.cart.reduce((sum, i) => sum + (i.selling_price * i.quantity), 0);

        if (!buyer) return showToast('Please enter buyer name', 'error');
        if (this.cart.length === 0) return showToast('No items in cart', 'error');

        const saleData = {
            buyer_name: buyer,
            total_amount: total,
            amount_paid: deposit,
            items: this.cart.map(i => ({ 
                product_id: i.id, 
                unit_price: i.selling_price, 
                quantity: i.quantity, 
                total: i.selling_price * i.quantity 
            }))
        };

        try {
            const res = await fetch('api/wholesale.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saleData)
            });

            if (res.ok) {
                showToast('Bulk sale processed successfully!', 'success');
                this.cart = [];
                document.getElementById('buyerName').value = '';
                document.getElementById('amountPaid').value = '';
                this.updateCart();
            } else {
                showToast('Failed to process bulk sale', 'error');
            }
        } catch (e) {
            showToast('Error connecting to server', 'error');
        }
    }
};