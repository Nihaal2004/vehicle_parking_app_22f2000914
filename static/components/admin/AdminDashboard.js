import { getAuthHeader } from '../../utils/auth.js';

export const AdminDashboard = {
    template: `
        <div class="col-md-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Admin Dashboard</h2>
                <div class="btn-group">
                    <button @click="export_res" class="btn btn-success me-2">Export Reservation</button>
                    <button @click="export_lot" class="btn btn-success me-2" :disabled="exportLoading">
                        <span v-if="exportLoading" class="spinner-border spinner-border-sm me-2"></span>
                        Export Lots
                    </button>
                    <button @click="logout" class="btn btn-danger">Logout</button>
                </div>
            </div>
            
            <!-- Alert message -->
            <div v-if="alertMessage" class="alert alert-success alert-dismissible fade show" role="alert">
                {{ alertMessage }}
                <button type="button" class="btn-close" @click="clearAlert"></button>
            </div>
            
            <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
                <div class="container-fluid">
                    <div class="collapse navbar-collapse">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item">
                                <router-link to="/admin/statistics" class="nav-link">Statistics</router-link>
                            </li>
                            <li class="nav-item">
                                <router-link to="/admin/parking-lots" class="nav-link">Parking Lots</router-link>
                            </li>
                            <li class="nav-item">
                                <router-link to="/admin/users" class="nav-link">Users</router-link>
                            </li>
                            <li class="nav-item">
                                <router-link to="/admin/reservations" class="nav-link">Reservations</router-link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            
            <router-view></router-view>
        </div>
    `,
    data() {
        return {
            exportLoading: false,
            alertMessage: ''
        };
    },
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
        },
        
        export_res() {
            fetch('/api/admin/export/csv', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }, 
                body: JSON.stringify({'report_type': 'reservations'})
            })
            .then(() => {
                this.alertMessage = 'Reservations export started successfully. You will receive an email when ready.';
                setTimeout(() => {
                    this.clearAlert();
                }, 5000);
            })
            .catch(error => {
                console.error('Export error:', error);
            });
        },
        
        async export_lot() {
            try {
                this.exportLoading = true;
                
                await fetch('/api/admin/export/csv', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeader()
                    },
                    body: JSON.stringify({'report_type': 'parking_lots'})
                });
                
                this.alertMessage = 'Parking lots export started successfully. You will receive an email when ready.';
                setTimeout(() => {
                    this.clearAlert();
                }, 5000);
                
            } catch (error) {
                console.error('Export error:', error);
            } finally {
                this.exportLoading = false;
            }
        },
        
        clearAlert() {
            this.alertMessage = '';
        }
    }
};