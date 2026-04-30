const Inventory = {
    products: [],
    categories: [],
    render() {
        return `
            <div class="container-fluid pb-5">
                <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 animate-up">
                    <div>
                        <h2 class="fw-bold mb-1">Inventory Management</h2>
                        <p class="text-muted mb-0">Total Stock Value: <span id="totalStockValue" class="fw-bold text-primary">0 TZS</span></p>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-primary" id="manageCatsBtn">
                            <i class="fa fa-tags me-2"></i> Categories
                        </button>
                        <button class="btn btn-primary shadow" id="addProductBtn">
                            <i class="fa fa-plus me-2"></i> Add Product
                        </button>
                    </div>
                </div>

                <div class="glass-card animate-up" style="animation-delay: 0.1s">
                    <div class="p-3 border-bottom d-flex justify-content-between align-items-center">
                        <div class="input-group" style="max-width: 300px;">
                            <span class="input-group-text bg-transparent border-0"><i class="fa fa-search small"></i></span>
                            <input type="text" id="inventorySearch" class="form-control border-0 bg-transparent" placeholder="Filter stock...">
                        </div>
                        <div class="small text-muted">Showing <span id="productCount">0</span> items</div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0" id="productTable">
                            <thead>
                                <tr>
                                    <th class="ps-4">Product Details</th>
                                    <th>Category</th>
                                    <th>Pricing</th>
                                    <th>Quantity</th>
                                    <th>Status</th>
                                    <th class="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Injected -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Add/Edit Modal -->
            <div class="modal fade" id="productModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content glass-card border-0" id="productFormContainer"></div>
                </div>
            </div>
            
            <!-- Category Modal -->
            <div class="modal fade" id="catModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content glass-card border-0 p-4">
                        <h5 class="fw-bold mb-4">Manage Categories</h5>
                        <div class="input-group mb-3">
                            <input type="text" id="newCatName" class="form-control" placeholder="New Category Name">
                            <button class="btn btn-primary" onclick="Inventory.addCategory()">Add</button>
                        </div>
                        <div id="catList" class="d-flex flex-wrap gap-2"></div>
                    </div>
                </div>
            </div>
        `;
    },
    async init() {
        await this.loadData();
        document.getElementById('addProductBtn').onclick = () => this.editProduct(null);
        document.getElementById('manageCatsBtn').onclick = () => {
            this.renderCatList();
            new bootstrap.Modal(document.getElementById('catModal')).show();
        };
        document.getElementById('inventorySearch').oninput = (e) => this.renderTable(e.target.value);
    },
    async loadData() {
        const [prodRes, catRes] = await Promise.all([
            fetch('api/products.php'),
            fetch('api/categories.php')
        ]);
        this.products = await prodRes.json();
        this.categories = await catRes.json();
        this.renderTable();
        this.calculateValue();
    },
    calculateValue() {
        const total = this.products.reduce((sum, p) => sum + (p.cost_price * p.quantity), 0);
        document.getElementById('totalStockValue').textContent = fmtCurrency(total);
        document.getElementById('productCount').textContent = this.products.length;
    },
    renderTable(filter = '') {
        const tbody = document.querySelector('#productTable tbody');
        const filtered = this.products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
        
        tbody.innerHTML = filtered.map(p => {
            const isLow = parseInt(p.quantity) <= parseInt(p.min_threshold);
            return `
                <tr>
                    <td class="ps-4">
                        <div class="d-flex align-items-center">
                            <div class="bg-light rounded-3 me-3" style="width: 40px; height: 40px; overflow: hidden;">
                                <img src="${p.image_path || 'assets/images/placeholder.png'}" style="width:100%; height:100%; object-fit:cover;">
                            </div>
                            <div>
                                <h6 class="mb-0 fw-bold small">${p.name}</h6>
                                <span class="text-muted small">SKU: ${p.serial_code || '---'}</span>
                            </div>
                        </div>
                    </td>
                    <td><span class="badge bg-light text-secondary border-0">${p.category || 'General'}</span></td>
                    <td>
                        <div class="small fw-bold text-primary">${fmtCurrency(p.selling_price)}</div>
                        <div class="text-muted small" style="font-size: 0.7rem;">Cost: ${fmtCurrency(p.cost_price)}</div>
                    </td>
                    <td>
                        <div class="fw-bold small">${p.quantity}</div>
                        <div class="progress mt-1" style="height: 3px; width: 50px;">
                            <div class="progress-bar ${isLow ? 'bg-danger' : 'bg-success'}" style="width: ${Math.min(100, (p.quantity/(p.min_threshold||1))*50)}%"></div>
                        </div>
                    </td>
                    <td>
                        <span class="badge ${isLow ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'} rounded-pill px-2 py-1 small" style="font-size: 0.65rem;">
                            ${isLow ? 'Low Stock' : 'Active'}
                        </span>
                    </td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm btn-outline-secondary border-0" onclick="Inventory.editProduct(${JSON.stringify(p).replace(/"/g, '&quot;')})"><i class="fa fa-edit"></i></button>
                        <button class="btn btn-sm btn-outline-danger border-0" onclick="Inventory.deleteProduct(${p.id})"><i class="fa fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    },
    editProduct(product = null) {
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        const formHTML = `
            <div class="modal-header border-0 p-4 pb-0">
                <h5 class="fw-bold mb-0">${product ? 'Update Item' : 'New Inventory Item'}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4 pt-4">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label small fw-bold text-muted text-uppercase">Item Name</label>
                        <input id="prodName" class="form-control" value="${product?.name || ''}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-bold text-muted text-uppercase">Category</label>
                        <select id="prodCategory" class="form-select">
                            <option value="">General</option>
                            ${this.categories.map(c => `<option value="${c.name}" ${product?.category === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-bold text-muted text-uppercase">Cost Price</label>
                        <input id="prodCost" class="form-control" type="number" value="${product?.cost_price || ''}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-bold text-muted text-uppercase">Selling Price</label>
                        <input id="prodPrice" class="form-control" type="number" value="${product?.selling_price || ''}">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label small fw-bold text-muted text-uppercase">Initial Qty</label>
                        <input id="prodQty" class="form-control" type="number" value="${product?.quantity || '0'}">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label small fw-bold text-muted text-uppercase">Low Stock Alert</label>
                        <input id="prodThreshold" class="form-control" type="number" value="${product?.min_threshold || '10'}">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label small fw-bold text-muted text-uppercase">Serial/SKU</label>
                        <input id="prodSerial" class="form-control" value="${product?.serial_code || ''}">
                    </div>
                    <div class="col-12 mt-4">
                        <button id="saveProdBtn" class="btn btn-primary w-100 py-3 rounded-3 shadow">
                            ${product ? 'Update Inventory Item' : 'Add to Inventory'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('productFormContainer').innerHTML = formHTML;
        modal.show();
        
        document.getElementById('saveProdBtn').onclick = async () => {
            const data = {
                name: document.getElementById('prodName').value,
                category: document.getElementById('prodCategory').value,
                cost_price: document.getElementById('prodCost').value,
                selling_price: document.getElementById('prodPrice').value,
                quantity: document.getElementById('prodQty').value,
                min_threshold: document.getElementById('prodThreshold').value,
                serial_code: document.getElementById('prodSerial').value
            };
            
            const method = product ? 'PUT' : 'POST';
            const url = product ? `api/products.php?id=${product.id}` : 'api/products.php';
            
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (res.ok) {
                modal.hide();
                showToast('Success!', 'success');
                this.loadData();
            }
        };
    },
    renderCatList() {
        const div = document.getElementById('catList');
        div.innerHTML = this.categories.map(c => `
            <span class="badge bg-light text-primary border p-2">
                ${c.name} 
                <i class="fa fa-times text-danger ms-2 cursor-pointer" onclick="Inventory.deleteCat(${c.id})"></i>
            </span>
        `).join('');
    },
    async addCategory() {
        const name = document.getElementById('newCatName').value;
        if(!name) return;
        const res = await fetch('api/categories.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        if(res.ok) {
            document.getElementById('newCatName').value = '';
            this.loadData().then(() => this.renderCatList());
        }
    }
};