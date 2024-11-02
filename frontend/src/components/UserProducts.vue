<template>
  <div class="user-products">
    <h1>User Shop</h1>
    <div class="products-container">
      <div
        v-for="product in products"
        :key="product.id"
        class="product-card"
      >
        <img :src="product.imageUrl" alt="Product Image" class="product-image" />
        <h3>{{ product.name }}</h3>
        <p>{{ product.description }}</p>
        <p><strong>Price: </strong>\${{ product.price }}</p>
        <button @click="addToCart(product)">Add to Cart</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default {
  name: "UserProducts",
  setup() {
    // Reactive reference for products list
    const products = ref([]);

    // Fetch products from Firestore
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        products.value = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    // Call fetchProducts on component mount
    onMounted(fetchProducts);

    // Add to cart function
    const addToCart = (product) => {
      console.log("Adding to cart:", product);
      // Add your logic here, e.g., save to Firestore or local storage
    };

    return {
      products,
      addToCart,
    };
  },
};
</script>

<style scoped>
.user-products {
  text-align: center;
}

.products-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  width: 200px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.product-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
