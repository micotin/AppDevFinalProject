<template>
  <div class="admin-dashboard">
    <h2 class="mb-4">🌺 Admin Dashboard</h2>

    <div class="row">
      <!-- Summary Cards -->
      <div class="col-md-3 mb-4" v-for="(stat, index) in stats" :key="index">
        <div class="card border-0 shadow-sm rounded">
          <div class="card-body text-center">
            <i :class="stat.icon + ' fs-1 mb-2 floral-icon'"></i>
            <h5 class="card-title">{{ stat.title }}</h5>
            <p class="card-text fs-4 fw-bold">{{ stat.value }}</p>
          </div>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="col-md-6 mb-4">
        <div class="card border-0 shadow-sm rounded">
          <div class="card-header bg-light floral-header">
            <h5 class="card-title mb-0">🌷 Recent Orders</h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover floral-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in recentOrders" :key="order.id">
                    <td>#{{ order.id.slice(0, 8) }}</td>
                    <td>{{ order.customerName }}</td>
                    <td>₱{{ order.total.toFixed(2) }}</td>
                    <td>
                      <span :class="'badge ' + getStatusClass(order.status)">
                        {{ order.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Products -->
      <div class="col-md-6 mb-4">
        <div class="card border-0 shadow-sm rounded">
          <div class="card-header bg-light floral-header">
            <h5 class="card-title mb-0">🌹 Top Products</h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover floral-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Sales</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="product in topProducts" :key="product.id">
                    <td>{{ product.name }}</td>
                    <td>
                      <span class="badge floral-badge">{{ product.category }}</span>
                    </td>
                    <td>{{ product.sales }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default {
  name: 'AdminDashboard',
  setup() {
    const stats = ref([
      { title: 'Total Orders', value: 0, icon: 'bi bi-cart-check' },
      { title: 'Total Revenue', value: '₱0', icon: 'bi bi-currency-dollar' },
      { title: 'Total Products', value: 0, icon: 'bi bi-box-seam' },
      { title: 'Total Users', value: 0, icon: 'bi bi-people' }
    ]);

    const recentOrders = ref([]);
    const topProducts = ref([]);

    const fetchDashboardData = async () => {
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const usersSnapshot = await getDocs(collection(db, 'users'));

      let totalRevenue = 0;
      ordersSnapshot.forEach(doc => {
        totalRevenue += doc.data().total;
      });

      stats.value[0].value = ordersSnapshot.size;
      stats.value[1].value = `₱${totalRevenue.toFixed(2)}`;
      stats.value[2].value = productsSnapshot.size;
      stats.value[3].value = usersSnapshot.size;

      // Fetch recent orders
      const recentOrdersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
      const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
      recentOrders.value = recentOrdersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch top products
      const topProductsQuery = query(collection(db, 'products'), orderBy('sales', 'desc'), limit(5));
      const topProductsSnapshot = await getDocs(topProductsQuery);
      topProducts.value = topProductsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    };

    const getStatusClass = (status) => {
      switch (status.toLowerCase()) {
        case 'completed': return 'bg-success';
        case 'processing': return 'bg-warning text-dark';
        case 'cancelled': return 'bg-danger';
        default: return 'bg-secondary';
      }
    };

    onMounted(fetchDashboardData);

    return {
      stats,
      recentOrders,
      topProducts,
      getStatusClass
    };
  }
};
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
  background-color: #f7f7f7;
  border-radius: 15px;
}

h2 {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  color: #5c5c5c;
}

.card {
  border-radius: 12px;
  transition: box-shadow 0.3s;
}

.card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.floral-header {
  background-color: #FDE2E4;
}

.floral-icon {
  color: #FF69B4;
}

.floral-table {
  border-radius: 12px;
  overflow: hidden;
}

.floral-table tbody tr:hover {
  background-color: rgba(0, 173, 85, 0.05);
}

.floral-btn {
  background-color: #FFB6C1;
  border-color: #FFB6C1;
  color: white;
}

.floral-btn:hover {
  background-color: #FF69B4;
  border-color: #FF69B4;
}

.floral-badge {
  background-color: #FCE4EC;
  color: #D81B60;
}

.badge {
  font-weight: 500;
}
</style>