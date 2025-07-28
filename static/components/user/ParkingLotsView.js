import { getAuthHeader } from '../../utils/auth.js';

export const ParkingLotsView = {
    template: `
    <div class="container-fluid p-0">
        <div class="row mb-4">
            <div class="col">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                        <div class="bg-info bg-gradient rounded-circle p-3 me-3">
                            <i class="bi bi-geo-alt text-white fs-4"></i>
                        </div>
                        <div>
                            <h2 class="mb-1 fw-bold text-dark">Available Parking Lots</h2>
                            <p class="text-muted mb-0">Find and reserve your perfect parking spot</p>
                        </div>
                    </div>
                    <button class="btn btn-primary bg-gradient btn-lg rounded-pill px-4" @click="loadParkingLots">
                        <i class="bi bi-arrow-clockwise me-2"></i>Refresh
                    </button>
                </div>
            </div>
        </div>

        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted mt-3">Loading parking lots...</p>
        </div>

        <div v-if="error" class="alert alert-danger border-0 rounded-4 shadow-sm">
            <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
        </div>

        <div v-else class="row">
            <div v-for="lot in parkingLots" :key="lot.id" class="col-md-6 col-xl-4 mb-4">
                <div class="card border-0 shadow-lg rounded-4 h-100" style="transition: transform 0.3s ease;">
                    <div class="card-header bg-gradient text-white border-0 rounded-top-4 py-3"
                         style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-building me-2"></i>
                            <h5 class="mb-0 fw-bold">{{ lot.name }}</h5>
                        </div>
                    </div>
                    
                    <div class="card-body p-4">
                        <div class="mb-3">
                            <div class="d-flex align-items-start">
                                <i class="bi bi-geo-alt text-warning me-2 mt-1"></i>
                                <div>
                                    <div class="text-dark">{{ lot.address }}</div>
                                    <small class="text-muted">PIN: {{ lot.pincode }}</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row mb-4">
                            <div class="col-6">
                                <div class="bg-success bg-gradient rounded-3 p-3 text-center text-white">
                                    <div class="fw-bold fs-4">{{ lot.available_spots }}</div>
                                    <div class="small opacity-75">Available</div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="bg-secondary bg-gradient rounded-3 p-3 text-center text-white">
                                    <div class="fw-bold fs-4">{{ lot.total_spots }}</div>
                                    <div class="small opacity-75">Total</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <div class="bg-light rounded-3 p-2">
                                <div class="progress" style="height: 8px;">
                                    <div class="progress-bar bg-success bg-gradient" 
                                         :style="{ width: (lot.available_spots / lot.total_spots * 100) + '%' }">
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between mt-2">
                                    <small class="text-muted">Occupancy</small>
                                    <small class="text-muted">{{ Math.round((lot.total_spots - lot.available_spots) / lot.total_spots * 100) }}%</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="d-flex align-items-center justify-content-between">
                            <div class="bg-warning bg-gradient rounded-3 px-3 py-2">
                                <div class="fw-bold text-dark fs-5">
                                    <i class="bi bi-currency-dollar"></i>$ {{ lot.price }}/hr
                                </div>
                            </div>
                            <button class="btn bg-gradient btn-lg rounded-pill px-4"
                                    :class="lot.available_spots > 0 ? 'btn-primary' : 'btn-secondary'"
                                    :disabled="lot.available_spots === 0"
                                    @click="openReservationModal(lot)">
                                <i class="bi bi-plus-circle me-2"></i>
                                {{ lot.available_spots > 0 ? 'Reserve Now' : 'Full' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="!loading && parkingLots.length === 0" class="text-center py-5">
            <div class="bg-light rounded-circle mx-auto mb-4" style="width: 120px; height: 120px; display: flex; align-items: center; justify-content: center;">
                <i class="bi bi-exclamation-circle text-muted" style="font-size: 3rem;"></i>
            </div>
            <h4 class="text-muted mb-2">No Parking Lots Available</h4>
            <p class="text-muted">Check back later for available parking spots</p>
        </div>

        <!-- Reservation Modal -->
        <div class="modal fade" id="reservationModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4">
                    <div class="modal-header bg-gradient text-white border-0 rounded-top-4"
                         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                        <h5 class="modal-title fw-bold">
                            <i class="bi bi-car-front me-2"></i>Reserve Parking Spot
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4">
                        <div v-if="selectedLot">
                            <div class="card bg-light border-0 rounded-3 mb-4">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-sm-8">
                                            <h6 class="fw-bold text-primary mb-1">{{ selectedLot.name }}</h6>
                                            <small class="text-muted">{{ selectedLot.address }}</small>
                                        </div>
                                        <div class="col-sm-4 text-end">
                                            <div class="bg-warning bg-gradient rounded-pill px-3 py-1 d-inline-block">
                                                <small class="fw-bold text-dark">$ {{ selectedLot.price }}/hour</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <form @submit.prevent="createReservation">
                                <div class="mb-4">
                                    <label class="form-label fw-semibold text-dark mb-2">
                                        <i class="bi bi-car-front me-2 text-primary"></i>License Plate Number *
                                    </label>
                                    <input type="text" 
                                        class="form-control form-control-lg border-2 rounded-3" 
                                        v-model="reservationForm.license_plate"
                                        placeholder="e.g., ABC123"
                                        required>
                                </div>
                                
                                <button type="submit" class="btn btn-primary bg-gradient btn-lg w-100 rounded-pill" :disabled="reservationLoading">
                                    <span v-if="reservationLoading" class="spinner-border spinner-border-sm me-2"></span>
                                    <i v-else class="bi bi-check-circle me-2"></i>
                                    {{ reservationLoading ? 'Creating Reservation...' : 'Confirm Reservation' }}
                                </button>
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