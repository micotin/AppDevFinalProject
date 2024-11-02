<template>
    <div class="contact-us">
      <div class="hero-section">
        <h1>Get in Touch</h1>
        <p>We're here to help and answer any question you might have</p>
      </div>
      <div class="container">
        <div class="contact-container">
          <div class="contact-info-container">
            <div class="contact-info">
              <h2>Contact Information</h2>
              <div class="info-item">
                <i class="bi bi-geo-alt"></i>
                <p>Gov. Ignacio st. Lumangbayan 5200 Calapan, Philippines</p>
              </div>
              <div class="info-item">
                <i class="bi bi-telephone"></i>
                <p>(555) 123-4567</p>
              </div>
              <div class="info-item">
                <i class="bi bi-envelope"></i>
                <p>info@sam1flowershop.com</p>
              </div>
            </div>
            <div class="business-hours">
              <h3>Business Hours</h3>
              <ul>
                <li><span>Monday - Friday:</span> 9:00 AM - 7:00 PM</li>
                <li><span>Saturday:</span> 10:00 AM - 6:00 PM</li>
                <li><span>Sunday:</span> Closed</li>
              </ul>
              <p><strong>Delivery Hours:</strong> 10:00 AM - 6:00 PM (Monday - Saturday)</p>
            </div>
          </div>
          <div class="contact-form-container">
            <h2>Send us a message</h2>
            <form @submit.prevent="submitForm" class="contact-form">
              <div class="form-group">
                <label for="name">Name</label>
                <input type="text" id="name" v-model="form.name" required>
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" v-model="form.email" readonly>
              </div>
              <div class="form-group">
                <label for="inquiryType">Inquiry Type</label>
                <select id="inquiryType" v-model="form.inquiryType" required>
                  <option value="">Select an option</option>
                  <option value="order">Order Inquiry</option>
                  <option value="general">General Question</option>
                </select>
              </div>
              <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" v-model="form.message" rows="5" required></textarea>
              </div>
              <button type="submit" class="submit-btn">Send Message</button>
            </form>
          </div>
        </div>
        <div class="map-container">
          <h2>Our Location</h2>
          <div id="map"></div>
          <a href="https://www.google.com/maps/search/?api=1&query=Gov.+Ignacio+st.+Lumangbayan+5200+Calapan,+Philippines" target="_blank" class="directions-btn">
            <i class="bi bi-geo-alt"></i> Get Directions
          </a>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { getAuth } from 'firebase/auth';
  import { collection, addDoc } from 'firebase/firestore';
  import { db } from '../firebaseConfig';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  
  export default {
    name: 'UserContactUs',
    setup() {
      const form = ref({
        name: '',
        email: '',
        inquiryType: '',
        message: ''
      });
  
      const submitForm = async () => {
        try {
          const docRef = await addDoc(collection(db, 'inquiries'), form.value);
          console.log('Inquiry sent with ID: ', docRef.id);
          alert('Your message has been sent successfully!');
          form.value = { ...form.value, name: '', inquiryType: '', message: '' };
        } catch (error) {
          console.error('Error sending inquiry: ', error);
          alert('An error occurred while sending your message. Please try again.');
        }
      };
  
      onMounted(() => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          form.value.email = user.email;
        } else {
          // Set a default email if user is not authenticated
          form.value.email = 'guest@example.com';
        }
  
        const map = L.map('map').setView([13.4105, 121.1817], 15);
  
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
  
        L.marker([13.4105, 121.1817]).addTo(map)
          .bindPopup('SAM1 Flower Shop<br>Gov. Ignacio st. Lumangbayan 5200 Calapan, Philippines')
          .openPopup();
      });
  
      return {
        form,
        submitForm
      };
    }
  };
  </script>
  
  <style scoped>
  .contact-us {
    font-family: 'Arial', sans-serif;
  }
  
  .hero-section {
    background: linear-gradient(135deg, #6a3093 0%, #a044ff 100%);
    color: white;
    text-align: center;
    padding: 4rem 0;
    margin-bottom: 3rem;
  }
  
  .hero-section h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  .hero-section p {
    font-size: 1.2rem;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  .contact-container {
    display: flex;
    gap: 2rem;
    margin-bottom: 3rem;
  }
  
  .contact-info-container, .contact-form-container {
    flex: 1;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 2rem;
  }
  
  .contact-info h2, .contact-form-container h2 {
    color: #6a3093;
    margin-bottom: 1.5rem;
  }
  
  .info-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
  
  .info-item i {
    color: #6a3093;
    font-size: 1.2rem;
    margin-right: 1rem;
    margin-top: 0.2rem;
  }
  
  .business-hours {
    margin-top: 2rem;
  }
  
  .business-hours h3 {
    color: #6a3093;
    margin-bottom: 1rem;
  }
  
  .business-hours ul {
    list-style-type: none;
    padding: 0;
  }
  
  .business-hours li {
    margin-bottom: 0.5rem;
  }
  
  .business-hours li span {
    font-weight: bold;
  }
  
  .contact-form .form-group {
    margin-bottom: 1.5rem;
  }
  
  .contact-form label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  .contact-form input,
  .contact-form select,
  .contact-form textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
  }
  
  .contact-form input[readonly] {
    background-color: #f0f0f0;
    cursor: not-allowed;
  }
  
  .submit-btn, .directions-btn {
    background: linear-gradient(135deg, #6a3093 0%, #a044ff 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .submit-btn:hover, .directions-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(106, 48, 147, 0.3);
  }
  
  .map-container {
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 2rem;
  }
  
  .map-container h2 {
    color: #6a3093;
    margin-bottom: 1.5rem;
  }
  
  #map {
    height: 400px;
    border-radius: 10px;
    margin-bottom: 1rem;
  }
  
  .directions-btn {
    display: inline-block;
    text-decoration: none;
  }
  
  @media (max-width: 768px) {
    .contact-container {
      flex-direction: column;
    }
  }
  </style>