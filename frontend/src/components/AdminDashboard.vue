<template>
  <div class="admin-dashboard">
    <h2 class="mb-4">🌺 Admin Dashboard</h2>

    <div class="row g-4">
      <!-- Summary Cards -->
      <div class="col-md-3 col-sm-6" v-for="(stat, index) in stats" :key="index">
        <div class="card h-100 border-0 shadow-sm rounded">
          <div class="card-body text-center d-flex flex-column justify-content-center">
            <component :is="stat.icon" class="mb-3 floral-icon" :size="32" />
            <h5 class="card-title mb-2">{{ stat.title }}</h5>
            <p class="card-text fs-4 fw-bold mb-0">{{ stat.value }}</p>
          </div>
        </div>
      </div>

      <!-- Sales Overview Chart -->
      <div class="col-lg-8 col-md-6">
        <div class="card h-100 border-0 shadow-sm rounded">
          <div class="card-header bg-dark floral-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">📊 Sales Overview</h5>
            <div class="btn-group">
              <button 
                v-for="period in ['Week', 'Month', 'Year']" 
                :key="period"
                @click="changeSalesPeriod(period.toLowerCase())"
                :class="['btn btn-sm', salesPeriod === period.toLowerCase() ? 'floral-btn' : 'btn-outline-secondary']"
              >
                {{ period }}
              </button>
            </div>
          </div>
          <div class="card-body">
            <canvas ref="salesChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Order Status Chart -->
      <div class="col-lg-4 col-md-6">
        <div class="card h-100 border-0 shadow-sm rounded">
          <div class="card-header bg-dark floral-header">
            <h5 class="card-title mb-0">🥧 Order Status Distribution</h5>
          </div>
          <div class="card-body">
            <canvas ref="orderStatusChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="col-md-6">
        <div class="card h-100 border-0 shadow-sm rounded">
          <div class="card-header bg-dark floral-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">🌷 Recent Orders</h5>
            <button class="btn btn-sm floral-btn" @click="refreshOrders">Refresh</button>
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
                    <td>{{ `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}` }}</td>
                    <td>₱{{ order.total.toFixed(2) }}</td>
                    <td>
                      <span :class="['badge', getStatusClass(order.status)]">
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
      <div class="col-md-6">
        <div class="card h-100 border-0 shadow-sm rounded">
          <div class="card-header bg-dark floral-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">🌹 Top Products</h5>
            <button class="btn btn-sm floral-btn" @click="refreshProducts">Refresh</button>
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

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Chart, registerables } from 'chart.js';
import { ShoppingCart, DollarSign, Package, Users } from 'lucide-vue-next';

Chart.register(...registerables);

const stats = ref([
  { title: 'Total Orders', value: 0, icon: ShoppingCart },
  { title: 'Total Revenue', value: '₱0', icon: DollarSign },
  { title: 'Total Products', value: 0, icon: Package },
  { title: 'Total Users', value: 0, icon: Users }
]);

const recentOrders = ref([]);
const topProducts = ref([]);
const salesChart = ref(null);
const orderStatusChart = ref(null);
const salesPeriod = ref('week');

let salesChartInstance = null;
let orderStatusChartInstance = null;

const fetchDashboardData = async () => {
  const ordersQuery = query(collection(db, 'orders'));
  const ordersSnapshot = await getDocs(ordersQuery);
  
  const productsSnapshot = await getDocs(collection(db, 'products'));
  
  const usersQuery = query(collection(db, 'users'), where('role', '!=', 'admin'));
  const usersSnapshot = await getDocs(usersQuery);

  let totalRevenue = 0;
  let totalOrders = 0;
  ordersSnapshot.forEach(doc => {
    const orderData = doc.data();
    if (orderData.status !== 'Cancelled') {
      totalRevenue += orderData.total;
      totalOrders++;
    }
  });

  stats.value[0].value = totalOrders;
  stats.value[1].value = `₱${totalRevenue.toFixed(2)}`;
  stats.value[2].value = productsSnapshot.size;
  stats.value[3].value = usersSnapshot.size;

  await refreshOrders();
  await refreshProducts();

  // Prepare data for charts
  const salesData = await prepareSalesData();
  const orderStatusData = await prepareOrderStatusData();

  // Create or update charts
  createOrUpdateSalesChart(salesData);
  createOrUpdateOrderStatusChart(orderStatusData);
};

const refreshOrders = async () => {
  const recentOrdersQuery = query(
    collection(db, 'orders'),
    orderBy('createdAt', 'desc'),
    limit(5)
  );
  const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
  recentOrders.value = recentOrdersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

const refreshProducts = async () => {
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
    case 'picked up': return 'bg-info';
    default: return 'bg-secondary';
  }
};

const prepareSalesData = async () => {
  const now = new Date();
  let startDate;

  switch (salesPeriod.value) {
    case 'week':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case 'year':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
  }

  const salesQuery = query(
    collection(db, 'orders'),
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    orderBy('createdAt', 'asc')
  );

  const salesSnapshot = await getDocs(salesQuery);
  const salesByDate = {};

  salesSnapshot.forEach(doc => {
    const orderData = doc.data();
    if (orderData.status !== 'Cancelled') {
      const date = new Date(orderData.createdAt.seconds * 1000).toLocaleDateString();
      salesByDate[date] = (salesByDate[date] || 0) + orderData.total;
    }
  });

  return {
    labels: Object.keys(salesByDate),
    data: Object.values(salesByDate)
  };
};

const prepareOrderStatusData = async () => {
  const ordersSnapshot = await getDocs(collection(db, 'orders'));
  const statusCounts = {};

  ordersSnapshot.forEach(doc => {
    const status = doc.data().status;
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  return {
    labels: Object.keys(statusCounts),
    data: Object.values(statusCounts)
  };
};

const createOrUpdateSalesChart = (salesData) => {
  const ctx = salesChart.value.getContext('2d');

  if (salesChartInstance) {
    salesChartInstance.data.labels = salesData.labels;
    salesChartInstance.data.datasets[0].data = salesData.data;
    salesChartInstance.update();
  } else {
    salesChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: salesData.labels,
        datasets: [{
          label: 'Sales',
          data: salesData.data,
          borderColor: '#e5484d',
          backgroundColor: 'rgba(229, 72, 77, 0.1)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Sales (₱)',
              color: '#b4b4bb'
            },
            ticks: {
              color: '#b4b4bb'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          x: {
            ticks: {
              color: '#b4b4bb'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#b4b4bb'
            }
          }
        }
      }
    });
  }
};

const createOrUpdateOrderStatusChart = (orderStatusData) => {
  const ctx = orderStatusChart.value.getContext('2d');

  if (orderStatusChartInstance) {
    orderStatusChartInstance.data.labels = orderStatusData.labels;
    orderStatusChartInstance.data.datasets[0].data = orderStatusData.data;
    orderStatusChartInstance.update();
  } else {
    orderStatusChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: orderStatusData.labels,
        datasets: [{
          data: orderStatusData.data,
          backgroundColor: [
            '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6c757d'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#b4b4bb'
            }
          }
        }
      }
    });
  }
};

const changeSalesPeriod = async (period) => {
  salesPeriod.value = period;
  await fetchDashboardData();
};

onMounted(() => {
  fetchDashboardData();
});

onUnmounted(() => {
  if (salesChartInstance) {
    salesChartInstance.destroy();
  }
  if (orderStatusChartInstance) {
    orderStatusChartInstance.destroy();
  }
});
</script>

<style scoped>
.admin-dashboard {
  font-family: 'Poppins', sans-serif;
}

h2 {
  font-weight: 600;
  color: #ffffff;
}

.card {
  background: rgba(35, 35, 50, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: box-shadow 0.3s, transform 0.3s;
}

.card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  transform: translateY(-5px);
}

.card-body {
  color: #b4b4bb;
}

.floral-header {
  background: rgba(40, 40, 55, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.floral-icon {
  color: #e5484d;
}

.floral-table {
  color: #b4b4bb;
}

.floral-table thead th {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.floral-table tbody tr:hover {
  background-color: rgba(229, 72, 77, 0.1);
}

.floral-btn {
  background: linear-gradient(135deg, #e5484d 0%, #a12c82 100%);
  border: none;
  color: white;
  transition: all 0.3s ease;
}

.floral-btn:hover {
  background: linear-gradient(135deg, #f05a5f 0%, #b13d93 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(229, 72, 77, 0.3);
}

.floral-badge {
  background-color: rgba(229, 72, 77, 0.2);
  color: #e5484d;
}

.badge {
  font-weight: 500;
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>