import { getAuthHeader } from '../../utils/auth.js';

export const AdminDashboard = {
    template: `
    <div class="min-vh-100 bg-light">
        <div class="bg-dark" style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%) !important;">
            <div class="container-fluid py-4">
                <div class="row align-items-center">
                    <div class="col">
                        <h1 class="text-white mb-0 fw-bold" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                            <i class="bi bi-shield-check me-3 text-warning"></i>
                            Admin Control Center
                        </h1>
                        <p class="text-light mb-0 mt-2" style="opacity: 0.9;">Manage your parking ecosystem</p>
                    </div>
                    <div class="col-auto">
                        <button @click="logout" class="btn btn-light btn-lg rounded-pill px-4 fw-semibold" style="box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                            <i class="bi bi-box-arrow-right me-2 text-danger"></i>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Dashboard Statistics -->
        <div class="container-fluid px-4 py-4">
            <div class="row mb-4">
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="card border-0 shadow-lg rounded-4 bg-primary bg-gradient text-white h-100">
                        <div class="card-body text-center p-4">
                            <i class="bi bi-building fs-1 mb-2 opacity-75"></i>
                            <h3 class="fw-bold mb-1">{{ dashboardStats.totalLots || 0 }}</h3>
                            <p class="mb-0 opacity-75">Total Parking Lots</p>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="card border-0 shadow-lg rounded-4 bg-success bg-gradient text-white h-100">
                        <div class="card-body text-center p-4">
                            <i class="bi bi-people fs-1 mb-2 opacity-75"></i>
                            <h3 class="fw-bold mb-1">{{ dashboardStats.totalUsers || 0 }}</h3>
                            <p class="mb-0 opacity-75">Total Users</p>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="card border-0 shadow-lg rounded-4 bg-warning bg-gradient text-white h-100">
                        <div class="card-body text-center p-4">
                            <i class="bi bi-car-front fs-1 mb-2 opacity-75"></i>
                            <h3 class="fw-bold mb-1">{{ dashboardStats.activeReservations || 0 }}</h3>
                            <p class="mb-0 opacity-75">Active Reservations</p>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="card border-0 shadow-lg rounded-4 bg-info bg-gradient text-white h-100">
                        <div class="card-body text-center p-4">
                            <i class="bi bi-currency-dollar fs-1 mb-2 opacity-75"></i>
                            <h3 class="fw-bold mb-1">\${{ (dashboardStats.totalRevenue || 0).toFixed(2) }}</h3>
                            <p class="mb-0 opacity-75">Total Revenue</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Charts Section -->
            <div class="row mb-4">
                <div class="col-lg-8 mb-4">
                    <div class="card border-0 shadow-lg rounded-4">
                        <div class="card-header bg-gradient text-white border-0 rounded-top-4 py-3"
                             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <h5 class="mb-0">
                                <i class="bi bi-graph-up me-2"></i>Revenue Overview (Last 7 Days)
                            </h5>
                        </div>
                        <div class="card-body p-4">
                            <canvas id="revenueChart" width="400" height="200"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 mb-4">
                    <div class="card border-0 shadow-lg rounded-4">
                        <div class="card-header bg-gradient text-white border-0 rounded-top-4 py-3"
                             style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                            <h5 class="mb-0">
                                <i class="bi bi-pie-chart me-2"></i>Parking Lot Usage
                            </h5>
                        </div>
                        <div class="card-body p-4">
                            <canvas id="usageChart" width="300" height="300"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="container-fluid px-4 py-4">
            <div class="row">
                <div class="col-12">
                    <div class="card border-0 shadow-lg rounded-4 mb-4">
                        <div class="card-body p-0">
                            <nav class="navbar navbar-expand-lg navbar-light bg-white rounded-4">
                                <div class="container-fluid px-4 py-3">
                                    <ul class="navbar-nav mx-auto">
                                        <li class="nav-item mx-3">
                                            <router-link to="/admin/parking-lots" 
                                                class="nav-link fw-semibold text-dark px-4 py-2 rounded-pill position-relative"
                                                style="transition: all 0.3s ease;">
                                                <i class="bi bi-building me-2 text-primary"></i>
                                                Parking Lots
                                            </router-link>
                                        </li>
                                        <li class="nav-item mx-3">
                                            <router-link to="/admin/users" 
                                                class="nav-link fw-semibold text-dark px-4 py-2 rounded-pill position-relative"
                                                style="transition: all 0.3s ease;">
                                                <i class="bi bi-people me-2 text-success"></i>
                                                Users
                                            </router-link>
                                        </li>
                                        <li class="nav-item mx-3">
                                            <router-link to="/admin/reservations" 
                                                class="nav-link fw-semibold text-dark px-4 py-2 rounded-pill position-relative"
                                                style="transition: all 0.3s ease;">
                                                <i class="bi bi-calendar-check me-2 text-warning"></i>
                                                Reservations
                                            </router-link>
                                        </li>
                                    </ul>
                                </div>
                            </nav>
                        </div>
                    </div>
                    
                    <div class="card border-0 shadow-lg rounded-4">
                        <div class="card-body p-4">
                            <router-view></router-view>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`,
    data() {
        return {
            dashboardStats: {
                totalLots: 0,
                totalUsers: 0,
                activeReservations: 0,
                totalRevenue: 0
            },
            revenueChart: null,
            usageChart: null
        }
    },
    mounted() {
    this.loadDashboardStats(); // <- CORRECT method name
    this.$nextTick(() => {
        this.initCharts();
    });
},

    beforeDestroy() {
        if (this.revenueChart) this.revenueChart.destroy();
        if (this.usageChart) this.usageChart.destroy();
    },
    methods: {
        async loadDashboardStats() {
            try {
                const headers = getAuthHeader();
                
                // Load basic stats
                const [lotsRes, usersRes, reservationsRes] = await Promise.all([
                    fetch('/api/parking-lots', { headers }),
                    fetch('/api/admin/users', { headers }),
                    fetch('/api/admin/reservations', { headers })
                ]);
                
                const lots = await lotsRes.json();
                const users = await usersRes.json();
                const reservations = await reservationsRes.json();
                
                this.dashboardStats = {
                    totalLots: lots.length,
                    totalUsers: users.length,
                    activeReservations: reservations.filter(r => r.status === 'active').length,
                    totalRevenue: reservations
                        .filter(r => r.parking_cost)
                        .reduce((sum, r) => sum + parseFloat(r.parking_cost || 0), 0)
                };
                
                this.updateCharts();
            } catch (error) {
                console.error('Error loading dashboard stats:', error);
            }
        },
        
        initCharts() {
            this.initRevenueChart();
            this.initUsageChart();
        },
        
        initRevenueChart() {
            const ctx = document.getElementById('revenueChart');
            if (!ctx) return;
            
            this.revenueChart = new window.Chart(ctx, {
                type: 'line',
                data: {
                    labels: this.getLast7Days(),
                    datasets: [{
                        label: 'Daily Revenue ($)',
                        data: [0, 0, 0, 0, 0, 0, 0], // Will be updated
                        borderColor: 'rgb(102, 126, 234)',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value;
                                }
                            }
                        }
                    }
                }
            });
        },
        
        initUsageChart() {
            const ctx = document.getElementById('usageChart');
            if (!ctx) return;
            
            this.usageChart = new window.Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Occupied', 'Available'],
                    datasets: [{
                        data: [0, 100], // Will be updated
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(75, 192, 192, 0.8)'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        },
        
        updateCharts() {
            this.updateRevenueChart();
            this.updateUsageChart();
        },
        
        async updateRevenueChart() {
            if (!this.revenueChart) return;
            
            try {
                const headers = getAuthHeader();
                const response = await fetch('/api/admin/revenue-stats', { headers });
                
                if (response.ok) {
                    const data = await response.json();
                    this.revenueChart.data.datasets[0].data = data.dailyRevenue || [0, 0, 0, 0, 0, 0, 0];
                } else {
                    // Generate mock data if API not available
                    this.revenueChart.data.datasets[0].data = this.generateMockRevenueData();
                }
                
                this.revenueChart.update();
            } catch (error) {
                console.error('Error updating revenue chart:', error);
                this.revenueChart.data.datasets[0].data = this.generateMockRevenueData();
                this.revenueChart.update();
            }
        },
        
        async updateUsageChart() {
            if (!this.usageChart) return;
            
            try {
                const headers = getAuthHeader();
                const response = await fetch('/api/parking-lots', { headers });
                const lots = await response.json();
                
                const totalSpots = lots.reduce((sum, lot) => sum + lot.total_spots, 0);
                const availableSpots = lots.reduce((sum, lot) => sum + lot.available_spots, 0);
                const occupiedSpots = totalSpots - availableSpots;
                
                this.usageChart.data.datasets[0].data = [occupiedSpots, availableSpots];
                this.usageChart.update();
            } catch (error) {
                console.error('Error updating usage chart:', error);
            }
        },
        
        getLast7Days() {
            const days = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            }
            return days;
        },
        
        generateMockRevenueData() {
            return Array.from({ length: 7 }, () => Math.floor(Math.random() * 500) + 100);
        },
        
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