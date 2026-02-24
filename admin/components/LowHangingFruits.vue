<template>
  <div class="report-section">
    <h2>Low Hanging Fruits Report</h2>
    <div class="input-group">
      <div class="date-picker">
        <label for="startDate">Start Date:</label>
        <input type="date" id="startDate" v-model="startDateStr" />
      </div>
      <button @click="fetchReport" :disabled="loading">{{ loading ? 'Running...' : 'Run Report' }}</button>
    </div>

    <div v-if="reportData.length > 0" class="report-results">
      <h3>Results ({{ reportData.length }} users)</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Email</th>
              <th>Print Count</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in reportData" :key="row.userId">
              <td>{{ row.userId }}</td>
              <td>{{ row.email }}</td>
              <td>{{ row.count }}</td>
              <td>
                <router-link :to="{ query: { userId: row.userId } }" class="view-link">View Profile</router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else-if="runOnce && !loading" class="no-results">
      No users found for the selected criteria.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '~/utils/api'
import { UrlService } from '~/utils/UrlService'
import { useToaster } from '~/utils/Toaster'
import { useToast } from 'primevue/usetoast'

const toaster = useToaster(useToast())
const loading = ref(false)
const runOnce = ref(false)
const reportData = ref<{ userId: number, email: string, count: number }[]>([])

// Default to 7 days ago
const defaultDate = new Date()
defaultDate.setDate(defaultDate.getDate() - 7)
const startDateStr = ref(defaultDate.toISOString().split('T')[0])

async function fetchReport() {
  loading.value = true
  runOnce.value = true
  
  if (!startDateStr.value) return
  const days = Math.floor((new Date().getTime() - new Date(startDateStr.value).getTime()) / (1000 * 60 * 60 * 24))
  
  try {
    const res = await api.get(UrlService.adminRoot + 'usage/low-hanging-fruits?days=' + days)
    reportData.value = res.data
  } catch (err: any) {
    toaster.error('Report Failed', err.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
    // Optionally auto-run on mount
})
</script>

<style scoped>
.report-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.input-group {
  display: flex;
  gap: 2rem;
  align-items: flex-end;
  margin-bottom: 2rem;
}

.date-picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-picker label {
  font-weight: 600;
  color: #2c3e50;
}

.date-picker input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;
}

button:hover {
  background: #2980b9;
}

button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.report-results {
  margin-top: 2rem;
}

.table-container {
  overflow-x: auto;
  border: 1px solid #eee;
  border-radius: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th, td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

tr:hover {
  background: #fcfcfc;
}

.view-link {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
}

.view-link:hover {
  text-decoration: underline;
}

.no-results {
  text-align: center;
  color: #7f8c8d;
  padding: 2rem;
}
</style>
