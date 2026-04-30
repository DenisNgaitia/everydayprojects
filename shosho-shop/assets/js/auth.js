const Auth = {
    render() {
        return `
            <div class="container d-flex align-items-center justify-content-center" style="min-height: 100vh;">
                <div class="glass-card p-5 shadow-lg w-100" style="max-width: 450px; border-radius: 32px;">
                    <div class="text-center mb-5">
                        <div class="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow" style="width: 72px; height: 72px;">
                            <i class="fa fa-shopping-bag fa-2x"></i>
                        </div>
                        <h2 class="fw-extrabold mb-1">Shosho Shop</h2>
                        <p class="text-muted">Premium POS & Inventory</p>
                    </div>

                    <div id="loginForm" class="fade-in-up">
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-muted text-uppercase">Email Address</label>
                            <input type="email" id="email" class="form-control form-control-lg border-0 bg-light" placeholder="admin@shosho.com">
                        </div>
                        <div class="mb-4">
                            <label class="form-label small fw-bold text-muted text-uppercase">Password</label>
                            <input type="password" id="password" class="form-control form-control-lg border-0 bg-light" placeholder="••••••••">
                        </div>
                        <button id="loginBtn" class="btn btn-primary w-100 py-3 shadow mb-4">
                            Log In to System
                        </button>
                        <div class="text-center">
                            <span class="text-muted small">New employee?</span>
                            <a href="#" id="showRegister" class="small fw-bold text-decoration-none ms-1">Request Account</a>
                        </div>
                    </div>

                    <div id="registerForm" style="display:none" class="fade-in-up">
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-muted text-uppercase">Full Name</label>
                            <input type="text" id="regName" class="form-control border-0 bg-light" placeholder="Jane Doe">
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-muted text-uppercase">Email Address</label>
                            <input type="email" id="regEmail" class="form-control border-0 bg-light" placeholder="jane@shosho.com">
                        </div>
                        <div class="mb-4">
                            <label class="form-label small fw-bold text-muted text-uppercase">Password</label>
                            <input type="password" id="regPassword" class="form-control border-0 bg-light" placeholder="Create password">
                        </div>
                        <button id="registerBtn" class="btn btn-primary w-100 py-3 shadow mb-4">
                            Create Account
                        </button>
                        <div class="text-center">
                            <a href="#" id="showLogin" class="small fw-bold text-decoration-none">Back to Login</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    init() {
        document.getElementById('loginBtn').onclick = () => this.login();
        document.getElementById('registerBtn').onclick = () => this.register();
        document.getElementById('showRegister').onclick = (e) => {
            e.preventDefault(); 
            document.getElementById('loginForm').style.display = 'none'; 
            document.getElementById('registerForm').style.display = 'block';
        };
        document.getElementById('showLogin').onclick = (e) => {
            e.preventDefault(); 
            document.getElementById('loginForm').style.display = 'block'; 
            document.getElementById('registerForm').style.display = 'none';
        };
    },
    async login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        if (!email || !password) return showToast('Please enter credentials', 'error');

        try {
            const res = await fetch('api/auth.php?action=login', {
                method: 'POST', body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.success) {
                App.user = data.user;
                App.loadMainLayout();
                showToast(`Welcome back, ${data.user.display_name}`, 'success');
            } else {
                showToast(data.error || 'Invalid credentials', 'error');
            }
        } catch (e) {
            showToast('Connection error', 'error');
        }
    },
    async register() {
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const name = document.getElementById('regName').value;
        if (!email || !password || !name) return showToast('Please fill all fields', 'error');

        try {
            const res = await fetch('api/auth.php?action=register', {
                method: 'POST', body: JSON.stringify({ email, password, name })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Account created! You can now login.', 'success');
                document.getElementById('showLogin').click();
            } else {
                showToast(data.error || 'Registration failed', 'error');
            }
        } catch (e) {
            showToast('Connection error', 'error');
        }
    }
};