
<template>
    <div class="flex flex-col items-center justify-center p-8">
        <div class="text-xl">Redirecting...</div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { affiliates } from '../lib/affiliates';
import { AttributionService } from '../services/AttributionService';
import { RouterNames } from '../router';

const route = useRoute();
const router = useRouter();

onMounted(() => {
    // Get the path segment (e.g., 'AirplaneAcademy')
    // Router config will map path to this component, but we need to know WHICH affiliate it was.
    // We can rely on router path or a prop. Since we'll generate routes dynamically, 
    // we can assume the last path segment is the key, OR we can check against our map.
    
    const path = route.path.substring(1); // remove leading slash
    // clean path to handle potential trailing slashes or other segments if any (though route config should be exact)
    const affiliateKey = Object.keys(affiliates).find(key => key.toLowerCase() === path.toLowerCase());

    if (affiliateKey) {
        const config = affiliates[affiliateKey];
        AttributionService.saveAttribution(config.attribution);
        
        const query: Record<string, string> = {
            affiliate: affiliateKey
        };

        router.push({ name: RouterNames.FTUX, query });
    } else {
        // Fallback if something went wrong or direct access
        router.push({ name: RouterNames.Home });
    }
});
</script>
