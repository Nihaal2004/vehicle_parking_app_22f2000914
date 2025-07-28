import { getAuthHeader } from '../../utils/auth.js';

export const UserList = {
    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3>Users Management</h3>
            </div>
            
            <div v-if="loading" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Current Spot</th>
                            <th>Total Reservations</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in users" :key="user.id">
                            <td>{{ user.id }}</td>
                            <td>{{ user.username }}</td>
                            <td>{{ user.email }}</td>
                            <td>
                                <span v-if="user.current_spot && user.current_spot.length">
                                <span v-for="(spot, index) in user.current_spot" :key="index" class="d-block">
                                {{ spot }} <span class="badge bg-info">Active</span>
                                </span>
                                </span>
                                <span v-else>--</span>
                            </td>
                            <td>{{ user.total_reservations }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `,
    data() {
        return {
            users: [],
            loading: false,
            error: ''
        }
    },
    mounted() {
        this.fetchUsers();
    },
    methods: {
        fetchUsers() {
            this.loading = true;
            fetch('/api/admin/users', {
                headers: { 'Content-Type': 'application/json' ,...getAuthHeader()}
            })
            .then(res => res.json())
            .then(data => {
                this.users = data;
                this.loading = false;
            })
            .catch(error => {
                this.error = 'Failed to fetch users';
                this.loading = false;
                console.error(error);
            });
        }
    }
};