<template>
  <div class="login-page d-flex justify-content-center align-items-center">
    <div class="login-container row">
      <!-- Left Side - Logo -->
      <div class="col-md-6 d-flex justify-content-center align-items-center">
        <img src="/images/logo.png" alt="Sam1 Flower Shop Logo" class="shop-logo" />
      </div>
      
      <!-- Right Side - Form -->
      <div class="col-md-6">
        <div class="card login-card">
          <div class="card-body">
            <h2 class="card-title text-center mb-4">Welcome to Sam1 Flower Shop!</h2>
            <form @submit.prevent="login">
              <div class="mb-3">
                <label for="email" class="form-label">Email address</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                  <input type="email" class="form-control" id="email" v-model="email" required>
                </div>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-lock"></i></span>
                  <input type="password" class="form-control" id="password" v-model="password" required>
                </div>
              </div>
              <button type="submit" class="btn btn-primary w-100 mt-3">Login</button>
            </form>
            <div class="text-center mt-3">
              <p>Don't have an account? <router-link to="/signup" class="signup-link">Sign up here</router-link></p>
            </div>
            <div v-if="message" :class="['alert', isError ? 'alert-danger' : 'alert-success']" role="alert">
              {{ message }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useRouter } from 'vue-router';

export default {
  setup() {
    const auth = getAuth();
    const db = getFirestore();
    const router = useRouter();

    const email = ref('');
    const password = ref('');
    const message = ref('');
    const isError = ref(true);

    const login = async () => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
        const user = userCredential.user;
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          if (!userData.verified) {
            message.value = "Please verify your email before logging in.";
            isError.value = true;
            return;
          }

          isError.value = false;
          message.value = "Login successful!";

          setTimeout(() => {
            router.push(userData.role === 'admin' ? '/admin/dashboard' : '/user/home');
          }, 1500);
        } else {
          message.value = "User does not exist.";
          isError.value = true;
        }
      } catch (error) {
        console.error("Error logging in:", error);
        isError.value = true;
        message.value = error.code === 'auth/user-not-found'
          ? "No user found with this email."
          : error.code === 'auth/wrong-password'
          ? "Incorrect password."
          : "Error logging in: " + error.message;
      }
    };

    return {
      email,
      password,
      message,
      isError,
      login
    };
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-image: url('/images/background.jpg');
  background-size: cover;
  background-position: center;
}

.login-container {
  max-width: 800px;
  background-color: rgba(255, 239, 236, 0.4); /* Soft peachy-pink background */
  border-radius: 15px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.shop-logo {
  width: 80%;
  max-width: 300px;
}

.login-card {
  background-color: transparent;
  border: none;
}

.card-title {
  color: #eb6666; /* Red-orange for title */
}

.form-label, .input-group-text, .signup-link, .alert-danger, .alert-success {
  color: #e73e0b; /* Deep red-orange for text */
}

.input-group-text {
  background-color: #ffe5e0; /* Light peach-pink background */
  border: 1px solid #ffab91; /* Border for slight contrast */
}

.form-control:focus {
  border-color: #ffab91;
  box-shadow: 0 0 0 0.2rem rgba(255, 171, 145, 0.25);
}

.btn-primary {
  background-color: #ff7043; /* Bold red-orange button */
  border-color: #ff7043;
}

.btn-primary:hover {
  background-color: #3a86ff; /* Baby blue on hover */
  border-color: #3a86ff;
}

.signup-link {
  color: #ff7043; /* Red-orange link */
}

.signup-link:hover {
  color: #3a86ff; /* Baby blue on hover */
  text-decoration: underline;
}

.alert-danger {
  background-color: #ffe4e4; /* Light pink for error alerts */
  border-color: #ffb8b8;
}

.alert-success {
  background-color: #ffece6; /* Soft peachy-pink for success alerts */
  border-color: #ffccb3;
}
</style>
