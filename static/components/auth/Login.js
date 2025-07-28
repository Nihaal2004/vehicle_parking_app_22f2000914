import { getAuthHeader } from '../../utils/auth.js';

export const Login = {
    template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-6 col-lg-5">
                    <div class="card border-0 shadow-lg rounded-4">
                        <div class="card-body p-5">
                            <div class="text-center mb-4">
                                <div class="bg-primary bg-gradient rounded-circle p-4 mx-auto mb-3" style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
                                    <i class="bi bi-car-front text-white fs-1"></i>
                                </div>
                                <h2 class="fw-bold text-dark mb-2">Welcome Back</h2>
                                <p class="text-muted">Sign in to your parking account</p>
                            </div>
                            
                            <div v-if="error" class="alert alert-danger border-0 rounded-3 mb-4">
                                <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
                            </div>
                            
                            <div v-if="success" class="alert alert-success border-0 rounded-3 mb-4">
                                <i class="bi bi-check-circle me-2"></i>{{ success }}
                            </div>
                            
                            <form @submit.prevent="login" class="mb-4">
                                <div class="mb-4">
                                    <label class="form-label fw-semibold text-dark mb-2">
                                        <i class="bi bi-envelope me-2 text-primary"></i>Email Address
                                    </label>
                                    <input type="email" v-model="loginForm.email" 
                                        class="form-control form-control-lg border-2 rounded-3" 
                                        placeholder="Enter your email" required>
                                </div>
                                
                                <div class="mb-4">
                                    <label class="form-label fw-semibold text-dark mb-2">
                                        <i class="bi bi-lock me-2 text-warning"></i>Password
                                    </label>
                                    <input type="password" v-model="loginForm.password" 
                                        class="form-control form-control-lg border-2 rounded-3" 
                                        placeholder="Enter your password" required>
                                </div>
                                
                                <button type="submit" class="btn btn-primary bg-gradient btn-lg w-100 rounded-pill">
                                    <i class="bi bi-box-arrow-in-right me-2"></i>Sign In
                                </button>
                            </form>
                            
                            <div class="text-center">
                                <p class="text-muted mb-0">Don't have an account?</p>
                                <router-link to="/register" class="btn btn-link text-decoration-none fw-semibold">
                                    <i class="bi bi-person-plus me-2"></i>Register here
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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