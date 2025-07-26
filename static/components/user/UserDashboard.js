import { getAuthHeader } from '../../utils/auth.js';

export const UserDashboard = {
    template: `
        <div class="col-md-12">
            <h2>User Dashboard</h2>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3>Welcome!</h3>
                <button @click="logout" class="btn btn-danger">Logout</button>
            </div>
        </div>
    `,
    methods: {
        logout() {
            fetch('/api/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' ,...getAuthHeader()}
            })
            .then(() => {
                this.$router.push('/login');
            });
        }
    }
};