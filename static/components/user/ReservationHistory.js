import { getAuthHeader } from '../../utils/auth.js';

export const ReservationHistory = {
    template: `
    <div class="container-fluid p-0">
        <div class="row mb-4">
            <div class="col">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                        <div class="bg-warning bg-gradient rounded-circle p-3 me-3">
                            <i class="bi bi-clock-history text-white fs-4"></i>
                        </div>
                        <div>
                            <h2 class="mb-1 fw-bold text-dark">Parking History</h2>
                            <p class="text-muted mb-0">View your complete parking record</p>
                        </div>
                    </div>
                    <button class="btn btn-primary bg-gradient btn-lg rounded-pill px-4" @click="loadHistory">
                        <i class="bi bi-arrow-clockwise me-2"></i>Refresh
                    </button>
                </div>
            </div>
        </div>

        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted mt-3">Loading your parking history...</p>
        </div>

        <div v-if="error" class="alert alert-danger border-0 rounded-4 shadow-sm">
            <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
        </div>

        <div v-else-if="!loading">
            <!-- Summary Stats -->
            <div v-if="reservations.length > 0" class="row mb-4">
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="card border-0 shadow-sm rounded-4 bg-primary bg-gradient text-white">
                        <div class="card-body text-center p-4">
                            <i class="bi bi-graph-up fs-1 mb-2 opacity-75"></i>
                            <h3 class="fw-bold mb-1">{{ getTotalVisits() }}</h3>
                            <p class="mb-0 opacity-75">Total Visits</p>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="card border-0 shadow-sm rounded-4 bg-success bg-gradient text-white">
                        <div class="card-body text-center p-4">
                            <i class="bi bi-clock fs-1 mb-2 opacity-75"></i>
                            <h3 class="fw-bold mb-1">{{ getTotalHours() }}h</h3>
                            <p class="mb-0 opacity-75">Total Hours</p>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="card border-0 shadow-sm rounded-4 bg-info bg-gradient text-white">
                        <div class="card-body text-center p-4">
                            <i class="bi bi-currency-dollar fs-1 mb-2 opacity-75"></i>
                            <h3 class="fw-bold mb-1">$ {{ getTotalCost() }}</h3>
                            <p class="mb-0 opacity-75">Total Spent</p>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="card border-0 shadow-sm rounded-4 bg-warning bg-gradient text-white">
                        <div class="card-body text-center p-4">
                            <i class="bi bi-car-front fs-1 mb-2 opacity-75"></i>
                            <h3 class="fw-bold mb-1">{{ getActiveCount() }}</h3>
                            <p class="mb-0 opacity-75">Active Now</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- History Table -->
            <div class="card border-0 shadow-lg rounded-4">
                <div class="card-header bg-gradient text-white border-0 rounded-top-4 py-3"
                     style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-table me-2"></i>
                        <h5 class="mb-0">Complete History</h5>
                        <span class="badge bg-white text-primary ms-auto px-3 py-2 rounded-pill">
                            {{ reservations.length }} Records
                        </span>
                    </div>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead class="bg-light">
                                <tr>
                                    <th class="border-0 py-3 px-4 fw-semibold text-dark">
                                        <i class="bi bi-building me-2 text-primary"></i>Parking Lot
                                    </th>
                                    <th class="border-0 py-3 px-4 fw-semibold text-dark">
                                        <i class="bi bi-geo-alt me-2 text-warning"></i>Spot
                                    </th>
                                    <th class="border-0 py-3 px-4 fw-semibold text-dark">
                                        <i class="bi bi-car-front me-2 text-info"></i>License
                                    </th>
                                    <th class="border-0 py-3 px-4 fw-semibold text-dark">
                                        <i class="bi bi-clock me-2 text-success"></i>Parked
                                    </th>
                                    <th class="border-0 py-3 px-4 fw-semibold text-dark">
                                        <i class="bi bi-clock-history me-2 text-secondary"></i>Left
                                    </th>
                                    <th class="border-0 py-3 px-4 fw-semibold text-dark">
                                        <i class="bi bi-hourglass me-2 text-warning"></i>Duration
                                    </th>
                                    <th class="border-0 py-3 px-4 fw-semibold text-dark">
                                        <i class="bi bi-currency-dollar me-2 text-success"></i>Cost
                                    </th>
                                    <th class="border-0 py-3 px-4 fw-semibold text-dark">
                                        <i class="bi bi-flag me-2 text-danger"></i>Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="reservation in reservations" :key="reservation.id" class="border-bottom border-light">
                                    <td class="py-3 px-4">
                                        <div class="fw-bold text-dark">{{ reservation.lot_name || 'N/A' }}</div>
                                    </td>
                                    <td class="py-3 px-4">
                                        <span class="badge bg-secondary bg-gradient px-3 py-2 rounded-pill fw-semibold text-white">
                                            {{ reservation.spot_number || 'N/A' }}
                                        </span>
                                    </td>
                                    <td class="py-3 px-4">
                                        <code class="bg-light px-2 py-1 rounded text-dark fw-bold">
                                            {{ reservation.license_plate || 'N/A' }}
                                        </code>
                                    </td>
                                    <td class="py-3 px-4 text-muted">
                                        {{ formatDateTime(reservation.parking_timestamp) }}
                                    </td>
                                    <td class="py-3 px-4 text-muted">
                                        <span v-if="reservation.leaving_timestamp">
                                            {{ formatDateTime(reservation.leaving_timestamp) }}
                                        </span>
                                        <span v-else>—</span>
                                    </td>
                                    <td class="py-3 px-4">
                                        <span v-if="reservation.duration_hours != null && !isNaN(reservation.duration_hours)" 
                                              class="badge bg-info bg-gradient px-3 py-2 rounded-pill fw-semibold">
                                            {{ parseFloat(reservation.duration_hours).toFixed(1) }}h
                                        </span>
                                        <span v-else class="text-muted">—</span>
                                    </td>
                                    <td class="py-3 px-4">
                                        <span v-if="reservation.parking_cost && !isNaN(reservation.parking_cost)" 
                                              class="fw-bold text-success fs-6">
                                            $ {{ (parseFloat(reservation.parking_cost) || 0).toFixed(2) }}
                                        </span>
                                        <span v-else class="text-muted">—</span>
                                    </td>
                                    <td class="py-3 px-4">
                                        <span v-if="reservation.status === 'active'" 
                                              class="badge bg-success bg-gradient px-3 py-2 rounded-pill fw-semibold">
                                            <i class="bi bi-check-circle me-1"></i>Active
                                        </span>
                                        <span v-else class="badge bg-secondary bg-gradient px-3 py-2 rounded-pill fw-semibold">
                                            <i class="bi bi-check2-all me-1"></i>Completed
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="reservations.length === 0 && !loading" class="text-center py-5">
            <div class="bg-light rounded-circle mx-auto mb-4" style="width: 120px; height: 120px; display: flex; align-items: center; justify-content: center;">
                <i class="bi bi-clock-history text-muted" style="font-size: 3rem;"></i>
            </div>
            <h4 class="text-muted mb-2">No Parking History</h4>
            <p class="text-muted">Your parking history will appear here once you make reservations</p>
            <router-link to="/dashboard/parking-lots" class="btn btn-primary bg-gradient btn-lg rounded-pill px-4">
                <i class="bi bi-plus-circle me-2"></i>Make Your First Reservation
            </router-link>
        </div>
    </div>
`,
    data() {
        return {
            reservations: [],
            loading: false,
            error: '',
            historyChart: null
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
    this.loadUserStats();
    waitForChart(() => {
        this.$nextTick(() => {
            this.initUserCharts();
        });
    });
},

    beforeDestroy() {
        if (this.historyChart) this.historyChart.destroy();
    },
    methods: {
        async loadHistory() {
            this.loading = true;
            this.error = '';
            
            try {
                const headers = typeof getAuthHeader === 'function' ? getAuthHeader() : {};
                const response = await fetch('/api/reservations/my-history', { headers });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                this.reservations = Array.isArray(data) ? data : [];
                
                this.updateHistoryChart();
                
            } catch (error) {
                console.error('Error loading history:', error);
                this.error = `Error loading parking history: ${error.message}`;
            } finally {
                this.loading = false;
            }
        },
        
        initHistoryChart() {
            // Add chart to history template if needed
            const ctx = document.getElementById('historyChart');
            if (!ctx) return;
            
            this.historyChart = new window.Chart(ctx, {
                type: 'bar',
                data: {
                    labels: this.getLast30Days(),
                    datasets: [{
                        label: 'Parking Sessions',
                        data: Array(30).fill(0),
                        backgroundColor: 'rgba(54, 162, 235, 0.8)',
                        borderColor: 'rgb(54, 162, 235)',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        },
        
        updateHistoryChart() {
            if (!this.historyChart) return;
            
            // Generate mock data for the last 30 days
            const mockData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 3));
            this.historyChart.data.datasets[0].data = mockData;
            this.historyChart.update();
        },
        
        getLast30Days() {
            const days = [];
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                days.push(date.getDate().toString());
            }
            return days;
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