const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token
    ? { 'Authentication-Token': token }
    : {};
};

// Component definitions
const Login = {
    template: `
        <div class="col-md-6 mx-auto">
            <h2 class="mb-4">Login</h2>
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            <div v-if="success" class="alert alert-success">{{ success }}</div>
            <form @submit.prevent="login" class="mb-3">
                <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input type="email" v-model="loginForm.email" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input type="password" v-model="loginForm.password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary">Login</button>
            </form>
            <p>Not registered? <router-link to="/register">Register here</router-link></p>
        </div>
    `,
    data() {
        return {
            loginForm: { email: '', password: '' },
            error: '',
            success: ''
        }
    },
    methods: {
        login() {
            this.error = '';
            fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.loginForm)
            })
            .then(res => res.json().then(data => ({ status: res.status, data })))
            .then(({status, data}) => {
                if (status === 200) {
                    // Store token in localStorage
                    localStorage.setItem('authToken', data.token);
                    
                    if (data.user.roles.includes('admin')) {
                        this.$router.push('/admin');
                    } else {
                        this.$router.push('/dashboard');
                    }
                } else {
                    this.error = data.error || 'Login failed';
                }
            })
            .catch(() => { this.error = 'Login failed'; });
        }
    }
};

const Register = {
    template: `
        <div class="col-md-6 mx-auto">
            <h2 class="mb-4">User Registration</h2>
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            <form @submit.prevent="register">
                <div class="mb-3">
                    <label class="form-label">Username</label>
                    <input type="text" v-model="registerForm.username" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input type="email" v-model="registerForm.email" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input type="password" v-model="registerForm.password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary">Register</button>
                <router-link to="/login" class="btn btn-link">Back to Login</router-link>
            </form>
        </div>
    `,
    data() {
        return {
            registerForm: { username: '', email: '', password: '' },
            error: ''
        }
    },
    methods: {
        register() {
            this.error = '';
            fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.registerForm)
            })
            .then(res => res.json().then(data => ({ status: res.status, data })))
            .then(({status, data}) => {
                if (status === 201) {
                    this.$router.push('/login');
                } else {
                    this.error = data.error || 'Registration failed';
                }
            })
            .catch(() => { this.error = 'Registration failed'; });
        }
    }
};

// ADMIN COMPONENTS
const AdminDashboard = {
    template: `
        <div class="col-md-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Admin Dashboard</h2>
                <button @click="logout" class="btn btn-danger">Logout</button>
            </div>
            
            <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
                <div class="container-fluid">
                    <div class="collapse navbar-collapse">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item">
                                <router-link to="/admin/parking-lots" class="nav-link">Parking Lots</router-link>
                            </li>
                            <li class="nav-item">
                                <router-link to="/admin/users" class="nav-link">Users</router-link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            
            <router-view></router-view>
        </div>
    `,
    methods: {
        logout() {
            fetch('/api/logout', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            })
            .then(() => {
                localStorage.removeItem('authToken');
                this.$router.push('/login');
            });
        }
    }
};

const ParkingLotList = {
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

const ParkingLotForm = {
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

const ParkingLotDetails = {
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

const UserList = {
    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3>Users Management</h3>
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
                            <th>Username</th>
                            <th>Email</th>
                            <th>Current Spot</th>
                            <th>Total Reservations</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in users" :key="user.id">
                            <td>{{ user.id }}</td>
                            <td>{{ user.username }}</td>
                            <td>{{ user.email }}</td>
                            <td>
                                <span v-if="user.current_spot">
                                    {{ user.current_spot }} 
                                    <span class="badge bg-info">Active</span>
                                </span>
                                <span v-else>--</span>
                            </td>
                            <td>{{ user.total_reservations }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `,
    data() {
        return {
            users: [],
            loading: false,
            error: ''
        }
    },
    mounted() {
        this.fetchUsers();
    },
    methods: {
        fetchUsers() {
            this.loading = true;
            fetch('/api/admin/users', {
                headers: { 'Content-Type': 'application/json' ,...getAuthHeader()}
            })
            .then(res => res.json())
            .then(data => {
                this.users = data;
                this.loading = false;
            })
            .catch(error => {
                this.error = 'Failed to fetch users';
                this.loading = false;
                console.error(error);
            });
        }
    }
};

const UserDashboard = {
    template: `
        <div class="col-md-12">
            <h2>User Dashboard</h2>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3>Welcome!</h3>
                <button @click="logout" class="btn btn-danger">Logout</button>
            </div>
        </div>
    `,
    methods: {
        logout() {
            fetch('/api/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' ,...getAuthHeader()}
            })
            .then(() => {
                this.$router.push('/login');
            });
        }
    }
};

// Router configuration
const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { 
        path: '/admin',
        component: AdminDashboard,
        children: [
            { path: '', redirect: 'parking-lots' },
            { path: 'parking-lots', component: ParkingLotList },
            { path: 'parking-lots/create', component: ParkingLotForm },
            { 
                path: 'parking-lots/:lotId', 
                component: ParkingLotDetails,
                props: true
            },
            { 
                path: 'parking-lots/:lotId/edit', 
                component: ParkingLotForm,
                props: true
            },
            { path: 'users', component: UserList }
        ]
    },
    { path: '/dashboard', component: UserDashboard }
];

const router = new VueRouter({
    routes
});

// Create Vue instance
new Vue({
    router
}).$mount('#app');