<template>
    <div class="admin-orders bg-light min-vh-100 py-5">
      <div class="container-fluid px-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 class="h2 mb-0">Manage Orders</h1>
          <button @click="exportOrders" class="btn btn-success">
            <i class="bi bi-file-earmark-excel me-2"></i>Export to Excel
          </button>
        </div>
  
        <!-- Navigation Tabs -->
        <ul class="nav nav-tabs mb-4">
          <li class="nav-item">
            <a 
              class="nav-link" 
              :class="{ active: activeTab === 'delivery' }"
              href="#"
              @click.prevent="activeTab = 'delivery'"
            >
              <i class="bi bi-truck me-2"></i>Delivery Orders
            </a>
          </li>
          <li class="nav-item">
            <a 
              class="nav-link" 
              :class="{ active: activeTab === 'pickup' }"
              href="#"
              @click.prevent="activeTab = 'pickup'"
            >
              <i class="bi bi-shop me-2"></i>Pickup Orders
            </a>
          </li>
          <li class="nav-item">
            <a 
              class="nav-link" 
              :class="{ active: activeTab === 'completed' }"
              href="#"
              @click.prevent="activeTab = 'completed'"
            >
              <i class="bi bi-check-circle me-2"></i>Completed Orders
            </a>
          </li>
        </ul>
  
        <!-- Order Sections -->
        <div v-for="section in ['delivery', 'pickup', 'completed']" :key="section">
          <div v-show="activeTab === section" class="order-section">
            <div class="card shadow-sm">
              <div class="card-body">
                <!-- Search and Filter Controls -->
                <div class="row g-3 mb-4">
                  <div class="col-md-6 col-lg-4">
                    <div class="input-group">
                      <span class="input-group-text bg-white border-end-0">
                        <i class="bi bi-search"></i>
                      </span>
                      <input 
                        v-model="searchQueries[section]" 
                        type="text" 
                        class="form-control border-start-0"
                        :placeholder="`Search ${section} orders...`"
                      >
                    </div>
                  </div>
                  <div class="col-md-3 col-lg-2">
                    <select v-model="statusFilters[section]" class="form-select">
                      <option value="">All Statuses</option>
                      <option v-for="status in getStatusOptions(section)" :key="status" :value="status">
                        {{ status }}
                      </option>
                    </select>
                  </div>
                  <div class="col-md-6 col-lg-4">
                    <div class="input-group">
                      <span class="input-group-text bg-white">From</span>
                      <input type="date" v-model="dateFilters[section].from" class="form-control">
                      <span class="input-group-text bg-white">To</span>
                      <input type="date" v-model="dateFilters[section].to" class="form-control">
                    </div>
                  </div>
                </div>
  
                <!-- Loading State -->
                <div v-if="loading" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
  
                <!-- Empty State -->
                <div v-else-if="getFilteredOrders(section).length === 0" class="text-center py-5">
                  <i class="bi bi-inbox display-1 text-muted"></i>
                  <p class="lead mt-3 text-muted">No {{ section }} orders found</p>
                </div>
  
                <!-- Orders Table -->
                <div v-else class="table-responsive">
                  <table class="table table-hover align-middle">
                    <thead class="table-light">
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>{{ section === 'pickup' ? 'Pickup Date' : 'Date' }}</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="order in getPaginatedOrders(section)" :key="order.id">
                        <td>
                          <span class="fw-medium">#{{ order.id }}</span>
                        </td>
                        <td>
                          <div class="d-flex flex-column">
                            <span>{{ `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}` }}</span>
                            <small class="text-muted">{{ order.shippingInfo.email }}</small>
                          </div>
                        </td>
                        <td>{{ formatDate(getRelevantDate(order, section)) }}</td>
                        <td>₱{{ order.total.toFixed(2) }}</td>
                        <td>
                          <span :class="['badge', getStatusClass(order.status)]">
                            {{ order.status }}
                          </span>
                        </td>
                        <td>
                          <div class="btn-group">
                            <button 
                              @click="viewOrderDetails(order)" 
                              class="btn btn-sm btn-outline-primary"
                              title="View Details"
                            >
                              <i class="bi bi-eye"></i>
                            </button>
                            <button 
                              v-if="section !== 'completed'"
                              @click="updateOrderStatus(order)" 
                              class="btn btn-sm btn-outline-secondary"
                              title="Update Status"
                            >
                              <i class="bi bi-pencil"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
  
                <!-- Pagination -->
                <nav v-if="getTotalPages(section) > 1" class="mt-4">
                  <ul class="pagination justify-content-center">
                    <li class="page-item" :class="{ disabled: currentPages[section] === 1 }">
                      <button 
                        @click="currentPages[section]--" 
                        class="page-link"
                        :disabled="currentPages[section] === 1"
                      >
                        <i class="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    <li 
                      v-for="page in getDisplayedPages(section)" 
                      :key="page" 
                      class="page-item"
                      :class="{ active: currentPages[section] === page }"
                    >
                      <button 
                        v-if="typeof page === 'number'" 
                        @click="currentPages[section] = page" 
                        class="page-link"
                      >
                        {{ page }}
                      </button>
                      <span v-else class="page-link">{{ page }}</span>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPages[section] === getTotalPages(section) }">
                      <button 
                        @click="currentPages[section]++" 
                        class="page-link"
                        :disabled="currentPages[section] === getTotalPages(section)"
                      >
                        <i class="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Order Details Modal -->
      <div class="modal fade" id="orderDetailsModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Order Details</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" v-if="selectedOrder">
              <div class="row mb-4">
                <div class="col-md-6">
                  <h6 class="fw-bold mb-3">Customer Information</h6>
                  <p class="mb-1">
                    <strong>Name:</strong> 
                    {{ `${selectedOrder.shippingInfo.firstName} ${selectedOrder.shippingInfo.lastName}` }}
                  </p>
                  <p class="mb-1">
                    <strong>Email:</strong> {{ selectedOrder.shippingInfo.email }}
                  </p>
                  <p class="mb-1">
                    <strong>Phone:</strong> {{ selectedOrder.shippingInfo.phone }}
                  </p>
                </div>
                <div class="col-md-6">
                  <h6 class="fw-bold mb-3">Order Information</h6>
                  <p class="mb-1"><strong>Order ID:</strong> #{{ selectedOrder.id }}</p>
                  <p class="mb-1">
                    <strong>Date:</strong> {{ formatDate(selectedOrder.createdAt) }}
                  </p>
                  <p class="mb-1">
                  <strong>Status:</strong>
                    <span :class="['badge ms-2', getStatusClass(selectedOrder.status)]">
                      {{ selectedOrder.status }}
                    </span>
                  </p>
                  <p class="mb-1">
                    <strong>Payment Method:</strong> {{ selectedOrder.paymentMethod }}
                  </p>
                  <p class="mb-1" v-if="selectedOrder.gcashReference">
                    <strong>GCash Reference:</strong> {{ selectedOrder.gcashReference }}
                  </p>
                </div>
              </div>
  
              <div v-if="selectedOrder.deliveryMethod === 'delivery'" class="mb-4">
                <h6 class="fw-bold mb-3">Delivery Address</h6>
                <p class="mb-1">
                  {{ selectedOrder.shippingInfo.street }},
                  {{ selectedOrder.shippingInfo.barangay }},
                  {{ selectedOrder.shippingInfo.municipality }}
                </p>
              </div>
  
              <div v-else class="mb-4">
                <h6 class="fw-bold mb-3">Pickup Information</h6>
                <p class="mb-1">
                  <strong>Pickup Date:</strong> {{ formatDate(selectedOrder.pickupDate) }}
                </p>
                <p class="mb-1">
                  <strong>Pickup Location:</strong> Calapan City, Lumangbayan
                </p>
              </div>
  
              <h6 class="fw-bold mb-3">Order Items</h6>
              <div class="table-responsive mb-4">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Image</th>
                      <th class="text-center">Quantity</th>
                      <th class="text-end">Price</th>
                      <th class="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in selectedOrder.items" :key="item.productId">
                      <td>{{ item.productName }}</td>
                      <td>
                        <img :src="item.imageUrl" :alt="item.productName" class="product-image" />
                      </td>
                      <td class="text-center">{{ item.quantity }}</td>
                      <td class="text-end">₱{{ item.price.toFixed(2) }}</td>
                      <td class="text-end">₱{{ (item.price * item.quantity).toFixed(2) }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="table-light">
                    <tr>
                      <td colspan="4" class="text-end"><strong>Subtotal:</strong></td>
                      <td class="text-end">₱{{ selectedOrder.subtotal.toFixed(2) }}</td>
                    </tr>
                    <tr v-if="selectedOrder.deliveryMethod === 'delivery'">
                      <td colspan="4" class="text-end"><strong>Delivery Fee:</strong></td>
                      <td class="text-end">₱{{ selectedOrder.deliveryFee.toFixed(2) }}</td>
                    </tr>
                    <tr>
                      <td colspan="4" class="text-end"><strong>Total:</strong></td>
                      <td class="text-end"><strong>₱{{ selectedOrder.total.toFixed(2) }}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
  
              <h6 class="fw-bold mb-3">Status Timeline</h6>
              <ul class="list-group">
                <li 
                  v-for="(status, index) in selectedOrder.statusTimeline" 
                  :key="index"
                  class="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span :class="['badge', getStatusClass(status.status)]">
                    {{ status.status }}
                  </span>
                  <small class="text-muted">{{ formatDate(status.timestamp) }}</small>
                </li>
              </ul>
  
              <div v-if="selectedOrder.gcashScreenshotUrl" class="mt-4">
                <h6 class="fw-bold mb-3">Payment Screenshot</h6>
                <img :src="selectedOrder.gcashScreenshotUrl" alt="GCash Payment Screenshot" class="img-fluid rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Update Status Modal -->
      <div class="modal fade" id="updateStatusModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Update Order Status</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="submitStatusUpdate">
                <div class="mb-3">
                  <label for="newStatus" class="form-label">New Status</label>
                  <select 
                    v-model="newStatus" 
                    id="newStatus" 
                    class="form-select"
                    required
                  >
                    <option 
                      v-for="status in getAvailableStatuses(selectedOrder?.deliveryMethod)" 
                      :key="status" 
                      :value="status"
                    >
                      {{ status }}
                    </option>
                  </select>
                </div>
                <div class="d-flex justify-content-end gap-2">
                  <button 
                    type="button" 
                    class="btn btn-secondary" 
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary">
                    Update Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, watch } from 'vue'
  import { getFirestore, collection, getDocs, doc, updateDoc, query, orderBy, addDoc, serverTimestamp, where } from 'firebase/firestore'
  import { getAuth } from 'firebase/auth'
  import { Modal } from 'bootstrap'
  import { db } from '../firebaseConfig'
  
  export default {
    name: 'AdminOrders',
    setup() {
      // State
      const orders = ref([])
      const loading = ref(true)
      const activeTab = ref('delivery')
      const selectedOrder = ref(null)
      const newStatus = ref('')
  
      // Unified state for all sections
      const searchQueries = ref({
        delivery: '',
        pickup: '',
        completed: ''
      })
      const statusFilters = ref({
        delivery: '',
        pickup: '',
        completed: ''
      })
      const dateFilters = ref({
        delivery: { from: '', to: '' },
        pickup: { from: '', to: '' },
        completed: { from: '', to: '' }
      })
      const currentPages = ref({
        delivery: 1,
        pickup: 1,
        completed: 1
      })
      const itemsPerPage = 10
  
      // Status configurations
      const deliveryStatuses = ['Processing', 'In Transit', 'Out for Delivery', 'Cancelled']
      const pickupStatuses = ['Processing', 'Ready for Pickup', 'Cancelled']
      const completedStatuses = ['Picked Up', 'Delivered']
  
      const auth = getAuth()
  
      // Fetch orders from Firestore
      const fetchOrders = async () => {
        try {
          loading.value = true
          const ordersRef = collection(db, 'orders')
          const q = query(ordersRef, orderBy('createdAt', 'desc'))
          const querySnapshot = await getDocs(q)
          orders.value = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        } catch (error) {
          console.error('Error fetching orders:', error)
        } finally {
          loading.value = false
        }
      }
  
      // Utility functions
      const formatDate = (date) => {
        if (!date) return ''
        return new Date(date.seconds * 1000).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
  
      const getStatusClass = (status) => {
        const classes = {
          'Processing': 'bg-warning text-dark',
          'In Transit': 'bg-info',
          'Out for Delivery': 'bg-primary',
          'Delivered': 'bg-success',
          'Ready for Pickup': 'bg-info',
          'Picked Up': 'bg-success',
          'Cancelled': 'bg-danger'
        }
        return classes[status] || 'bg-secondary'
      }
  
      const getAvailableStatuses = (deliveryMethod) => {
        if (deliveryMethod === 'pickup') {
          return [...pickupStatuses, ...completedStatuses]
        } else {
          return [...deliveryStatuses, ...completedStatuses]
        }
      }
  
      const getStatusOptions = (section) => {
        switch (section) {
          case 'delivery':
            return deliveryStatuses
          case 'pickup':
            return pickupStatuses
          case 'completed':
            return completedStatuses
          default:
            return []
        }
      }
  
      const getRelevantDate = (order, section) => {
        if (section === 'pickup') {
          return order.pickupDate
        } else if (section === 'completed') {
          return order.status === 'Picked Up' ? order.pickupDate : order.deliveredDate
        } else {
          return order.createdAt
        }
      }
  
      // Modal handlers
      const viewOrderDetails = (order) => {
        selectedOrder.value = order
        const modal = new Modal(document.getElementById('orderDetailsModal'))
        modal.show()
      }
  
      const updateOrderStatus = (order) => {
        selectedOrder.value = order
        newStatus.value = order.status
        const modal = new Modal(document.getElementById('updateStatusModal'))
        modal.show()
      }
  
      const submitStatusUpdate = async () => {
        try {
          const orderRef = doc(db, 'orders', selectedOrder.value.id)
          const oldStatus = selectedOrder.value.status
  
          // Ensure statusTimeline is an array before spreading
          const currentStatusTimeline = Array.isArray(selectedOrder.value.statusTimeline) 
            ? selectedOrder.value.statusTimeline 
            : []
  
          // Update order status
          await updateDoc(orderRef, {
            status: newStatus.value,
            statusTimeline: [
              ...currentStatusTimeline,
              {
                status: newStatus.value,
                timestamp: new Date()
              }
            ]
          })
  
          // Update pickup or delivery date
          if (newStatus.value === 'Picked Up' || newStatus.value === 'Delivered') {
            const dateField = newStatus.value === 'Picked Up' ? 'pickupDate' : 'deliveredDate'
            await updateDoc(orderRef, {
              [dateField]: new Date()
            })
          }
  
          // Record admin action
          await addDoc(collection(db, 'adminHistory'), {
            adminEmail: auth.currentUser.email,
            action: 'Updated order status',
            orderId: selectedOrder.value.id,
            oldStatus,
            newStatus: newStatus.value,
            timestamp: serverTimestamp()
          })
  
          // Update local state
          const index = orders.value.findIndex(o => o.id === selectedOrder.value.id)
          if (index !== -1) {
            orders.value[index].status = newStatus.value
            if (!Array.isArray(orders.value[index].statusTimeline)) {
              orders.value[index].statusTimeline = []
            }
            orders.value[index].statusTimeline.push({
              status: newStatus.value,
              timestamp: new Date()
            })
            if (newStatus.value === 'Picked Up' || newStatus.value === 'Delivered') {
              orders.value[index][newStatus.value === 'Picked Up' ? 'pickupDate' : 'deliveredDate'] = new Date()
            }
          }
  
          // Close modal and show success message
          const modal = Modal.getInstance(document.getElementById('updateStatusModal'))
          modal.hide()
          alert('Order status updated successfully')
        } catch (error) {
          console.error('Error updating order status:', error)
          alert('An error occurred while updating the order status')
        }
      }
  
      // Filtered orders
      const getFilteredOrders = (section) => {
        return computed(() => {
          let filtered = orders.value
  
          // Filter by section
          if (section === 'delivery') {
            filtered = filtered.filter(order => 
              order.deliveryMethod === 'delivery' && 
              !completedStatuses.includes(order.status)
            )
          } else if (section === 'pickup') {
            filtered = filtered.filter(order => 
              order.deliveryMethod === 'pickup' && 
              !completedStatuses.includes(order.status)
            )
          } else if (section === 'completed') {
            filtered = filtered.filter(order => 
              completedStatuses.includes(order.status)
            )
          }
  
          // Apply search query
          if (searchQueries.value[section]) {
            const query = searchQueries.value[section].toLowerCase()
            filtered = filtered.filter(order => 
              order.id.toLowerCase().includes(query) ||
              `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`.toLowerCase().includes(query) ||
              order.shippingInfo.email.toLowerCase().includes(query)
            )
          }
  
          // Apply status filter
          if (statusFilters.value[section]) {
            filtered = filtered.filter(order => order.status === statusFilters.value[section])
          }
  
          // Apply date filter
          if (dateFilters.value[section].from && dateFilters.value[section].to) {
            const fromDate = new Date(dateFilters.value[section].from)
            const toDate = new Date(dateFilters.value[section].to)
            toDate.setHours(23, 59, 59, 999) // Set to end of day
            filtered = filtered.filter(order => {
              const orderDate = new Date(getRelevantDate(order, section).seconds * 1000)
              return orderDate >= fromDate && orderDate <= toDate
            })
          }
  
          return filtered
        }).value
      }
  
      // Paginated orders
      const getPaginatedOrders = (section) => {
        const filtered = getFilteredOrders(section)
        const startIndex = (currentPages.value[section] - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filtered.slice(startIndex, endIndex)
      }
  
      // Total pages
      const getTotalPages = (section) => {
        return Math.ceil(getFilteredOrders(section).length / itemsPerPage)
      }
  
      // Pagination display logic
      const getDisplayedPages = (section) => {
        const currentPage = currentPages.value[section]
        const totalPages = getTotalPages(section)
        const delta = 2
        const range = []
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
          range.push(i)
        }
  
        if (currentPage - delta > 2) {
          range.unshift("...")
        }
        if (currentPage + delta < totalPages - 1) {
          range.push("...")
        }
  
        range.unshift(1)
        if (totalPages !== 1) {
          range.push(totalPages)
        }
  
        return range
      }
  
      const exportOrders = async () => {
        try {
          const ordersToExport = getFilteredOrders(activeTab.value)
          const csvContent = generateCSV(ordersToExport)
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
          const link = document.createElement('a')
          if (link.download !== undefined) {
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', `${activeTab.value}_orders_${new Date().toISOString()}.csv`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }
        } catch (error) {
          console.error('Error exporting orders:', error)
          alert('An error occurred while exporting orders')
        }
      }
  
      const generateCSV = (orders) => {
        const headers = ['Order ID', 'Customer Name', 'Email', 'Phone', 'Date', 'Status', 'Total', 'Payment Method']
        const rows = orders.map(order => [
          order.id,
          `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
          order.shippingInfo.email,
          order.shippingInfo.phone,
          formatDate(order.createdAt),
          order.status,
          order.total.toFixed(2),
          order.paymentMethod
        ])
        return [headers, ...rows].map(row => row.join(',')).join('\n')
      }
  
      // Watch for changes in filter inputs
      watch([searchQueries, statusFilters, dateFilters], () => {
        currentPages.value = {
          delivery: 1,
          pickup: 1,
          completed: 1
        }
      })
  
      onMounted(() => {
        fetchOrders()
      })
  
      return {
        // State
        orders,
        loading,
        activeTab,
        selectedOrder,
        newStatus,
        searchQueries,
        statusFilters,
        dateFilters,
        currentPages,
        
        // Methods
        formatDate,
        getStatusClass,
        getAvailableStatuses,
        getStatusOptions,
        getRelevantDate,
        viewOrderDetails,
        updateOrderStatus,
        submitStatusUpdate,
        getFilteredOrders,
        getPaginatedOrders,
        getTotalPages,
        getDisplayedPages,
        exportOrders
      }
    }
  }
  </script>
  
  <style scoped>
  .admin-orders {
    min-height: 100vh;
  }
  
  .nav-tabs .nav-link {
    color: #6c757d;
    border: none;
    padding: 1rem 1.5rem;
    font-weight: 500;
  }
  
  .nav-tabs .nav-link.active {
    color: #6a3093;
    border-bottom: 2px solid #6a3093;
    background: none;
  }
  
  .nav-tabs .nav-link:hover:not(.active) {
    border-bottom: 2px solid #e9ecef;
  }
  
  .table th {
    font-weight: 600;
    white-space: nowrap;
  }
  
  .badge {
    font-weight: 500;
    padding: 0.5em 0.75em;
  }
  
  .btn-group .btn {
    padding: 0.25rem 0.5rem;
  }
  
  .btn-group .btn i {
    font-size: 1.1rem;
  }
  
  .pagination {
    --bs-pagination-color: #6a3093;
    --bs-pagination-hover-color: #a044ff;
    --bs-pagination-focus-color: #a044ff;
    --bs-pagination-active-bg: #6a3093;
    --bs-pagination-active-border-color: #6a3093;
  }
  
  .form-select:focus,
  .form-control:focus {
    border-color: #6a3093;
    box-shadow: 0 0 0 0.25rem rgba(106, 48, 147, 0.25);
  }
  
  .modal-header {
    background-color: #6a3093;
    color: white;
  }
  
  .modal-header .btn-close {
    filter: invert(1) grayscale(100%) brightness(200%);
  }
  
  .product-image {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
  }
  </style>