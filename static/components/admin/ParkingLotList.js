import { getAuthHeader } from '../../utils/auth.js';

export const ParkingLotList = {
    template: `
    <div class="container-fluid p-0">
        <div class="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-2 border-primary">
            <div class="d-flex align-items-center">
                <div class="bg-primary bg-gradient rounded-circle p-3 me-3">
                    <i class="bi bi-buildings text-white fs-4"></i>
                </div>
                <div>
                    <h2 class="mb-1 fw-bold text-dark">Parking Lots Management</h2>
                    <p class="text-muted mb-0">Manage all your parking locations</p>
                </div>
            </div>
            <router-link to="/admin/parking-lots/create" 
                class="btn btn-primary bg-gradient btn-lg rounded-pill px-4">
                <i class="bi bi-plus-circle me-2"></i>Add New Lot
            </router-link>
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
        
        <div class="card border-0 shadow-lg rounded-4">
            <div class="card-header bg-gradient text-white border-0 rounded-top-4 py-3"
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div class="d-flex align-items-center">
                    <i class="bi bi-table me-2"></i>
                    <h5 class="mb-0">All Parking Lots</h5>
                    <span class="badge bg-white text-primary ms-auto px-3 py-2 rounded-pill">
                        {{ parkingLots.length }} Total
                    </span>
                </div>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="bg-light">
                            <tr>
                                <th class="border-0 py-3 px-4 fw-semibold text-dark">ID</th>
                                <th class="border-0 py-3 px-4 fw-semibold text-dark">Name</th>
                                <th class="border-0 py-3 px-4 fw-semibold text-dark">Address</th>
                                <th class="border-0 py-3 px-4 fw-semibold text-dark">PIN</th>
                                <th class="border-0 py-3 px-4 fw-semibold text-dark">Price</th>
                                <th class="border-0 py-3 px-4 fw-semibold text-dark">Total</th>
                                <th class="border-0 py-3 px-4 fw-semibold text-dark">Available</th>
                                <th class="border-0 py-3 px-4 fw-semibold text-dark">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="lot in parkingLots" :key="lot.id" 
                                class="border-bottom border-light" style="transition: all 0.3s ease;">
                                <td class="py-3 px-4">
                                    <span class="badge bg-secondary bg-gradient px-3 py-2 rounded-pill fw-semibold">
                                        #{{ lot.id }}
                                    </span>
                                </td>
                                <td class="py-3 px-4">
                                    <div class="fw-bold text-dark">{{ lot.name }}</div>
                                </td>
                                <td class="py-3 px-4 text-muted">{{ lot.address }}</td>
                                <td class="py-3 px-4">
                                    <code class="bg-light px-2 py-1 rounded text-dark">{{ lot.pincode }}</code>
                                </td>
                                <td class="py-3 px-4">
                                    <span class="fw-bold text-success">$ {{ lot.price.toFixed(2) }}</span>
                                </td>
                                <td class="py-3 px-4">
                                    <span class="badge bg-primary bg-gradient px-3 py-2 rounded-pill">
                                        {{ lot.total_spots }}
                                    </span>
                                </td>
                                <td class="py-3 px-4">
                                    <span class="badge bg-success bg-gradient px-3 py-2 rounded-pill">
                                        {{ lot.available_spots }}
                                    </span>
                                </td>
                                <td class="py-3 px-4">
                                    <div class="btn-group" role="group">
                                        <router-link :to="'/admin/parking-lots/' + lot.id" 
                                            class="btn btn-info btn-sm rounded-pill px-3">
                                            <i class="bi bi-eye"></i>
                                        </router-link>
                                        <router-link :to="'/admin/parking-lots/' + lot.id + '/edit'" 
                                            class="btn btn-warning btn-sm rounded-pill px-3 mx-1">
                                            <i class="bi bi-pencil"></i>
                                        </router-link>
                                        <button @click="deleteLot(lot.id)" 
                                            class="btn btn-danger btn-sm rounded-pill px-3">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div v-if="parkingLots.length === 0 && !loading" class="text-center py-5">
            <div class="bg-light rounded-circle mx-auto mb-4" style="width: 120px; height: 120px; display: flex; align-items: center; justify-content: center;">
                <i class="bi bi-building-x text-muted" style="font-size: 3rem;"></i>
            </div>
            <h4 class="text-muted mb-2">No Parking Lots Found</h4>
            <p class="text-muted">Create your first parking lot to get started</p>
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