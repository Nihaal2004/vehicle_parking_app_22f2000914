import { getAuthHeader } from '../../utils/auth.js';

export const AdminReservations = {
    template: `
        <div>
            <h3><i class="bi bi-clock-history me-2"></i>Reservations</h3>
            
            <div v-if="loading" class="text-center py-3">
                <div class="spinner-border" role="status"></div>
            </div>

            <div v-else-if="error" class="alert alert-danger">
                {{ error }}
            </div>

            <div v-else class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Parking Lot</th>
                            <th>Spot</th>
                            <th>License Plate</th>
                            <th>Parked</th>
                            <th>Cost</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="reservation in reservations" :key="reservation.id">
                            <td>{{ reservation.username }}</td>
                            <td>{{ reservation.lot_name }}</td>
                            <td>{{ reservation.spot_number }}</td>
                            <td>{{ reservation.license_plate }}</td>
                            <td>{{ formatDateTime(reservation.parking_timestamp) }}</td>
                            <td>
                                <span v-if="reservation.status === 'completed' && reservation.parking_cost">
                                    $ {{ parseFloat(reservation.parking_cost).toFixed(2) }}
                                </span>
                                <span v-else class="text-muted">-</span>
                            </td>
                            <td>
                                <span v-if="reservation.status === 'active'" class="badge bg-success">
                                    Active
                                </span>
                                <span v-else class="badge bg-secondary">
                                    Completed
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="reservations.length === 0 && !loading" class="text-center py-4">
                <p class="text-muted">No reservations found</p>
            </div>
        </div>
    `,
    data() {
        return {
            reservations: [],
            loading: false,
            error: ''
        }
    },
    mounted() {
        this.loadReservations();
    },
    methods: {
        async loadReservations() {
            this.loading = true;
            this.error = '';
            
            try {
                const headers = typeof getAuthHeader === 'function' ? getAuthHeader() : {};
                const response = await fetch('/api/admin/reservations', { headers });
                
                if (!response.ok) {
                    throw new Error('Failed to load reservations');
                }
                
                const data = await response.json();
                this.reservations = Array.isArray(data) ? data : [];
                
            } catch (error) {
                this.error = 'Error loading reservations: ' + error.message;
            } finally {
                this.loading = false;
            }
        },
        
        formatDateTime(timestamp) {
            if (!timestamp) return 'N/A';
            return new Date(timestamp).toLocaleString();
        }
    }
};