<template>
    <div class="order-confirmation container py-5">
      <div class="card shadow">
        <div class="card-body p-4">
          <h1 class="card-title text-center mb-4">Order Confirmation</h1>
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading order details...</span>
            </div>
          </div>
          <div v-else-if="error" class="alert alert-danger" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
          </div>
          <div v-else>
            <div class="alert alert-success" role="alert">
              <h4 class="alert-heading"><i class="bi bi-check-circle-fill me-2"></i>Thank you for your order!</h4>
              <p class="mb-0">Your order has been successfully placed and is being processed.</p>
            </div>
            
            <div class="order-details mt-4">
              <h2 class="h4 mb-3">Order Details</h2>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <p><strong>Order ID:</strong> {{ order.id }}</p>
                  <p><strong>Order Date:</strong> {{ formatDate(order.createdAt) }}</p>
                </div>
                <div class="col-md-6 mb-3">
                  <p><strong>Order Status:</strong> <span class="badge bg-primary">{{ capitalizeFirstLetter(order.status) }}</span></p>
                  <p><strong>Order Type:</strong> {{ capitalizeFirstLetter(order.orderType) }}</p>
                </div>
              </div>
            </div>
            
            <div class="items-ordered mt-4">
              <h3 class="h5 mb-3">Items Ordered</h3>
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th class="text-end">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in order.items" :key="item.productId">
                      <td>{{ item.productName }}</td>
                      <td>{{ item.quantity }}</td>
                      <td class="text-end">₱{{ (item.price * item.quantity).toFixed(2) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="2" class="text-end"><strong>Subtotal</strong></td>
                      <td class="text-end">₱{{ order.subtotal.toFixed(2) }}</td>
                    </tr>
                    <tr>
                      <td colspan="2" class="text-end"><strong>Shipping Fee</strong></td>
                      <td class="text-end">₱{{ order.shippingFee.toFixed(2) }}</td>
                    </tr>
                    <tr>
                      <td colspan="2" class="text-end"><strong>Total</strong></td>
                      <td class="text-end"><strong>₱{{ order.total.toFixed(2) }}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <div class="shipping-info mt-4">
              <h3 class="h5 mb-3">Shipping Information</h3>
              <div class="card bg-light">
                <div class="card-body">
                  <p class="mb-1"><strong>Name:</strong> {{ order.fullName }}</p>
                  <p class="mb-1"><strong>Phone:</strong> {{ order.shippingInfo.phone }}</p>
                  <template v-if="order.orderType === 'delivery'">
                    <p class="mb-0"><strong>Address:</strong> {{ order.shippingInfo.streetAddress }}, {{ order.shippingInfo.barangay }}, {{ order.shippingInfo.municipality }}</p>
                  </template>
                  <template v-else>
                    <p class="mb-0"><strong>Pickup Location:</strong> Store Address, City</p>
                  </template>
                </div>
              </div>
            </div>
            
            <div class="mt-4 d-flex justify-content-between">
              <router-link to="/user/orders" class="btn btn-primary">
                <i class="bi bi-list-ul me-2"></i>View All Orders
              </router-link>
              <router-link to="/user/shop" class="btn btn-outline-secondary">
                <i class="bi bi-cart me-2"></i>Continue Shopping
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { getAuth } from 'firebase/auth';
  import { db } from '../firebaseConfig';
  import { doc, getDoc } from 'firebase/firestore';
  
  const route = useRoute();
  const router = useRouter();
  const order = ref(null);
  const loading = ref(true);
  const error = ref(null);
  
  const fetchOrderDetails = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      try {
        const orderId = route.params.orderId;
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (orderDoc.exists() && orderDoc.data().userId === user.uid) {
          order.value = { id: orderDoc.id, ...orderDoc.data() };
        } else {
          error.value = 'Order not found or you do not have permission to view it.';
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        error.value = 'An error occurred while fetching order details. Please try again.';
      } finally {
        loading.value = false;
      }
    } else {
      error.value = 'You must be logged in to view order details.';
      loading.value = false;
      router.push('/login');
    }
  };
  
  const formatDate = (date) => {
    return new Date(date.seconds * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  
  onMounted(fetchOrderDetails);
  </script>
  
  <style scoped>
  .order-confirmation {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .card {
    border: none;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  
  .card-title {
    color: #333;
    font-weight: 600;
  }
  
  .btn-primary {
    background-color: #0d6efd;
    border-color: #0d6efd;
    transition: all 0.3s ease;
  }
  
  .btn-primary:hover {
    background-color: #0b5ed7;
    border-color: #0a58ca;
    transform: translateY(-2px);
  }
  
  .btn-outline-secondary {
    transition: all 0.3s ease;
  }
  
  .btn-outline-secondary:hover {
    transform: translateY(-2px);
  }
  
  .table {
    border-collapse: separate;
    border-spacing: 0 0.5rem;
  }
  
  .table th,
  .table td {
    vertical-align: middle;
  }
  
  .badge {
    font-size: 0.9em;
    padding: 0.5em 0.75em;
  }
  
  .shipping-info .card {
    border-radius: 10px;
  }
  </style>