import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Lazy-loaded components
const LandingPage = () => import('./components/LandingPage.vue');
const Login = () => import('./components/Login.vue');
const Signup = () => import('./components/Signup.vue');
const Verification = () => import('./components/Verification.vue');
const UserCartFav = () => import('./components/UserCartFav.vue');
const UserMain = () => import('./components/UserMain.vue');
const UserHome = () => import('./components/UserHome.vue');
const UserShop = () => import('./components/UserShop.vue');
const UserAccount = () => import('./components/UserAccount.vue');
const UserCustomize = () => import('./components/UserCustomize.vue');
const UserProducts = () => import('./components/UserProducts.vue');
const UserContactUs = () => import('./components/UserContactUs.vue');
const UserCheckout = () => import('./components/UserCheckout.vue');
const UserViewProduct = () => import('./components/UserViewProduct.vue');
const UserOrder = () => import('./components/UserOrder.vue');
const UserGallery = () => import('./components/UserGallery.vue');
const UserViewGallery = () => import('./components/UserViewGallery.vue');
const UserReview = () => import('./components/UserReview.vue');
const AdminPanel = () => import('./components/AdminPanel.vue');
const AdminDashboard = () => import('./components/AdminDashboard.vue');
const AdminProducts = () => import('./components/AdminProducts.vue');
const AdminUsers = () => import('./components/AdminUsers.vue');
const AdminOrders = () => import('./components/AdminOrders.vue');
const AdminHistory = () => import('./components/AdminHistory.vue');
const AdminContactUs = () => import('./components/AdminContactUs.vue');
const AdminGallery = () => import('./components/AdminGallery.vue');
const AdminCustomizeAttachment = () => import('./components/AdminCustomizeAttachment.vue');
const AdminReview = () => import('./components/AdminReview.vue');
const NotFound = () => import('./components/NotFound.vue');

const routes = [
  { path: '/', name: 'LandingPage', component: LandingPage },
  { path: '/login', name: 'Login', component: Login },
  { path: '/signup', name: 'Signup', component: Signup },
  { path: '/verification', name: 'Verification', component: Verification },
  
  {
    path: '/user',
    component: UserMain,
    meta: { requiresAuth: true, role: 'user' },
    children: [
      { path: 'home', name: 'UserHome', component: UserHome },
      { path: 'account', name: 'UserAccount', component: UserAccount },
      { path: 'customize', name: 'UserCustomize', component: UserCustomize },
      { path: 'products', name: 'UserProducts', component: UserProducts },
      { path: 'contact', name: 'UserContactUs', component: UserContactUs },
      { path: 'shop', name: 'UserShop', component: UserShop },
      { path: 'cart-fav', name: 'UserCartFav', component: UserCartFav },
      { path: 'product/:id', name: 'UserViewProduct', component: UserViewProduct },
      { path: 'checkout', name: 'UserCheckout', component: UserCheckout },
      { path: 'order', name: 'UserOrders', component: UserOrder },
      { path: 'order/:orderId', name: 'UserOrder', component: UserOrder },
      { path: 'gallery', name: 'UserGallery', component: UserGallery },
      { path: 'gallery/:id', name: 'UserViewGallery', component: UserViewGallery },
      { path: 'reviews', name: 'UserReview', component: UserReview },
    ],
  },

  {
    path: '/admin',
    component: AdminPanel,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: 'dashboard', name: 'AdminDashboard', component: AdminDashboard },
      { path: 'products', name: 'AdminProducts', component: AdminProducts },
      { path: 'users', name: 'AdminUsers', component: AdminUsers },
      { path: 'orders', name: 'AdminOrders', component: AdminOrders },
      { path: 'history', name: 'AdminHistory', component: AdminHistory },
      { path: 'contact', name: 'AdminContactUs', component: AdminContactUs },
      { path: 'gallery', name: 'AdminGallery', component: AdminGallery },
      { path: 'customize-attachment', name: 'AdminCustomizeAttachment', component: AdminCustomizeAttachment },
      { path: 'reviews', name: 'AdminReview', component: AdminReview },
    ],
  },

  // Catch-all 404
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
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
    return next({ name: 'Login' });
  } else if (requiresAuth && userRole) {
    const routeRole = to.meta.role;
    if (routeRole && userRole !== routeRole) {
      return next(userRole === 'admin' ? { name: 'AdminDashboard' } : { name: 'UserHome' });
    } else {
      return next();
    }
  } else {
    next();
  }
});

export default router;