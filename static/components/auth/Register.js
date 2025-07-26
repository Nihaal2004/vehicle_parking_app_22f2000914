export const Register = {
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