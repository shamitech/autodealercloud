<template>
  <div class="platform-dashboard">
    <div class="dashboard-header">
      <h1>Platform Administration</h1>
      <p class="subtitle">Manage tenants, domains, and system configuration</p>
    </div>

    <div class="dashboard-grid">
      <!-- Stats Cards -->
      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-icon tenants">🏢</div>
          <div class="stat-content">
            <h3>{{ tenantStats.total }}</h3>
            <p>Total Tenants</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active">✓</div>
          <div class="stat-content">
            <h3>{{ tenantStats.active }}</h3>
            <p>Active</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon pending">⏳</div>
          <div class="stat-content">
            <h3>{{ tenantStats.pending }}</h3>
            <p>Pending Setup</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <router-link to="/tenants" class="action-btn primary">
          <span>📊</span>
          Manage Tenants
        </router-link>
        <router-link to="/system-settings" class="action-btn">
          <span>⚙️</span>
          System Settings
        </router-link>
        <router-link to="/billing" class="action-btn">
          <span>💳</span>
          Billing & Plans
        </router-link>
        <router-link to="/reports" class="action-btn">
          <span>📈</span>
          Reports
        </router-link>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity">
        <h2>Recent Tenant Activity</h2>
        <div class="activity-list">
          <div v-if="recentActivity.length === 0" class="empty-state">
            <p>No recent activity</p>
          </div>
          <div v-else v-for="activity in recentActivity" :key="activity.id" class="activity-item">
            <span class="activity-type">{{ activity.type }}</span>
            <span class="activity-desc">{{ activity.description }}</span>
            <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const tenantStats = ref({
  total: 0,
  active: 0,
  pending: 0,
})
const recentActivity = ref([])

onMounted(async () => {
  // Fetch tenant statistics
  // TODO: Call API endpoint /api/platform/tenants/stats
  tenantStats.value = {
    total: 12,
    active: 10,
    pending: 2,
  }

  // Fetch recent activity
  // TODO: Call API endpoint /api/platform/activity
  recentActivity.value = [
    {
      id: 1,
      type: 'Created',
      description: 'New tenant "Smith Motors" registered',
      timestamp: new Date(),
    },
    {
      id: 2,
      type: 'Updated',
      description: 'Tenant "Johnson Auto" plan upgraded',
      timestamp: new Date(Date.now() - 3600000),
    },
  ]
})

const formatTime = (date) => {
  const now = new Date()
  const diff = now - date
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}
</script>

<style scoped>
.platform-dashboard {
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.dashboard-header {
  color: white;
  margin-bottom: 3rem;
  text-align: center;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  margin: 0;
  font-weight: 700;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0.5rem 0 0 0;
}

.dashboard-grid {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.tenants {
  background: #e3f2fd;
  color: #1976d2;
}

.stat-icon.active {
  background: #e8f5e9;
  color: #388e3c;
}

.stat-icon.pending {
  background: #fff3e0;
  color: #f57c00;
}

.stat-content h3 {
  margin: 0;
  font-size: 2rem;
  color: #333;
}

.stat-content p {
  margin: 0.5rem 0 0 0;
  color: #666;
  font-size: 0.95rem;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.action-btn {
  background: white;
  border: 2px solid white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  text-decoration: none;
  color: #667eea;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
}

.action-btn span {
  font-size: 2rem;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateY(-3px);
}

.action-btn.primary {
  background: white;
  color: #667eea;
}

.action-btn.primary:hover {
  background: #667eea;
  color: white;
}

.recent-activity {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.recent-activity h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.5rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-left: 4px solid #667eea;
  background: #f9f9f9;
  border-radius: 4px;
  gap: 1rem;
}

.activity-type {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  min-width: 80px;
}

.activity-desc {
  flex: 1;
  color: #333;
}

.activity-time {
  color: #999;
  font-size: 0.9rem;
}
</style>
