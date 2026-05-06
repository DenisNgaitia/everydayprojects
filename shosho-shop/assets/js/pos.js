const POS = {
    products: [],
    cart: [],
    render() {
        return `
            <div class="row g-4">
                <div class="col-12 col-lg-8">
                    <div class="glass-card p-3 mb-4 animate-up">
                        <div class="input-group">
                            <span class="input-group-text bg-transparent border-0"><i class="fa fa-search text-muted"></i></span>
                            <input type="text" id="searchProduct" class="form-control border-0 bg-transparent ps-0" placeholder="Search product by name, category or SKU...">
                            <div class="btn-group border ms-2 rounded-3 overflow-hidden">
                                <button id="viewCatsBtn" class="btn btn-primary px-3">Categories</button>
                                <button id="viewItemsBtn" class="btn btn-light px-3">Items</button>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mt-3 gap-2" id="breadcrumbContainer" style="display:none !important">
                            <button class="btn btn-sm btn-light" onclick="POS.showCategories()"><i class="fa fa-arrow-left"></i> Back</button>
                            <span class="fw-bold" id="currentCategoryLabel"></span>
                        </div>
                    </div>
                    <div id="productGrid" class="row g-3 product-grid-container">
                        <!-- Products injected here -->
                    </div>
                </div>
                <div class="col-12 col-lg-4">
                    <div class="cart-panel glass-card p-4 sticky-top animate-up" style="top: 20px; animation-delay: 0.1s">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h5 class="fw-bold mb-0">Order Summary</h5>
                            <button class="btn btn-sm btn-light-danger" onclick="POS.clearCart()">Clear</button>
                        </div>
                        <div id="cartItems" class="mb-4" style="min-height: 200px; max-height: 400px; overflow-y: auto;">
                            <!-- Items -->
                        </div>
                        <div class="border-top pt-4">
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted">Subtotal</span>
                                <span class="fw-bold" id="cartSubtotal">0 KSh</span>
                            </div>
                            <div class="d-flex justify-content-end gap-2 mb-3" id="bagButtons">
                                <!-- Bag buttons injected here -->
                            </div>
                            <div class="d-flex justify-content-between mb-4">
                                <h4 class="fw-extrabold mb-0">Total</h4>
                                <h4 class="fw-extrabold mb-0 text-primary" id="cartTotal">0 KSh</h4>
                            </div>
                            <button id="checkoutBtn" class="btn btn-primary w-100 py-3 shadow-lg rounded-3">
                                <i class="fa fa-cash-register me-2"></i> Complete Sale
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Receipt Modal -->
            <div class="modal fade" id="receiptModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content glass-card border-0">
                        <div class="modal-body p-4 text-center">
                            <div id="receiptContent">
                                <!-- Receipt paper -->
                            </div>
                            <div class="d-flex gap-2 mt-4 no-print">
                                <button class="btn btn-outline-secondary flex-grow-1" data-bs-dismiss="modal">Close</button>
                                <button class="btn btn-primary flex-grow-1" onclick="window.print()">
                                    <i class="fa fa-print me-2"></i> Print Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style media="print">
                .no-print { display: none !important; }
                body * { visibility: hidden; }
                #receiptContent, #receiptContent * { visibility: visible; }
                #receiptContent { position: absolute; left: 0; top: 0; width: 100%; }
            </style>

            <!-- Payment Modal (Hidden but reused) -->
            <div class="modal fade" id="paymentModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content glass-card border-0">
                        <div class="modal-header border-0 pb-0">
                            <h5 class="modal-title fw-bold">Select Payment</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4">
                            <div class="text-center mb-4">
                                <h2 class="fw-extrabold text-primary mb-1" id="modalTotal">0 KSh</h2>
                                <p class="text-muted small">Total amount due</p>
                            </div>
                            <div class="d-flex gap-2 mb-4">
                                <input type="radio" class="btn-check" name="payment_method" id="pay_cash" value="cash" checked>
                                <label class="btn btn-outline-primary flex-grow-1 py-3" for="pay_cash">Cash</label>
                                <input type="radio" class="btn-check" name="payment_method" id="pay_mobile" value="mobile_money">
                                <label class="btn btn-outline-primary flex-grow-1 py-3" for="pay_mobile">Mobile</label>
                            </div>
                            
                            <div id="mobileInputGroup" style="display: none;" class="mb-3">
                                <label class="form-label small fw-bold text-muted">Customer M-Pesa Number (Optional)</label>
                                <input type="text" id="customerPhone" class="form-control form-control-lg" placeholder="e.g. 0712345678">
                                <small class="text-muted" style="font-size: 0.75rem;">Improves automatic payment matching.</small>
                            </div>

                            <div id="cashInputGroup">
                                <input type="number" id="cashReceived" class="form-control form-control-lg mb-3" placeholder="Amount received">
                                <div class="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                                    <span class="text-muted">Change:</span>
                                    <h5 class="mb-0 fw-bold text-success" id="changeAmt">0 KSh</h5>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer border-0 pt-0 p-4">
                            <button id="confirmSaleBtn" class="btn btn-primary w-100 py-3 shadow">Confirm Sale</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Verification Modal -->
            <div class="modal fade" id="verificationModal" data-bs-backdrop="static" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content glass-card border-0">
                        <div class="modal-body p-5 text-center">
                            <div class="spinner-border text-primary mb-4" role="status" style="width: 4rem; height: 4rem;"></div>
                            <h4 class="fw-bold mb-2">Waiting for M-Pesa...</h4>
                            <p class="text-muted mb-4">Please ask the customer to complete the payment on their phone.</p>
                            
                            <div class="bg-light p-3 rounded-3 text-start mb-4">
                                <label class="form-label small fw-bold text-muted">Manual Override</label>
                                <div class="mb-2">
                                    <input type="text" id="manualMpesaCode" class="form-control" placeholder="Transaction Code (e.g. QGK...)">
                                </div>
                                <div class="mb-2">
                                    <input type="text" id="manualCustomerPhone" class="form-control" placeholder="Customer Phone (if not provided)">
                                </div>
                                <button class="btn btn-primary w-100" id="verifyManualBtn">Verify Manually</button>
                            </div>

                            <button class="btn btn-outline-danger w-100" data-bs-dismiss="modal" id="cancelVerificationBtn">Cancel Sale</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    async init() {
        document.body.appendChild(document.getElementById('receiptModal'));
        document.body.appendChild(document.getElementById('paymentModal'));
        document.body.appendChild(document.getElementById('verificationModal'));
        const res = await fetch('api/products.php');
        this.products = await res.json();

        try {
            const analyticsRes = await fetch('api/analytics.php');
            const analyticsData = await analyticsRes.json();
            this.topItemsMap = {};
            if (analyticsData.top_items) {
                analyticsData.top_items.forEach((item, index) => {
                    this.topItemsMap[item.id] = analyticsData.top_items.length - index;
                });
            }
        } catch (e) { this.topItemsMap = {}; }

        this.cart = [];
        this.viewMode = 'categories';
        this.currentCategory = null;

        this.bags = this.products.filter(p => ['Small Bag', 'Medium Bag', 'Large Bag'].includes(p.name));
        document.getElementById('bagButtons').innerHTML = this.bags.map(b => `
            <button class="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold" onclick="POS.addToCart(${b.id})">
                <i class="fa fa-shopping-bag me-1 text-muted"></i> ${b.selling_price}
            </button>
        `).join('');

        this.updateCartDisplay();
        this.displayProducts();

        document.getElementById('viewCatsBtn').onclick = () => {
            this.viewMode = 'categories';
            this.currentCategory = null;
            document.getElementById('viewCatsBtn').className = 'btn btn-primary px-3';
            document.getElementById('viewItemsBtn').className = 'btn btn-light px-3';
            document.getElementById('breadcrumbContainer').style.setProperty('display', 'none', 'important');
            this.displayProducts();
        };
        document.getElementById('viewItemsBtn').onclick = () => {
            this.viewMode = 'items';
            this.currentCategory = null;
            document.getElementById('viewItemsBtn').className = 'btn btn-primary px-3';
            document.getElementById('viewCatsBtn').className = 'btn btn-light px-3';
            document.getElementById('breadcrumbContainer').style.setProperty('display', 'none', 'important');
            this.displayProducts();
        };

        document.getElementById('searchProduct').addEventListener('input', (e) => this.displayProducts(e.target.value));
        document.getElementById('checkoutBtn').onclick = () => this.openPayment();
        document.getElementById('confirmSaleBtn').onclick = () => this.confirmSale();
        document.getElementById('verifyManualBtn').onclick = () => this.handleManualVerification();
        
        // Hide cash input when mobile is selected
        document.querySelectorAll('input[name="payment_method"]').forEach(el => {
            el.addEventListener('change', (e) => {
                const isCash = e.target.value === 'cash';
                document.getElementById('cashInputGroup').style.display = isCash ? 'block' : 'none';
                document.getElementById('mobileInputGroup').style.display = isCash ? 'none' : 'block';
            });
        });

        document.getElementById('cashReceived').addEventListener('input', (e) => {
            const received = parseFloat(e.target.value) || 0;
            const change = received - this.cartTotal;
            document.getElementById('changeAmt').textContent = fmtCurrency(Math.max(0, change));
        });
    },
    showCategories() {
        this.currentCategory = null;
        document.getElementById('breadcrumbContainer').style.setProperty('display', 'none', 'important');
        this.displayProducts();
    },
    selectCategory(cat) {
        this.currentCategory = cat;
        document.getElementById('currentCategoryLabel').textContent = cat;
        document.getElementById('breadcrumbContainer').style.setProperty('display', 'flex', 'important');
        this.displayProducts();
    },
    displayProducts(filter = '') {
        const grid = document.getElementById('productGrid');

        // Categories View
        if (this.viewMode === 'categories' && !this.currentCategory && !filter) {
            const cats = [...new Set(this.products.filter(p => !['Small Bag', 'Medium Bag', 'Large Bag'].includes(p.name)).map(p => p.category || 'General'))];
            grid.innerHTML = cats.map(c => `
                <div class="col-6 col-sm-4 col-md-3">
                    <div class="pos-card animate-scale h-100 p-4 text-center d-flex flex-column align-items-center justify-content-center" onclick="POS.selectCategory('${c}')" style="background: var(--p-50);">
                        <i class="fa fa-folder text-primary mb-2" style="font-size: 2rem;"></i>
                        <h6 class="fw-bold mb-0 text-truncate w-100">${c}</h6>
                        <span class="text-muted small">${this.products.filter(p => (p.category || 'General') === c && !['Small Bag', 'Medium Bag', 'Large Bag'].includes(p.name)).length} items</span>
                    </div>
                </div>
            `).join('');
            return;
        }

        let filtered = this.products.filter(p => !['Small Bag', 'Medium Bag', 'Large Bag'].includes(p.name));

        if (this.currentCategory) {
            filtered = filtered.filter(p => (p.category || 'General') === this.currentCategory);
        }

        if (filter) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(filter.toLowerCase()) ||
                (p.category && p.category.toLowerCase().includes(filter.toLowerCase()))
            );
        }

        // Sort algorithmically by frequency (top items first)
        filtered.sort((a, b) => (this.topItemsMap[b.id] || 0) - (this.topItemsMap[a.id] || 0) || a.name.localeCompare(b.name));

        grid.innerHTML = filtered.map(p => `
            <div class="col-6 col-sm-4 col-md-3">
                <div class="pos-card animate-scale h-100" onclick="POS.addToCart(${p.id})">
                    <img src="${p.image_path || 'assets/images/placeholder.png'}">
                    <div class="p-2">
                        <p class="small text-muted mb-0">${p.category || 'General'}</p>
                        <h6 class="fw-bold text-truncate mb-1">${p.name}</h6>
                        <span class="text-primary fw-bold">${fmtCurrency(p.selling_price)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    },
    addToCart(id) {
        const product = this.products.find(p => p.id == id);
        const existing = this.cart.find(i => i.id == id);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        this.updateCartDisplay();
    },
    updateCartDisplay() {
        let subtotalWithoutBags = 0;
        this.cart.forEach(i => {
            if (!['Small Bag', 'Medium Bag', 'Large Bag'].includes(i.name)) {
                subtotalWithoutBags += (i.selling_price * i.quantity);
            }
        });

        // Conditional Bag Pricing logic
        const freeBags = subtotalWithoutBags > 300;

        this.cartTotal = 0;
        this.cart.forEach(i => {
            if (['Small Bag', 'Medium Bag', 'Large Bag'].includes(i.name) && freeBags) {
                i.display_price = 0;
            } else {
                i.display_price = i.selling_price;
            }
            this.cartTotal += (i.display_price * i.quantity);
        });

        document.getElementById('cartSubtotal').textContent = fmtCurrency(subtotalWithoutBags);
        document.getElementById('cartTotal').textContent = fmtCurrency(this.cartTotal);

        const cartDiv = document.getElementById('cartItems');
        if (this.cart.length === 0) {
            cartDiv.innerHTML = '<div class="text-center py-5 text-muted opacity-50">Empty Cart</div>';
            return;
        }

        cartDiv.innerHTML = this.cart.map(i => `
            <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom animate-up">
                <div class="flex-grow-1">
                    <h6 class="fw-bold mb-0 text-truncate" style="max-width: 140px;">${i.name}</h6>
                    <div class="d-flex align-items-center mt-1">
                        <button class="btn btn-xs btn-light rounded-circle" onclick="POS.changeQty(${i.id}, -1)">-</button>
                        <span class="mx-3 small fw-bold">${i.quantity}</span>
                        <button class="btn btn-xs btn-light rounded-circle" onclick="POS.changeQty(${i.id}, 1)">+</button>
                    </div>
                </div>
                <div class="text-end">
                    <div class="fw-bold small ${i.display_price === 0 ? 'text-success' : ''}">${i.display_price === 0 ? 'Free' : fmtCurrency(i.display_price * i.quantity)}</div>
                    <button class="btn btn-link text-danger p-0 mt-1" onclick="POS.removeItem(${i.id})"><i class="fa fa-trash-alt small"></i></button>
                </div>
            </div>
        `).join('');
    },
    changeQty(id, delta) {
        const item = this.cart.find(i => i.id == id);
        if (item) {
            item.quantity = Math.max(1, item.quantity + delta);
            this.updateCartDisplay();
        }
    },
    removeItem(id) {
        this.cart = this.cart.filter(i => i.id != id);
        this.updateCartDisplay();
    },
    clearCart() {
        if (confirm('Clear all items?')) {
            this.cart = [];
            this.updateCartDisplay();
        }
    },
    openPayment() {
        if (this.cart.length === 0) return showToast('Cart is empty', 'error');
        document.getElementById('modalTotal').textContent = fmtCurrency(this.cartTotal);
        bootstrap.Modal.getOrCreateInstance(document.getElementById('paymentModal')).show();
    },
    async confirmSale() {
        const method = document.querySelector('input[name="payment_method"]:checked').value;
        const cashReceived = method === 'cash' ? parseFloat(document.getElementById('cashReceived').value) || 0 : 0;
        
        let customerPhone = null;
        if (method === 'mobile_money') {
            const rawPhone = document.getElementById('customerPhone').value.trim();
            if (rawPhone) {
                // Normalize phone to 254...
                let normalized = rawPhone;
                if (normalized.startsWith('+')) normalized = normalized.substring(1);
                if (normalized.startsWith('0')) normalized = '254' + normalized.substring(1);
                if (normalized.startsWith('7') || normalized.startsWith('1')) normalized = '254' + normalized;
                customerPhone = normalized;
            }
        }

        if (method === 'cash' && cashReceived < this.cartTotal) return showToast('Insufficient cash', 'error');

        const saleData = {
            total_amount: this.cartTotal,
            payment_method: method,
            cash_received: cashReceived,
            change_given: Math.max(0, cashReceived - this.cartTotal),
            customer_phone: customerPhone,
            items: this.cart.map(i => ({
                product_id: i.id,
                unit_price: i.display_price,
                quantity: i.quantity,
                total: i.display_price * i.quantity
            }))
        };

        try {
            const btn = document.getElementById('confirmSaleBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Processing...';
            btn.disabled = true;

            // If offline, DB might just store it. We assume online for real-time M-Pesa.
            const res = await fetch('api/sales.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saleData)
            });

            btn.innerHTML = originalText;
            btn.disabled = false;

            if (res.ok) {
                const data = await res.json();
                bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();

                if (method === 'mobile_money') {
                    // Start Verification Flow
                    this.startPaymentVerification(data.sale_id, saleData);
                } else {
                    this.showReceipt(data.sale_id, saleData);
                    this.cart = [];
                    this.updateCartDisplay();
                    showToast('Sale Success!', 'success');
                }
            }
        } catch (e) { showToast('Network Error', 'error'); }
    },

    startPaymentVerification(saleId, saleData) {
        this.currentPendingSaleId = saleId;
        this.currentPendingSaleData = saleData;
        
        document.getElementById('manualMpesaCode').value = '';
        document.getElementById('manualCustomerPhone').value = saleData.customer_phone || '';
        
        const verificationModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('verificationModal'));
        verificationModal.show();
        
        // Start polling
        let attempts = 0;
        const maxAttempts = 40; // 120 seconds (3s interval)
        
        if (this.verificationInterval) clearInterval(this.verificationInterval);
        
        this.verificationInterval = setInterval(async () => {
            attempts++;
            if (attempts > maxAttempts) {
                clearInterval(this.verificationInterval);
                
                // Cancel sale on timeout
                try {
                    await fetch('api/cancel-sale.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sale_id: saleId })
                    });
                } catch(e) {}

                showToast('Payment verification timed out. Sale cancelled.', 'error');
                verificationModal.hide();
                this.cart = [];
                this.updateCartDisplay();
                return;
            }
            
            try {
                const res = await fetch(`api/check-payment.php?sale_id=${saleId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.payment_status === 'confirmed') {
                        clearInterval(this.verificationInterval);
                        verificationModal.hide();
                        
                        // Update sale data with manual ID if any
                        if (data.mpesa_transaction_id) {
                            this.currentPendingSaleData.mpesa_transaction_id = data.mpesa_transaction_id;
                        }
                        
                        this.showReceipt(saleId, this.currentPendingSaleData);
                        this.cart = [];
                        this.updateCartDisplay();
                        showToast('M-Pesa Payment Confirmed!', 'success');
                    }
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 3000);
        
        // Handle cancel button click
        document.getElementById('cancelVerificationBtn').onclick = async () => {
            clearInterval(this.verificationInterval);
            try {
                await fetch('api/cancel-sale.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sale_id: saleId })
                });
            } catch(e) {}
            
            this.cart = [];
            this.updateCartDisplay();
            showToast('Sale cancelled.', 'info');
        };
    },

    async handleManualVerification() {
        const code = document.getElementById('manualMpesaCode').value.trim();
        const rawPhone = document.getElementById('manualCustomerPhone').value.trim();
        if (!code) return showToast('Please enter the transaction code', 'error');
        if (!this.currentPendingSaleId) return;

        let phone = null;
        if (rawPhone) {
            phone = rawPhone;
            if (phone.startsWith('+')) phone = phone.substring(1);
            if (phone.startsWith('0')) phone = '254' + phone.substring(1);
            if (phone.startsWith('7') || phone.startsWith('1')) phone = '254' + phone;
        }

        const btn = document.getElementById('verifyManualBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '...';
        btn.disabled = true;

        try {
            const res = await fetch('api/verify-manual.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sale_id: this.currentPendingSaleId,
                    mpesa_transaction_id: code,
                    customer_phone: phone
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    clearInterval(this.verificationInterval);
                    bootstrap.Modal.getInstance(document.getElementById('verificationModal')).hide();

                    this.currentPendingSaleData.mpesa_transaction_id = code;
                    this.currentPendingSaleData.customer_phone = phone || this.currentPendingSaleData.customer_phone;
                    
                    this.showReceipt(this.currentPendingSaleId, this.currentPendingSaleData);
                    this.cart = [];
                    this.updateCartDisplay();
                    showToast('Payment verified manually!', 'success');
                } else {
                    showToast(data.error || 'Verification failed', 'error');
                }
            }
        } catch (e) {
            showToast('Network error during verification', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    },

    showReceipt(id, sale) {
        const content = document.getElementById('receiptContent');
        content.innerHTML = `
            <div class="receipt-paper">
                <h4 class="fw-bold mb-1 text-uppercase">Shosho Shop</h4>
                <p class="small mb-2">P.O BOX 123, Nairobi<br>Tel: +254 700 000 000</p>
                <div class="border-top border-bottom py-2 my-2 small">
                    Receipt #: ${id}<br>
                    Date: ${new Date().toLocaleString()}<br>
                    Cashier: ${App.user.display_name}
                </div>
                <div class="text-start">
                    ${this.cart.map(i => `
                        <div class="d-flex justify-content-between small mb-1">
                            <span>${i.name} x${i.quantity}</span>
                            <span>${i.display_price === 0 ? 'Free' : fmtCurrency(i.display_price * i.quantity)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="border-top pt-2 mt-2">
                    <div class="d-flex justify-content-between fw-bold">
                        <span>TOTAL</span>
                        <span>${fmtCurrency(sale.total_amount)}</span>
                    </div>
                    <div class="d-flex justify-content-between small">
                        <span>Paid (${sale.payment_method})</span>
                        <span>${fmtCurrency(sale.cash_received || sale.total_amount)}</span>
                    </div>
                    <div class="d-flex justify-content-between small">
                        <span>Change</span>
                        <span>${fmtCurrency(sale.change_given)}</span>
                    </div>
                </div>
                <div class="mt-4 small italic">
                    ~ Thank you for shopping with us! ~<br>
                    Built with ❤️ by Shosho
                </div>
            </div>
        `;
        bootstrap.Modal.getOrCreateInstance(document.getElementById('receiptModal')).show();
    }
};