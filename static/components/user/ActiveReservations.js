import { getAuthHeader } from '../../utils/auth.js';

export const ActiveReservations = {
    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3><i class="bi bi-car-front me-2"></i>Active Reservations</h3>
                <button class="btn btn-primary" @click="loadActiveReservations">
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

            <!-- Active Reservations -->
            <div v-else>
                <div v-for="reservation in activeReservations" :key="reservation.id" class="card mb-3">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <h5 class="card-title mb-2">
                                    <i class="bi bi-building me-2"></i>{{ reservation.lot_name }}
                                </h5>
                                <div class="row">
                                    <div class="col-sm-6">
                                        <small class="text-muted">Spot:</small>
                                        <div class="fw-bold">{{ reservation.spot_number }}</div>
                                    </div>
                                    <div class="col-sm-6">
                                        <small class="text-muted">License Plate:</small>
                                        <div class="fw-bold">{{ reservation.license_plate }}</div>
                                    </div>
                                </div>
                                <div class="mt-2">
                                    <small class="text-muted">Parked since:</small>
                                    <div class="fw-bold">{{ formatDateTime(reservation.parking_timestamp) }}</div>
                                    <small class="text-primary">Duration: {{ calculateDuration(reservation.parking_timestamp) }}</small>
                                </div>
                            </div>
                            <div class="col-md-4 text-md-end">
                                <button 
                                    class="btn btn-danger btn-lg"
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

                <!-- No active reservations -->
                <div v-if="activeReservations.length === 0" class="text-center py-5">
                    <i class="bi bi-car-front text-muted" style="font-size: 3rem;"></i>
                    <h5 class="text-muted mt-3">No active reservations</h5>
                    <p class="text-muted">Reserve a parking spot to see it here</p>
                </div>
            </div>

            <!-- Release Confirmation Modal -->
            <div class="modal fade" id="releaseModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-exclamation-triangle me-2"></i>Confirm Release
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div v-if="reservationToRelease">
                                <p>Are you sure you want to release this parking spot?</p>
                                <div class="alert alert-info">
                                    <strong>{{ reservationToRelease.lot_name }}</strong><br>
                                    <strong>Spot:</strong> {{ reservationToRelease.spot_number }}<br>
                                    <strong>License:</strong> {{ reservationToRelease.license_plate }}<br>
                                    <strong>Duration:</strong> {{ calculateDuration(reservationToRelease.parking_timestamp) }}
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger" @click="releaseSpot">
                                <i class="bi bi-check-circle me-1"></i> Yes, Release
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