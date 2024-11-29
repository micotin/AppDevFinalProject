<template>
  <div class="login-page d-flex justify-content-center align-items-center">
    <div class="login-card">
      <div class="card-body p-4">
        <h2 class="text-white mb-2">Login</h2>
        <p class="text-light-purple mb-4">Welcome back!</p>
        
        <form @submit.prevent="login">
          <div class="mb-4">
            <label for="email" class="form-label text-light-purple">Email</label>
            <input 
              type="email" 
              class="form-control custom-input" 
              id="email" 
              v-model="email" 
              placeholder="Enter your email"
              required
            >
          </div>
          
          <div class="mb-3">
            <label for="password" class="form-label text-light-purple">Password</label>
            <input 
              type="password" 
              class="form-control custom-input" 
              id="password" 
              v-model="password" 
              placeholder="Enter your password"
              required
            >
          </div>
          
          <div class="text-end mb-4">
            <router-link to="/forgot-password" class="forgot-link">Forgot password?</router-link>
          </div>
          
          <button type="submit" class="btn custom-button w-100 mb-4">Login</button>
        </form>
        
        <div class="text-center">
          <p class="text-light-purple mb-0">
            Don't have an account? 
            <router-link to="/signup" class="signup-link">Signup</router-link>
          </p>
        </div>
        
        <div v-if="message" :class="['alert', 'mt-3', isError ? 'alert-danger' : 'alert-success']" role="alert">
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
  background: linear-gradient(135deg, #2d1b69 0%, #a12c82 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: rgba(28, 28, 45, 0.9);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.text-light-purple {
  color: #b4b4bb;
}

.custom-input {
  background: rgba(35, 35, 50, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  padding: 12px 16px;
}

.custom-input:focus {
  background: rgba(40, 40, 55, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

.custom-input::placeholder {
  color: #6c6c7d;
}

.custom-button {
  background: linear-gradient(135deg, #e5484d 0%, #a12c82 100%);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 12px;
  font-weight: 500;
  transition: opacity 0.2s;
}

.custom-button:hover {
  opacity: 0.9;
  color: white;
}

.forgot-link, .signup-link {
  color: #b4b4bb;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.forgot-link:hover, .signup-link:hover {
  color: white;
}

.signup-link {
  color: #e5484d;
}

.alert {
  background: rgba(35, 35, 50, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}

.alert-danger {
  background: rgba(229, 72, 77, 0.1);
  border-color: rgba(229, 72, 77, 0.2);
}

.alert-success {
  background: rgba(46, 160, 67, 0.1);
  border-color: rgba(46, 160, 67, 0.2);
}
</style>