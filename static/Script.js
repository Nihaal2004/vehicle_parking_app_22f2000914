// Component definitions
const Login = {
    template: `
        <div class="col-md-6 mx-auto">
            <h2 class="mb-4">Login</h2>
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            <div v-if="success" class="alert alert-success">{{ success }}</div>
            <form @submit.prevent="login" class="mb-3">
                <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input type="email" v-model="loginForm.email" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input type="password" v-model="loginForm.password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary">Login</button>
            </form>
            <p>Not registered? <router-link to="/register">Register here</router-link></p>
        </div>
    `,
    data() {
        return {
            loginForm: { email: '', password: '' },
            error: '',
            success: ''
        }
    },
    methods: {
        login() {
            this.error = '';
            fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.loginForm)
            })
            .then(res => res.json().then(data => ({ status: res.status, data })))
            .then(({status, data}) => {
                if (status === 200) {
                    if (data.user.roles.includes('admin')) {
                        this.$router.push('/admin');
                    } else {
                        this.$router.push('/dashboard');
                    }
                } else {
                    this.error = data.error || 'Login failed';
                }
            })
            .catch(() => { this.error = 'Login failed'; });
        }
    }
};

const Register = {
    template: `
        <div class="col-md-6 mx-auto">
            <h2 class="mb-4">User Registration</h2>
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            <form @submit.prevent="register">
                <div class="mb-3">
                    <label class="form-label">Username</label>
                    <input type="text" v-model="registerForm.username" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input type="email" v-model="registerForm.email" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input type="password" v-model="registerForm.password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary">Register</button>
                <router-link to="/login" class="btn btn-link">Back to Login</router-link>
            </form>
        </div>
    `,
    data() {
        return {
            registerForm: { username: '', email: '', password: '' },
            error: ''
        }
    },
    methods: {
        register() {
            this.error = '';
            fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.registerForm)
            })
            .then(res => res.json().then(data => ({ status: res.status, data })))
            .then(({status, data}) => {
                if (status === 201) {
                    this.$router.push('/login');
                } else {
                    this.error = data.error || 'Registration failed';
                }
            })
            .catch(() => { this.error = 'Registration failed'; });
        }
    }
};

const AdminDashboard = {
    template: `
        <div class="col-md-12">
            <h2>Admin Dashboard</h2>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3>Welcome, Admin!</h3>
                <button @click="logout" class="btn btn-danger">Logout</button>
            </div>
            <!-- Add admin-specific content here -->
        </div>
    `,
    methods: {
        logout() {
            this.handleLogout();
        },
        handleLogout() {
            fetch('/api/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
            .then(() => {
                this.$router.push('/login');
            });
        }
    }
};

const UserDashboard = {
    template: `
        <div class="col-md-12">
            <h2>User Dashboard</h2>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3>Welcome!</h3>
                <button @click="logout" class="btn btn-danger">Logout</button>
            </div>
            <!-- Add user-specific content here -->
        </div>
    `,
    methods: {
        logout() {
            this.handleLogout();
        },
        handleLogout() {
            fetch('/api/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
            .then(() => {
                this.$router.push('/login');
            });
        }
    }
};

// Router configuration
const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/admin', component: AdminDashboard },
    { path: '/dashboard', component: UserDashboard }
];

const router = new VueRouter({
    routes
});

// Create Vue instance
new Vue({
    router
}).$mount('#app');