<template>
  <div>Redirecting...</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const props = defineProps({
  source: { type: String, required: true }
})

onMounted(() => {
  // Construct the redirect URL with UTM parameters
  const params = new URLSearchParams({
    utm_source: props.source,
    utm_medium: 'referral',
    utm_campaign: 'short_link'
  })
  
  // Redirect to first time user experience with UTM parameters
  window.location.href = `/ftux?${params.toString()}`
})
</script>