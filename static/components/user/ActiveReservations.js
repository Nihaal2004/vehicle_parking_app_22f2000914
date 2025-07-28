import { getAuthHeader } from '../../utils/auth.js';

export const ActiveReservations = {
    template: `
    <div class="container-fluid p-0">
        <div class="row mb-4">
            <div class="col">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                        <div class="bg-success bg-gradient rounded-circle p-3 me-3">
                            <i class="bi bi-car-front text-white fs-4"></i>
                        </div>
                        <div>
                            <h2 class="mb-1 fw-bold text-dark">Active Reservations</h2>
                            <p class="text-muted mb-0">Manage your current parking spots</p>
                        </div>
                    </div>
                    <button class="btn btn-primary bg-gradient btn-lg rounded-pill px-4" @click="loadActiveReservations">
                        <i class="bi bi-arrow-clockwise me-2"></i>Refresh
                    </button>
                </div>
            </div>
        </div>

        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted mt-3">Loading your active reservations...</p>
        </div>

        <div v-if="error" class="alert alert-danger border-0 rounded-4 shadow-sm">
            <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
        </div>

        <div v-else class="row">
            <div v-for="reservation in activeReservations" :key="reservation.id" class="col-md-6 col-lg-4 mb-4">
                <div class="card border-0 shadow-lg rounded-4 h-100">
                    <div class="card-header bg-gradient text-white border-0 rounded-top-4 py-3"
                         style="background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-building me-2"></i>
                            <h6 class="mb-0 fw-bold">{{ reservation.lot_name }}</h6>
                            <span class="badge bg-white text-success ms-auto px-2 py-1 rounded-pill">
                                <i class="bi bi-check-circle me-1"></i>Active
                            </span>
                        </div>
                    </div>
                    <div class="card-body p-4">
                        <div class="row mb-3">
                            <div class="col-6">
                                <div class="bg-light rounded-3 p-3 text-center">
                                    <i class="bi bi-geo-alt text-warning fs-4 mb-2"></i>
                                    <div class="fw-bold text-dark">Spot</div>
                                    <div class="text-primary fw-bold fs-5">{{ reservation.spot_number }}</div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="bg-light rounded-3 p-3 text-center">
                                    <i class="bi bi-car-front text-info fs-4 mb-2"></i>
                                    <div class="fw-bold text-dark">License</div>
                                    <div class="text-dark fw-bold">{{ reservation.license_plate }}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <div class="bg-primary bg-gradient rounded-3 p-3 text-white text-center">
                                <div class="small opacity-75 mb-1">Parked Since</div>
                                <div class="fw-bold">{{ formatDateTime(reservation.parking_timestamp) }}</div>
                                <div class="mt-2 small">
                                    <i class="bi bi-clock me-1"></i>
                                    Duration: {{ calculateDuration(reservation.parking_timestamp) }}
                                </div>
                            </div>
                        </div>
                        
                        <button class="btn btn-danger bg-gradient btn-lg w-100 rounded-pill"
                                @click="confirmRelease(reservation)"
                                :disabled="releaseLoading === reservation.id">
                            <span v-if="releaseLoading === reservation.id" class="spinner-border spinner-border-sm me-2"></span>
                            <i v-else class="bi bi-box-arrow-right me-2"></i>
                            {{ releaseLoading === reservation.id ? 'Releasing...' : 'Release Spot' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="activeReservations.length === 0 && !loading" class="text-center py-5">
            <div class="bg-light rounded-circle mx-auto mb-4" style="width: 120px; height: 120px; display: flex; align-items: center; justify-content: center;">
                <i class="bi bi-car-front text-muted" style="font-size: 3rem;"></i>
            </div>
            <h4 class="text-muted mb-2">No Active Reservations</h4>
            <p class="text-muted">Reserve a parking spot to see it here</p>
            <router-link to="/dashboard/parking-lots" class="btn btn-primary bg-gradient btn-lg rounded-pill px-4">
                <i class="bi bi-plus-circle me-2"></i>Find Parking
            </router-link>
        </div>

        <!-- Release Confirmation Modal -->
        <div class="modal fade" id="releaseModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4">
                    <div class="modal-header bg-gradient text-white border-0 rounded-top-4"
                         style="background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);">
                        <h5 class="modal-title fw-bold">
                            <i class="bi bi-exclamation-triangle me-2"></i>Confirm Release
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4">
                        <div v-if="reservationToRelease">
                            <p class="mb-3">Are you sure you want to release this parking spot?</p>
                            <div class="card bg-light border-0 rounded-3">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-sm-6 mb-2">
                                            <strong class="text-primary">Location:</strong><br>
                                            {{ reservationToRelease.lot_name }}
                                        </div>
                                        <div class="col-sm-6 mb-2">
                                            <strong class="text-success">Spot:</strong><br>
                                            {{ reservationToRelease.spot_number }}
                                        </div>
                                        <div class="col-sm-6 mb-2">
                                            <strong class="text-info">License:</strong><br>
                                            {{ reservationToRelease.license_plate }}
                                        </div>
                                        <div class="col-sm-6 mb-2">
                                            <strong class="text-warning">Duration:</strong><br>
                                            {{ calculateDuration(reservationToRelease.parking_timestamp) }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer border-0">
                        <button type="button" class="btn btn-secondary bg-gradient rounded-pill px-4" data-bs-dismiss="modal">
                            <i class="bi bi-x-circle me-2"></i>Cancel
                        </button>
                        <button type="button" class="btn btn-danger bg-gradient rounded-pill px-4" @click="releaseSpot">
                            <i class="bi bi-check-circle me-2"></i>Yes, Release
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
`,
    data() {
        return {
            activeReservations: [],
            loading: false,
            error: '',
            releaseLoading: null,
            reservationToRelease: null
        }
    },
    mounted() {
        this.loadActiveReservations();
        // Auto-refresh every 30 seconds
        this.refreshInterval = setInterval(this.loadActiveReservations, 30000);
    },
    beforeDestroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    },
    methods: {
        loadActiveReservations() {
            this.loading = true;
            this.error = '';
            fetch('/api/reservations/my-history', { headers: getAuthHeader() })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to load reservations');
                    return response.json();
                })
                .then(data => {
                    this.activeReservations = data.filter(r => r.status === 'active');
                    this.loading = false;
                })
                .catch(error => {
                    this.error = 'Error loading reservations';
                    this.loading = false;
                    console.error('Error loading reservations:', error);
                });
        },
        
        confirmRelease(reservation) {
            this.reservationToRelease = reservation;
            const modal = new bootstrap.Modal(document.getElementById('releaseModal'));
            modal.show();
        },
        
        releaseSpot() {
            if (!this.reservationToRelease) return;
            
            this.releaseLoading = this.reservationToRelease.id;
            fetch(`/api/reservations/${this.reservationToRelease.id}/release`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => Promise.reject(err));
                }
                return response.json();
            })
            .then(data => {
                alert(`Spot released successfully! Duration: ${data.duration_hours}h, Cost: $${data.total_cost}`);
                
                const modal = bootstrap.Modal.getInstance(document.getElementById('releaseModal'));
                modal.hide();
                
                this.loadActiveReservations();
                this.$emit('spot-released');
            })
            .catch(error => {
                console.error('Error releasing spot:', error);
                alert(error.error || 'Error releasing spot');
            })
            .finally(() => {
                this.releaseLoading = null;
            });
        },
        
        formatDateTime(timestamp) {
            return new Date(timestamp).toLocaleString();
        },
        
        calculateDuration(startTime) {
            const start = new Date(startTime);
            const now = new Date();
            const diffMs = now - start;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            return `${diffHours}h ${diffMinutes}m`;
        }
    }
};