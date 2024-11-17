<template>
  <div class="user-cart-fav min-vh-100 bg-light py-5">
    <div class="container">
      <h1 class="text-center mb-5 fw-bold text-primary">Your Cart and Favorites</h1>
      
      <div class="card shadow-lg border-0 rounded-3 overflow-hidden">
        <div class="card-header bg-white border-bottom-0 p-0">
          <ul class="nav nav-pills nav-fill" id="myTab" role="tablist">
            <li class="nav-item" role="presentation">
              <button @click="activeTab = 'cart'" class="nav-link rounded-0 py-3" :class="{ active: activeTab === 'cart' }" id="cart-tab" data-bs-toggle="tab" type="button" role="tab" aria-controls="cart" aria-selected="true">
                <i class="bi bi-cart-fill me-2"></i>Cart ({{ cartItemCount }})
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button @click="activeTab = 'favorites'" class="nav-link rounded-0 py-3" :class="{ active: activeTab === 'favorites' }" id="favorites-tab" data-bs-toggle="tab" type="button" role="tab" aria-controls="favorites" aria-selected="false">
                <i class="bi bi-heart-fill me-2"></i>Favorites ({{ favorites.length }})
              </button>
            </li>
          </ul>
        </div>
        <div class="card-body p-4">
          <div class="tab-content" id="myTabContent">
            <!-- Cart Section -->
            <div class="tab-pane fade" :class="{ 'show active': activeTab === 'cart' }" id="cart" role="tabpanel" aria-labelledby="cart-tab">
              <div v-if="loadingCart" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading cart...</span>
                </div>
              </div>
              <div v-else-if="cartItemCount === 0" class="text-center py-5">
                <i class="bi bi-cart-x text-muted" style="font-size: 4rem;"></i>
                <p class="mt-3 text-muted">Your cart is empty.</p>
                <router-link to="/user/shop" class="btn btn-primary mt-2">Start Shopping</router-link>
              </div>
              <div v-else>
                <div v-for="item in cart" :key="item.id" class="card mb-3 border-0 shadow-sm hover-effect">
                  <div class="row g-0">
                    <div class="col-md-3 col-lg-2">
                      <img :src="item.product?.imageUrl || '/placeholder.svg'" class="img-fluid rounded-start h-100 object-fit-cover" :alt="item.product?.name || 'Product image'">
                    </div>
                    <div class="col-md-6 col-lg-7">
                      <div class="card-body">
                        <h5 class="card-title fw-bold">{{ item.product?.name || 'Product name' }}</h5>
                        <p class="card-text d-none d-md-block text-muted">{{ item.product?.description || 'Product description' }}</p>
                        <div class="d-flex align-items-center mt-2">
                          <button @click="decreaseQuantity(item)" class="btn btn-outline-primary btn-sm" :disabled="item.quantity <= 1">
                            <i class="bi bi-dash"></i>
                          </button>
                          <input v-model.number="item.quantity" type="number" class="form-control form-control-sm mx-2 text-center" style="width: 60px;" min="1" @change="updateCartItem(item)">
                          <button @click="increaseQuantity(item)" class="btn btn-outline-primary btn-sm">
                            <i class="bi bi-plus"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3 col-lg-3 d-flex flex-column justify-content-center align-items-end p-3">
                      <p class="price mb-2 fw-bold">₱{{ ((item.product?.price || 0) * item.quantity).toFixed(2) }}</p>
                      <button @click="removeFromCart(item)" class="btn btn-outline-danger btn-sm">
                        <i class="bi bi-trash me-1"></i> Remove
                      </button>
                    </div>
                  </div>
                </div>
                <div class="mt-4">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4 class="fw-bold text-primary">Total: ₱{{ cartTotal.toFixed(2) }}</h4>
                  </div>
                  <div class="alert alert-info border-start border-info border-4" role="alert">
                    <h4 class="alert-heading fw-bold"><i class="bi bi-info-circle-fill me-2"></i>Important Notice</h4>
                    <p class="mb-0">All orders, whether for pick-up or delivery, require payment in advance. For deliveries within Oriental Mindoro, customers are responsible for all delivery charges.</p>
                  </div>
                  <button @click="checkout" class="btn btn-success btn-lg w-100 mt-3 checkout-btn">
                    <i class="bi bi-credit-card me-2"></i>Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>

            <!-- Favorites Section -->
            <div class="tab-pane fade" :class="{ 'show active': activeTab === 'favorites' }" id="favorites" role="tabpanel" aria-labelledby="favorites-tab">
              <div v-if="loadingFavorites" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading favorites...</span>
                </div>
              </div>
              <div v-else-if="favorites.length === 0" class="text-center py-5">
                <i class="bi bi-heart text-muted" style="font-size: 4rem;"></i>
                <p class="mt-3 text-muted">You haven't added any favorites yet.</p>
                <router-link to="/user/shop" class="btn btn-primary mt-2">Explore Products</router-link>
              </div>
              <div v-else class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                <div v-for="product in favorites" :key="product.id" class="col">
                  <div class="card h-100 border-0 shadow-sm product-card hover-effect">
                    <img :src="product.imageUrl || '/placeholder.svg'" class="card-img-top" :alt="product.name || 'Product image'">
                    <div class="card-body d-flex flex-column">
                      <h5 class="card-title fw-bold">{{ product.name || 'Product name' }}</h5>
                      <p class="card-text flex-grow-1 text-muted">{{ product.description || 'Product description' }}</p>
                      <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                          <span class="price fw-bold">₱{{ (product.price || 0).toFixed(2) }}</span>
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
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
      <div id="liveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <strong class="me-auto">Notification</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          {{ toastMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { db } from '../firebaseConfig'
import { collection, getDocs, doc, deleteDoc, setDoc, updateDoc, getDoc } from 'firebase/firestore'
import { Toast } from 'bootstrap'

export default {
  name: 'UserCartFav',
  setup() {
    const router = useRouter()
    const favorites = ref([])
    const cart = ref([])
    const loadingFavorites = ref(true)
    const loadingCart = ref(true)
    const activeTab = ref('cart')
    const toastMessage = ref('')

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
          loadingCart.value = true
          const cartSnapshot = await getDocs(collection(db, 'users', user.uid, 'cart'))
          const cartItems = cartSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          const productsSnapshot = await getDocs(collection(db, 'products'))
          const productsMap = new Map(productsSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]))
          cart.value = cartItems.map(item => ({
            ...item,
            product: productsMap.get(item.productId) || { id: item.productId, name: 'Unknown Product', price: 0, description: 'Product not found' }
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
          showToast(`${product.name} removed from favorites`)
        } catch (err) {
          console.error("Error removing favorite:", err)
          showToast('Error removing from favorites')
        }
      }
    }

    const addToCart = async (product) => {
      const auth = getAuth()
      const user = auth.currentUser
      if (user) {
        try {
          const cartRef = doc(db, 'users', user.uid, 'cart', product.id)
          const cartDocSnap = await getDoc(cartRef)
          
          if (cartDocSnap.exists()) {
            const existingItem = cartDocSnap.data()
            await updateDoc(cartRef, { quantity: existingItem.quantity + 1 })
          } else {
            await setDoc(cartRef, { productId: product.id, quantity: 1 })
          }
          
          await fetchCart()
          activeTab.value = 'cart'
          showToast(`${product.name} added to cart`)
        } catch (err) {
          console.error("Error adding to cart:", err)
          showToast('Error adding to cart')
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
          showToast(`${item.product.name} removed from cart`)
        } catch (err) {
          console.error("Error removing from cart:", err)
          showToast('Error removing from cart')
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
          showToast(`${item.product.name} quantity updated`)
        } catch (err) {
          console.error("Error updating cart item:", err)
          showToast('Error updating cart item')
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
      return cart.value.reduce((total, item) => total + ((item.product?.price || 0) * item.quantity), 0)
    })

    const cartItemCount = computed(() => {
      return cart.value.reduce((total, item) => total + item.quantity, 0)
    })

    const checkout = () => {
      router.push('/user/checkout')
    }

    const showToast = (message) => {
      toastMessage.value = message
      const toastEl = document.getElementById('liveToast')
      const toast = new Toast(toastEl)
      toast.show()
    }

    onMounted(() => {
      fetchFavorites()
      fetchCart()
    })

    watch(cart, () => {
      // This will trigger a re-render when the cart changes
    }, { deep: true })

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
      cartItemCount,
      checkout,
      toastMessage
    }
  }
}
</script>

<style scoped>
.user-cart-fav {
  background-color: #f8f9fa;
}

.card {
  transition: all 0.3s ease;
}

.product-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.hover-effect:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
}

.product-card .card-img-top {
  height: 200px;
  object-fit: cover;
}

.nav-pills .nav-link {
  color: #6c757d;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-pills .nav-link.active {
  background-color: #0d6efd;
  color: white;
}

.price {
  font-size: 1.2rem;
  color: #0d6efd;
}

.img-fluid {
  transition: all 0.3s ease;
}

.img-fluid:hover {
  transform: scale(1.05);
}

.btn-outline-primary:hover,
.btn-outline-danger:hover,
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.alert-info {
  background-color: #cff4fc;
  border-color: #b6effb;
}

.checkout-btn {
  background-color: #198754;
  border-color: #198754;
  transition: all 0.3s ease;
}

.checkout-btn:hover {
  background-color: #157347;
  border-color: #146c43;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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

@media (max-width: 575.98px) {
  .card-body {
    padding: 0.75rem;
  }

  .product-card .card-img-top {
    height: 150px;
  }
}
</style>