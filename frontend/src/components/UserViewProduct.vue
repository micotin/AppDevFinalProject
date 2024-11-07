<template>
    <div class="user-view-product">
      <div class="container py-4">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="error" class="alert alert-danger" role="alert">
          {{ error }}
        </div>
        <div v-else>
          <div class="row g-4">
            <div class="col-md-6">
              <div class="product-image-container">
                <img :src="product.imageUrl" :alt="product.name" class="img-fluid rounded shadow-sm">
                <button @click="toggleFavorite" class="btn btn-favorite" :class="{ 'is-favorite': isFavorite }">
                  <i class="bi" :class="isFavorite ? 'bi-heart-fill' : 'bi-heart'"></i>
                </button>
              </div>
            </div>
            <div class="col-md-6">
              <h1 class="mb-3">{{ product.name }}</h1>
              <p class="lead mb-4">{{ product.description }}</p>
              <div class="d-flex justify-content-between align-items-center mb-4">
                <span class="price display-4">₱{{ product.price.toFixed(2) }}</span>
                <span class="badge bg-secondary fs-6">{{ product.category }}</span>
              </div>
              <div class="mb-4">
                <div class="d-flex align-items-center">
                  <div class="me-3">
                    <label for="quantity" class="form-label">Quantity:</label>
                    <input type="number" id="quantity" v-model.number="quantity" min="1" max="99" class="form-control">
                  </div>
                  <button @click="addToCart" class="btn btn-primary btn-lg flex-grow-1">
                    <i class="bi bi-cart-plus me-2"></i>Add to Cart
                  </button>
                </div>
              </div>
              <div class="product-details">
                <h5>Product Details:</h5>
                <ul class="list-unstyled">
                  <li><strong>SKU:</strong> {{ product.sku }}</li>
                  <li><strong>Availability:</strong> <span :class="product.inStock ? 'text-success' : 'text-danger'">{{ product.inStock ? 'In Stock' : 'Out of Stock' }}</span></li>
                  <li><strong>Dimensions:</strong> {{ product.dimensions }}</li>
                </ul>
              </div>
            </div>
          </div>
  
          <!-- Related Products Section -->
          <div class="mt-5">
            <h2 class="mb-4">Related Products</h2>
            <div v-if="loadingRecommendations" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading related products...</span>
              </div>
            </div>
            <div v-else class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
              <div v-for="relatedProduct in recommendations" :key="relatedProduct.id" class="col">
                <div class="card h-100 shadow-sm">
                  <img :src="relatedProduct.imageUrl" class="card-img-top" :alt="relatedProduct.name">
                  <div class="card-body d-flex flex-column">
                    <h5 class="card-title">{{ relatedProduct.name }}</h5>
                    <p class="card-text mb-4">₱{{ relatedProduct.price.toFixed(2) }}</p>
                    <button @click="viewProduct(relatedProduct.id)" class="btn btn-outline-primary mt-auto">
                      View Product
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { doc, getDoc, collection, getDocs, query, where, limit, updateDoc, setDoc, deleteDoc } from 'firebase/firestore'
  import { db } from '../firebaseConfig'
  import { getAuth } from 'firebase/auth'
  
  const route = useRoute()
  const router = useRouter()
  const product = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const isFavorite = ref(false)
  const recommendations = ref([])
  const loadingRecommendations = ref(true)
  const quantity = ref(1)
  
  const fetchProduct = async () => {
    try {
      const productDoc = await getDoc(doc(db, 'products', route.params.id))
      if (productDoc.exists()) {
        product.value = { id: productDoc.id, ...productDoc.data() }
        loading.value = false
      } else {
        error.value = 'Product not found'
        loading.value = false
      }
    } catch (err) {
      console.error("Error fetching product:", err)
      error.value = "An error occurred while fetching the product. Please try again later."
      loading.value = false
    }
  }
  
  const fetchRecommendations = async () => {
    try {
      const q = query(
        collection(db, 'products'),
        where('category', '==', product.value.category),
        where('id', '!=', product.value.id),
        limit(4)
      )
      const querySnapshot = await getDocs(q)
      recommendations.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      loadingRecommendations.value = false
    } catch (err) {
      console.error("Error fetching related products:", err)
      loadingRecommendations.value = false
    }
  }
  
  const checkFavoriteStatus = async () => {
    const auth = getAuth()
    const user = auth.currentUser
    if (user) {
      const favoriteDoc = await getDoc(doc(db, 'users', user.uid, 'favorites', product.value.id))
      isFavorite.value = favoriteDoc.exists()
    }
  }
  
  const toggleFavorite = async () => {
    const auth = getAuth()
    const user = auth.currentUser
    if (user) {
      const favoriteRef = doc(db, 'users', user.uid, 'favorites', product.value.id)
      if (isFavorite.value) {
        await deleteDoc(favoriteRef)
      } else {
        await setDoc(favoriteRef, { productId: product.value.id })
      }
      isFavorite.value = !isFavorite.value
    } else {
      alert('Please log in to add favorites')
    }
  }
  
  const addToCart = async () => {
    const auth = getAuth()
    const user = auth.currentUser
    if (user) {
      try {
        const cartRef = doc(db, 'users', user.uid, 'cart', product.value.id)
        const cartDoc = await getDoc(cartRef)
        if (cartDoc.exists()) {
          await updateDoc(cartRef, { quantity: cartDoc.data().quantity + quantity.value })
        } else {
          await setDoc(cartRef, { productId: product.value.id, quantity: quantity.value })
        }
        alert(`${quantity.value} ${product.value.name}(s) added to cart!`)
      } catch (err) {
        console.error("Error adding to cart:", err)
        alert('An error occurred while adding the product to cart. Please try again.')
      }
    } else {
      alert('Please log in to add items to your cart')
    }
  }
  
  const viewProduct = (productId) => {
    router.push({ name: 'UserViewProduct', params: { id: productId } })
  }
  
  onMounted(() => {
    fetchProduct().then(() => {
      checkFavoriteStatus()
      fetchRecommendations()
    })
  })
  
  watch(() => route.params.id, () => {
    loading.value = true
    loadingRecommendations.value = true
    fetchProduct().then(() => {
      checkFavoriteStatus()
      fetchRecommendations()
    })
  })
  </script>
  
  <style scoped>
  .user-view-product {
    padding-top: 2rem;
  }
  
  .product-image-container {
    position: relative;
  }
  
  .btn-favorite {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .btn-favorite:hover {
    background-color: #f8f9fa;
  }
  
  .btn-favorite.is-favorite {
    color: #dc3545;
  }
  
  .price {
    color: #6a3093;
    font-weight: bold;
  }
  
  .btn-primary {
    background-color: #6a3093;
    border-color: #6a3093;
    transition: all 0.3s ease;
  }
  
  .btn-primary:hover {
    background-color: #a044ff;
    border-color: #a044ff;
  }
  
  .btn-outline-primary {
    color: #6a3093;
    border-color: #6a3093;
  }
  
  .btn-outline-primary:hover {
    background-color: #6a3093;
    color: white;
  }
  
  .product-details {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
  }
  
  @media (max-width: 767px) {
    .product-image-container {
      margin-bottom: 1rem;
    }
  
    .price {
      font-size: 2rem;
    }
  }
  </style>