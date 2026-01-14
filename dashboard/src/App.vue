<script setup>
import { useRoute } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const route = useRoute()

// Pages that should be full-screen without dashboard layout
const fullScreenPages = ['Login', 'NotFound', 'ResetPassword', 'ForgotPassword']
</script>

<template>
  <div id="app">
    <!-- Full-screen pages without dashboard layout -->
    <LoginView v-if="route.name === 'Login'" />
    <NotFoundView v-else-if="route.name === 'NotFound'" />
    
    <!-- Dashboard layout with side panel for all other pages -->
    <DashboardLayout v-else />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  background-color: #f3f4f6;
}

#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
