import { getAuthHeader } from '../../utils/auth.js';

export const ParkingLotForm = {
    template: `
    <div class="container-fluid p-0">
        <div class="d-flex align-items-center mb-4 pb-3 border-bottom border-2 border-primary">
            <div class="bg-primary bg-gradient rounded-circle p-3 me-3">
                <i class="bi bi-building-add text-white fs-4"></i>
            </div>
            <div>
                <h2 class="mb-1 fw-bold text-dark">
                    {{ isEdit ? 'Edit Parking Lot' : 'Create New Parking Lot' }}
                </h2>
                <p class="text-muted mb-0">
                    {{ isEdit ? 'Update parking lot information' : 'Add a new parking location to your system' }}
                </p>
            </div>
        </div>
        
        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted mt-3">{{ isEdit ? 'Loading parking lot data...' : 'Processing...' }}</p>
        </div>
        
        <div v-if="error" class="alert alert-danger border-0 rounded-4 shadow-sm mb-4">
            <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
        </div>
        
        <div class="card border-0 shadow-lg rounded-4">
            <div class="card-header bg-gradient text-white border-0 rounded-top-4 py-3"
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <h5 class="mb-0">
                    <i class="bi bi-form-control me-2"></i>Parking Lot Details
                </h5>
            </div>
            <div class="card-body p-4">
                <form @submit.prevent="submitForm">
                    <div class="row">
                        <div class="col-lg-6 mb-4">
                            <label class="form-label fw-semibold text-dark mb-2">
                                <i class="bi bi-building me-2 text-primary"></i>Parking Lot Name
                            </label>
                            <input type="text" v-model="formData.name" 
                                class="form-control form-control-lg border-2 rounded-3" 
                                placeholder="Enter parking lot name" required>
                        </div>
                        
                        <div class="col-lg-6 mb-4">
                            <label class="form-label fw-semibold text-dark mb-2">
                                <i class="bi bi-geo-alt me-2 text-success"></i>PIN Code
                            </label>
                            <input type="text" v-model="formData.pincode" 
                                class="form-control form-control-lg border-2 rounded-3" 
                                placeholder="Enter PIN code" required>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <label class="form-label fw-semibold text-dark mb-2">
                            <i class="bi bi-map me-2 text-warning"></i>Full Address
                        </label>
                        <textarea v-model="formData.address" 
                            class="form-control form-control-lg border-2 rounded-3" 
                            rows="3" placeholder="Enter complete address" required></textarea>
                    </div>
                    
                    <div class="row">
                        <div class="col-lg-6 mb-4">
                            <label class="form-label fw-semibold text-dark mb-2">
                                <i class="bi bi-currency-dollar me-2 text-success"></i>Price per Hour ($)
                            </label>
                            <div class="input-group input-group-lg">
                                <span class="input-group-text bg-light border-2">$</span>
                                <input type="number" step="0.01" v-model="formData.price" 
                                    class="form-control border-2 rounded-end-3" 
                                    placeholder="0.00" required>
                            </div>
                        </div>
                        
                        <div class="col-lg-6 mb-4">
                            <label class="form-label fw-semibold text-dark mb-2">
                                <i class="bi bi-grid-3x3-gap me-2 text-info"></i>Total Parking Spots
                            </label>
                            <input type="number" v-model="formData.total_spots" 
                                class="form-control form-control-lg border-2 rounded-3" 
                                placeholder="Enter number of spots" required min="1">
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between pt-3 border-top">
                        <router-link to="/admin/parking-lots" 
                            class="btn btn-secondary bg-gradient btn-lg rounded-pill px-5">
                            <i class="bi bi-x-circle me-2"></i>Cancel
                        </router-link>
                        <button type="submit" class="btn btn-primary bg-gradient btn-lg rounded-pill px-5">
                            <i class="bi bi-check-circle me-2"></i>
                            {{ isEdit ? 'Update Parking Lot' : 'Create Parking Lot' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
`,
    props: {
        lotId: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            formData: {
                name: '',
                address: '',
                pincode: '',
                price: 0,
                total_spots: 10
            },
            loading: false,
            error: '',
            isEdit: false
        }
    },
    created() {
        this.isEdit = !!this.lotId;
        if (this.isEdit) {
            this.fetchParkingLot();
        }
    },
    methods: {
        fetchParkingLot() {
            this.loading = true;
            fetch(`/api/parking-lots/${this.lotId}`,{headers: getAuthHeader()})
            .then(res => res.json())
            .then(data => {
                this.formData = {
                    name: data.name,
                    address: data.address,
                    pincode: data.pincode,
                    price: data.price,
                    total_spots: data.total_spots
                };
                this.loading = false;
            })
            .catch(error => {
                this.error = 'Failed to fetch parking lot details';
                this.loading = false;
                console.error(error);
            });
        },
        submitForm() {
            this.loading = true;
            this.error = '';
            
            const url = this.isEdit 
                ? `/api/parking-lots/${this.lotId}` 
                : '/api/parking-lots';
                
            const method = this.isEdit ? 'PUT' : 'POST';
            
            fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' , ...getAuthHeader()},
                body: JSON.stringify(this.formData)
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    throw new Error(data.error);
                }
                this.$router.push('/admin/parking-lots');
            })
            .catch(error => {
                this.error = error.message || 'Operation failed';
                this.loading = false;
            });
        }
    }
};