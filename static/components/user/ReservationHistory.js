import { getAuthHeader } from '../../utils/auth.js';

export const ReservationHistory = {
    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3><i class="bi bi-clock-history me-2"></i>Parking History</h3>
                <button class="btn btn-primary" @click="loadHistory">
                    <i class="bi bi-arrow-clockwise me-1"></i> Refresh
                </button>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>

            <!-- Error message -->
            <div v-if="error" class="alert alert-danger">{{ error }}</div>

            <!-- History Table -->
            <div v-else-if="!loading" class="table-responsive">
                <table class="table table-striped">
                    <thead class="table-dark">
                        <tr>
                            <th>Parking Lot</th>
                            <th>Spot</th>
                            <th>License Plate</th>
                            <th>Parked Time</th>
                            <th>Left Time</th>
                            <th>Duration</th>
                            <th>Cost</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="reservation in reservations" :key="reservation.id">
                            <td class="fw-bold">{{ reservation.lot_name || 'N/A' }}</td>
                            <td>
                                <span class="badge bg-secondary">{{ reservation.spot_number || 'N/A' }}</span>
                            </td>
                            <td>{{ reservation.license_plate || 'N/A' }}</td>
                            <td>{{ formatDateTime(reservation.parking_timestamp) }}</td>
                            <td>
                                <span v-if="reservation.leaving_timestamp">
                                    {{ formatDateTime(reservation.leaving_timestamp) }}
                                </span>
                                <span v-else class="text-muted">-</span>
                            </td>
                            <td>
                                <span v-if="reservation.duration_hours != null && !isNaN(reservation.duration_hours)">
                                    {{ parseFloat(reservation.duration_hours).toFixed(1) }}h
                                </span>
                                <span v-else class="text-muted">-</span>
                            </td>
                            <td>
                                <span v-if="reservation.parking_cost && !isNaN(reservation.parking_cost)" class="fw-bold text-success">
                                    $ {{ (parseFloat(reservation.parking_cost) || 0).toFixed(2) }}
                                </span>
                                <span v-else class="text-muted">-</span>
                            </td>
                            <td>
                                <span v-if="reservation.status === 'active'" class="badge bg-success">Active</span>
                                <span v-else class="badge bg-secondary">Completed</span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- No history message -->
                <div v-if="reservations.length === 0" class="text-center py-5">
                    <i class="bi bi-clock-history text-muted" style="font-size: 3rem;"></i>
                    <h5 class="text-muted mt-3">No parking history</h5>
                    <p class="text-muted">Your parking history will appear here</p>
                </div>
            </div>

            <!-- Summary Stats -->
            <div v-if="reservations.length > 0" class="row mt-4">
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title text-primary">{{ getTotalVisits() }}</h5>
                            <p class="card-text text-muted">Total Visits</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title text-success">{{ getTotalHours() }}h</h5>
                            <p class="card-text text-muted">Total Hours</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title text-info">\${{ getTotalCost() }}</h5>
                            <p class="card-text text-muted">Total Spent</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title text-warning">{{ getActiveCount() }}</h5>
                            <p class="card-text text-muted">Active Now</p>
                        </div>
                    </div>
                </div>
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
    computed: {
        totalVisits() {
            return this.reservations ? this.reservations.length : 0;
        },
        totalHours() {
            try {
                const total = this.reservations
                    .filter(r => r.duration_hours && !isNaN(r.duration_hours))
                    .reduce((sum, r) => sum + parseFloat(r.duration_hours), 0);
                return (total || 0).toFixed(1);
            } catch (error) {
                console.error('Error calculating total hours:', error);
                return '0.0';
            }
        },
        totalCost() {
            try {
                const total = this.reservations
                    .filter(r => r.parking_cost && !isNaN(r.parking_cost))
                    .reduce((sum, r) => sum + parseFloat(r.parking_cost), 0);
                return (total || 0).toFixed(2);
            } catch (error) {
                console.error('Error calculating total cost:', error);
                return '0.00';
            }
        },
        activeCount() {
            return this.reservations ? this.reservations.filter(r => r.status === 'active').length : 0;
        }
    },
    mounted() {
        this.loadHistory();
    },
    methods: {
        async loadHistory() {
            this.loading = true;
            this.error = '';
            
            try {
                // Check if getAuthHeader is available
                const headers = typeof getAuthHeader === 'function' ? getAuthHeader() : {};
                
                const response = await fetch('/api/reservations/my-history', { headers });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                this.reservations = Array.isArray(data) ? data : [];
                
            } catch (error) {
                console.error('Error loading history:', error);
                this.error = `Error loading parking history: ${error.message}`;
            } finally {
                this.loading = false;
            }
        },
        
        formatDateTime(timestamp) {
            if (!timestamp) return 'N/A';
            
            try {
                const date = new Date(timestamp);
                if (isNaN(date.getTime())) {
                    return 'Invalid Date';
                }
                return date.toLocaleString();
            } catch (error) {
                console.error('Date formatting error:', error);
                return 'Invalid Date';
            }
        },

        getTotalVisits() {
            return this.reservations ? this.reservations.length : 0;
        },

        getTotalHours() {
            try {
                const total = this.reservations
                    .filter(r => r.duration_hours != null && !isNaN(r.duration_hours))
                    .reduce((sum, r) => sum + parseFloat(r.duration_hours), 0);
                return (total || 0).toFixed(1);
            } catch (error) {
                console.error('Error calculating total hours:', error);
                return '0.0';
            }
        },

        getTotalCost() {
            try {
                const total = this.reservations
                    .filter(r => r.parking_cost != null && !isNaN(r.parking_cost))
                    .reduce((sum, r) => sum + parseFloat(r.parking_cost), 0);
                return (total || 0).toFixed(2);
            } catch (error) {
                console.error('Error calculating total cost:', error);
                return '0.00';
            }
        },

        getActiveCount() {
            return this.reservations ? this.reservations.filter(r => r.status === 'active').length : 0;
        }
    }
};