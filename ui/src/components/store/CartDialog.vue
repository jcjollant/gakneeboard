<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Your Cart</h2>
        <button @click="close" class="close-button">
          <font-awesome-icon icon="xmark" />
        </button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading-state">
          <p class="stand-by-text">Hold Short</p>
          <font-awesome-icon icon="spinner" spin size="2x" />
        </div>

        <div v-else-if="!cart || !cart.items || cart.items.length === 0" class="empty-state">
          Your cart is empty.
        </div>

        <div v-else class="cart-content">
          <div class="cart-items">
            <div v-for="item in cart.items" :key="item.id" class="cart-item">
              <div class="item-details">
                <h3>{{ item.displayName }}</h3>
                <p class="item-description">{{ formatDescription(item.formatCode) }}</p>
                <p v-if="item.productType === 'CUSTOM'" class="item-meta">{{ item.sheetsCount }} sheets ({{ item.pagesCount }} pages)</p>
              </div>
              <div class="item-actions">
                <span class="item-price">${{ (item.priceCents / 100).toFixed(2) }}</span>
                <button @click="removeItem(item.id)" class="remove-button" title="Remove Item">
                  <font-awesome-icon icon="trash" />
                </button>
              </div>
            </div>
          </div>

          <div class="cart-summary">
            <span class="total-label">Total</span>
            <span class="total-amount">${{ ((cart.amountCents || 0) / 100).toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <div class="modal-footer" v-if="cart && cart.items && cart.items.length > 0">
        <button @click="close" class="btn btn-secondary">Continue Shopping</button>
        <button @click="checkout" class="btn btn-primary">
          <font-awesome-icon icon="lock" /> Checkout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { StoreService } from '../../services/StoreService';
import { CurrentUser } from '../../assets/CurrentUser';
import { PrintOrder, PrintFormat, PRINT_PRICING } from '@gak/shared';
import { useToast } from 'primevue/usetoast';
import { useToaster } from '../../assets/Toaster';

const toaster = useToaster(useToast());

const props = defineProps<{
  visible: boolean;
  user: CurrentUser;
}>();

const emit = defineEmits(['close']);

const cart = ref<PrintOrder | null>(null);
const loading = ref(false);

const loadCart = async () => {
  loading.value = true;
  try {
    const fetchedCart = await StoreService.getCart(props.user);
    // console.log('Fetched cart', fetchedCart);
    cart.value = fetchedCart;
  } catch (e) {
    console.error('Failed to load cart', e);
  } finally {
    loading.value = false;
  }
};

const removeItem = async (itemId: string) => {
    loading.value = true;
    try {
        cart.value = await StoreService.removeItem(props.user, itemId);
    } catch(e) {
        console.error('Failed to remove item', e);
    } finally {
        loading.value = false;
    }
}

const checkout = async () => {
    if(!cart.value) return;
    
    // Close dialog immediately
    close();
    
    toaster.info('Preparing Checkout', 'Please wait while we redirect you to Stripe...', 5000);
    
    try {
        // Run checkout and minimum delay in parallel
        const [_, url] = await Promise.all([
            new Promise(resolve => setTimeout(resolve, 5000)),
            StoreService.checkout(props.user, cart.value)
        ]);

        if (url) {
            window.location.href = url;
        } else {
            toaster.error('Checkout Failed', 'No checkout URL returned');
        }
    } catch(e: any) {
        toaster.error('Checkout Failed', e.message || e);
    }
}

const formatDescription = (code: PrintFormat) => {
    return PRINT_PRICING[code]?.description || code;
}

const close = () => {
  emit('close');
};

watch(() => props.visible, (newVal) => {
    if (newVal) {
        loadCart();
    }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #111827;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s;
}

.close-button:hover {
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex-grow: 1;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 2rem 0;
  color: #6b7280;
}

.cart-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-details h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.item-description {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.item-meta {
  margin: 0.25rem 0 0 0;
  font-size: 0.75rem;
  color: #9ca3af;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-price {
  font-weight: bold;
  color: #111827;
}

.remove-button {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
}

.remove-button:hover {
  color: #b91c1c;
}

.cart-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
}

.total-label {
  font-size: 1.25rem;
  font-weight: bold;
  color: #111827;
}

.total-amount {
  font-size: 1.25rem;
  font-weight: bold;
  color: #111827;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
  font-size: 1rem;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.stand-by-text {
    font-size: 1.25rem;
    font-weight: 500;
    color: #4b5563;
    margin-bottom: 1rem;
    animation: fadeIn 0.5s ease-in-out;
}
</style>
