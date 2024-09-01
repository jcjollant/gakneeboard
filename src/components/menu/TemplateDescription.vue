<script setup>
import { onMounted, ref, watch } from 'vue'
import { describePage } from '../../assets/sheetData'

const template = ref(null)

//-----------------
// Props management
const props = defineProps({ 
  template: { type: Object, default: null},
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

<template>
    <div class="templateDescription">
        <div class="label">Front</div><div class="pageDescription">{{ describePage(template, 0) }}</div>
        <div class="label">Back</div><div class="pageDescription">{{ describePage(template, 1) }}</div>
    </div>
</template>

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