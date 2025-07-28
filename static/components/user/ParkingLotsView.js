import { getAuthHeader } from '../../utils/auth.js';

export const ParkingLotsView = {
    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3><i class="bi bi-geo-alt me-2"></i>Available Parking Lots</h3>
                <button class="btn btn-primary" @click="loadParkingLots">
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

            <!-- Parking Lots Grid -->
            <div v-else class="row">
                <div v-for="lot in parkingLots" :key="lot.id" class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">
                                <i class="bi bi-building me-2"></i>{{ lot.name }}
                            </h5>
                            <p class="card-text text-muted">
                                <i class="bi bi-geo-alt me-1"></i>{{ lot.address }}<br>
                                <small>PIN: {{ lot.pincode }}</small>
                            </p>
                            
                            <div class="mb-3">
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="badge bg-success fs-6">
                                        {{ lot.available_spots }} Available
                                    </span>
                                    <span class="text-muted">
                                        / {{ lot.total_spots }} Total
                                    </span>
                                </div>
                                <div class="progress mt-2" style="height: 8px;">
                                    <div class="progress-bar bg-success" 
                                         :style="{ width: (lot.available_spots / lot.total_spots * 100) + '%' }">
                                    </div>
                                </div>
                            </div>

                            <div class="d-flex justify-content-between align-items-center">
                                <h6 class="text-primary mb-0">
                                    <i class="bi bi-currency-dollar me-1"></i>$ {{ lot.price }}/hour
                                </h6>
                                <button 
                                    class="btn btn-primary btn-sm"
                                    :disabled="lot.available_spots === 0"
                                    @click="openReservationModal(lot)">
                                    <i class="bi bi-plus-circle me-1"></i>
                                    {{ lot.available_spots > 0 ? 'Reserve' : 'Full' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- No lots message -->
            <div v-if="!loading && parkingLots.length === 0" class="text-center py-5">
                <i class="bi bi-exclamation-circle text-muted" style="font-size: 3rem;"></i>
                <h5 class="text-muted mt-3">No parking lots available</h5>
            </div>

            <!-- Reservation Modal -->
            <div class="modal fade" id="reservationModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-car-front me-2"></i>Reserve Parking Spot
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div v-if="selectedLot">
                                <div class="alert alert-info">
                                    <strong>{{ selectedLot.name }}</strong><br>
                                    <small>{{ selectedLot.address }}</small><br>
                                    <small>Rate: $ {{ selectedLot.price }}/hour</small>
                                </div>
                                
                                <form @submit.prevent="createReservation">
                                    <div class="mb-3">
                                        <label class="form-label">License Plate Number *</label>
                                        <input 
                                            type="text" 
                                            class="form-control" 
                                            v-model="reservationForm.license_plate"
                                            placeholder="e.g., ABC123"
                                            required>
                                    </div>
                                    
                                    <div class="d-grid gap-2">
                                        <button type="submit" class="btn btn-primary" :disabled="reservationLoading">
                                            <span v-if="reservationLoading" class="spinner-border spinner-border-sm me-2"></span>
                                            <i v-else class="bi bi-check-circle me-2"></i>
                                            {{ reservationLoading ? 'Creating...' : 'Confirm Reservation' }}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            parkingLots: [],
            loading: false,
            error: '',
            selectedLot: null,
            reservationForm: {
                license_plate: ''
            },
            reservationLoading: false
        }
    },
    mounted() {
        this.loadParkingLots();
    },
    methods: {
        loadParkingLots() {
            this.loading = true;
            this.error = '';
            fetch('/api/parking-lots', { headers: getAuthHeader() })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to load parking lots');
                    return response.json();
                })
                .then(data => {
                    this.parkingLots = data;
                    this.loading = false;
                })
                .catch(error => {
                    this.error = 'Error loading parking lots';
                    this.loading = false;
                    console.error('Error loading parking lots:', error);
                });
        },
        
        openReservationModal(lot) {
            this.selectedLot = lot;
            this.reservationForm.license_plate = '';
            const modal = new bootstrap.Modal(document.getElementById('reservationModal'));
            modal.show();
        },
        
        createReservation() {
            this.reservationLoading = true;
            fetch('/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({
                    lot_id: this.selectedLot.id,
                    license_plate: this.reservationForm.license_plate
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => Promise.reject(err));
                }
                return response.json();
            })
            .then(data => {
                alert(`Reservation successful! Spot: ${data.spot_number}`);
                
                const modal = bootstrap.Modal.getInstance(document.getElementById('reservationModal'));
                modal.hide();
                
                this.loadParkingLots(); // Refresh the list
                this.$emit('reservation-created');
            })
            .catch(error => {
                console.error('Error creating reservation:', error);
                alert(error.error || 'Error creating reservation');
            })
            .finally(() => {
                this.reservationLoading = false;
            });
        }
    }
};