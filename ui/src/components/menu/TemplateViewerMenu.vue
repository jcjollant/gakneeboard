<template>
  <div id="vfr-menu" class="templateMenu">
    <MenuButton id="btnShow" icon="bars" title="Show/hide Menu" 
      :label="isCollapsed ? 'Show Menu' : 'Hide Menu'"
      :active="!isCollapsed"
      @click="$emit('update:isCollapsed', !isCollapsed)"/>

    <template v-if="!isCollapsed">
      <!-- Always visible in Expanded modes -->
      <MenuButton id="btnPrint" icon="print" title="Print Kneeboard" label="Print" primary
        @click="$emit('print')"/>
      
      <MenuButton v-if="showSave" id="btnSave" icon="save" title="Save Kneeboard to the Cloud" label="Save" :disabled="!isTemplateValid"
        @click="$emit('save', false)"/>

      <MenuButton v-if="isModified && hasId" id="btnUndo" icon="rotate-left" title="Discard unsaved changes" label="Undo"
        @click="$emit('undo')"/>
      
      <!-- Only visible in Full Mode -->
      <template v-if="isFullMode">
        <MenuButton id="btnDuplicate" v-if="hasVersion" icon="clone" title="Save as a duplicate new kneeboard" label="Duplicate" 
          @click="$emit('save', true)" />
        
        <MenuButton v-if="showScroll" id="btnRoll" icon="scroll" title="Toggle Scroll View" 
          :label="activeScroll ? 'Exit Scroll Mode' : 'Enter Scroll Mode'" :active="activeScroll"
          @click="$emit('scroll')"/>
        
        <MenuButton v-if="showEditor" id="btnEditor"
          icon="screwdriver-wrench" title="Toggle Editor mode" 
          :label="activeEditor ? 'Hide Editor Controls' : 'Show Editor Controls'" :active="activeEditor"
          :class="{'editorButtonActive':activeEditor}" class="editorButton"
          @click="$emit('editor')"/>
        
        <MenuButton v-if="showExport" id="btnExport" icon="file-export" title="Export Kneeboard to Various Formats" label="Export"
          @click="$emit('export')"/>
        
        <MenuButton id="btnSettings" icon="gear" title="Kneeboard Name and Description" label="Properties"
          @click="$emit('settings')"/>
        
        <MenuButton v-if="showDelete" id="btnDelete" icon="trash" title="Delete Kneeboard" label="Delete Kneeboard" :danger="true" :disabled="!isTemplateValid"
          @click="$emit('delete')"/>
      </template>
      <MenuButton v-if="!isFullMode" id="btnExpand" icon="ellipsis" title="Expand Menu" label="More" @click="isFullMode = !isFullMode"/>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import MenuButton from './MenuButton.vue'

const props = defineProps<{
  isCollapsed: boolean
  isTemplateValid: boolean
  activeScroll?: boolean
  activeEditor?: boolean
  showDelete?: boolean
  showEditor?: boolean
  showExport?: boolean
  showSave?: boolean
  showScroll?: boolean
  hasVersion?: boolean
  isModified?: boolean
  hasId?: boolean
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
  (e: 'undo'): void
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
