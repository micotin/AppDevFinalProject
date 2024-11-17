<template>
    <div class="admin-contact-us">
      <h1 class="mb-4">Admin Contact Management</h1>
      <div class="row">
        <div class="col-md-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title mb-4">Inquiries</h5>
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Type</th>
                      <th>Message</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="inquiry in inquiries" :key="inquiry.id">
                      <td>{{ formatDate(inquiry.createdAt) }}</td>
                      <td>{{ inquiry.name }}</td>
                      <td>{{ inquiry.email }}</td>
                      <td>{{ inquiry.inquiryType }}</td>
                      <td>{{ truncateMessage(inquiry.message) }}</td>
                      <td>
                        <span :class="getStatusBadgeClass(inquiry.status)">
                          {{ inquiry.status }}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-primary me-2" @click="viewInquiry(inquiry)">View</button>
                        <button class="btn btn-sm btn-success" @click="updateStatus(inquiry)">Update Status</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- View Inquiry Modal -->
      <div class="modal fade" id="viewInquiryModal" tabindex="-1" aria-labelledby="viewInquiryModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="viewInquiryModalLabel">View Inquiry</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" v-if="selectedInquiry">
              <p><strong>Name:</strong> {{ selectedInquiry.name }}</p>
              <p><strong>Email:</strong> {{ selectedInquiry.email }}</p>
              <p><strong>Type:</strong> {{ selectedInquiry.inquiryType }}</p>
              <p><strong>Message:</strong> {{ selectedInquiry.message }}</p>
              <p><strong>Status:</strong> {{ selectedInquiry.status }}</p>
              <p><strong>Date:</strong> {{ formatDate(selectedInquiry.createdAt) }}</p>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Update Status Modal -->
      <div class="modal fade" id="updateStatusModal" tabindex="-1" aria-labelledby="updateStatusModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="updateStatusModalLabel">Update Inquiry Status</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="submitStatusUpdate">
                <div class="mb-3">
                  <label for="statusSelect" class="form-label">New Status</label>
                  <select class="form-select" id="statusSelect" v-model="newStatus">
                    <option value="new">New</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <button type="submit" class="btn btn-primary">Update Status</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
  import { db } from '../firebaseConfig';
  import { Modal } from 'bootstrap';
  
  const inquiries = ref([]);
  const selectedInquiry = ref(null);
  const newStatus = ref('');
  
  const fetchInquiries = async () => {
    const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    inquiries.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };
  
  const truncateMessage = (message, length = 50) => {
    return message.length > length ? message.substring(0, length) + '...' : message;
  };
  
  const getStatusBadgeClass = (status) => {
    const classes = {
      new: 'bg-info',
      'in-progress': 'bg-warning',
      resolved: 'bg-success'
    };
    return `badge ${classes[status] || 'bg-secondary'}`;
  };
  
  const viewInquiry = (inquiry) => {
    selectedInquiry.value = inquiry;
    const modal = new Modal(document.getElementById('viewInquiryModal'));
    modal.show();
  };
  
  const updateStatus = (inquiry) => {
    selectedInquiry.value = inquiry;
    newStatus.value = inquiry.status;
    const modal = new Modal(document.getElementById('updateStatusModal'));
    modal.show();
  };
  
  const submitStatusUpdate = async () => {
    if (selectedInquiry.value && newStatus.value) {
      const inquiryRef = doc(db, 'inquiries', selectedInquiry.value.id);
      await updateDoc(inquiryRef, { status: newStatus.value });
      await fetchInquiries();
      const modal = Modal.getInstance(document.getElementById('updateStatusModal'));
      modal.hide();
    }
  };
  
  onMounted(() => {
    fetchInquiries();
  });
  </script>
  
  <style scoped>
  .admin-contact-us {
    font-family: 'Poppins', sans-serif;
  }
  
  .btn-primary {
    background-color: #6a3093;
    border-color: #6a3093;
  }
  
  .btn-primary:hover, .btn-primary:focus {
    background-color: #a044ff;
    border-color: #a044ff;
  }
  
  .text-primary {
    color: #6a3093 !important;
  }
  </style>