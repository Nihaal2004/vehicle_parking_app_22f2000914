import { getAuthHeader } from '../../utils/auth.js';

export const AdminReservations = {
    template: `
    <div class="container-fluid p-0">
        <div class="d-flex align-items-center mb-4 pb-3 border-bottom border-2 border-primary">
            <div class="bg-primary bg-gradient rounded-circle p-3 me-3">
                <i class="bi bi-calendar-check text-white fs-4"></i>
            </div>
            <div>
                <h2 class="mb-1 fw-bold text-dark">Reservation Management</h2>
                <p class="text-muted mb-0">Monitor and track all parking reservations</p>
            </div>
        </div>
        
        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted mt-3">Loading reservations...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger border-0 rounded-4 shadow-sm">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ error }}
        </div>

        <div v-else class="card border-0 shadow-lg rounded-4">
            <div class="card-header bg-gradient text-white border-0 rounded-top-4 py-3" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div class="d-flex align-items-center">
                    <i class="bi bi-table me-2"></i>
                    <h5 class="mb-0">All Reservations</h5>
                    <span class="badge bg-white text-primary ms-auto px-3 py-2 rounded-pill">
                        {{ reservations.length }} Total
                    </span>
                </div>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="bg-light">
                            <tr>
                                <th class="border-0 py-3 px-4 fw-semibold text-dark">
                                    <i class="bi bi-person me-2 text-primary"></i>User
                                </th>
                                <th class="border-0 py-3 px-4 fw-semibold text-dark">
                                    <i class="bi bi-building me-2 text-success"></i>Parking Lot
                                </th>
                                <th class="border-0 py-3 px-4 fw-semibold text-dark">
                                    <i class="bi bi-geo-alt me-2 text-warning"></i>Spot
                                </th>
                                <th class="border-0 py-3 px-4 fw-semibold text-dark">
                                    <i class="bi bi-car-front me-2 text-info"></i>License Plate
                                </th>
                                <th class="border-0 py-3 px-4 fw-semibold text-dark">
                                    <i class="bi bi-clock me-2 text-secondary"></i>Parked Time
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
                            <tr v-for="reservation in reservations" :key="reservation.id" 
                                class="border-bottom border-light" style="transition: all 0.3s ease;">
                                <td class="py-3 px-4">
                                    <div class="d-flex align-items-center">
                                        <div class="bg-primary bg-gradient rounded-circle p-2 me-3">
                                            <i class="bi bi-person-fill text-white"></i>
                                        </div>
                                        <span class="fw-semibold text-dark">{{ reservation.username }}</span>
                                    </div>
                                </td>
                                <td class="py-3 px-4 fw-medium text-dark">{{ reservation.lot_name }}</td>
                                <td class="py-3 px-4">
                                    <span class="badge bg-warning bg-gradient text-dark px-3 py-2 rounded-pill fw-semibold">
                                        {{ reservation.spot_number }}
                                    </span>
                                </td>
                                <td class="py-3 px-4">
                                    <code class="bg-light px-3 py-2 rounded text-dark fw-bold">
                                        {{ reservation.license_plate }}
                                    </code>
                                </td>
                                <td class="py-3 px-4 text-muted">{{ formatDateTime(reservation.parking_timestamp) }}</td>
                                <td class="py-3 px-4">
                                    <span v-if="reservation.status === 'completed' && reservation.parking_cost" 
                                          class="fw-bold text-success fs-6">
                                        $ {{ parseFloat(reservation.parking_cost).toFixed(2) }}
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

        <div v-if="reservations.length === 0 && !loading" class="text-center py-5">
            <div class="bg-light rounded-circle mx-auto mb-4" style="width: 120px; height: 120px; display: flex; align-items: center; justify-content: center;">
                <i class="bi bi-calendar-x text-muted" style="font-size: 3rem;"></i>
            </div>
            <h4 class="text-muted mb-2">No Reservations Found</h4>
            <p class="text-muted">Reservations will appear here once users start booking spots</p>
        </div>
    </div>
`,
    data() {
        return {
            reservations: [],
            loading: false,
            error: '',
            reservationChart: null
        }
    },
    mounted() {
    this.loadReservations(); // <- CORRECT method name
    this.$nextTick(() => {
        this.initReservationChart();
    });
},

    beforeDestroy() {
        if (this.reservationChart) this.reservationChart.destroy();
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
                
                this.updateReservationChart();
                
            } catch (error) {
                this.error = 'Error loading reservations: ' + error.message;
            } finally {
                this.loading = false;
            }
        },
        
        initReservationChart() {
            // Add chart to reservations template if needed
            const ctx = document.getElementById('reservationChart');
            if (!ctx) return;
            
            this.reservationChart = new window.Chart(ctx, {
                type: 'line',
                data: {
                    labels: this.getLast7Days(),
                    datasets: [{
                        label: 'Daily Reservations',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
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
        
        updateReservationChart() {
            if (!this.reservationChart) return;
            
            // Generate mock daily reservation data
            const mockData = Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 5);
            this.reservationChart.data.datasets[0].data = mockData;
            this.reservationChart.update();
        },
        
        getLast7Days() {
            const days = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            }
            return days;
        },
        
        formatDateTime(timestamp) {
            if (!timestamp) return 'N/A';
            return new Date(timestamp).toLocaleString();
        }
    }
};