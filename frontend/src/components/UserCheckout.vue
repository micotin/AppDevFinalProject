<template>
    <div class="checkout-container">
      <h1 class="checkout-title">Checkout</h1>
      
      <div class="checkout-layout">
        <div class="checkout-form">
          <form @submit.prevent="submitOrder">
            <section class="form-section">
              <h2>Shipping Information</h2>
              <div class="input-group">
                <input :value="user.firstName" type="text" id="firstName" readonly>
                <label for="firstName">First Name</label>
              </div>
              <div class="input-group">
                <input :value="user.lastName" type="text" id="lastName" readonly>
                <label for="lastName">Last Name</label>
              </div>
            </section>
  
            <section class="form-section">
              <h2>Delivery Method</h2>
              <div class="delivery-options">
                <label class="delivery-option">
                  <input v-model="deliveryMethod" type="radio" name="deliveryMethod" value="pickup">
                  <span class="option-text">
                    <IconPickup class="w-5 h-5 mr-2" />
                    Pick-up
                  </span>
                </label>
                <label class="delivery-option">
                  <input v-model="deliveryMethod" type="radio" name="deliveryMethod" value="delivery">
                  <span class="option-text">
                    <IconDelivery class="w-5 h-5 mr-2" />
                    Delivery
                  </span>
                </label>
              </div>
            </section>
  
            <section v-if="deliveryMethod === 'delivery'" class="form-section">
              <h2>Address Details</h2>
              <div class="input-group">
                <select 
                  v-model="shippingInfo.municipality" 
                  @change="updateBarangays" 
                  id="municipality" 
                  required
                >
                  <option value="">Select Municipality</option>
                  <option v-for="municipality in municipalities" :key="municipality" :value="municipality">
                    {{ municipality }}
                  </option>
                </select>
                <label for="municipality">Municipality</label>
              </div>
              
              <div class="input-group">
                <select 
                  v-model="shippingInfo.barangay" 
                  id="barangay" 
                  required
                  :disabled="!shippingInfo.municipality"
                >
                  <option value="">Select Barangay</option>
                  <option v-for="barangay in barangays" :key="barangay" :value="barangay">
                    {{ barangay }}
                  </option>
                </select>
                <label for="barangay">Barangay</label>
              </div>
              
              <div class="input-group">
                <input v-model="shippingInfo.street" type="text" id="street" required>
                <label for="street">Street Address</label>
              </div>
            </section>
  
            <section class="form-section">
              <h2>Contact Information</h2>
              <div class="input-group">
                <input :value="user.email" type="email" id="email" readonly>
                <label for="email">Email Address</label>
              </div>
              <div class="input-group phone-group">
                <div class="phone-prefix">+63</div>
                <input 
                  v-model="shippingInfo.phone" 
                  type="tel" 
                  id="phone" 
                  placeholder="9123456789" 
                  required 
                  pattern="[0-9]{10}"
                  maxlength="10"
                >
                <label for="phone">Phone Number</label>
              </div>
            </section>
  
            <section class="form-section">
              <h2>Payment Information (GCash)</h2>
              <div class="gcash-info">
                <div class="gcash-qr">
                  <div class="qr-placeholder">GCash QR Code</div>
                </div>
                <p class="gcash-number">GCash Number: 09123456789</p>
              </div>
              <div class="input-group">
                <input v-model="gcashReference" type="text" id="gcashReference" required>
                <label for="gcashReference">GCash Reference Number</label>
              </div>
              <div class="file-input">
                <input 
                  @change="handleFileUpload" 
                  type="file" 
                  id="gcashScreenshot" 
                  accept="image/*" 
                  required
                >
                <label for="gcashScreenshot" :class="{ 'file-selected': isFileSelected }">
                  <IconUpload v-if="!isFileSelected" class="w-5 h-5 mr-2" />
                  <IconCheck v-else class="w-5 h-5 mr-2 text-green-500" />
                  {{ isFileSelected ? gcashScreenshot.name : 'Upload Payment Screenshot' }}
                </label>
              </div>
              <p v-if="isFileSelected" class="text-sm text-green-600 mt-2">
                <IconCheck class="w-4 h-4 inline-block mr-1" />
                Payment screenshot uploaded successfully
              </p>
            </section>
  
            <div class="important-info">
              <h3>
                <IconInfo class="w-5 h-5 inline-block mr-2" />
                Important Information:
              </h3>
              <ul>
                <li>This is a <strong>pay-first system</strong>. Your order will only be processed after payment is confirmed.</li>
                <li v-if="deliveryMethod === 'delivery'">For delivery orders, additional charges apply based on your location.</li>
                <li v-else>For pick-up orders, please collect your items from our store in Calapan City, Lumangbayan within 3 days of order confirmation.</li>
                <li>Please ensure your GCash payment screenshot clearly shows the transaction details.</li>
                <li>
                  By placing an order, you agree to our 
                  <a href="#" @click.prevent="showTermsModal = true">Terms of Service</a> and 
                  <a href="#" @click.prevent="showPrivacyModal = true">Privacy Policy</a>.
                </li>
              </ul>
            </div>
  
            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              <IconSpinner v-if="isSubmitting" class="animate-spin w-5 h-5 mr-2" />
              {{ isSubmitting ? 'Placing Order...' : 'Place Order' }}
            </button>
          </form>
        </div>
  
        <div class="order-summary">
          <h2>Order Summary</h2>
          <div v-if="loading" class="loading">
            <IconSpinner class="animate-spin w-5 h-5 mr-2" />
            Loading...
          </div>
          <div v-else>
            <ul class="cart-items">
              <li v-for="item in cartItems" :key="item.id" class="cart-item">
                <img :src="item.product.imageUrl" :alt="item.product.name">
                <div class="item-details">
                  <h3>{{ item.product.name }}</h3>
                  <p>Quantity: {{ item.quantity }}</p>
                </div>
                <span class="item-price">₱{{ (item.product.price * item.quantity).toFixed(2) }}</span>
              </li>
            </ul>
            <div class="summary-totals">
              <div class="summary-row">
                <span>Subtotal</span>
                <strong>₱{{ cartTotal.toFixed(2) }}</strong>
              </div>
              <div v-if="deliveryMethod === 'delivery'" class="summary-row">
                <span>Delivery Fee</span>
                <strong>₱{{ deliveryFee.toFixed(2) }}</strong>
              </div>
              <div class="summary-row total">
                <span>Total</span>
                <strong>₱{{ totalWithDelivery.toFixed(2) }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modal component -->
      <div v-if="showTermsModal || showPrivacyModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <h2>{{ showTermsModal ? 'Terms of Service' : 'Privacy Policy' }}</h2>
          <div class="modal-body">
            <div v-if="showTermsModal">
              <h3>1. Acceptance of Terms</h3>
              <p>By accessing and placing an order with our store, you confirm that you are in agreement with and bound by the terms of service contained in the Terms & Conditions outlined below. These terms apply to the entire website and any email or other type of communication between you and our store.</p>
              
              <h3>2. Credit Card Details and Prices</h3>
              <p>All prices are in Philippine Peso (PHP). While we strive and make every effort to provide accurate pricing information, pricing errors may occur. Our store reserves the right to modify or update prices at any time without prior notice.</p>
              
              <h3>3. Product Descriptions</h3>
              <p>We strive to provide accurate product descriptions and images. However, we do not warrant that product descriptions or other content of this site is accurate, complete, reliable, current, or error-free.</p>
              
              <h3>4. Shipping and Delivery</h3>
              <p>Shipping and delivery times may vary based on your location and the products ordered. We are not responsible for delays outside our control, such as customs or postal delays.</p>
            </div>
            <div v-if="showPrivacyModal">
              <h3>1. Information We Collect</h3>
              <p>We collect information you provide directly to us. For example, we collect information when you create an account, subscribe, participate in any interactive features of our services, fill out a form, request customer support or otherwise communicate with us. The types of information we may collect include your name, email address, postal address, credit card information and other contact or identifying information you choose to provide.</p>
              
              <h3>2. Use of Information</h3>
              <p>We use the information we collect to provide, maintain, and improve our services, to process your transactions, send you related information, including confirmations and invoices, to communicate with you, to send you technical notices, updates, security alerts and support and administrative messages, to respond to your comments, questions and requests, and to provide customer service.</p>
              
              <h3>3. Sharing of Information</h3>
              <p>We may share information about you as follows or as otherwise described in this Privacy Policy: With vendors, consultants and other service providers who need access to such information to carry out work on our behalf; In response to a request for information if we believe disclosure is in accordance with any applicable law, regulation or legal process, or as otherwise required by any applicable law, rule or regulation; If we believe your actions are inconsistent with the spirit or language of our user agreements or policies, or to protect the rights, property and safety of our company or others.</p>
              
              <h3>4. Security</h3>
              <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
            </div>
          </div>
          <button @click="closeModal" class="modal-close-btn">Close</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { getAuth } from 'firebase/auth'
  import { db, storage } from '../firebaseConfig'
  import { collection, getDocs, doc, deleteDoc, addDoc, getDoc } from 'firebase/firestore'
  import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
  import { 
    Truck as IconDelivery, 
    Package as IconPickup, 
    Upload as IconUpload, 
    Check as IconCheck, 
    Info as IconInfo, 
    Loader as IconSpinner
  } from 'lucide-vue-next'
  
  const router = useRouter()
  const cartItems = ref([])
  const loading = ref(true)
  const isSubmitting = ref(false)
  const user = ref({ firstName: '', lastName: '', email: '' })
  const shippingInfo = ref({
    municipality: '',
    barangay: '',
    street: '',
    phone: ''
  })
  const deliveryMethod = ref('pickup')
  const gcashReference = ref('')
  const gcashScreenshot = ref(null)
  const isFileSelected = ref(false)
  const showTermsModal = ref(false)
  const showPrivacyModal = ref(false)
  
  const municipalities = [
    'Baco', 'Bansud', 'Bongabong', 'Bulalacao', 'Calapan City', 'Gloria', 
    'Mansalay', 'Naujan', 'Pinamalayan', 'Pola', 'Puerto Galera', 'Roxas', 
    'San Teodoro', 'Socorro', 'Victoria'
  ]
  
  const barangayMap = {
    'Baco': ['Alag', 'Bangkatan', 'Baras', 'Bayanan', 'Burbuli', 'Catwiran I', 'Catwiran II', 'Dulangan I', 'Dulangan II', 'Lantuyang', 'Lumangbayan', 'Malapad', 'Mangangan I', 'Mangangan II', 'Mayabig', 'Pambisan', 'Pulang-Tubig', 'Putican-Cabulo', 'San Andres', 'San Ignacio', 'Santa Cruz', 'Santa Rosa I', 'Santa Rosa II', 'Tabon-tabon', 'Water'],
    'Calapan City': ['Balingayan', 'Balite', 'Baruyan', 'Batino', 'Bayanan I', 'Bayanan II', 'Biga', 'Bondoc', 'Bucayao', 'Buhuan', 'Bulusan', 'Calero', 'Camilmil', 'Canubing I', 'Canubing II', 'Comunal', 'Guinobatan', 'Gulod', 'Ibaba East', 'Ibaba West', 'Ilaya', 'Lazareto', 'Libis', 'Lumangbayan', 'Mahal Na Pangalan', 'Maidlang', 'Malad', 'Malamig', 'Managpi', 'Masipit', 'Nag-Iba I', 'Nag-Iba II', 'Pachoca', 'Palhi', 'Panggalaan', 'Parang', 'Patas', 'Salong', 'San Antonio', 'San Vicente Central', 'San Vicente East', 'San Vicente North', 'San Vicente South', 'San Vicente West', 'Santa Cruz', 'Santa Isabel', 'Santa Maria Village', 'Santa Rita', 'Santo Niño', 'Sapul', 'Silonay', 'Suqui',      'Tawagan', 'Tibag', 'Wawa'],
    // Add other municipalities and their barangays here
  }
  
  const barangays = ref([])
  
  const cartTotal = computed(() => {
    return cartItems.value.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  })
  
  const deliveryFee = computed(() => {
    if (deliveryMethod.value !== 'delivery') return 0
  
    const baseDeliveryFee = 50
    const distanceMultiplier = getDistanceMultiplier(shippingInfo.value.municipality, shippingInfo.value.barangay)
    return baseDeliveryFee * distanceMultiplier
  })
  
  const totalWithDelivery = computed(() => {
    return cartTotal.value + deliveryFee.value
  })
  
  const getDistanceMultiplier = (municipality, barangay) => {
    if (municipality === 'Calapan City') {
      if (barangay === 'Lumangbayan') return 1
      return 1.5 // Other barangays in Calapan City
    }
    return 2 // Other municipalities
  }
  
  const fetchUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        user.value = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email
        }
      }
    } catch (err) {
      console.error("Error fetching user data:", err)
    }
  }
  
  const fetchCartItems = async () => {
    const auth = getAuth()
    const currentUser = auth.currentUser
    
    if (currentUser) {
      try {
        await fetchUserData(currentUser.uid)
        const cartSnapshot = await getDocs(collection(db, 'users', currentUser.uid, 'cart'))
        const cartData = cartSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        const productsSnapshot = await getDocs(collection(db, 'products'))
        const productsMap = new Map(productsSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]))
        cartItems.value = cartData.map(item => ({
          ...item,
          product: productsMap.get(item.productId)
        }))
        loading.value = false
      } catch (err) {
        console.error("Error fetching cart items:", err)
        loading.value = false
      }
    }
  }
  
  const updateBarangays = () => {
    barangays.value = barangayMap[shippingInfo.value.municipality] || []
    shippingInfo.value.barangay = ''
  }
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      gcashScreenshot.value = file
      isFileSelected.value = true
    } else {
      gcashScreenshot.value = null
      isFileSelected.value = false
    }
  }
  
  const uploadScreenshot = async () => {
    if (gcashScreenshot.value) {
      const storageReference = storageRef(storage, `gcash_screenshots/${Date.now()}_${gcashScreenshot.value.name}`)
      await uploadBytes(storageReference, gcashScreenshot.value)
      return await getDownloadURL(storageReference)
    }
    return null
  }
  
  const submitOrder = async () => {
    const auth = getAuth()
    const currentUser = auth.currentUser
    if (currentUser) {
      try {
        isSubmitting.value = true
        const screenshotUrl = await uploadScreenshot()
  
        const orderRef = await addDoc(collection(db, 'orders'), {
          userId: currentUser.uid,
          items: cartItems.value.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          })),
          shippingInfo: {
            ...shippingInfo.value,
            firstName: user.value.firstName,
            lastName: user.value.lastName,
            email: user.value.email
          },
          deliveryMethod: deliveryMethod.value,
          paymentMethod: 'gcash',
          gcashReference: gcashReference.value,
          gcashScreenshotUrl: screenshotUrl,
          subtotal: cartTotal.value,
          deliveryFee: deliveryFee.value,
          total: totalWithDelivery.value,
          status: 'pending',
          createdAt: new Date()
        })
  
        const cartSnapshot = await getDocs(collection(db, 'users', currentUser.uid, 'cart'))
        
        cartSnapshot.docs.forEach(async (doc) => {
          await deleteDoc(doc.ref)
        })
  
        // Redirect to the UserOrder component with the new order ID
        router.push({ name: 'UserOrder', params: { orderId: orderRef.id } })
      } catch (err) {
        console.error("Error submitting order:", err)
        // Handle error (e.g., show error message to user)
      } finally {
        isSubmitting.value = false
      }
    }
  }
  
  const closeModal = () => {
    showTermsModal.value = false
    showPrivacyModal.value = false
  }
  
  onMounted(() => {
    fetchCartItems()
  })
  
  watch(deliveryMethod, (newValue) => {
    if (newValue === 'pickup') {
      shippingInfo.value.municipality = ''
      shippingInfo.value.barangay = ''
      shippingInfo.value.street = ''
    }
  })
  </script>
  
  <style scoped>
  .checkout-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: 'Inter', sans-serif;
  }
  
  .checkout-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .checkout-layout {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
  }
  
  .checkout-form {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 2rem;
  }
  
  .form-section {
    margin-bottom: 2rem;
  }
  
  .form-section h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #2d3748;
  }
  
  .input-group {
    position: relative;
    margin-bottom: 1.5rem;
  }
  
  .input-group input,
  .input-group select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  
  .input-group label {
    position: absolute;
    left: 0.75rem;
    top: 0.75rem;
    font-size: 1rem;
    color: #718096;
    transition: all 0.3s;
    pointer-events: none;
    background-color: #fff;
    padding: 0 0.25rem;
  }
  
  .input-group input:focus,
  .input-group select:focus {
    border-color: #4299e1;
    outline: none;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }
  
  .input-group input:focus + label,
  .input-group select:focus + label,
  .input-group input:not(:placeholder-shown) + label,
  .input-group select:not(:placeholder-shown) + label {
    top: -0.5rem;
    left: 0.5rem;
    font-size: 0.75rem;
    color: #4299e1;
  }
  
  .phone-group {
    display: flex;
    align-items: center;
  }
  
  .phone-prefix {
    padding: 0.75rem;
    background-color: #f7fafc;
    border: 1px solid #e2e8f0;
    border-right: none;
    border-radius: 4px 0 0 4px;
    color: #4a5568;
    font-weight: 600;
  }
  
  .phone-group input {
    border-left: none;
    border-radius: 0 4px 4px 0;
    flex-grow: 1;
  }
  
  .delivery-options {
    display: flex;
    gap: 1rem;
  }
  
  .delivery-option {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .delivery-option:hover {
    background-color: #f7fafc;
  }
  
  .delivery-option input {
    display: none;
  }
  
  .delivery-option input:checked + .option-text {
    font-weight: 600;
    color: #4299e1;
  }
  
  .option-text {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .gcash-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .gcash-qr {
    width: 200px;
    height: 200px;
    background-color: #f7fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    border: 1px dashed #e2e8f0;
    border-radius: 4px;
  }
  
  .qr-placeholder {
    font-size: 1rem;
    color: #718096;
    text-align: center;
  }
  
  .gcash-number {
    font-weight: 600;
    color: #2d3748;
  }
  
  .file-input {
    position: relative;
    overflow: hidden;
  }
  
  .file-input input {
    position: absolute;
    left: -9999px;
  }
  
  .file-input label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background-color: #f7fafc;
    border: 1px dashed #e2e8f0;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    color: #4a5568;
  }
  
  .file-input label:hover {
    background-color: #edf2f7;
  }
  
  .file-input label.file-selected {
    background-color: #e6fffa;
    border-color: #38b2ac;
    color: #2c7a7b;
  }
  
  .important-info {
    background-color: #ebf8ff;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 2rem;
  }
  
  .important-info h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #2b6cb0;
  }
  
  .important-info ul {
    padding-left: 1.5rem;
    color: #2d3748;
  }
  
  .important-info li {
    margin-bottom: 0.5rem;
  }
  
  .submit-btn {
    width: 100%;
    padding: 1rem;
    background-color: #4299e1;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 1.125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .submit-btn:hover {
    background-color: #3182ce;
  }
  
  .submit-btn:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
  
  .order-summary {
    background-color: #f7fafc;
    border-radius: 8px;
    padding: 2rem;
    position: sticky;
    top: 2rem;
  }
  
  .order-summary h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #2d3748;
  }
  
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    color: #4a5568;
  }
  
  .cart-items {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  
  .cart-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .cart-item img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .item-details {
    flex-grow: 1;
  }
  
  .item-details h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: #2d3748;
  }
  
  .item-price {
    font-weight: 600;
    color: #2d3748;
  }
  
  .summary-totals {
    margin-top: 1rem;
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    color: #4a5568;
  }
  
  .summary-row.total {
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
    color: #2d3748;
  }
  
  /* Modal styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: #fff;
    padding: 2rem;
    border-radius: 8px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
  }
  
  .modal-content h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #2d3748;
  }
  
  .modal-body {
    margin-bottom: 1rem;
    color: #4a5568;
  }
  
  .modal-close-btn {
    background-color: #4299e1;
    color: #fff;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .modal-close-btn:hover {
    background-color: #3182ce;
  }
  
  @media (max-width: 768px) {
    .checkout-layout {
      grid-template-columns: 1fr;
    }
  
    .order-summary {
      position: static;
      margin-top: 2rem;
    }
  }
  </style>