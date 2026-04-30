const Wholesale = {
    products: [],
    cart: [],
    render() {
        return `
            <h5>Wholesale (Mololine)</h5>
            <div class="mb-2"><input id="buyerName" class="form-control" placeholder="Buyer Name"></div>
            <div class="row">
                <div class="col-12 col-md-8" id="wholesaleProductGrid"></div>
                <div class="col-12 col-md-4 border-start p-2">
                    <h6>Cart</h6>
                    <div id="wholesaleCartItems"></div>
                    <hr>
                    <strong>Total: <span id="wholesaleTotal">0</span> TZS</strong>
                    <div class="mt-2">
                        <input id="amountPaid" class="form-control mb-1" placeholder="Amount Paid" type="number" step="0.01">
                        <select id="paymentStatus" class="form-select mb-2">
                            <option value="paid">Paid</option>
                            <option value="partial">Partial</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                    <button id="confirmWholesaleBtn" class="btn btn-success w-100">Complete Sale</button>
                </div>
            </div>
        `;
    },
    async init() {
        const res = await fetch('api/products.php');
        this.products = await res.json();
        this.cart = [];
        this.displayProducts();
        document.getElementById('confirmWholesaleBtn').onclick = () => this.confirmSale();
    },
    displayProducts() {
        const grid = document.getElementById('wholesaleProductGrid');
        grid.innerHTML = `<div class="row g-2">` + this.products.map(p => `
            <div class="col-4 col-md-3 mb-2">
                <div class="card wholesale-product" data-id="${p.id}" style="cursor:pointer;">
                    <img src="${p.image_path || 'assets/images/placeholder.png'}" class="card-img-top">
                    <div class="card-body p-1 text-center"><small>${p.name}</small><br><small>${p.selling_price}</small></div>
                </div>
            </div>
        `).join('') + `</div>`;
        document.querySelectorAll('.wholesale-product').forEach(card => {
            card.onclick = () => {
                const id = card.dataset.id;
                const prod = this.products.find(p => p.id == id);
                this.addToCart(prod);
            };
        });
    },
    addToCart(prod) {
        const existing = this.cart.find(i => i.id === prod.id);
        if (existing) existing.quantity++; else this.cart.push({ ...prod, quantity: 1 });
        this.updateCart();
    },
    updateCart() {
        const total = this.cart.reduce((s, i) => s + i.selling_price * i.quantity, 0);
        document.getElementById('wholesaleTotal').textContent = fmtCurrency(total);
        document.getElementById('wholesaleCartItems').innerHTML = this.cart.map(i => `
            <div class="d-flex justify-content-between">${i.name} x${i.quantity} ${fmtCurrency(i.selling_price * i.quantity)} <i class="fa fa-times text-danger remove-wholesale-item" data-id="${i.id}"></i></div>
        `).join('');
        document.querySelectorAll('.remove-wholesale-item').forEach(btn => btn.onclick = () => {
            this.cart = this.cart.filter(i => i.id != btn.dataset.id); this.updateCart();
        });
    },
    async confirmSale() {
        const buyer = document.getElementById('buyerName').value;
        if (!buyer) return alert('Enter buyer name');
        const amountPaid = parseFloat(document.getElementById('amountPaid').value) || 0;
        const paymentStatus = document.getElementById('paymentStatus').value;
        const totalAmount = this.cart.reduce((s, i) => s + i.selling_price * i.quantity, 0);
        const saleData = {
            buyer_name: buyer,
            total_amount: totalAmount,
            amount_paid: amountPaid,
            payment_status: paymentStatus,
            items: this.cart.map(i => ({ product_id: i.id, unit_price: i.selling_price, quantity: i.quantity, total: i.selling_price * i.quantity }))
        };
        const res = await fetch('api/wholesale.php', { method: 'POST', body: JSON.stringify(saleData) });
        if (res.ok) {
            this.cart = []; this.updateCart(); this.init(); showToast('Wholesale sale recorded');
        } else {
            alert('Error');
        }
    }
};