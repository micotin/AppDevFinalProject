<template>
  <div class="verification-page d-flex justify-content-center align-items-center">
    <div class="verification-card">
      <div class="card-body p-4 text-center">
        <h2 class="text-white mb-3">Verify Your Email Address</h2>
        <p class="text-light-purple mb-4">
          A confirmation link has been sent to your inbox.<br>
          Please click the link to verify your email and activate your account.
        </p>
        
        <div v-if="message" class="verification-message mb-4" :class="{ 'verified': isVerified }">
          {{ message }}
        </div>
        
        <button 
          :disabled="!isVerified" 
          class="btn custom-button w-100"
          @click="goToLogin"
        >
          Return to Login
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { useRouter } from 'vue-router';

export default {
  setup() {
    const auth = getAuth();
    const db = getFirestore();
    const router = useRouter();

    const message = ref('');
    const isVerified = ref(false);

    const checkVerificationStatus = async () => {
      const user = auth.currentUser;

      if (user) {
        await user.reload();
        if (user.emailVerified) {
          isVerified.value = true;
          message.value = "Your email has been verified! You can now log in.";

          // Update Firestore to set verified status to true
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { verified: true });
        } else {
          message.value = "Your email is not verified yet. Please check your inbox.";
        }
      } else {
        message.value = "No user found. Please sign up again.";
      }
    };

    const goToLogin = () => {
      router.push('/login');
    };

    const pollVerificationStatus = () => {
      const intervalId = setInterval(() => {
        checkVerificationStatus();
        if (isVerified.value) {
          clearInterval(intervalId);
        }
      }, 3000); // Check every 3 seconds
    };

    onMounted(() => {
      checkVerificationStatus();
      pollVerificationStatus();
    });

    return {
      message,
      isVerified,
      goToLogin
    };
  }
};
</script>

<style scoped>
.verification-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #2d1b69 0%, #a12c82 100%);
}

.verification-card {
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

.verification-message {
  padding: 12px;
  border-radius: 8px;
  background: rgba(229, 72, 77, 0.1);
  border: 1px solid rgba(229, 72, 77, 0.2);
  color: #ff6b6b;
}

.verification-message.verified {
  background: rgba(46, 160, 67, 0.1);
  border-color: rgba(46, 160, 67, 0.2);
  color: #2ea043;
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

.custom-button:hover:not(:disabled) {
  opacity: 0.9;
  color: white;
}

.custom-button:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

h2 {
  font-size: 1.75rem;
  font-weight: 600;
}

p {
  font-size: 0.95rem;
  line-height: 1.6;
}
</style>