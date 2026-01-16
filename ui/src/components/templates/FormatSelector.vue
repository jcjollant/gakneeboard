<template>
  <div class="formatSelector">
    <div class="header">Select Template Format</div>
    <div class="formatOptions">
      <div class="formatOption" @click="selectFormat(TemplateFormat.Kneeboard)">
        <img src="/thumbnails/kneeboard-size.png" class="formatImage" />
        <div class="formatTitle">Kneeboard Size</div>
        <div class="formatDescription">
          5.5" x 8.5" to fold and clip on kneeboard.
        </div>
      </div>
      <div class="formatOption" @click="selectFormat(TemplateFormat.FullPage)">
        <img src="/thumbnails/fullpage-size.png" class="formatImage" />
        <div class="formatTitle">Full Page</div>
        <div class="formatDescription">
          8.5" x 11" full Letter size format.
        </div>
      </div>
    </div>
    <div class="formatActions">
      <Button label="Cancel" class="p-button-secondary" @click="onCancel" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { TemplateFormat } from '../../models/TemplateFormat';
import { getTemplateBlank } from '../../assets/sheetData';
import { useRouter } from 'vue-router';
import { routeToLocalTemplate } from '../../assets/data';
import Button from 'primevue/button';

const router = useRouter();

function selectFormat(format: string) {
  const templateData = getTemplateBlank();
  templateData.name = 'New Template';
  templateData.format = format;
  
  // For Full Page format, create with only one page
  if (format === TemplateFormat.FullPage && templateData.data.length > 1) {
    templateData.data.pop(); // Remove the second page
    templateData.pages = templateData.data.length; // Update page count
  }
  
  // Save template data to localstore and navigate to template editor
  routeToLocalTemplate(router, templateData);
}

function onCancel() {
  router.push('/');
}
</script>

<style scoped>
.formatSelector {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.header {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
}

.formatOptions {
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.formatOption {
  width: 300px;
  border: 2px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.formatOption:hover {
  border-color: var(--bg);
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.formatImage {
  width: 300px;
  height: 300px;
  padding: 10px;
  object-fit: contain;
}

.formatTitle {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.formatDescription {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.formatActions {
  display: flex;
  justify-content: center;
}
</style>
