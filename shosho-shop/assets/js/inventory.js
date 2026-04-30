const Inventory = {
    products: [],
    render() {
        return `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5>Inventory</h5>
                <button class="btn btn-primary" id="addProductBtn">+ Add Product</button>
            </div>
            <table class="table table-sm" id="productTable">
                <thead><tr><th>Name</th><th>Qty</th><th>Price</th><th>Stock</th><th></th></tr></thead>
                <tbody></tbody>
            </table>
            <!-- Add/Edit Modal -->
            <div class="modal fade" id="productModal" tabindex="-1">
                <div class="modal-dialog"><div class="modal-content" id="productFormContainer"></div></div>
            </div>
        `;
    },
    async init() {
        const res = await fetch('api/products.php');
        this.products = await res.json();
        this.renderTable();
        document.getElementById('addProductBtn').onclick = () => this.editProduct(null);
        document.getElementById('productTable').addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const id = btn.dataset.id;
            if (btn.classList.contains('edit-btn')) {
                const product = this.products.find(p => p.id == id);
                this.editProduct(product);
            } else if (btn.classList.contains('delete-btn')) {
                if (confirm('Delete this product?')) this.deleteProduct(id);
            }
        });
    },
    renderTable() {
        const tbody = document.querySelector('#productTable tbody');
        tbody.innerHTML = this.products.map(p => `
            <tr>
                <td>${p.name}</td>
                <td>${p.quantity}</td>
                <td>${p.selling_price}</td>
                <td class="${p.quantity <= p.min_threshold ? 'text-danger' : ''}">${p.quantity <= p.min_threshold ? 'LOW' : 'OK'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary edit-btn" data-id="${p.id}"><i class="fa fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${p.id}"><i class="fa fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },
    editProduct(product = null) {
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        const formHTML = `
            <div class="modal-header"><h5>${product ? 'Edit' : 'Add'} Product</h5></div>
            <div class="modal-body">
                <input id="prodName" class="form-control mb-2" placeholder="Name" value="${product?.name || ''}">
                <input id="prodCategory" class="form-control mb-2" placeholder="Category" value="${product?.category || ''}">
                <input id="prodCost" class="form-control mb-2" type="number" step="0.01" placeholder="Cost Price" value="${product?.cost_price || ''}">
                <input id="prodPrice" class="form-control mb-2" type="number" step="0.01" placeholder="Selling Price" value="${product?.selling_price || ''}">
                <input id="prodQty" class="form-control mb-2" type="number" placeholder="Quantity" value="${product?.quantity || ''}">
                <input id="prodThreshold" class="form-control mb-2" type="number" placeholder="Min Threshold" value="${product?.min_threshold || '10'}">
                <input id="prodSupplier" class="form-control mb-2" placeholder="Supplier" value="${product?.supplier || ''}">
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button id="saveProductBtn" class="btn btn-primary">Save</button>
            </div>
        `;
        document.getElementById('productFormContainer').innerHTML = formHTML;
        modal.show();
        document.getElementById('saveProductBtn').onclick = async () => {
            const data = {
                name: document.getElementById('prodName').value,
                category: document.getElementById('prodCategory').value,
                cost_price: document.getElementById('prodCost').value,
                selling_price: document.getElementById('prodPrice').value,
                quantity: document.getElementById('prodQty').value,
                min_threshold: document.getElementById('prodThreshold').value,
                supplier: document.getElementById('prodSupplier').value
            };
            if (product) {
                await fetch(`api/products.php?id=${product.id}`, { method: 'PUT', body: JSON.stringify(data) });
            } else {
                await fetch('api/products.php', { method: 'POST', body: JSON.stringify(data) });
            }
            modal.hide();
            this.init();
        };
    },
    async deleteProduct(id) {
        await fetch(`api/products.php?id=${id}`, { method: 'DELETE' });
        this.init();
    }
};