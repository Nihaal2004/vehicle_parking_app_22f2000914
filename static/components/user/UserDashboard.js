import { getAuthHeader } from '../../utils/auth.js';
import { ParkingLotsView } from './ParkingLotsView.js';
import { ActiveReservations } from './ActiveReservations.js';
import { ReservationHistory } from './ReservationHistory.js';

export const UserDashboard = {
    template: `
    <div class="min-vh-100" style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
        <!-- Navigation Header -->
        <nav class="navbar navbar-expand-lg shadow-lg mb-0" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <div class="container-fluid px-4">
                <a class="navbar-brand text-white fw-bold fs-4" href="#">
                    <i class="bi bi-car-front me-3"></i>
                    ParkEase
                </a>
                <div class="navbar-nav ms-auto">
                    <div class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle text-white fw-semibold d-flex align-items-center" 
                           href="#" role="button" data-bs-toggle="dropdown">
                            <div class="bg-white bg-opacity-25 rounded-circle p-2 me-2">
                                <i class="bi bi-person-fill text-white"></i>
                            </div>
                            Welcome, {{ user.username }}
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end border-0 shadow-lg rounded-3">
                            <li>
                                <button class="dropdown-item d-flex align-items-center py-2" @click="logout">
                                    <i class="bi bi-box-arrow-right me-2 text-danger"></i>
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>

        <div class="container-fluid px-4 py-4">
            <!-- User Dashboard Stats -->
            <div class="row mb-4">
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="card border-0 shadow-sm rounded-4 bg-primary bg-gradient text-white h-100">
                        <div class="card-body text-center p-4">
                            <i class="bi bi-car-front fs-1 mb-2 opacity-75"></i>
                            <h3 class="fw-bold mb-1">{{ userStats.activeReservations || 0 }}</h3>
                            <p class="mb-0 opacity-75">Active Spots</p>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="card border-0 shadow-sm rounded-4 bg-success bg-gradient text-white h-100">
                        <div class="card-body text-center p-4">
                            <i class="bi bi-clock-history fs-1 mb-2 opacity-75"></i>
                            <h3 class="fw-bold mb-1">{{ userStats.totalReservations || 0 }}</h3>
                            <p class="mb-0 opacity-75">Total Visits</p>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="card border-0 shadow-sm rounded-4 bg-info bg-gradient text-white h-100">
                        <div class="card-body text-center p-4">
                            <i class="bi bi-clock fs-1 mb-2 opacity-75"></i>
                            <h3 class="fw-bold mb-1">{{ (userStats.totalHours || 0).toFixed(1) }}h</h3>
                            <p class="mb-0 opacity-75">Total Hours</p>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="card border-0 shadow-sm rounded-4 bg-warning bg-gradient text-white h-100">
                        <div class="card-body text-center p-4">
                            <i class="bi bi-currency-dollar fs-1 mb-2 opacity-75"></i>
                            <h3 class="fw-bold mb-1">\${{ (userStats.totalSpent || 0).toFixed(2) }}</h3>
                            <p class="mb-0 opacity-75">Total Spent</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- User Charts Section -->
            <div class="row mb-4">
                <div class="col-lg-8 mb-4">
                    <div class="card border-0 shadow-lg rounded-4">
                        <div class="card-header bg-gradient text-white border-0 rounded-top-4 py-3"
                             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <h5 class="mb-0">
                                <i class="bi bi-graph-up me-2"></i>Your Parking Usage (Last 7 Days)
                            </h5>
                        </div>
                        <div class="card-body p-4">
                            <canvas id="userUsageChart" width="400" height="200"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 mb-4">
                    <div class="card border-0 shadow-lg rounded-4">
                        <div class="card-header bg-gradient text-white border-0 rounded-top-4 py-3"
                             style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                            <h5 class="mb-0">
                                <i class="bi bi-pie-chart me-2"></i>Spending Breakdown
                            </h5>
                        </div>
                        <div class="card-body p-4">
                            <canvas id="userSpendingChart" width="300" height="300"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Navigation Tabs -->
            <div class="card border-0 shadow-lg rounded-4 mb-4">
                <div class="card-body p-0">
                    <nav class="navbar navbar-expand-lg navbar-light bg-white rounded-4">
                        <div class="container-fluid px-4">
                            <ul class="navbar-nav mx-auto">
                                <li class="nav-item mx-2">
                                    <router-link class="nav-link fw-semibold px-4 py-3 rounded-pill d-flex align-items-center" 
                                                to="/dashboard/parking-lots" active-class="active bg-primary text-white"
                                                style="transition: all 0.3s ease;">
                                        <i class="bi bi-geo-alt me-2"></i>
                                        Find Parking
                                    </router-link>
                                </li>
                                <li class="nav-item mx-2">
                                    <router-link class="nav-link fw-semibold px-4 py-3 rounded-pill d-flex align-items-center" 
                                                to="/dashboard/active-reservations" active-class="active bg-success text-white"
                                                style="transition: all 0.3s ease;">
                                        <i class="bi bi-car-front me-2"></i>
                                        Active Spots
                                    </router-link>
                                </li>
                                <li class="nav-item mx-2">
                                    <router-link class="nav-link fw-semibold px-4 py-3 rounded-pill d-flex align-items-center" 
                                                to="/dashboard/history" active-class="active bg-warning text-white"
                                                style="transition: all 0.3s ease;">
                                        <i class="bi bi-clock-history me-2"></i>
                                        History
                                    </router-link>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </div>
            </div>

            <!-- Content Area -->
            <div class="card border-0 shadow-lg rounded-4">
                <div class="card-body p-4">
                    <router-view></router-view>
                </div>
            </div>
        </div>
    </div>
`,
    data() {
        return {
            user: JSON.parse(localStorage.getItem('user') || '{}'),
            userStats: {
                activeReservations: 0,
                totalReservations: 0,
                totalHours: 0,
                totalSpent: 0
            },
            userUsageChart: null,
            userSpendingChart: null
        }
    },
    mounted() {
    this.loadUserStats(); // <- This method exists
    this.$nextTick(() => {
        this.initUserCharts();
    });
},

    beforeDestroy() {
        if (this.userUsageChart) this.userUsageChart.destroy();
        if (this.userSpendingChart) this.userSpendingChart.destroy();
    },
    methods: {
        async loadUserStats() {
            try {
                const headers = getAuthHeader();
                const response = await fetch('/api/reservations/my-history', { headers });
                const reservations = await response.json();
                
                this.userStats = {
                    activeReservations: reservations.filter(r => r.status === 'active').length,
                    totalReservations: reservations.length,
                    totalHours: reservations
                        .filter(r => r.duration_hours && !isNaN(r.duration_hours))
                        .reduce((sum, r) => sum + parseFloat(r.duration_hours), 0),
                    totalSpent: reservations
                        .filter(r => r.parking_cost && !isNaN(r.parking_cost))
                        .reduce((sum, r) => sum + parseFloat(r.parking_cost), 0)
                };
                
                this.updateUserCharts();
            } catch (error) {
                console.error('Error loading user stats:', error);
            }
        },
        
        initUserCharts() {
            this.initUserUsageChart();
            this.initUserSpendingChart();
        },
        
        initUserUsageChart() {
            const ctx = document.getElementById('userUsageChart');
            if (!ctx) return;
            
            this.userUsageChart = new window.Chart(ctx, {
                type: 'bar',
                data: {
                    labels: this.getLast7Days(),
                    datasets: [{
                        label: 'Hours Parked',
                        data: [0, 0, 0, 0, 0, 0, 0], // Will be updated
                        backgroundColor: 'rgba(102, 126, 234, 0.8)',
                        borderColor: 'rgb(102, 126, 234)',
                        borderWidth: 2,
                        borderRadius: 4
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
                                    return value + 'h';
                                }
                            }
                        }
                    }
                }
            });
        },
        
        initUserSpendingChart() {
            const ctx = document.getElementById('userSpendingChart');
            if (!ctx) return;
            
            this.userSpendingChart = new window.Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['This Month', 'Previous Months'],
                    datasets: [{
                        data: [0, 0], // Will be updated
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(54, 162, 235, 0.8)'
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
        
        updateUserCharts() {
            this.updateUserUsageChart();
            this.updateUserSpendingChart();
        },
        
        updateUserUsageChart() {
            if (!this.userUsageChart) return;
            
            // Generate mock usage data for last 7 days
            const mockData = Array.from({ length: 7 }, () => Math.floor(Math.random() * 8));
            this.userUsageChart.data.datasets[0].data = mockData;
            this.userUsageChart.update();
        },
        
        updateUserSpendingChart() {
            if (!this.userSpendingChart) return;
            
            // Calculate spending breakdown
            const thisMonth = this.userStats.totalSpent * 0.3; // Mock: 30% this month
            const previousMonths = this.userStats.totalSpent * 0.7; // Mock: 70% previous months
            
            this.userSpendingChart.data.datasets[0].data = [thisMonth, previousMonths];
            this.userSpendingChart.update();
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
                localStorage.removeItem('user');
                this.$router.push('/login');
            });
        }
    }
};
