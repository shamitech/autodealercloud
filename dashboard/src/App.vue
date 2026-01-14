<script setup>
import { useRoute } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const route = useRoute()
</script>

<template>
  <div id="app">
    <!-- If on login page, show full-screen login -->
    <LoginView v-if="route.name === 'Login'" />
    
    <!-- Otherwise show dashboard layout with router-view -->
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
