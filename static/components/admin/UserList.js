import { getAuthHeader } from '../../utils/auth.js';

export const UserList = {
    template: `
    <div class="container-fluid p-0">
        <div class="d-flex align-items-center mb-4 pb-3 border-bottom border-2 border-success">
            <div class="bg-success bg-gradient rounded-circle p-3 me-3">
                <i class="bi bi-people text-white fs-4"></i>
            </div>
            <div>
                <h2 class="mb-1 fw-bold text-dark">Users Management</h2>
                <p class="text-muted mb-0">Monitor and manage all registered users</p>
            </div>
        </div>
        
        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-success" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted mt-3">Loading users...</p>
        </div>
        
        <div v-if="error" class="alert alert-danger border-0 rounded-4 shadow-sm">
            <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
        </div>
        
        <div class="card border-0 shadow-lg rounded-4">
            <div class="card-header bg-gradient text-white border-0 rounded-top-4 py-3"
                 style="background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);">
                <div class="d-flex align-items-center">
                    <i class="bi bi-table me-2"></i>
                    <h5 class="mb-0">All Users</h5>
                    <span class="badge bg-white text-success ms-auto px-3 py-2 rounded-pill">
                        {{ users.length }} Total
                    </span>
                </div>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="bg-light">
                            <tr>
                                <th class="border-0 py-3 px-4 fw-semibold text-dark">
                                    <i class="bi bi-hash me-2 text-secondary"></i>ID
                                </th>
                                <th class="border-0 py-3 px-4 fw-semibold text-dark">
                                    <i class="bi bi-person me-2 text-primary"></i>Username
                                </th>
                                <th class="border-0 py-3 px-4 fw-semibold text-dark">
                                    <i class="bi bi-envelope me-2 text-info"></i>Email
                                </th>
                                <th class="border-0 py-3 px-4 fw-semibold text-dark">
                                    <i class="bi bi-geo-alt me-2 text-warning"></i>Current Spot
                                </th>
                                <th class="border-0 py-3 px-4 fw-semibold text-dark">
                                    <i class="bi bi-graph-up me-2 text-success"></i>Total Reservations
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="user in users" :key="user.id" class="border-bottom border-light">
                                <td class="py-3 px-4">
                                    <span class="badge bg-secondary bg-gradient px-3 py-2 rounded-pill fw-semibold">
                                        #{{ user.id }}
                                    </span>
                                </td>
                                <td class="py-3 px-4">
                                    <div class="d-flex align-items-center">
                                        <div class="bg-primary bg-gradient rounded-circle p-2 me-3">
                                            <i class="bi bi-person-fill text-white"></i>
                                        </div>
                                        <span class="fw-bold text-dark">{{ user.username }}</span>
                                    </div>
                                </td>
                                <td class="py-3 px-4 text-muted">{{ user.email }}</td>
                                <td class="py-3 px-4">
                                    <div v-if="user.current_spot && user.current_spot.length">
                                        <div v-for="(spot, index) in user.current_spot" :key="index" class="mb-1">
                                            <span class="badge bg-warning bg-gradient text-dark px-3 py-2 rounded-pill me-2">
                                                {{ spot }}
                                            </span>
                                            <span class="badge bg-success bg-gradient px-2 py-1 rounded-pill small">Active</span>
                                        </div>
                                    </div>
                                    <span v-else class="text-muted">—</span>
                                </td>
                                <td class="py-3 px-4">
                                    <div class="bg-success bg-gradient rounded-3 p-2 text-center d-inline-block" style="min-width: 60px;">
                                        <span class="text-white fw-bold">{{ user.total_reservations }}</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div v-if="users.length === 0 && !loading" class="text-center py-5">
            <div class="bg-light rounded-circle mx-auto mb-4" style="width: 120px; height: 120px; display: flex; align-items: center; justify-content: center;">
                <i class="bi bi-person-x text-muted" style="font-size: 3rem;"></i>
            </div>
            <h4 class="text-muted mb-2">No Users Found</h4>
            <p class="text-muted">Users will appear here once they register</p>
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