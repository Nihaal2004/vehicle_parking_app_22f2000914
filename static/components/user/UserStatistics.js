import { getAuthHeader } from '../../utils/auth.js';

export const UserStatistics = {
    template: `
        <div class="row">
            <div class="col-12">
                <h3 class="mb-4">My Parking Statistics</h3>
            </div>
            
            <!-- User Statistics Cards -->
            <div class="col-md-3 mb-4">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <h5 class="card-title">Total Reservations</h5>
                        <h2>{{ userStats.totalReservations }}</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <h5 class="card-title">Active Reservations</h5>
                        <h2>{{ userStats.activeReservations }}</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <h5 class="card-title">Completed</h5>
                        <h2>{{ userStats.completedReservations }}</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card bg-warning text-white">
                    <div class="card-body">
                        <h5 class="card-title">Total Spent</h5>
                        <h2>\${{ userStats.totalSpent }}</h2>
                    </div>
                </div>
            </div>
            
            <!-- User Charts Row -->
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5>My Reservation Status</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="userStatusChart" width="400" height="300"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5>Monthly Spending</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="userSpendingChart" width="400" height="300"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6 mb-4" v-if="apiData && apiData.parkingLotUsage && apiData.parkingLotUsage.length > 0">
                <div class="card">
                    <div class="card-header">
                        <h5>Most Used Parking Lots</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="userParkingChart" width="400" height="300"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6 mb-4" v-else>
                <div class="card">
                    <div class="card-header">
                        <h5>Most Used Parking Lots</h5>
                    </div>
                    <div class="card-body text-center py-5">
                        <p class="text-muted">No parking lot usage data available</p>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5>Weekly Parking Pattern</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="userWeeklyChart" width="400" height="300"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            userStats: {
                totalReservations: 0,
                activeReservations: 0,
                completedReservations: 0,
                totalSpent: 0
            },
            charts: {},
            apiData: null
        }
    },
    async mounted() {
        await this.loadUserStatistics();
    },
    beforeDestroy() {
        // Destroy charts to prevent memory leaks
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
    },
    methods: {
        async loadUserStatistics() {
            try {
                const response = await fetch('/api/user/statistics', {
                    headers: getAuthHeader()
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.userStats = data.stats;
                    this.apiData = data;
                    // Initialize charts with real data
                    this.$nextTick(() => {
                        this.initializeUserCharts();
                    });
                } else {
                    console.error('Failed to load user statistics:', response.status);
                }
            } catch (error) {
                console.error('Error loading user statistics:', error);
            }
        },
        
        initializeUserCharts() {
            if (!this.apiData) return;

            const monthLabels = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                monthLabels.push(date.toLocaleString('default', { month: 'short' }));
            }

            const userStatusCtx = document.getElementById('userStatusChart').getContext('2d');
            this.charts.userStatus = new Chart(userStatusCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Active', 'Completed', 'Cancelled'],
                    datasets: [{
                        data: [
                            this.apiData.reservationStatus.active || 0,
                            this.apiData.reservationStatus.completed || 0,
                            this.apiData.reservationStatus.cancelled || 0
                        ],
                        backgroundColor: ['#28a745', '#007bff', '#dc3545'],
                        borderWidth: 2
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

            const userSpendingCtx = document.getElementById('userSpendingChart').getContext('2d');
            this.charts.userSpending = new Chart(userSpendingCtx, {
                type: 'line',
                data: {
                    labels: monthLabels,
                    datasets: [{
                        label: 'Spending ($)',
                        data: this.apiData.monthlySpending || [],
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            if (this.apiData.parkingLotUsage && this.apiData.parkingLotUsage.length > 0) {
                const userParkingCtx = document.getElementById('userParkingChart').getContext('2d');
                this.charts.userParking = new Chart(userParkingCtx, {
                    type: 'bar',
                    data: {
                        labels: this.apiData.parkingLotUsage.map(item => item.name),
                        datasets: [{
                            label: 'Visits',
                            data: this.apiData.parkingLotUsage.map(item => item.count),
                            backgroundColor: '#17a2b8',
                            borderColor: '#117a8b',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        scales: {
                            x: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }

            const userWeeklyCtx = document.getElementById('userWeeklyChart').getContext('2d');
            this.charts.userWeekly = new Chart(userWeeklyCtx, {
                type: 'radar',
                data: {
                    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                    datasets: [{
                        label: 'Parking Frequency',
                        data: this.apiData.weeklyPattern || [0, 0, 0, 0, 0, 0, 0],
                        borderColor: '#ffc107',
                        backgroundColor: 'rgba(255, 193, 7, 0.2)',
                        pointBackgroundColor: '#ffc107',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#ffc107'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }
};