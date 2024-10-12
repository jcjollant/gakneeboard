<template>
  <div>
    <div class="templateDescription">
      <div v-if="!hideDescription" class="label">Desc.</div>
      <div v-if="!hideDescription" class="pageDescription">{{ Template.describe(template) }}</div>
      <div class="label">Page 1</div>
      <div class="pageDescription">{{ describePage(template, 0) }}</div>
      <div class="label">Page 2</div>
      <div class="pageDescription">{{ describePage(template, 1) }}</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { describePage } from '../../assets/sheetData'
import { Template }  from '../../assets/Templates'

const template = ref(null)

//-----------------
// Props management
const props = defineProps({ 
  template: { type: Object, default: null},
  hideDescription : { type: Boolean, default: false}
})


function loadProps(props) {
  // Active template
  // console.log('[TemplateDialog.loadProps]', JSON.stringify(props.template))
  template.value = props.template;
}

onMounted( () => {
  loadProps(props)
})

watch( props, async() => {
  loadProps( props)
})

// End of props management
//------------------------


</script>

<style scoped>
.label {
    font-weight: bold;
    font-size: 0.8rem;
}
.pageDescription {
  font-size: 0.8rem;
  overflow: hidden;
  height: 1.1rem;
}

.templateDescription {
  display: grid;
  gap: 5px;
  grid-template-columns: 3.5rem auto;
  grid-column: 1 / span 3;
}

</style>