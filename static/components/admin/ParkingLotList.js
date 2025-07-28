import { getAuthHeader } from '../../utils/auth.js';

export const ParkingLotList = {
    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3>Parking Lots Management</h3>
                <router-link to="/admin/parking-lots/create" class="btn btn-primary">
                    <i class="bi bi-plus-circle"></i> Create New
                </router-link>
            </div>
            
            <div v-if="loading" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Address</th>
                            <th>Pincode</th>
                            <th>Price</th>
                            <th>Total Spots</th>
                            <th>Available</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="lot in parkingLots" :key="lot.id">
                            <td>{{ lot.id }}</td>
                            <td>{{ lot.name }}</td>
                            <td>{{ lot.address }}</td>
                            <td>{{ lot.pincode }}</td>
                            <td>$ {{ lot.price.toFixed(2) }}</td>
                            <td>{{ lot.total_spots }}</td>
                            <td>{{ lot.available_spots }}</td>
                            <td>
                                <router-link :to="'/admin/parking-lots/' + lot.id" class="btn btn-sm btn-info">
                                    <i class="bi bi-eye"></i>
                                </router-link>
                                <router-link :to="'/admin/parking-lots/' + lot.id + '/edit'" class="btn btn-sm btn-warning mx-1">
                                    <i class="bi bi-pencil"></i>
                                </router-link>
                                <button @click="deleteLot(lot.id)" class="btn btn-sm btn-danger">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `,
    data() {
        return {
            parkingLots: [],
            loading: false,
            error: ''
        }
    },
    mounted() {
        this.fetchParkingLots();
    },
    methods: {
        fetchParkingLots() {
            this.loading = true;
            this.error = '';
            
            fetch('/api/parking-lots', {
                headers: { 'Content-Type': 'application/json',
                            ...getAuthHeader()
                 }
            })
            .then(res => res.json())
            .then(data => {
                this.parkingLots = data;
                this.loading = false;
            })
            .catch(error => {
                this.error = 'Failed to fetch parking lots';
                this.loading = false;
                console.error(error);
            });
        },
        deleteLot(lotId) {
            if (!confirm('Are you sure you want to delete this parking lot?')) return;
            
            fetch(`/api/parking-lots/${lotId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
            })
            .then(res => {
                if (res.ok) {
                    this.fetchParkingLots();
                } else {
                    throw new Error('Deletion failed');
                }
            })
            .catch(error => {
                this.error = 'Failed to delete parking lot';
                console.error(error);
            });
        }
    }
};