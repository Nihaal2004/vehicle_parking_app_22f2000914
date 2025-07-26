import { getAuthHeader } from '../../utils/auth.js';

export const Login = {
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
                    localStorage.setItem('authToken', data.token);
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