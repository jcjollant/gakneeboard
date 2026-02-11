<template>
  <div v-if="isCollapsed" class="templateMenu collapsed">
    <MenuButton id="btnExpand" icon="bars" title="Show Menu Buttons" label="Expand Menu"
      @click="$emit('update:isCollapsed', false)"/>
  </div>
  <div v-else class="templateMenu">
    
    <!-- Toggle Button: Short Mode -> Full Mode -->
    <MenuButton v-if="!isFullMode" id="btnExpandMore" icon="ellipsis" title="Show All Actions" label="Show More"
      @click="isFullMode = true"/>

    <!-- Toggle Button: Full Mode -> Collapsed -->
    <MenuButton v-else id="btnExpand" icon="bars" title="Hide Menu Buttons" label="Collapse Menu" :active="true"
      @click="$emit('update:isCollapsed', true)"/>
    
    <!-- Always visible in Expanded modes -->
    <MenuButton id="btnPrint" icon="print" title="Print Kneeboard" label="Print" primary
      @click="$emit('print')"/>
    
    <MenuButton id="btnSave" icon="save" title="Save Kneeboard to the Cloud" label="Save" :disabled="!isTemplateValid"
      @click="$emit('save', false)"/>
    
    <!-- Only visible in Full Mode -->
    <template v-if="isFullMode">
      <MenuButton id="btnDuplicate" v-if="hasVersion" icon="clone" title="Save as a duplicate new kneeboard" label="Duplicate" 
        @click="$emit('save', true)" />
      
      <MenuButton id="btnRoll" icon="scroll" title="Toggle Scroll View" label="Toggle Scroll" :active="showScroll"
        @click="$emit('scroll')"/>
      
      <MenuButton id="btnEditor"
        icon="screwdriver-wrench" title="Toggle Editor mode" label="Toggle Editor" :active="showEditor"
        :class="{'editorButtonActive':showEditor}" class="editorButton"
        @click="$emit('editor')"/>
      
      <MenuButton id="btnExport" icon="file-export" title="Export Kneeboard to Various Formats" label="Export"
        @click="$emit('export')"/>
      
      <MenuButton id="btnSettings" icon="gear" title="Kneeboard Name and Description" label="Properties"
        @click="$emit('settings')"/>
      
      <MenuButton id="btnDelete" icon="trash" title="Delete Kneeboard" label="Delete" :danger="true" :disabled="!isTemplateValid"
        @click="$emit('delete')"/>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import MenuButton from './MenuButton.vue'

const props = defineProps<{
  isCollapsed: boolean
  isTemplateValid: boolean
  showScroll?: boolean
  showEditor?: boolean
  hasVersion?: boolean
}>()

defineEmits<{
  (e: 'update:isCollapsed', value: boolean): void
  (e: 'print'): void
  (e: 'save', clone: boolean): void
  (e: 'scroll'): void
  (e: 'editor'): void
  (e: 'export'): void
  (e: 'settings'): void
  (e: 'delete'): void
}>()

const isFullMode = ref(false)

// Reset full mode when collapsed
watch(() => props.isCollapsed, (newVal) => {
  if (newVal) {
    isFullMode.value = false
  }
})
</script>

<style scoped>
.templateMenu {
  position: absolute;
  left: calc( var(--menu-border-offset) / 2);
  top: 0;
  display: flex;
  flex-flow: column;
  gap: var(--menu-border-offset);
  z-index: 20;
  top: -15px;
}

#btnDelete {
  margin-top: 40px;
}
</style>
