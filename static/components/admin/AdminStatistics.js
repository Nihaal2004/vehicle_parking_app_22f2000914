import { getAuthHeader } from '../../utils/auth.js';

export const AdminStatistics = {
    template: `
        <div class="row">
            <div class="col-12">
                <h3 class="mb-4">Admin Statistics Dashboard</h3>
            </div>
            
            <!-- Statistics Cards -->
            <div class="col-md-3 mb-4">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <h5 class="card-title">Total Parking Lots</h5>
                        <h2>{{ stats.totalParkingLots }}</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <h5 class="card-title">Active Reservations</h5>
                        <h2>{{ stats.activeReservations }}</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <h5 class="card-title">Total Users</h5>
                        <h2>{{ stats.totalUsers }}</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card bg-warning text-white">
                    <div class="card-body">
                        <h5 class="card-title">Monthly Revenue</h5>
                        <h2>\${{ stats.monthlyRevenue }}</h2>
                    </div>
                </div>
            </div>
            
            <!-- Charts Row -->
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5>Parking Lot Occupancy</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="occupancyChart" width="400" height="300"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5>Monthly Revenue Trend</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="revenueChart" width="400" height="300"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5>Reservations by Status</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="statusChart" width="400" height="300"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5>Daily Reservations (Last 7 Days)</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="dailyChart" width="400" height="300"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            stats: {
                totalParkingLots: 0,
                activeReservations: 0,
                totalUsers: 0,
                monthlyRevenue: 0
            },
            charts: {},
            apiData: null
        }
    },
    async mounted() {
        await this.loadStatistics();
    },
    beforeDestroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
    },
    methods: {
        async loadStatistics() {
            try {
                const response = await fetch('/api/admin/statistics', {
                    headers: getAuthHeader()
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.stats = data.stats;
                    this.apiData = data;
                    this.$nextTick(() => {
                        this.initializeCharts();
                    });
                } else {
                    console.error('Failed to load statistics:', response.status);
                }
            } catch (error) {
                console.error('Error loading statistics:', error);
            }
        },
        
        initializeCharts() {
            if (!this.apiData) return;

            const monthLabels = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                monthLabels.push(date.toLocaleString('default', { month: 'short' }));
            }

            const occupancyCtx = document.getElementById('occupancyChart').getContext('2d');
            this.charts.occupancy = new Chart(occupancyCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Occupied', 'Available'],
                    datasets: [{
                        data: [
                            this.apiData.occupancy.occupied || 0, 
                            this.apiData.occupancy.available || 0
                        ],
                        backgroundColor: ['#dc3545', '#28a745'],
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

            const revenueCtx = document.getElementById('revenueChart').getContext('2d');
            this.charts.revenue = new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: monthLabels,
                    datasets: [{
                        label: 'Revenue ($)',
                        data: this.apiData.revenue.monthly || [],
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
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

            const statusCtx = document.getElementById('statusChart').getContext('2d');
            this.charts.status = new Chart(statusCtx, {
                type: 'pie',
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

            const dailyCtx = document.getElementById('dailyChart').getContext('2d');
            this.charts.daily = new Chart(dailyCtx, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Reservations',
                        data: this.apiData.dailyReservations || [],
                        backgroundColor: '#17a2b8',
                        borderColor: '#117a8b',
                        borderWidth: 1
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
        }
    }
};