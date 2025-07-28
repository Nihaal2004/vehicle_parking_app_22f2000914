import { getAuthHeader } from '../../utils/auth.js';

export const ParkingLotForm = {
    template: `
        <div>
            <h3 v-if="isEdit">Edit Parking Lot</h3>
            <h3 v-else>Create New Parking Lot</h3>
            
            <div v-if="loading" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            
            <form @submit.prevent="submitForm">
                <div class="mb-3">
                    <label class="form-label">Name</label>
                    <input type="text" v-model="formData.name" class="form-control" required>
                </div>
                
                <div class="mb-3">
                    <label class="form-label">Address</label>
                    <textarea v-model="formData.address" class="form-control" required></textarea>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">Pincode</label>
                        <input type="text" v-model="formData.pincode" class="form-control" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Price per hour ($)</label>
                        <input type="number" step="0.01" v-model="formData.price" class="form-control" required>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label class="form-label">Total Parking Spots</label>
                    <input type="number" v-model="formData.total_spots" class="form-control" required min="1">
                </div>
                
                <div class="d-flex justify-content-between">
                    <router-link to="/admin/parking-lots" class="btn btn-secondary">Cancel</router-link>
                    <button type="submit" class="btn btn-primary">
                        {{ isEdit ? 'Update' : 'Create' }}
                    </button>
                </div>
            </form>
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