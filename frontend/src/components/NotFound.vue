<template>
    <div class="not-found">
      <div class="content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>Oops! The page you're looking for doesn't exist.</p>
        <router-link to="/" class="home-link">
          <IconHome class="icon" />
          Go to Homepage
        </router-link>
      </div>
    </div>
  </template>
  
  <script setup>
  import { IconHome } from 'lucide-vue-next'
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  onMounted(() => {
    document.title = '404 - Page Not Found'
  })
  
  const goBack = () => {
    router.go(-1)
  }
  </script>
  
  <style scoped>
  .not-found {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f8fafc;
    font-family: 'Inter', sans-serif;
  }
  
  .content {
    text-align: center;
    padding: 2rem;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 90%;
  }
  
  h1 {
    font-size: 6rem;
    font-weight: 700;
    color: #3b82f6;
    margin: 0;
    line-height: 1;
  }
  
  h2 {
    font-size: 2rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0.5rem 0 1rem;
  }
  
  p {
    font-size: 1rem;
    color: #64748b;
    margin-bottom: 2rem;
  }
  
  .home-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    background-color: #3b82f6;
    color: #ffffff;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 500;
    transition: background-color 0.3s ease;
  }
  
  .home-link:hover {
    background-color: #2563eb;
  }
  
  .home-link:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
  }
  
  .icon {
    margin-right: 0.5rem;
  }
  
  @media (max-width: 640px) {
    h1 {
      font-size: 4rem;
    }
  
    h2 {
      font-size: 1.5rem;
    }
  
    p {
      font-size: 0.875rem;
    }
  }
  </style>