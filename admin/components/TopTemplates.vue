<template>
  <div class="top-templates-section">
    <div class="section-header">
      <h2>Top 100 Templates</h2>
      <div class="sort-controls">
        <span class="sort-label">Sort by:</span>
        <button
          v-for="opt in sortOptions"
          :key="opt.value"
          :class="['sort-btn', { active: sortBy === opt.value }]"
          @click="setSortBy(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Loading templates…</span>
    </div>

    <div v-else-if="templates.length > 0" class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>User ID</th>
            <th>Version</th>
            <th>Pages</th>
            <th>Created</th>
            <th>Last Update</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in templates" :key="t.id">
            <td>
              <a
                :href="mainSiteUrl(t.id)"
                target="_blank"
                rel="noopener noreferrer"
                class="template-id-link"
              >{{ t.id }}</a>
            </td>
            <td class="template-name">{{ t.name || '—' }}</td>
            <td>{{ t.user_id ?? 'system' }}</td>
            <td>{{ t.version }}</td>
            <td>{{ t.pages }}</td>
            <td>{{ formatDate(t.creation_date) }}</td>
            <td>{{ t.last_save ? formatDate(t.last_save) : '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="fetched && !loading" class="no-results">
      No templates found.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '~/utils/api'
import { UrlService } from '~/utils/UrlService'
import { useToaster } from '~/utils/Toaster'
import { useToast } from 'primevue/usetoast'

interface TemplateRow {
  id: number
  name: string | null
  user_id: number | null
  version: number
  pages: number
  creation_date: string
  last_save: string | null
}

const toaster = useToaster(useToast())
const loading = ref(false)
const fetched = ref(false)
const templates = ref<TemplateRow[]>([])
const sortBy = ref<'creation_date' | 'version' | 'last_save'>('creation_date')

const sortOptions: { value: 'creation_date' | 'version' | 'last_save'; label: string }[] = [
  { value: 'creation_date', label: '📅 Creation Date' },
  { value: 'version', label: '🔢 Version Number' },
  { value: 'last_save', label: '💾 Last Update' },
]

const MAIN_SITE = computed(() => UrlService.appRoot)

function mainSiteUrl(id: number): string {
  return `${MAIN_SITE.value}/template/${id}`
}

function formatDate(raw: string | null): string {
  if (!raw) return '—'
  const d = new Date(raw)
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

async function fetchTemplates() {
  loading.value = true
  try {
    const res = await api.get(UrlService.adminRoot + `templates/top?sortBy=${sortBy.value}`)
    templates.value = res.data
    fetched.value = true
  } catch (err: any) {
    toaster.error('Failed to load templates', err.message)
  } finally {
    loading.value = false
  }
}

function setSortBy(val: 'creation_date' | 'version' | 'last_save') {
  sortBy.value = val
  fetchTemplates()
}

onMounted(() => {
  fetchTemplates()
})
</script>

<style scoped>
.top-templates-section {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  color: #2c3e50;
  font-family: 'Outfit', sans-serif;
  font-size: 1.4rem;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sort-label {
  font-weight: 600;
  color: #64748b;
  font-size: 0.9rem;
}

.sort-btn {
  padding: 0.4rem 0.9rem;
  border: 2px solid #e1e8ed;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s ease;
}

.sort-btn:hover {
  border-color: #3498db;
  color: #3498db;
}

.sort-btn.active {
  background: #3498db;
  border-color: #3498db;
  color: white;
}

/* Loading */
.loading-state {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  color: #64748b;
  font-size: 0.95rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #e1e8ed;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Table */
.table-container {
  overflow-x: auto;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

thead th {
  background: #f8fafc;
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e1e8ed;
  white-space: nowrap;
}

tbody td {
  padding: 0.6rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #374151;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background: #f8fafc;
}

.template-name {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.template-id-link {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  color: #2563eb;
  font-weight: 600;
  font-size: 0.85rem;
  text-decoration: none;
  transition: all 0.15s ease;
}

.template-id-link:hover {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
  font-style: italic;
}
</style>
