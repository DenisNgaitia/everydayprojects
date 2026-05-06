const App = {
    user: null,
    init() {
        this.checkAuth().then(() => {
            if (this.user) {
                this.loadMainLayout();
            } else {
                document.getElementById('app').innerHTML = Auth.render();
                Auth.init();
            }
        });
    },
    async checkAuth() {
        try {
            const res = await fetch('api/auth.php?action=me');
            const data = await res.json();
            if (data.id) {
                this.user = data;
            }
        } catch (e) { console.error("Auth check failed", e); }
    },
    loadMainLayout() {
        document.getElementById('app').innerHTML = `
            <div class="app-shell pb-5 mb-5">
                <main id="main-content" class="container-fluid pt-4 animate-fade"></main>
                
                <nav class="app-nav">
                    <a class="nav-item active" href="#" data-page="dashboard"><i class="fa fa-th-large"></i><span>Home</span></a>
                    <a class="nav-item" href="#" data-page="pos"><i class="fa fa-cash-register"></i><span>Sell</span></a>
                    <a class="nav-item" href="#" data-page="inventory"><i class="fa fa-boxes"></i><span>Stock</span></a>
                    <a class="nav-item" href="#" data-page="analytics"><i class="fa fa-chart-bar"></i><span>Stats</span></a>
                    <a class="nav-item" href="#" data-page="b2b"><i class="fa fa-handshake"></i><span>B2B</span></a>
                    <a class="nav-item text-danger" href="#" onclick="App.logout()"><i class="fa fa-power-off"></i><span>Exit</span></a>
                </nav>
            </div>
        `;
        this.bindNav();
        this.navigate('dashboard');
    },
    bindNav() {
        document.querySelectorAll('.nav-item[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.closest('a').dataset.page;
                this.setActiveNav(page);
                this.navigate(page);
            });
        });
    },
    setActiveNav(page) {
        document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
        document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');
    },
    navigate(page) {
        // Clean up any modals moved to body and their backdrops
        document.querySelectorAll('body > .modal').forEach(el => el.remove());
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style = '';

        const container = document.getElementById('main-content');
        container.classList.remove('animate-fade');
        void container.offsetWidth; // trigger reflow
        container.classList.add('animate-fade');

        switch (page) {
            case 'dashboard':
                container.innerHTML = Dashboard.render();
                Dashboard.init();
                break;
            case 'pos':
                container.innerHTML = POS.render();
                POS.init();
                break;
            case 'inventory':
                container.innerHTML = Inventory.render();
                Inventory.init();
                break;
            case 'wholesale':
                container.innerHTML = Wholesale.render();
                Wholesale.init();
                break;
            case 'expenses':
                container.innerHTML = Expenses.render();
                Expenses.init();
                break;
            case 'analytics':
                container.innerHTML = Analytics.render();
                Analytics.init();
                break;
            case 'b2b':
                container.innerHTML = B2B.render();
                B2B.init();
                break;
        }
    },
    logout() {
        if(confirm('Are you sure you want to logout?')) {
            fetch('api/auth.php?action=logout').then(() => {
                this.user = null;
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = 'login.php';
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());