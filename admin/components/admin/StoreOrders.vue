<template>
    <div class="store-orders">
        <h2>Store Orders (Processing)</h2>
        <div v-if="loading" class="loading">Loading...</div>
        <div v-if="!loading && orders.length === 0" class="empty">No processing orders found.</div>
        <div v-else class="orders-list">
            <div v-for="order in orders" :key="order.id" class="order-card">
                <div class="header">
                    <span class="id">#{{ order.id.substring(0, 8) }}</span>
                    <span class="status">{{ order.status }}</span>
                    <span class="date">{{ new Date(order.createdAt).toLocaleString() }}</span>
                </div>
                <div class="details">
                     <p>User ID: {{ order.userId }}</p>
                     <p>Amount: ${{ (order.amountCents / 100).toFixed(2) }}</p>
                     <div class="address" v-if="order.shippingAddress">
                        <strong>Shipping:</strong>
                        <div class="address-box">
                            <div>{{ order.shippingAddress.name }}</div>
                            <div v-if="order.shippingAddress.address">
                                <div>{{ order.shippingAddress.address.line1 }}</div>
                                <div>{{ order.shippingAddress.address.line2 }}</div>
                                <div>{{ order.shippingAddress.address.city }}, {{ order.shippingAddress.address.state }} {{ order.shippingAddress.address.postal_code }}</div>
                                <div>{{ order.shippingAddress.address.country }}</div>
                            </div>
                        </div>
                     </div>
                </div>
                <div class="items">
                    <h4>Items</h4>
                    <ul>
                        <li v-for="item in order.items" :key="item.id">
                            <strong>{{ item.displayName }}</strong> ({{ item.productType }} - {{ item.formatCode }}) <br>
                            {{ item.sheetsCount }} sheets ({{ item.pagesCount }} pages)
                            <a v-if="item.pdfUrl" :href="item.pdfUrl" target="_blank" class="pdf-link">View PDF</a>
                        </li>
                    </ul>
                </div>
                <div class="actions">
                    <button @click="markShipped(order.id)" class="ship-btn">Mark as Shipped</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '~/utils/api';
import { UrlService } from '~/utils/UrlService';
import { useToaster } from '~/utils/Toaster';
import { useToast } from 'primevue/usetoast';

const orders = ref<any[]>([]);
const loading = ref(false);
const toaster = useToaster(useToast());

const fetchOrders = async () => {
    loading.value = true;
    try {
        const res = await api.get(UrlService.adminRoot + 'orders');
        orders.value = res.data;
    } catch (e: any) {
        toaster.error('Failed to fetch orders', e.message);
    } finally {
        loading.value = false;
    }
}

const markShipped = async (orderId: string) => {
    if (!confirm('Are you sure you want to mark this order as shipped?')) return;
    try {
        await api.post(UrlService.adminRoot + 'orders/' + orderId + '/ship');
        toaster.success('Order Shipped', 'Order marked as shipped successfully.');
        fetchOrders(); // Refresh
    } catch (e: any) {
        toaster.error('Failed to update order', e.message);
    }
}


onMounted(() => {
    fetchOrders();
});
</script>

<style scoped>
.order-card {
    border: 1px solid #ccc;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 8px;
    background: #f9f9f9;
}
.header {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    border-bottom: 1px solid #ddd;
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
}
.details {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}
.address-box {
    background: #fff;
    padding: 5px;
    border: 1px solid #eee;
}
.pdf-link {
    color: blue;
    margin-left: 10px;
    font-weight: bold;
}
.ship-btn {
    background: #27ae60;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 10px;
}
.ship-btn:hover {
    background: #2ecc71;
}
.items ul {
    list-style: none;
    padding: 0;
}
.items li {
    background: #fff;
    padding: 5px;
    margin-bottom: 5px;
    border: 1px solid #eee;
}
</style>
