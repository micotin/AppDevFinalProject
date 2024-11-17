<template>
  <div class="user-contact-us">
    <div class="hero-section text-center text-white py-5 mb-5">
      <div class="container">
        <h1 class="display-4 fw-bold mb-3">Get in Touch</h1>
        <p class="lead">We're here to help and answer any questions you might have.</p>
      </div>
    </div>

    <div class="container mb-5">
      <div class="row g-5">
        <div class="col-lg-5">
          <div class="contact-info bg-light p-4 rounded-3 shadow-sm">
            <h2 class="h4 mb-4">Contact Information</h2>
            <ul class="list-unstyled">
              <li class="mb-3">
                <i class="bi bi-geo-alt-fill text-primary me-2"></i>
                Gov. Ignacio St., Lumangbayan 5200 Calapan, Philippines
              </li>
              <li class="mb-3">
                <i class="bi bi-telephone-fill text-primary me-2"></i>
                (555) 123-4567
              </li>
              <li class="mb-3">
                <i class="bi bi-envelope-fill text-primary me-2"></i>
                info@sam1flowershop.com
              </li>
            </ul>

            <h3 class="h5 mb-3">Business Hours</h3>
            <ul class="list-unstyled">
              <li>Monday - Friday: 9:00 AM - 7:00 PM</li>
              <li>Saturday: 10:00 AM - 6:00 PM</li>
              <li>Sunday: Closed</li>
              <li>Delivery: 10:00 AM - 6:00 PM (Mon-Sat)</li>
            </ul>
            <p class="mt-2">
              <span :class="['badge', isOpen ? 'bg-success' : 'bg-danger']">
                {{ isOpen ? 'Open Now' : 'Closed Now' }}
              </span>
            </p>

            <h3 class="h5 mb-3">Follow Us</h3>
            <div class="mb-4">
              <a href="https://www.facebook.com/sam1flowershop" target="_blank" class="text-primary me-3 fs-4">
                <i class="bi bi-facebook"></i>
              </a>
              <a href="https://www.instagram.com/sam1flowershop" target="_blank" class="text-primary fs-4">
                <i class="bi bi-instagram"></i>
              </a>
            </div>
          </div>
        </div>

        <div class="col-lg-7">
          <h2 class="h3 mb-4">Send us a message</h2>
          <form @submit.prevent="submitForm" class="needs-validation" novalidate>
            <div class="mb-3">
              <label for="name" class="form-label">Name</label>
              <input type="text" class="form-control" id="name" v-model="form.name" required>
              <div class="invalid-feedback">Please provide your name.</div>
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input type="email" class="form-control" id="email" v-model="form.email" required>
              <div class="invalid-feedback">Please provide a valid email.</div>
            </div>
            <div class="mb-3">
              <label for="inquiryType" class="form-label">Inquiry Type</label>
              <select class="form-select" id="inquiryType" v-model="form.inquiryType" required>
                <option value="">Select an option</option>
                <option value="order">Order Inquiry</option>
                <option value="general">General Question</option>
                <option value="feedback">Feedback</option>
                <option value="complaint">Complaint</option>
              </select>
              <div class="invalid-feedback">Please select an inquiry type.</div>
            </div>
            <div class="mb-3">
              <label for="message" class="form-label">Message</label>
              <textarea class="form-control" id="message" rows="5" v-model="form.message" required></textarea>
              <div class="invalid-feedback">Please enter your message.</div>
            </div>
            <div class="mb-3 form-check">
              <input type="checkbox" class="form-check-input" id="terms" v-model="form.terms" required>
              <label class="form-check-label" for="terms">I agree to the terms and conditions</label>
              <div class="invalid-feedback">You must agree before submitting.</div>
            </div>
            <button type="submit" class="btn btn-primary w-100" :disabled="isSubmitting">
              {{ isSubmitting ? 'Sending...' : 'Send Message' }}
            </button>
          </form>
          <div v-if="successMessage" class="alert alert-success mt-3" role="alert">{{ successMessage }}</div>
          <div v-if="errorMessage" class="alert alert-danger mt-3" role="alert">{{ errorMessage }}</div>
        </div>
      </div>

      <div class="row mt-5">
        <div class="col-12">
          <h2 class="h3 mb-4">Our Location</h2>
          <div id="map" class="map-container mb-3"></div>
          <a href="https://www.google.com/maps/search/?api=1&query=Gov.+Ignacio+st.+Lumangbayan+5200+Calapan,+Philippines" 
             target="_blank" 
             class="btn btn-outline-primary">
            <i class="bi bi-geo-alt-fill me-2"></i>
            Get Directions
          </a>
        </div>
      </div>

      <div class="row mt-5" v-if="user">
        <div class="col-12">
          <h2 class="h3 mb-4">Your Inquiry History</h2>
          <button class="btn btn-primary mb-3" @click="showInquiryHistory">View Inquiry History</button>
        </div>
      </div>
    </div>

    <!-- Inquiry History Modal -->
    <div class="modal fade" id="inquiryHistoryModal" tabindex="-1" aria-labelledby="inquiryHistoryModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="inquiryHistoryModalLabel">Your Inquiry History</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="userInquiries.length === 0" class="text-center">
              <p>You haven't made any inquiries yet.</p>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Message</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="inquiry in userInquiries" :key="inquiry.id">
                    <td>{{ formatDate(inquiry.createdAt) }}</td>
                    <td>{{ inquiry.inquiryType }}</td>
                    <td>{{ truncateMessage(inquiry.message) }}</td>
                    <td>
                      <span :class="getStatusBadgeClass(inquiry.status)">
                        {{ inquiry.status }}
                      </span>
                    </td>
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
import { ref, onMounted, computed } from 'vue';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import L from 'leaflet';
import { Modal } from 'bootstrap';

const form = ref({
  name: '',
  email: '',
  inquiryType: '',
  message: '',
  terms: false
});

const successMessage = ref('');
const errorMessage = ref('');
const isSubmitting = ref(false);
const user = ref(null);
const userInquiries = ref([]);

const isOpen = computed(() => {
  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;

  if (day === 0) return false; // Sunday: Closed

  if (day >= 1 && day <= 5) { // Monday to Friday
    return currentTime >= 9 * 60 && currentTime < 19 * 60;
  }

  if (day === 6) { // Saturday
    return currentTime >= 10 * 60 && currentTime < 18 * 60;
  }

  return false;
});

const submitForm = async () => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const docRef = await addDoc(collection(db, 'inquiries'), {
      ...form.value,
      createdAt: serverTimestamp(),
      status: 'new',
      userId: user.value ? user.value.uid : 'guest'
    });
    console.log('Inquiry sent with ID: ', docRef.id);
    successMessage.value = 'Your message has been sent successfully!';
    form.value = { name: '', email: '', inquiryType: '', message: '', terms: false };
    fetchUserInquiries();
  } catch (error) {
    console.error('Error sending inquiry: ', error);
    errorMessage.value = 'An error occurred while sending your message. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};

const fetchUserInquiries = async () => {
  if (user.value) {
    const q = query(
      collection(db, 'inquiries'),
      where('userId', '==', user.value.uid),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    userInquiries.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

const showInquiryHistory = () => {
  const modal = new Modal(document.getElementById('inquiryHistoryModal'));
  modal.show();
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

onMounted(() => {
  const auth = getAuth();
  user.value = auth.currentUser;
  if (user.value) {
    form.value.email = user.value.email;
    form.value.name = user.value.displayName || '';
    fetchUserInquiries();
  }

  const map = L.map('map').setView([13.4105, 121.1817], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  L.marker([13.4105, 121.1817]).addTo(map)
    .bindPopup('SAM1 Flower Shop<br>Gov. Ignacio st. Lumangbayan 5200 Calapan, Philippines')
    .openPopup();

  // Enable Bootstrap form validation
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });

  // Update open/closed status every minute
  setInterval(() => {
    isOpen.value = isOpen.value;
  }, 60000);
});
</script>

<style scoped>
.user-contact-us {
  font-family: 'Poppins', sans-serif;
}

.hero-section {
  background: linear-gradient(135deg, #6a3093 0%, #a044ff 100%);
}

.map-container {
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

.btn-primary {
  background-color: #6a3093;
  border-color: #6a3093;
}

.btn-primary:hover, .btn-primary:focus {
  background-color: #a044ff;
  border-color: #a044ff;
}

.btn-outline-primary {
  color: #6a3093;
  border-color: #6a3093;
}

.btn-outline-primary:hover, .btn-outline-primary:focus {
  background-color: #6a3093;
  color: white;
}

.text-primary {
  color: #6a3093 !important;
}

.form-control:focus, .form-select:focus {
  border-color: #a044ff;
  box-shadow: 0 0 0 0.25rem rgba(160, 68, 255, 0.25);
}

.contact-info {
  border-left: 4px solid #6a3093;
}

.badge {
  font-size: 0.9em;
  padding: 0.5em 0.7em;
}
</style>