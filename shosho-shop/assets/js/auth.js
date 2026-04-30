const Auth = {
    render() {
        return `
            <div class="container mt-5" style="max-width:400px">
                <h2>Shosho Shop Login</h2>
                <div id="loginForm">
                    <input type="email" id="email" class="form-control mb-2" placeholder="Email">
                    <input type="password" id="password" class="form-control mb-2" placeholder="Password">
                    <button id="loginBtn" class="btn btn-primary w-100">Login</button>
                    <p class="mt-2">No account? <a href="#" id="showRegister">Register</a></p>
                </div>
                <div id="registerForm" style="display:none">
                    <input type="email" id="regEmail" class="form-control mb-2" placeholder="Email">
                    <input type="password" id="regPassword" class="form-control mb-2" placeholder="Password">
                    <input type="text" id="regName" class="form-control mb-2" placeholder="Full Name">
                    <button id="registerBtn" class="btn btn-success w-100">Register</button>
                    <p class="mt-2"><a href="#" id="showLogin">Back to Login</a></p>
                </div>
            </div>
        `;
    },
    init() {
        document.getElementById('loginBtn').onclick = () => this.login();
        document.getElementById('registerBtn').onclick = () => this.register();
        document.getElementById('showRegister').onclick = (e) => {
            e.preventDefault(); document.getElementById('loginForm').style.display = 'none'; document.getElementById('registerForm').style.display = 'block';
        };
        document.getElementById('showLogin').onclick = (e) => {
            e.preventDefault(); document.getElementById('loginForm').style.display = 'block'; document.getElementById('registerForm').style.display = 'none';
        };
    },
    async login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const res = await fetch('api/auth.php?action=login', {
            method: 'POST', body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
            App.user = data.user;
            App.loadMainLayout();
        } else {
            alert(data.error || 'Login failed');
        }
    },
    async register() {
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const name = document.getElementById('regName').value;
        const res = await fetch('api/auth.php?action=register', {
            method: 'POST', body: JSON.stringify({ email, password, name })
        });
        const data = await res.json();
        if (data.success) {
            alert('Registration successful. Please login.');
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('registerForm').style.display = 'none';
        } else {
            alert('Registration failed');
        }
    }
};