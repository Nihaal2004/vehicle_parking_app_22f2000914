import { getAuthHeader } from '../../utils/auth.js';

export const ParkingLotDetails = {
    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3>Parking Lot Details: {{ parkingLot.name }}</h3>
                <div>
                    <router-link :to="'/admin/parking-lots/' + parkingLot.id + '/edit'" class="btn btn-warning mx-1">
                        <i class="bi bi-pencil"></i> Edit
                    </router-link>
                    <router-link to="/admin/parking-lots" class="btn btn-secondary">
                        <i class="bi bi-arrow-left"></i> Back
                    </router-link>
                </div>
            </div>
            
            <div v-if="loading" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            
            <div v-if="parkingLot" class="card mb-4">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h5>Basic Information</h5>
                            <p><strong>Name:</strong> {{ parkingLot.name }}</p>
                            <p><strong>Address:</strong> {{ parkingLot.address }}</p>
                            <p><strong>Pincode:</strong> {{ parkingLot.pincode }}</p>
                        </div>
                        <div class="col-md-6">
                            <h5>Capacity & Pricing</h5>
                            <p><strong>Total Spots:</strong> {{ parkingLot.total_spots }}</p>
                            <p><strong>Available Spots:</strong> {{ availableSpotsCount }}</p>
                            <p><strong>Price per hour:</strong> $ {{ parkingLot.price.toFixed(2) }}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <h4 class="mb-3">Parking Spots</h4>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Spot ID</th>
                            <th>Spot Number</th>
                            <th>Status</th>
                            <th>Reserved By</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="spot in parkingSpots" :key="spot.id">
                            <td>{{ spot.id }}</td>
                            <td>{{ spot.spot_number }}</td>
                            <td>
                                <span :class="{
                                    'badge bg-success': spot.status === 'A',
                                    'badge bg-danger': spot.status === 'O'
                                }">
                                    {{ spot.status === 'A' ? 'Available' : 'Occupied' }}
                                </span>
                            </td>
                            <td>
                                <span v-if="spot.reservation">
                                    {{ spot.reservation.user.username }} ({{ spot.reservation.license_plate }})
                                </span>
                                <span v-else>--</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
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