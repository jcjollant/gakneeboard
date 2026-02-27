<template>
    <div class="ty">
        <div class="confirm">
            <FAButton label="Home Page" icon="plane-departure" @click="router.push('/')"/>
        </div>
    </div>
</template>
<script setup lang="ts">
import FAButton from '../components/shared/FAButton.vue';
import { useRouter, useRoute } from 'vue-router';
import { onMounted } from 'vue';
import { CheckoutService } from '../services/CheckoutService';
import { currentUser } from '../assets/data';
import { AnalyticsService } from '../services/AnalyticsService';

const router = useRouter();
const route = useRoute();

onMounted(async () => {
    const sessionId = route.query.session_id as string;
    if (sessionId) {
        const storageKey = `ga4_tracked_${sessionId}`;
        
        // Prevent duplicate tracking
        if (!localStorage.getItem(storageKey)) {
            try {
                const sessionData = await CheckoutService.getSession(sessionId, currentUser);
                
                // Format items for GA4
                const items = sessionData.line_items?.data.map((item: any) => {
                    return {
                        item_id: item.price?.product || item.id,
                        item_name: item.description,
                        price: item.amount_total / 100,
                        quantity: item.quantity
                    };
                }) || [];

                AnalyticsService.purchase(sessionData, items);
                
                localStorage.setItem(storageKey, 'true');
            } catch (e) {
                console.error('Failed to fetch session for GA4 tracking', e);
            }
        }
        
        // Clean up URL
        router.replace({ query: {} });
    }
});
</script>


<style scoped>
.ty {
    position: relative;
    min-height: 100vh;
    background: url('/ThankYou.jpg');
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}
.confirm {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 10px;
    width: 100%;
}
</style>