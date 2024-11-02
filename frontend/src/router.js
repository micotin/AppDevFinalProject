import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

import LandingPage from './components/LandingPage.vue';
import Login from './components/Login.vue';
import Signup from './components/Signup.vue';
import Verification from './components/Verification.vue';
import UserCartFav from './components/UserCartFav.vue'; // New parent component for user layout
import UserMain from './components/UserMain.vue'; // New parent component for user layout
import UserHome from './components/UserHome.vue';
import UserShop from './components/UserShop.vue';
import UserAccount from './components/UserAccount.vue';
import UserCustomize from './components/UserCustomize.vue';
import UserProducts from './components/UserProducts.vue';
import UserContactUs from './components/UserContactUs.vue';
import AdminPanel from './components/AdminPanel.vue';
import AdminDashboard from './components/AdminDashboard.vue';
import AdminProducts from './components/AdminProducts.vue';
import AdminUsers from './components/AdminUsers.vue';

const routes = [
  { path: '/', component: LandingPage },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/verification', name: 'Verification', component: Verification },
  
  {
    path: '/user',
    component: UserMain, // UserMain as a parent layout for user pages
    meta: { requiresAuth: true, role: 'user' },
    children: [
      { path: 'home', component: UserHome },
      { path: 'account', component: UserAccount },
      { path: 'customize', component: UserCustomize },
      { path: 'products', component: UserProducts },
      { path: 'contact', component: UserContactUs },
      { path: 'shop', component: UserShop },
      { path: 'cart-fav', component: UserCartFav }
    ],
  },

  {
    path: '/admin',
    component: AdminPanel,
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'products', component: AdminProducts },
      { path: 'users', component: AdminUsers },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const auth = getAuth();

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  let userRole = null;

  await new Promise(resolve => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          userRole = userDoc.data().role;
        }
        resolve();
      } else {
        resolve();
      }
    });
  });

  if (requiresAuth && !auth.currentUser) {
    return next({ path: '/login' });
  } else if (requiresAuth && userRole) {
    const routeRole = to.meta.role;
    if (routeRole && userRole !== routeRole) {
      return next(userRole === 'admin' ? '/admin/dashboard' : '/user/home');
    } else {
      return next();
    }
  } else {
    next();
  }
});

export default router;
