<template>
  <div class="login-page d-flex justify-content-center align-items-center">
    <div class="card login-card">
      <div class="card-body">
        <h2 class="card-title text-center mb-4">Welcome to Sam1 Flower Shop</h2>
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
  background-image: url('../assets/images/log-reg_bg.png');
  background-size: cover;
  background-position: center;
}

.login-card {
  max-width: 400px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.card-title {
  color: #4a0e4e;
}

.form-label, .input-group-text, .signup-link, .alert-danger, .alert-success {
  color: #4a0e4e;
}

.input-group-text {
  background-color: #e0e8ff;
  border: 1px solid #b8c4ff;
}

.form-control:focus {
  border-color: #b8c4ff;
  box-shadow: 0 0 0 0.2rem rgba(184, 196, 255, 0.25);
}

.btn-primary {
  background-color: #7c3aed;
  border-color: #7c3aed;
}

.signup-link {
  color: #7c3aed;
}

.signup-link:hover {
  color: #6d28d9;
  text-decoration: underline;
}

.alert-danger {
  background-color: #ffe4e4;
  border-color: #ffb8b8;
}

.alert-success {
  background-color: #e4ffe4;
  border-color: #b8ffb8;
}
</style>