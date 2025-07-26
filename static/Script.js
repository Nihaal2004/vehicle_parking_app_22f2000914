import { Login } from './components/auth/Login.js';
import { Register } from './components/auth/Register.js';
import { AdminDashboard } from './components/admin/AdminDashboard.js';
import { ParkingLotList } from './components/admin/ParkingLotList.js';
import { ParkingLotForm } from './components/admin/ParkingLotForm.js';
import { ParkingLotDetails } from './components/admin/ParkingLotDetails.js';
import { UserList } from './components/admin/UserList.js';
import { UserDashboard } from './components/user/UserDashboard.js';
import { ReservationHistory } from './components/user/ReservationHistory.js';
import { ParkingLotsView } from './components/user/ParkingLotsView.js';
import { ActiveReservations } from './components/user/ActiveReservations.js';

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
    { 
        path: '/dashboard', 
        component: UserDashboard,
        children: [
            { path: '', redirect: 'parking-lots' },
            { path: 'parking-lots', component: ParkingLotsView },
            { path: 'active-reservations', component: ActiveReservations },
            { path: 'history', component: ReservationHistory }
        ]
    }
];

const router = new VueRouter({
    routes
});

// Create Vue instance
new Vue({
    router
}).$mount('#app');