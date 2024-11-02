<template>
  <div class="user-cart-fav">
    <div class="container py-5">
      <h1 class="text-center mb-5">Your Favorites and Cart</h1>
      
      <div class="card shadow-sm">
        <div class="card-header">
          <ul class="nav nav-tabs card-header-tabs">
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'favorites' }" @click="activeTab = 'favorites'" href="#">Favorites</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'cart' }" @click="activeTab = 'cart'" href="#">Cart</a>
            </li>
          </ul>
        </div>
        <div class="card-body">
          <!-- Favorites Section -->
          <div v-if="activeTab === 'favorites'">
            <div v-if="loadingFavorites" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading favorites...</span>
              </div>
            </div>
            <div v-else-if="favorites.length === 0" class="text-center py-5">
              <i class="bi bi-heart text-muted" style="font-size: 3rem;"></i>
              <p class="mt-3">You haven't added any favorites yet.</p>
              <router-link to="/shop" class="btn btn-primary mt-2">Explore Products</router-link>
            </div>
            <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              <div v-for="product in favorites" :key="product.id" class="col">
                <div class="card h-100 border-0 shadow-sm">
                  <img :src="product.imageUrl" class="card-img-top" :alt="product.name">
                  <div class="card-body d-flex flex-column">
                    <h5 class="card-title">{{ product.name }}</h5>
                    <p class="card-text flex-grow-1">{{ product.description }}</p>
                    <div class="mt-auto">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="price">₱{{ product.price.toFixed(2) }}</span>
                        <button @click="removeFavorite(product)" class="btn btn-outline-danger btn-sm">
                          <i class="bi bi-heart-fill me-1"></i> Remove
                        </button>
                      </div>
                      <button @click="addToCart(product)" class="btn btn-primary w-100">
                        <i class="bi bi-cart-plus me-2"></i>Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Cart Section -->
          <div v-if="activeTab === 'cart'">
            <div v-if="loadingCart" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading cart...</span>
              </div>
            </div>
            <div v-else-if="cart.length === 0" class="text-center py-5">
              <i class="bi bi-cart text-muted" style="font-size: 3rem;"></i>
              <p class="mt-3">Your cart is empty.</p>
              <router-link to="/shop" class="btn btn-primary mt-2">Start Shopping</router-link>
            </div>
            <div v-else>
              <div v-for="item in cart" :key="item.id" class="card mb-3 border-0 shadow-sm">
                <div class="row g-0">
                  <div class="col-md-2">
                    <img :src="item.product.imageUrl" class="img-fluid rounded-start" :alt="item.product.name">
                  </div>
                  <div class="col-md-7">
                    <div class="card-body">
                      <h5 class="card-title">{{ item.product.name }}</h5>
                      <p class="card-text">{{ item.product.description }}</p>
                      <div class="d-flex align-items-center">
                        <button @click="decreaseQuantity(item)" class="btn btn-outline-secondary btn-sm me-2">-</button>
                        <input v-model.number="item.quantity" type="number" class="form-control form-control-sm w-25 text-center" min="1" @change="updateCartItem(item)">
                        <button @click="increaseQuantity(item)" class="btn btn-outline-secondary btn-sm ms-2">+</button>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3 d-flex flex-column justify-content-center align-items-end p-3">
                    <p class="price mb-2">₱{{ (item.product.price * item.quantity).toFixed(2) }}</p>
                    <button @click="removeFromCart(item)" class="btn btn-outline-danger btn-sm">
                      <i class="bi bi-trash me-1"></i> Remove
                    </button>
                  </div>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center mt-4">
                <h4>Total: ₱{{ cartTotal.toFixed(2) }}</h4>
                <button @click="checkout" class="btn btn-success">
                  <i class="bi bi-credit-card me-2"></i>Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { db } from '../firebaseConfig'
import { collection, getDocs, doc, deleteDoc, setDoc, updateDoc } from 'firebase/firestore'

export default {
  name: 'UserCartFav',
  setup() {
    const router = useRouter()
    const favorites = ref([])
    const cart = ref([])
    const loadingFavorites = ref(true)
    const loadingCart = ref(true)
    const activeTab = ref('favorites')

    const fetchFavorites = async () => {
      const auth = getAuth()
      const user = auth.currentUser
      if (user) {
        try {
          const favoritesSnapshot = await getDocs(collection(db, 'users', user.uid, 'favorites'))
          const favoriteIds = favoritesSnapshot.docs.map(doc => doc.id)
          const productsSnapshot = await getDocs(collection(db, 'products'))
          favorites.value = productsSnapshot.docs
            .filter(doc => favoriteIds.includes(doc.id))
            .map(doc => ({ id: doc.id, ...doc.data() }))
          loadingFavorites.value = false
        } catch (err) {
          console.error("Error fetching favorites:", err)
          loadingFavorites.value = false
        }
      }
    }

    const fetchCart = async () => {
      const auth = getAuth()
      const user = auth.currentUser
      if (user) {
        try {
          const cartSnapshot = await getDocs(collection(db, 'users', user.uid, 'cart'))
          const cartItems = cartSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          const productsSnapshot = await getDocs(collection(db, 'products'))
          const productsMap = new Map(productsSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]))
          cart.value = cartItems.map(item => ({
            ...item,
            product: productsMap.get(item.productId)
          }))
          loadingCart.value = false
        } catch (err) {
          console.error("Error fetching cart:", err)
          loadingCart.value = false
        }
      }
    }

    const removeFavorite = async (product) => {
      const auth = getAuth()
      const user = auth.currentUser
      if (user) {
        try {
          await deleteDoc(doc(db, 'users', user.uid, 'favorites', product.id))
          favorites.value = favorites.value.filter(fav => fav.id !== product.id)
        } catch (err) {
          console.error("Error removing favorite:", err)
        }
      }
    }

    const addToCart = async (product) => {
      const auth = getAuth()
      const user = auth.currentUser
      if (user) {
        try {
          const cartRef = doc(db, 'users', user.uid, 'cart', product.id)
          const cartItem = cart.value.find(item => item.productId === product.id)
          if (cartItem) {
            await updateDoc(cartRef, { quantity: cartItem.quantity + 1 })
          } else {
            await setDoc(cartRef, { productId: product.id, quantity: 1 })
          }
          await fetchCart()
          activeTab.value = 'cart'
        } catch (err) {
          console.error("Error adding to cart:", err)
        }
      }
    }

    const removeFromCart = async (item) => {
      const auth = getAuth()
      const user = auth.currentUser
      if (user) {
        try {
          await deleteDoc(doc(db, 'users', user.uid, 'cart', item.id))
          cart.value = cart.value.filter(cartItem => cartItem.id !== item.id)
        } catch (err) {
          console.error("Error removing from cart:", err)
        }
      }
    }

    const updateCartItem = async (item) => {
      const auth = getAuth()
      const user = auth.currentUser
      if (user) {
        try {
          const cartRef = doc(db, 'users', user.uid, 'cart', item.id)
          await updateDoc(cartRef, { quantity: item.quantity })
        } catch (err) {
          console.error("Error updating cart item:", err)
        }
      }
    }

    const increaseQuantity = (item) => {
      item.quantity++
      updateCartItem(item)
    }

    const decreaseQuantity = (item) => {
      if (item.quantity > 1) {
        item.quantity--
        updateCartItem(item)
      }
    }

    const cartTotal = computed(() => {
      return cart.value.reduce((total, item) => total + (item.product.price * item.quantity), 0)
    })

    const checkout = () => {
      // TODO: Implement checkout functionality
      alert('Checkout functionality not implemented yet.')
    }

    onMounted(() => {
      fetchFavorites()
      fetchCart()
    })

    return {
      favorites,
      cart,
      loadingFavorites,
      loadingCart,
      activeTab,
      removeFavorite,
      addToCart,
      removeFromCart,
      updateCartItem,
      increaseQuantity,
      decreaseQuantity,
      cartTotal,
      checkout
    }
  }
}
</script>

<style scoped>
.user-cart-fav {
  background-color: #f8f9fa;
}

.card {
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  background-color: #fff;
  border-bottom: none;
}

.nav-tabs .nav-link {
  color: #6c757d;
  border: none;
  padding: 1rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-tabs .nav-link.active {
  color: #6a3093;
  border-bottom: 2px solid #6a3093;
}

.price {
  font-size: 1.2rem;
  font-weight: bold;
  color: #6a3093;
}

.btn-primary {
  background-color: #6a3093;
  border-color: #6a3093;
}

.btn-primary:hover {
  background-color: #a044ff;
  border-color: #a044ff;
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
}

.img-fluid {
  max-height: 100px;
  object-fit: cover;
}

.form-control:focus {
  border-color: #6a3093;
  box-shadow: 0 0 0 0.2rem rgba(106, 48, 147, 0.25);
}

.btn-outline-secondary {
  color: #6a3093;
  border-color: #6a3093;
}

.btn-outline-secondary:hover {
  background-color: #6a3093;
  color: #fff;
}

@media (max-width: 767.98px) {
  .card-title {
    font-size: 1.1rem;
  }

  .price {
    font-size: 1rem;
  }

  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
}
</style>