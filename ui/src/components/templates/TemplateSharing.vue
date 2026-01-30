<template>
    <div class="sharing">
        <div class="sharingText">Sharing</div>
        <OneChoice v-model="publishChoice" :choices="[pubPrivate,pubPublic]" />
        <div v-if="directLink" class="directlink">
            <div>with code</div>
            <div class="bold"><a :href="directLink" target="_blank" title="Open link in new tab">{{ template?.code ? template.code:'(none)' }}</a></div>
            <Button icon="pi pi-clipboard" title="Copy link to clipboard" @click="onCopyURL" link></Button>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { UserUrl } from '@/lib/UserUrl';
import { useToast } from 'primevue/usetoast'
import { useToaster } from '@/assets/Toaster';

import Button from 'primevue/button'
import OneChoice from '../shared/OneChoice.vue';


const directLink = ref('')
const pubPublic = {label:'Public'}
const pubPrivate = {label:'Private'}
const publishChoice = ref(pubPublic)
const publish = defineModel()
const template = ref(null)
const toaster = useToaster(useToast())

//-----------------
// Props management
const props = defineProps({
  template: { type: Object, default: null},
})

function loadProps(props) {
  // Active template
  // console.log('[TemplateSharing.loadProps]', JSON.stringify(props.template))
  template.value = props.template;
  publishChoice.value = (publish.value ? pubPublic : pubPrivate)
  if( template.value && template.value.code) {
    directLink.value = UserUrl.main + '/?t=' + template.value.code
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
watch(publishChoice, () => {
    if(template.value){
        publish.value = (publishChoice.value.label == pubPublic.label)
        // console.log('[TemplateSharing.watch]', publish.value)
    } 
})

// End of props management
//------------------------

async function onCopyURL() {
  const toastTitle = 'Copy to Clipboard'
    if(!directLink.value) {
      toaster.error(toastTitle, 'Nothing to copy')
      return;
    }
    try {
      await navigator.clipboard.writeText(directLink.value);
      toaster.info(toastTitle, 'URL copied to clipboard')
    } catch(e) {
      console.log('[TemplateSharing.onCopyURL]' + e)
      toaster.error(toastTitle, 'Could not copy to clipboard')
    } 
}

</script>

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