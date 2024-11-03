<template>
  <div class="signup-page d-flex justify-content-center align-items-center">
    <div class="card signup-card d-flex flex-row">
      <!-- Left Side: Logo -->
      <div class="logo-container d-flex align-items-center justify-content-center">
        <img src="/images/logo.png" alt="Sam1 Flower Shop Logo" class="shop-logo">
      </div>
      
      <!-- Right Side: Form -->
      <div class="form-container card-body">
        <h2 class="card-title text-center mb-4">Join Sam1 Flower Shop</h2>
        <form @submit.prevent="handleSignUp">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="firstName" class="form-label">First Name</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-person"></i></span>
                <input type="text" class="form-control" id="firstName" v-model="firstName" required>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <label for="lastName" class="form-label">Last Name</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-person"></i></span>
                <input type="text" class="form-control" id="lastName" v-model="lastName" required>
              </div>
            </div>
          </div>
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
          <div class="mb-3">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
              <input type="password" class="form-control" id="confirmPassword" v-model="confirmPassword" required>
            </div>
          </div>
          <button type="submit" class="btn btn-primary w-100 mt-3">Sign Up</button>
        </form>
        <div class="text-center mt-3">
          <p>Already have an account? <router-link to="/login">Login here</router-link></p>
        </div>
        <div v-if="message" class="alert" :class="{'alert-danger': isError, 'alert-success': !isError}" role="alert">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useRouter } from 'vue-router';

export default {
  setup() {
    const auth = getAuth();
    const db = getFirestore();
    const router = useRouter();

    const firstName = ref('');
    const lastName = ref('');
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const message = ref('');
    const isError = ref(false);

    const handleSignUp = async () => {
      if (password.value !== confirmPassword.value) {
        message.value = "Passwords do not match.";
        isError.value = true;
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
        const user = userCredential.user;

        // Send verification email
        await sendEmailVerification(user);

        // Save user details to Firestore with verified status set to false
        await setDoc(doc(db, "users", user.uid), {
          firstName: firstName.value,
          lastName: lastName.value,
          email: email.value,
          verified: false,
          role: 'user'
        });

        // Navigate to the verification page
        router.push({ name: 'Verification', params: { email: email.value } });

        message.value = "A verification email has been sent. Please check your inbox.";
        isError.value = false;
      } catch (error) {
        console.error("Error signing up:", error);
        message.value = "Error signing up: " + error.message;
        isError.value = true;
      }
    };

    return {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      message,
      isError,
      handleSignUp
    };
  }
};
</script>

<style scoped>
.signup-page {
  min-height: 100vh;
  background-image: url('/images/background.jpg');
  background-size: cover;
  background-position: center;
}

.signup-card {
  display: flex;
  flex-direction: row;
  max-width: 900px;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.logo-container {
  width: 50%;
  background-color: rgba(255, 229, 224, 0.1); /* Semi-transparent background */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.shop-logo {
  width: 80%;
  max-width: 300px;
}

.form-container {
  width: 50%;
  padding: 30px;
  background-color: rgba(255, 255, 255, 0.4); /* Semi-transparent white */
}

.card-title {
  color: #e57373;
  font-family: 'Georgia', serif;
}

.form-label {
  color: #d84315;
}

.input-group-text {
  background-color: #ffe5e0;
  border: 1px solid #ffab91;
  color: #d84315;
}

.form-control:focus {
  border-color: #ffab91;
  box-shadow: 0 0 0 0.2rem rgba(255, 171, 145, 0.25);
}

.btn-primary {
  background-color: #ff7043;
  border-color: #ff7043;
}

.btn-primary:hover,
.btn-primary:focus {
  background-color: #3a86ff;
  border-color: #3a86ff;
}

a {
  color: #ff7043;
  text-decoration: none;
}

a:hover {
  color: #3a86ff;
  text-decoration: underline;
}

.alert-danger {
  background-color: #ffe4e4;
  border-color: #ffb8b8;
}

.alert-success {
  background-color: #ffece6;
  border-color: #ffccb3;
}

/* Responsive Design */
@media (max-width: 768px) {
  .signup-card {
    flex-direction: column;
  }
  .logo-container,
  .form-container {
    width: 100%;
  }
}
</style>
