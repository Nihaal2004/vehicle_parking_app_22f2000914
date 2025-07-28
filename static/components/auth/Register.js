export const Register = {
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
                                    <i class="bi bi-person-plus text-white fs-1"></i>
                                </div>
                                <h2 class="fw-bold text-dark mb-2">Create Account</h2>
                                <p class="text-muted">Join our parking management system</p>
                            </div>
                            
                            <div v-if="error" class="alert alert-danger border-0 rounded-3 mb-4">
                                <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
                            </div>
                            
                            <form @submit.prevent="register">
                                <div class="mb-4">
                                    <label class="form-label fw-semibold text-dark mb-2">
                                        <i class="bi bi-person me-2 text-primary"></i>Username
                                    </label>
                                    <input type="text" v-model="registerForm.username" 
                                        class="form-control form-control-lg border-2 rounded-3" 
                                        placeholder="Choose a username" required>
                                </div>
                                
                                <div class="mb-4">
                                    <label class="form-label fw-semibold text-dark mb-2">
                                        <i class="bi bi-envelope me-2 text-success"></i>Email Address
                                    </label>
                                    <input type="email" v-model="registerForm.email" 
                                        class="form-control form-control-lg border-2 rounded-3" 
                                        placeholder="Enter your email" required>
                                </div>
                                
                                <div class="mb-4">
                                    <label class="form-label fw-semibold text-dark mb-2">
                                        <i class="bi bi-lock me-2 text-warning"></i>Password
                                    </label>
                                    <input type="password" v-model="registerForm.password" 
                                        class="form-control form-control-lg border-2 rounded-3" 
                                        placeholder="Create a password" required>
                                </div>
                                
                                <button type="submit" class="btn btn-primary bg-gradient btn-lg w-100 rounded-pill mb-3">
                                    <i class="bi bi-check-circle me-2"></i>Create Account
                                </button>
                            </form>
                            
                            <div class="text-center">
                                <p class="text-muted mb-0">Already have an account?</p>
                                <router-link to="/login" class="btn btn-link text-decoration-none fw-semibold">
                                    <i class="bi bi-arrow-left me-2"></i>Back to Login
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