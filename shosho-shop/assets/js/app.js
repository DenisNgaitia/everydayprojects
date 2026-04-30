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
        const res = await fetch('api/auth.php?action=me');
        const data = await res.json();
        if (data.id) {
            this.user = data;
        }
    },
    showLogin() {
        document.getElementById('app').innerHTML = Auth.render();
        Auth.init();
    },
    loadMainLayout() {
        document.getElementById('app').innerHTML = `
            <div id="main-content" class="container-fluid pb-5"></div>
            <nav class="nav-bottom navbar navbar-expand navbar-light bg-light">
                <ul class="navbar-nav d-flex flex-row justify-content-around w-100">
                    <li class="nav-item"><a class="nav-link active" href="#" data-page="pos"><i class="fa fa-cash-register"></i> Sell</a></li>
                    <li class="nav-item"><a class="nav-link" href="#" data-page="inventory"><i class="fa fa-boxes"></i> Stock</a></li>
                    <li class="nav-item"><a class="nav-link" href="#" data-page="wholesale"><i class="fa fa-truck"></i> Wholesale</a></li>
                    <li class="nav-item"><a class="nav-link" href="#" data-page="analytics"><i class="fa fa-chart-bar"></i> Reports</a></li>
                    <li class="nav-item"><a class="nav-link" href="#" onclick="App.logout()"><i class="fa fa-sign-out-alt"></i></a></li>
                </ul>
            </nav>
        `;
        this.bindNav();
        this.navigate('pos');
    },
    bindNav() {
        document.querySelectorAll('.nav-link[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.closest('a').dataset.page;
                this.setActiveNav(page);
                this.navigate(page);
            });
        });
    },
    setActiveNav(page) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelector(`.nav-link[data-page="${page}"]`)?.classList.add('active');
    },
    navigate(page) {
        const container = document.getElementById('main-content');
        switch (page) {
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
            case 'analytics':
                container.innerHTML = Analytics.render();
                Analytics.init();
                break;
        }
    },
    logout() {
        fetch('api/auth.php?action=logout').then(() => {
            this.user = null;
            location.reload();
        });
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());