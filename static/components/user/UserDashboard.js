import { getAuthHeader } from '../../utils/auth.js';
import { ParkingLotsView } from './ParkingLotsView.js';
import { ActiveReservations } from './ActiveReservations.js';
import { ReservationHistory } from './ReservationHistory.js';

export const UserDashboard = {
    template: `
        <div>
            <!-- Navigation -->
            <nav class="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
                <div class="container-fluid">
                    <a class="navbar-brand" href="#">
                        <i class="bi bi-car-front me-2"></i>
                        Parking System
                    </a>
                    <div class="navbar-nav ms-auto">
                        <span class="navbar-text me-3">Welcome, {{ user.username }}</span>
                        <button class="btn btn-outline-light btn-sm" @click="logout">
                            <i class="bi bi-box-arrow-right"></i> Logout
                        </button>
                    </div>
                </div>
            </nav>

            <!-- Navigation Tabs -->
            <ul class="nav nav-tabs mb-4">
                <li class="nav-item">
                    <router-link class="nav-link" to="/dashboard/parking-lots" active-class="active">
                        <i class="bi bi-geo-alt me-1"></i> Parking Lots
                    </router-link>
                </li>
                <li class="nav-item">
                    <router-link class="nav-link" to="/dashboard/active-reservations" active-class="active">
                        <i class="bi bi-car-front me-1"></i> Active Reservations
                    </router-link>
                </li>
                <li class="nav-item">
                    <router-link class="nav-link" to="/dashboard/history" active-class="active">
                        <i class="bi bi-clock-history me-1"></i> History
                    </router-link>
                </li>
            </ul>

            <!-- Child route content -->
            <router-view></router-view>
        </div>
    `,
    data() {
        return {
            user: JSON.parse(localStorage.getItem('user') || '{}')
        }
    },
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
                localStorage.removeItem('user');
                this.$router.push('/login');
            });
        }
    }
};