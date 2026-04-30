const POS = {
    products: [],
    cart: [],
    render() {
        return `
            <div class="row">
                <div class="col-12"><input type="text" id="searchProduct" class="form-control mb-2" placeholder="Search product..."></div>
                <div id="productGrid" class="row g-2 col-12 col-md-8" style="max-height:60vh; overflow-y:auto;"></div>
                <div id="cartPanel" class="col-12 col-md-4 border-start bg-light p-2">
                    <h6>Cart</h6>
                    <div id="cartItems"></div>
                    <hr>
                    <strong>Total: <span id="cartTotal">0</span> TZS</strong>
                    <button id="checkoutBtn" class="btn btn-success w-100 mt-2">Checkout</button>
                </div>
            </div>
            <!-- Payment Modal -->
            <div class="modal fade" id="paymentModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header"><h5 class="modal-title">Payment</h5></div>
                        <div class="modal-body">
                            <p>Total: <span id="modalTotal"></span></p>
                            <select id="paymentMethod" class="form-select mb-2">
                                <option value="cash">Cash</option>
                                <option value="mobile_money">Mobile Money</option>
                            </select>
                            <div id="cashInput">
                                <input type="number" id="cashReceived" class="form-control" placeholder="Amount received" step="0.01">
                                <p>Change: <span id="changeAmt">0</span></p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button id="confirmSaleBtn" class="btn btn-primary">Confirm</button>
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
        this.updateCartDisplay();
        this.displayProducts();
        document.getElementById('searchProduct').addEventListener('input', (e) => this.displayProducts(e.target.value));
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            if (this.cart.length === 0) return alert('Cart is empty');
            this.openPayment();
        });
        document.getElementById('paymentMethod').addEventListener('change', (e) => {
            document.getElementById('cashInput').style.display = e.target.value === 'cash' ? 'block' : 'none';
        });
        document.getElementById('cashReceived').addEventListener('input', (e) => {
            const change = parseFloat(e.target.value) - this.cartTotal;
            document.getElementById('changeAmt').textContent = change >= 0 ? change.toFixed(2) : '0';
        });
        document.getElementById('confirmSaleBtn').addEventListener('click', () => this.confirmSale());
    },
    displayProducts(filter = '') {
        const grid = document.getElementById('productGrid');
        const filtered = this.products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
        grid.innerHTML = filtered.map(p => `
            <div class="col-4 col-md-3 mb-2">
                <div class="card product-card" data-id="${p.id}" style="cursor:pointer;">
                    <img src="${p.image_path || 'assets/images/placeholder.png'}" class="card-img-top">
                    <div class="card-body p-1 text-center">
                        <small>${p.name}</small><br>
                        <small class="fw-bold">${p.selling_price}</small>
                    </div>
                </div>
            </div>
        `).join('');
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                const product = this.products.find(p => p.id == id);
                this.addToCart(product);
            });
        });
    },
    addToCart(product, qty = 1) {
        const existing = this.cart.find(i => i.id === product.id);
        if (existing) {
            existing.quantity += qty;
        } else {
            this.cart.push({ ...product, quantity: qty });
        }
        this.updateCartDisplay();
    },
    updateCartDisplay() {
        this.cartTotal = this.cart.reduce((sum, i) => sum + (i.selling_price * i.quantity), 0);
        document.getElementById('cartTotal').textContent = fmtCurrency(this.cartTotal);
        const cartDiv = document.getElementById('cartItems');
        cartDiv.innerHTML = this.cart.map(i => `
            <div class="d-flex justify-content-between cart-item">
                <span>${i.name} x${i.quantity}</span>
                <span>${fmtCurrency(i.selling_price * i.quantity)} 
                    <i class="fa fa-times text-danger" style="cursor:pointer" data-remove="${i.id}"></i>
                </span>
            </div>
        `).join('');
        document.querySelectorAll('[data-remove]').forEach(btn => {
            btn.onclick = () => {
                this.cart = this.cart.filter(item => item.id != btn.dataset.remove);
                this.updateCartDisplay();
            };
        });
    },
    openPayment() {
        document.getElementById('modalTotal').textContent = fmtCurrency(this.cartTotal);
        new bootstrap.Modal(document.getElementById('paymentModal')).show();
    },
    async confirmSale() {
        const method = document.getElementById('paymentMethod').value;
        const cashReceived = method === 'cash' ? parseFloat(document.getElementById('cashReceived').value) || 0 : 0;
        const change = cashReceived - this.cartTotal;
        const saleData = {
            total_amount: this.cartTotal,
            payment_method: method,
            cash_received: cashReceived,
            change_given: change > 0 ? change : 0,
            items: this.cart.map(i => ({ product_id: i.id, unit_price: i.selling_price, quantity: i.quantity, total: i.selling_price * i.quantity }))
        };
        if (navigator.onLine) {
            const res = await fetch('api/sales.php', { method: 'POST', body: JSON.stringify(saleData) });
            if (res.ok) {
                this.cart = [];
                this.updateCartDisplay();
                bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
                showToast('Sale completed');
                this.init(); // refresh stock
            } else {
                alert('Error processing sale');
            }
        } else {
            await savePendingSale(saleData);
            this.cart = [];
            this.updateCartDisplay();
            bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
            showToast('Sale saved offline. Will sync when online.');
        }
    }
};