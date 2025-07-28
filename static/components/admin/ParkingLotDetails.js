import { getAuthHeader } from '../../utils/auth.js';

export const ParkingLotDetails = {
    template: `
    <div class="container-fluid p-0">
        <div class="row mb-4">
            <div class="col">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                        <div class="bg-primary bg-gradient rounded-circle p-3 me-3">
                            <i class="bi bi-building text-white fs-4"></i>
                        </div>
                        <div>
                            <h2 class="mb-1 fw-bold text-dark">{{ parkingLot.name }}</h2>
                            <p class="text-muted mb-0">Detailed parking lot information</p>
                        </div>
                    </div>
                    <div class="d-flex gap-2">
                        <router-link :to="'/admin/parking-lots/' + parkingLot.id + '/edit'" 
                            class="btn btn-warning bg-gradient btn-lg rounded-pill px-4">
                            <i class="bi bi-pencil-square me-2"></i>Edit Details
                        </router-link>
                        <router-link to="/admin/parking-lots" 
                            class="btn btn-secondary bg-gradient btn-lg rounded-pill px-4">
                            <i class="bi bi-arrow-left me-2"></i>Back to List
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
        
        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted mt-3">Loading parking lot details...</p>
        </div>
        
        <div v-if="error" class="alert alert-danger border-0 rounded-4 shadow-sm">
            <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
        </div>
        
        <div v-if="parkingLot" class="row mb-4">
            <div class="col-lg-6 mb-4">
                <div class="card border-0 shadow-lg rounded-4 h-100">
                    <div class="card-header bg-gradient text-white border-0 rounded-top-4 py-3"
                         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                        <h5 class="mb-0">
                            <i class="bi bi-info-circle me-2"></i>Basic Information
                        </h5>
                    </div>
                    <div class="card-body p-4">
                        <div class="mb-3">
                            <label class="text-muted fw-semibold mb-2">Parking Lot Name</label>
                            <p class="h5 text-dark mb-0 fw-bold">{{ parkingLot.name }}</p>
                        </div>
                        <div class="mb-3">
                            <label class="text-muted fw-semibold mb-2">Address</label>
                            <p class="text-dark mb-0">{{ parkingLot.address }}</p>
                        </div>
                        <div>
                            <label class="text-muted fw-semibold mb-2">PIN Code</label>
                            <span class="badge bg-light text-dark px-3 py-2 rounded-pill fw-bold fs-6">
                                {{ parkingLot.pincode }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-6 mb-4">
                <div class="card border-0 shadow-lg rounded-4 h-100">
                    <div class="card-header bg-gradient text-white border-0 rounded-top-4 py-3"
                         style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                        <h5 class="mb-0">
                            <i class="bi bi-graph-up me-2"></i>Capacity & Pricing
                        </h5>
                    </div>
                    <div class="card-body p-4">
                        <div class="row">
                            <div class="col-6 mb-3">
                                <label class="text-muted fw-semibold mb-2">Total Spots</label>
                                <div class="bg-primary bg-gradient rounded-3 p-3 text-center">
                                    <h4 class="text-white mb-0 fw-bold">{{ parkingLot.total_spots }}</h4>
                                </div>
                            </div>
                            <div class="col-6 mb-3">
                                <label class="text-muted fw-semibold mb-2">Available</label>
                                <div class="bg-success bg-gradient rounded-3 p-3 text-center">
                                    <h4 class="text-white mb-0 fw-bold">{{ availableSpotsCount }}</h4>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label class="text-muted fw-semibold mb-2">Price per Hour</label>
                            <div class="bg-warning bg-gradient rounded-3 p-3 text-center">
                                <h4 class="text-dark mb-0 fw-bold">$ {{ parkingLot.price.toFixed(2) }}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card border-0 shadow-lg rounded-4">
            <div class="card-header bg-gradient text-white border-0 rounded-top-4 py-3"
                 style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                <h4 class="mb-0">
                    <i class="bi bi-grid-3x3-gap me-2"></i>Parking Spots Overview
                </h4>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="bg-light">
                            <tr>
                                <th class="border-0 py-3 px-4 fw-semibold">Spot ID</th>
                                <th class="border-0 py-3 px-4 fw-semibold">Spot Number</th>
                                <th class="border-0 py-3 px-4 fw-semibold">Status</th>
                                <th class="border-0 py-3 px-4 fw-semibold">Reserved By</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="spot in parkingSpots" :key="spot.id" class="border-bottom border-light">
                                <td class="py-3 px-4 text-muted">#{{ spot.id }}</td>
                                <td class="py-3 px-4">
                                    <span class="badge bg-info bg-gradient text-white px-3 py-2 rounded-pill fw-semibold">
                                        {{ spot.spot_number }}
                                    </span>
                                </td>
                                <td class="py-3 px-4">
                                    <span :class="{
                                        'badge bg-success bg-gradient px-3 py-2 rounded-pill fw-semibold': spot.status === 'A',
                                        'badge bg-danger bg-gradient px-3 py-2 rounded-pill fw-semibold': spot.status === 'O'
                                    }">
                                        <i :class="{
                                            'bi bi-check-circle me-1': spot.status === 'A',
                                            'bi bi-x-circle me-1': spot.status === 'O'
                                        }"></i>
                                        {{ spot.status === 'A' ? 'Available' : 'Occupied' }}
                                    </span>
                                </td>
                                <td class="py-3 px-4">
                                    <div v-if="spot.reservation" class="d-flex align-items-center">
                                        <div class="bg-primary bg-gradient rounded-circle p-2 me-2">
                                            <i class="bi bi-person-fill text-white small"></i>
                                        </div>
                                        <div>
                                            <div class="fw-semibold text-dark">{{ spot.reservation.user.username }}</div>
                                            <small class="text-muted">({{ spot.reservation.license_plate }})</small>
                                        </div>
                                    </div>
                                    <span v-else class="text-muted">—</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
`,
    props: {
        lotId: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            parkingLot: null,
            parkingSpots: [],
            loading: false,
            error: ''
        }
    },
    computed: {
        availableSpotsCount() {
            return this.parkingSpots.filter(spot => spot.status === 'A').length;
        }
    },
    mounted() {
        this.fetchParkingLotDetails();
    },
    methods: {
        fetchParkingLotDetails() {
            this.loading = true;
            Promise.all([
                fetch(`/api/parking-lots/${this.lotId}`,{headers: getAuthHeader()}).then(res => res.json()),
                fetch(`/api/parking-lots/${this.lotId}/spots`,{headers: getAuthHeader()}).then(res => res.json())
            ])
            .then(([lotData, spotsData]) => {
                this.parkingLot = lotData;
                this.parkingSpots = spotsData.spots;
                this.loading = false;
            })
            .catch(error => {
                this.error = 'Failed to fetch parking lot details';
                this.loading = false;
                console.error(error);
            });
        }
    }
};