<template>
  <div class="page-test-container">
    <div class="page-wrapper">
      <Page :data="testPage" @update="onPageUpdate" />
    </div>
    <div class="controls">
      <button @click="clearPage" class="clear-btn">Clear</button>
      <button @click="copyToClipboard" class="copy-btn">Copy Page Data</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { TemplatePage } from '../models/Template'
import Page from '../components/page/Page.vue'
import { useToaster } from '../assets/Toaster'
import { useToast } from 'primevue/usetoast'

const testPage = ref<TemplatePage>(new TemplatePage())
const toaster = useToaster(useToast())

onMounted(() => {
  loadPageFromStorage()
})

function loadPageFromStorage() {
  const storedPage = localStorage.getItem('test-page')
  if (storedPage) {
    try {
      const pageData = JSON.parse(storedPage)
      // Reconstruct TemplatePage
      testPage.value = new TemplatePage(pageData.type, pageData.name, pageData.data)
    } catch (error) {
      console.error('Failed to parse stored page data:', error)
      testPage.value = new TemplatePage()
    }
  } else {
    testPage.value = new TemplatePage()
  }
}

function onPageUpdate(newPageData: TemplatePage) {
  // Page component emits {type:..., data:...} which matches TemplatePage structure roughly
  // but let's be safe. The emit in Page.vue is:
  // emits('update', {type:type.value,data:newData})
  testPage.value = new TemplatePage(newPageData.type, '', newPageData.data)
  savePage()
}

function savePage() {
  localStorage.setItem('test-page', JSON.stringify(testPage.value))
}

function clearPage() {
  localStorage.removeItem('test-page')
  testPage.value = new TemplatePage()
}

function copyToClipboard() {
  navigator.clipboard.writeText(JSON.stringify(testPage.value, null, 2))
  toaster.success('Copied', 'Page data copied to clipboard')
}
</script>

<style scoped>
.page-test-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: var(--background-color, #f5f5f5);
}

.page-wrapper {
  margin-bottom: 20px;
  width: 100%;
  max-width: 1200px; /* Adjust as needed */
}

.controls {
  display: flex;
  gap: 10px;
}

.clear-btn, .copy-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.clear-btn {
  background-color: #f44336;
  color: white;
}

.clear-btn:hover {
  background-color: #da190b;
}

.copy-btn {
  background-color: #FF9800;
  color: white;
}

.copy-btn:hover {
  background-color: #F57C00;
}
</style>
