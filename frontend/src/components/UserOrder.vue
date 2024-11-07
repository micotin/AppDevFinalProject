<template>
  <div class="user-order bg-light">
    <div class="container py-5">
      <h1 class="display-4 text-center mb-5">My Orders</h1>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="error" class="alert alert-danger" role="alert">
        <h4 class="alert-heading">Error</h4>
        <p>{{ error }}</p>
        <button @click="retryFetchOrders" class="btn btn-outline-danger mt-3">
          <i class="bi bi-arrow-clockwise me-2"></i>Retry
        </button>
      </div>

      <template v-else>
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-8">
                <div class="input-group">
                  <span class="input-group-text bg-white border-end-0">
                    <i class="bi bi-search"></i>
                  </span>
                  <input 
                    v-model="searchQuery" 
                    type="text" 
                    class="form-control border-start-0"
                    placeholder="Search orders by ID or product name"
                  >
                </div>
              </div>
              <div class="col-md-4">
                <select 
                  v-model="sortBy" 
                  class="form-select"
                >
                  <option value="date">Sort by Date</option>
                  <option value="status">Sort by Status</option>
                  <option value="total">Sort by Total</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredActiveOrders.length === 0 && filteredHistoryOrders.length === 0" class="text-center py-5">
          <i class="bi bi-box-seam display-1 text-muted"></i>
          <h3 class="mt-3">No orders found</h3>
          <p class="text-muted">Try adjusting your search to find what you're looking for.</p>
        </div>

        <template v-else>
          <ul class="nav nav-pills mb-4">
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'active' }" @click.prevent="activeTab = 'active'" href="#">Active Orders</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'history' }" @click.prevent="activeTab = 'history'" href="#">Order History</a>
            </li>
          </ul>

          <div v-show="activeTab === 'active'">
            <div 
              v-for="order in paginatedActiveOrders" 
              :key="order.id" 
              class="card mb-4 shadow-sm order-card"
            >
              <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Order #{{ order.id }}</h5>
                <span :class="['badge', statusClasses[order.status]]">
                  {{ order.status }}
                </span>
              </div>
              <div class="card-body">
                <div class="row mb-3">
                  <div class="col-md-6">
                    <p class="mb-1"><strong>Order Date:</strong></p>
                    <p>{{ formatDate(order.createdAt) }}</p>
                  </div>
                  <div class="col-md-6 text-md-end">
                    <p class="mb-1"><strong>Total:</strong></p>
                    <p class="text-primary h4">₱{{ order.total.toFixed(2) }}</p>
                  </div>
                </div>
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in order.items" :key="item.productId">
                        <td>
                          <div class="d-flex align-items-center">
                            <img 
                              :src="item.imageUrl" 
                              :alt="item.productName"
                              class="me-3 rounded"
                              style="width: 48px; height: 48px; object-fit: cover;"
                              @error="handleImageError"
                            >
                            {{ item.productName }}
                          </div>
                        </td>
                        <td>{{ item.quantity }}</td>
                        <td>₱{{ item.price.toFixed(2) }}</td>
                        <td>₱{{ (item.price * item.quantity).toFixed(2) }}</td>
                        <td>
                          <button 
                            @click="viewProduct(item.productId)" 
                            class="btn btn-sm btn-outline-primary"
                          >
                            View Product
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="mt-4">
                  <h6 class="mb-3">Order Status Timeline:</h6>
                  <div class="timeline">
                    <div 
                      v-for="(status, index) in order.statusTimeline" 
                      :key="index" 
                      class="timeline-item"
                      :class="{ 'active': index === order.statusTimeline.length - 1 }"
                    >
                      <div class="timeline-badge"></div>
                      <div class="timeline-panel">
                        <div class="timeline-heading">
                          <h6 class="timeline-title">{{ status.status }}</h6>
                          <p><small class="text-muted"><i class="bi bi-clock"></i> {{ formatDate(status.timestamp) }}</small></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mt-4 alert alert-info">
                  <i class="bi bi-info-circle-fill me-2"></i>
                  <strong>Order Information:</strong> 
                  <span v-if="order.status === 'To Pay'">
                    To cancel this order, please contact the shop. Full refund available.
                  </span>
                  <span v-else-if="order.status === 'Processing'">
                    To cancel this order, please contact the shop. 60-70% refund available, depending on the order.
                  </span>
                  <span v-else-if="order.status === 'Ready to Pick Up'">
                    To cancel this order, please contact the shop. 50% refund available.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-show="activeTab === 'history'">
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              <div v-for="order in paginatedHistoryOrders" :key="order.id" class="col">
                <div class="card h-100 shadow-sm order-history- card">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Order #{{ order.id }}</h5>
                    <span :class="['badge', statusClasses[order.status]]">
                      {{ order.status }}
                    </span>
                  </div>
                  <div class="card-body">
                    <p><strong>Date:</strong> {{ formatDate(order.createdAt) }}</p>
                    <p><strong>Total:</strong> ₱{{ order.total.toFixed(2) }}</p>
                    <h6 class="mt-3">Products:</h6>
                    <ul class="list-group">
                      <li v-for="item in order.items.slice(0, 3)" :key="item.productId" class="list-group-item d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                          <img 
                            :src="item.imageUrl" 
                            :alt="item.productName"
                            class="me-2 rounded"
                            style="width: 32px; height: 32px; object-fit: cover;"
                            @error="handleImageError"
                          >
                          <span>{{ item.productName }} (x{{ item.quantity }})</span>
                        </div>
                        <span>₱{{ (item.price * item.quantity).toFixed(2) }}</span>
                      </li>
                      <li v-if="order.items.length > 3" class="list-group-item">
                        <span>+{{ order.items.length - 3 }} more</span>
                      </li>
                    </ul>
                  </div>
                  <div class="card-footer text-end">
                    <button 
                      @click="viewOrderDetails(order.id)" 
                      class="btn btn-sm btn-outline-primary"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <nav v-if="totalPages > 1" aria-label="Order pagination" class="mt-4">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button @click="currentPage--" class="page-link" :disabled="currentPage === 1">
                  Previous
                </button>
              </li>
              <li v-for="page in displayedPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
                <button v-if="typeof page === 'number'" @click="currentPage = page" class="page-link">
                  {{ page }}
                </button>
                <span v-else class="page-link">{{ page }}</span>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button @click="currentPage++" class="page-link" :disabled="currentPage === totalPages">
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </template>
      </template>
    </div>

    <!-- Order Details Modal -->
    <div class="modal fade" id="orderDetailsModal" tabindex="-1" aria-labelledby="orderDetailsModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="orderDetailsModalLabel">Order Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedOrder">
            <h6>Order #{{ selectedOrder.id }}</h6>
            <p><strong>Date:</strong> {{ formatDate(selectedOrder.createdAt) }}</p>
            <p><strong>Status:</strong> 
              <span :class="['badge', statusClasses[selectedOrder.status]]">
                {{ selectedOrder.status }}
              </span>
            </p>
            <p><strong>Total:</strong> ₱{{ selectedOrder.total.toFixed(2) }}</p>
            <h6 class="mt-4">Items:</h6>
            <ul class="list-group">
              <li v-for="item in selectedOrder.items" :key="item.productId" class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                  <div class="d-flex align-items-center">
                    <img 
                      :src="item.imageUrl" 
                      :alt="item.productName"
                      class="me-3 rounded"
                      style="width: 48px; height: 48px; object-fit : cover;"
                      @error="handleImageError"
                    >
                    <span>{{ item.productName }} (x{{ item.quantity }})</span>
                  </div>
                  <span>₱{{ (item.price * item.quantity).toFixed(2) }}</span>
                </div>
              </li>
            </ul>
            <h6 class="mt-4">Order Timeline:</h6>
            <div class="timeline">
              <div 
                v-for="(status, index) in selectedOrder.statusTimeline" 
                :key="index" 
                class="timeline-item"
                :class="{ 'active': index === selectedOrder.statusTimeline.length - 1 }"
              >
                <div class="timeline-badge"></div>
                <div class="timeline-panel">
                  <div class="timeline-heading">
                    <h6 class="timeline-title">{{ status.status }}</h6>
                    <p><small class="text-muted"><i class="bi bi-clock"></i> {{ formatDate(status.timestamp) }}</small></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { Modal } from 'bootstrap'

export default {
  name: 'User Order',
  setup() {
    const router = useRouter()
    const db = getFirestore()

    const orders = ref([])
    const loading = ref(true)
    const error = ref(null)
    const searchQuery = ref('')
    const sortBy = ref('date')
    const currentPage = ref(1)
    const ordersPerPage = 5
    const selectedOrder = ref(null)
    const activeTab = ref('active')

    const statusClasses = {
      'To Pay': 'bg-warning text-dark',
      'Processing': 'bg-info text-dark',
      'Ready to Pick Up': 'bg-primary',
      'Picked Up': 'bg-success',
      'Delivered': 'bg-success',
      'Cancelled': 'bg-danger',
    }

    const fetchOrders = async () => {
      try {
        loading.value = true
        error.value = null
        const auth = getAuth()
        const currentUser  = auth.currentUser 
        
        if (!currentUser ) {
          error.value = 'Please login to view your orders'
          loading.value = false
          return
        }

        const ordersRef = collection(db, 'orders')
        const q = query(ordersRef, where('userId', '==', currentUser .uid))
        const orderSnapshot = await getDocs(q)

        if (orderSnapshot.empty) {
          orders.value = []
          loading.value = false
          return
        }

        const productIds = new Set()
        orderSnapshot.docs.forEach(doc => {
          const orderData = doc.data()
          orderData.items.forEach(item => {
            productIds.add(item.productId)
          })
        })

        const productsRef = collection(db, 'products')
        const productsSnapshot = await getDocs(productsRef)
        const productsMap = new Map(
          productsSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }])
        )

        orders.value = orderSnapshot.docs.map(doc => {
          const orderData = doc.data()
          return {
            id: doc.id,
            ...orderData,
            items: orderData.items.map(item => {
              const product = productsMap.get(item.productId)
              return {
                ...item,
                productName: product?.name || 'Product Not Found',
                imageUrl: product?.imageUrl || '/placeholder.svg?height=48&width=48',
              }
            }),
            statusTimeline: orderData.statusTimeline || [
              {
                status: orderData.status,
                timestamp: orderData.createdAt
              }
            ]
          }
        })

        loading.value = false
      } catch (err) {
        console.error('Error fetching orders:', err)
        error.value = 'An error occurred while fetching orders. Please try again later.'
        loading.value = false
      }
    }

    const retryFetchOrders = () => {
      fetchOrders()
    }

    const formatDate = (date) => {
      return new Date(date.seconds * 1000).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const handleImageError = (event) => {
      event.target.src = '/placeholder.svg?height=48&width=48'
    }

    const viewProduct = (productId) => {
      router.push({ name: 'User ViewProduct', params: { id: productId } })
    }

    const viewOrderDetails = async (orderId) => {
      try {
        const orderRef = doc(db, 'orders', orderId)
        const orderDoc = await getDoc(orderRef)
        if (orderDoc.exists()) {
          selectedOrder.value = { id: orderDoc.id, ...orderDoc.data() }
          const modal = new Modal(document.getElementById('orderDetailsModal'))
          modal.show()
        } else {
          console.error('Order not found')
        }
      } catch (error) {
        console.error('Error fetching order details:', error)
      }
    }

    const filteredOrders = computed(() => {
      let filtered = orders.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(order => 
          order.id.toLowerCase().includes(query) ||
          order.items.some(item => item.productName.toLowerCase().includes(query))
        )
      }

      switch (sortBy.value) {
        case 'date':
          filtered.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
          break
        case 'status':
          filtered.sort((a, b) => a.status.localeCompare(b.status))
          break
        case 'total':
          filtered.sort((a, b) => b.total - a.total)
          break
      }

      return filtered
    })

    const filteredActiveOrders = computed(() => {
      return filteredOrders.value.filter(order => 
        !['Picked Up', 'Delivered', 'Cancelled'].includes(order.status)
      )
    })

    const filteredHistoryOrders = computed(() => {
      return filteredOrders.value.filter(order => 
        ['Picked Up', 'Delivered', 'Cancelled'].includes(order.status)
      )
    })

    const paginatedActiveOrders = computed(() => {
      const startIndex = (currentPage.value - 1) * ordersPerPage
      const endIndex = startIndex + ordersPerPage
      return filteredActiveOrders.value.slice(startIndex, endIndex)
    })

    const paginatedHistoryOrders = computed(() => {
      const startIndex = (currentPage.value - 1) * ordersPerPage
      const endIndex = startIndex + ordersPerPage
      return filteredHistoryOrders.value.slice(startIndex, endIndex)
    })

    const totalPages = computed(() => Math.ceil(
      (activeTab.value === 'active' ? filteredActiveOrders.value.length : filteredHistoryOrders.value.length) / ordersPerPage
    ))

    const displayedPages = computed(() => {
      const delta = 2
      const range = []
      for (let i = Math.max(2, currentPage.value - delta); i <= Math.min(totalPages.value - 1, currentPage.value + delta); i++) {
        range.push(i)
      }

      if (currentPage.value - delta > 2) {
        range.unshift("...")
      }
      if (currentPage.value + delta < totalPages.value - 1) {
        range.push("...")
      }

      range.unshift(1)
      if (totalPages.value !== 1) {
        range.push(totalPages.value)
      }

      return range
    })

    // Reset page when search query, sort method, or active tab changes
    watch([searchQuery, sortBy, activeTab], () => {
      currentPage.value = 1
    })

    onMounted(() => {
      fetchOrders()
    })

    return {
      orders,
      loading,
      error,
      searchQuery,
      sortBy,
      currentPage,
      statusClasses,
      filteredActiveOrders,
      filteredHistoryOrders,
      paginatedActiveOrders,
      paginatedHistoryOrders,
      totalPages,
      displayedPages,
      selectedOrder,
      activeTab,
      formatDate,
      handleImageError,
      viewProduct,
      viewOrderDetails,
      retryFetchOrders
    }
  }
}
</script>

<style scoped>
.user-order {
  min-height: 100vh;
}

.order-card {
  transition: all 0.3s ease;
}

.order-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.table th {
  font-weight: 600;
}

.badge {
  font-size: 0.875rem;
}

.nav 
-pills .nav-link {
  color: #6c757d;
  cursor: pointer;
}

.nav-pills .nav-link.active {
  background-color: #6a3093;
  color: #fff;
}

.pagination {
  --bs-pagination-color: #6a3093;
  --bs-pagination-hover-color: #a044ff;
  --bs-pagination-focus-color: #a044ff;
  --bs-pagination-active-bg: #6a3093;
  --bs-pagination-active-border-color: #6a3093;
}

.btn-outline-primary {
  --bs-btn-color: #6a3093;
  --bs-btn-border-color: #6a3093;
  --bs-btn-hover-bg: #6a3093;
  --bs-btn-hover-border-color: #6a3093;
  --bs-btn-active-bg: #6a3093;
  --bs-btn-active-border-color: #6a3093;
}

.text-primary {
  color: #6a3093 !important;
}

.list-group-item {
  transition: background-color 0.3s ease;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.timeline {
  position: relative;
  padding: 20px 0;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 20px;
  width: 2px;
  background: #e9ecef;
}

.timeline-item {
  position: relative;
  margin-bottom: 30px;
}

.timeline-badge {
  position: absolute;
  left: 16px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #6a3093;
  border: 2px solid #fff;
}

.timeline-panel {
  position: relative;
  margin-left: 40px;
  background: #fff;
  border-radius: 4px;
  padding: 10px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}

.timeline-title {
  margin: 0;
  color: #495057;
}

.timeline-item.active .timeline-badge {
  background: #28a745;
}

.timeline-item.active .timeline-panel {
  border-left: 3px solid #28a745;
}

.order-history-card {
  transition: all 0.3s ease;
}

.order-history-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}
</style>