import { getAuthHeader } from '../../utils/auth.js';

export const AdminDashboard = {
    template: `
        <div class="col-md-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Admin Dashboard</h2>
                <button @click="logout" class="btn btn-danger">Logout</button>
            </div>
            
            <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
                <div class="container-fluid">
                    <div class="collapse navbar-collapse">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item">
                                <router-link to="/admin/parking-lots" class="nav-link">Parking Lots</router-link>
                            </li>
                            <li class="nav-item">
                                <router-link to="/admin/users" class="nav-link">Users</router-link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            
            <router-view></router-view>
        </div>
    `,
    methods: {
        logout() {
            fetch('/api/logout', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            })
            .then(() => {
                localStorage.removeItem('authToken');
                this.$router.push('/login');
            });
        }
    }
};