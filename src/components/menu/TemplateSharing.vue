<script setup>
import { onMounted, ref, watch } from 'vue'

import { urlKneeboard } from '../../assets/data'
import { emitToastError } from '../../assets/toast'

import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'

const emits = defineEmits(["toast"]);

const directLink = ref('')
const pubPublic = 'Public'
const pubPrivate = 'Private'
const publish = ref(pubPrivate)
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
  publish.value = template.value?.publish ? pubPublic : pubPrivate
  if( template.value && template.value.code) {
    directLink.value = urlKneeboard + '?t=' + template.value.code
  } else {
    directLink.value = ''
  }
}

onMounted( () => {
  loadProps(props)
})

watch( props, async() => {
  loadProps( props)
})

// keep template publish in sync with publish option
watch(publish, () => {
    if(template.value){
        template.value.publish = (publish.value == pubPublic)
        // console.log('[TemplateSharing.watch]', template.value.publish)
    } 
})

// End of props management
//------------------------

async function onCopyURL() {
  const toastTitle = 'Copy to Clipboard'
    if(!directLink.value) {
      emitToastError(toastTitle, 'Nothing to copy')
      return;
    }
    try {
      await navigator.clipboard.writeText(directLink.value);
      emitToast(toastTitle, directLink.value + ' copied to clipboard')
    } catch($e) {
      emitToastError(toastTitle, 'Could not copy to clipboard', toastError)
    }  
}



</script>

<template>
    <div class="sharing">
        <div class="sharingText">Sharing</div>
        <SelectButton v-model="publish" :options="[pubPrivate,pubPublic]" aria-labelledby="basic" />
        <div v-if="directLink" class="directlink">
            <div>with code</div>
            <div class="bold"><a :href="directLink" target="_blank" title="Open link in new tab">{{ template?.code ? template.code:'(none)' }}</a></div>
            <Button icon="pi pi-clipboard" title="Copy link to clipboard" @click="onCopyURL" link></Button>
        </div>
    </div>
</template>

<style>
.directlink {
    display: flex;
    align-items: center;
    gap: 0.2rem;
}
.sharing {
    display: flex;
    align-items: center;
    font-size: 0.8rem;
    gap: 10px;
}
.sharingText {
    font-weight: bold;
}
</style>