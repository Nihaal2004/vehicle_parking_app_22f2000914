import { Login } from './components/auth/Login.js';
import { Register } from './components/auth/Register.js';
import { AdminDashboard } from './components/admin/AdminDashboard.js';
import { AdminStatistics } from './components/admin/AdminStatistics.js';
import { ParkingLotList } from './components/admin/ParkingLotList.js';
import { ParkingLotForm } from './components/admin/ParkingLotForm.js';
import { ParkingLotDetails } from './components/admin/ParkingLotDetails.js';
import { UserList } from './components/admin/UserList.js';
import { UserDashboard } from './components/user/UserDashboard.js';
import { UserStatistics } from './components/user/UserStatistics.js';
import { ReservationHistory } from './components/user/ReservationHistory.js';
import { ParkingLotsView } from './components/user/ParkingLotsView.js';
import { ActiveReservations } from './components/user/ActiveReservations.js';
import { AdminReservations } from './components/admin/AdminReservations.js';

// Router configuration
const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { 
        path: '/admin',
        component: AdminDashboard,
        children: [
            { path: '', component: AdminStatistics },
            { path: 'statistics', component: AdminStatistics },
            { path: 'parking-lots', component: ParkingLotList },
            { path: 'parking-lots/create', component: ParkingLotForm },
            { path: 'reservations', component: AdminReservations },
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
    { path: 'parking-lots', component: ParkingLotsView },
    { path: 'active-reservations', component: ActiveReservations },
    { path: 'history', component: ReservationHistory },
    { path: 'statistics', component: UserStatistics }, 
    { path: '', redirect: 'statistics' }
  ]
}

];

const router = new VueRouter({
    routes
});

new Vue({
    router
}).$mount('#app');