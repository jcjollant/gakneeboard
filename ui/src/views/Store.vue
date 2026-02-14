<template>
  <Menu></Menu>
  <div class="store-container">
    <div class="store-header">
      <h1>Store</h1>
      <button @click="showCart = true" class="cart-button">
        <font-awesome-icon icon="shopping-cart" /> Cart
      </button>
    </div>

    <!-- Custom Configuration Mode -->
    <div v-if="customMode" class="config-section">
      <div class="config-header">
        <h2>Configure Your Custom Print</h2>
      </div>
      <div class="config-content">
        <div class="preview-area">
           <iframe v-if="customPdfUrl" :src="customPdfUrl" class="pdf-preview"></iframe>
           <p class="page-count">{{ customPagesCount }} pages detected.</p>
        </div>
        <div class="options-area">
            <div class="format-selection">
                <label class="section-label">Select a Format</label>
                <div class="format-list">
                    <div v-for="(details, code) in pricing" :key="code" 
                         class="format-option"
                         :class="{'selected': selectedFormat === code}"
                         @click="selectedFormat = code"
                    >
                        <div class="radio-circle">
                            <div v-if="selectedFormat === code" class="radio-inner"></div>
                        </div>
                        <div class="format-details">
                            <span class="format-name">{{ details.description }}</span>
                            <span class="format-price">${{ (calculatePrice(code, customPagesCount) / 100).toFixed(2) }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="action-buttons">
                <button @click="addCustomToCart" :disabled="!selectedFormat" class="btn btn-primary full-width">
                    Add Custom Print to Cart
                </button>
                <button @click="cancelCustom" class="btn btn-text full-width">
                    Cancel
                </button>
            </div>
        </div>
      </div>
    </div>

    <div v-if="customMode" class="divider"></div>

    <!-- Standard Items -->
    <div class="products-section">
        <h2>Quick Reference Cards</h2>
        <p class="section-subtitle">What you need. When you need it. Kneeboard sized laminated reference cards.</p>
        <div class="products-grid">
            <div class="product-card">
                <div class="badge-free-shipping">FREE SHIPPING</div>
                <Kneeboard3D 
                    frontSrc="/thumbnails/reference-0.png" 
                    backSrc="/thumbnails/reference-1.png" 
                />
                <div class="product-info">
                    <h3>VFR / IFR</h3>
                    <div class="description-block">
                        <p class="desc-text"><span class="desc-label">VFR Side:</span> Cloud Clearance, Flight Categories, VFR Altitudes, Definition of Night, Lost Comms, Quick Reference</p>
                    </div>
                    <div class="description-block">
                        <p class="desc-text"><span class="desc-label">IFR Side:</span> IFR Alternate, IFR Lost Comms, IFR Reporting, Service Volumes and Supplemental Oxygen</p>
                    </div>
                </div>
                <div class="product-footer">
                    <span class="price">$9.99</span>
                    <button @click="addStandardToCart('Reference Card', 'KB_LOOSE')" class="btn btn-success">
                        Add to Cart
                    </button>
                </div>
            </div>
            
            <div class="product-card">
                <div class="badge-free-shipping">FREE SHIPPING</div>
                <Kneeboard3D 
                    frontSrc="/thumbnails/seattle.png" 
                    backSrc="/thumbnails/default.png" 
                />
                <div class="product-info">
                    <h3>Seattle GA Airports</h3>
                    <div class="description-block">
                        <p class="desc-text"><span class="desc-label">Front:</span>Arlington (KAWO), Auburn (S50), Boeing Field (KBFI), Bremerton (KPWT), Harvey (S43), Normal Grier (S36).</p>
                    </div>
                    <div class="description-block">
                        <p class="desc-text"><span class="desc-label">Back:</span>Olympia (KOLM), Paine (KPAE), Pierce (KPLU), Renton (KRNT), Skagit (KBVS), Tacoma (KTIW)</p>
                    </div>
                </div>
                <div class="product-footer">
                    <span class="price">$9.99</span>
                    <button @click="addStandardToCart('Seattle Airports', 'KB_LOOSE')" class="btn btn-success">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <div v-if="!customMode && FeatureFlags.CUSTOM_KNEEBOARD_LAMINATION" class="custom-promo">
        <div class="divider"></div>
        <div class="promo-content">
            <div>
                <h2>Want to laminate your custom Kneeboards?</h2>
                <p>Go to the Print dialog on any template and select "Laminate" to order a custom high-quality print.</p>
            </div>
            <button @click="router.push('/')" class="btn btn-primary">
                Go to Templates
            </button>
        </div>
    </div>

    <div v-if="showPlans" class="products-section">
        <div class="divider"></div>
        <h2>Available Memberships</h2>
        <div class="products-grid">
             <div 
                v-for="plan in plans" 
                :key="plan.id" 
                class="product-card plan-card"
                :class="{ 'featured-plan': plan.id === 'pro' }"
              >
                <div v-if="plan.id === 'pro'" class="badge-free-shipping bg-orange-500">BEST VALUE</div>
                <div class="product-info">
                   <h3>{{ plan.displayName }}</h3>
                   <ul class="plan-features">
                       <li v-for="subtitle in plan.subtitles" :key="subtitle">{{ subtitle }}</li>
                   </ul>
                </div>
                <div class="product-footer stacked mt-4">
                   <div class="price-container">
                       <span class="price">{{ plan.displayPrice }}</span>
                       <span class="text-sm text-gray-500" v-if="plan.chargeFrequency === 'monthly'">/mo</span>
                   </div>
                   <button @click="onPlan(plan)" class="btn btn-primary">
                       View Plan
                   </button>
               </div>
            </div>
        </div>
    </div>

    <CartDialog :visible="showCart" :user="user" @close="showCart = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { currentUser } from '../assets/data';
import { StoreService } from '../services/StoreService';
import { CheckoutService } from '../services/CheckoutService';
import { PrintFormat, PRINT_PRICING, PRINT_OVERAGE_CENTS, PLANS, AccountType, PlanDescription, FeatureFlags } from '@gak/shared';
import CartDialog from '../components/store/CartDialog.vue';
import Menu from '../components/menu/Menu.vue';
import { useToast } from 'primevue/usetoast';
import { useToaster } from '../assets/Toaster';
import Kneeboard3D from '../components/store/Kneeboard3D.vue';

const route = useRoute();
const router = useRouter();
const user = currentUser;
const toaster = useToaster(useToast());

const showCart = ref(false);
const customMode = ref(false);
const customPdfUrl = ref('');
const customPagesCount = ref(0);
const selectedFormat = ref<PrintFormat | null>(null);

const pricing = PRINT_PRICING;

onMounted(() => {
    if (route.query.pdfUrl) {
        customMode.value = true;
        customPdfUrl.value = route.query.pdfUrl as string;
        customPagesCount.value = Number(route.query.pages) || 0;
    }
});

const calculatePrice = (formatCode: string, pages: number) => {
    const format = formatCode as PrintFormat;
    const priceData = PRINT_PRICING[format];
    if(!priceData) return 0;

    const base = priceData.basePriceCents;
    const sheets = Math.ceil(pages / 2);
    const overage = sheets > 1 ? (sheets - 1) * PRINT_OVERAGE_CENTS : 0;
    return base + overage;
};

const addCustomToCart = async () => {
    if (!selectedFormat.value) return;
    try {
        await StoreService.addCustomItem(user, 'Custom Print', selectedFormat.value, customPdfUrl.value, customPagesCount.value);
        showCart.value = true;
        customMode.value = false;
        router.replace({ query: {} });
        toaster.success('Added to Cart', 'Custom print added successfully');
    } catch (e: any) {
        toaster.error('Failed to add to cart', e.message || e);
    }
};

const cancelCustom = () => {
    customMode.value = false;
    router.replace({ query: {} });
}

const addStandardToCart = async (name: string, format: string) => {
    try {
        await StoreService.addStandardItem(user, name, format as PrintFormat); 
        showCart.value = true;
        toaster.success('Added to Cart', `${name} added successfully`);
    } catch (e: any) {
        toaster.error('Failed to add to cart', e.message || e);
    }
}

const plans = PLANS.filter(p => p.show);

const showPlans = computed(() => {
    return !user.loggedIn || user.accountType === AccountType.simmer;
});

const onPlan = async (plan: PlanDescription) => {
    router.push('/plans');
}
</script>

<style scoped>
.store-container {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1e3a8a;
    background: #f8fafc;
    min-height: 100vh;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.store-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.store-header h1 {
    font-size: 2.5rem;
    font-weight: bold;
    color: #1e3a8a;
    margin: 0;
}

.cart-button {
    background-color: #1f2937;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: bold;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background-color 0.2s;
}

.cart-button:hover {
    background-color: #374151;
}

/* Config Section */
.config-section {
    background: white;
    border-radius: 12px;
    border: 2px solid #3b82f6; /* Blue border */
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.config-header h2 {
    font-size: 1.5rem;
    font-weight: bold;
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: #1e3a8a;
}

.config-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
}

@media (min-width: 768px) {
    .config-content {
        grid-template-columns: 1fr 1fr;
    }
}

.pdf-preview {
    width: 100%;
    height: 400px;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background: #f3f4f6;
}

.page-count {
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.5rem;
    text-align: center;
}

.section-label {
    display: block;
    font-size: 1rem;
    font-weight: bold;
    color: #374151;
    margin-bottom: 0.75rem;
}

.format-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.format-option {
    display: flex;
    align-items: center;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
}

.format-option:hover {
    background-color: #f9fafb;
}

.format-option.selected {
    border-color: #3b82f6;
    background-color: #eff6ff;
    box-shadow: 0 0 0 1px #3b82f6;
}

.radio-circle {
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid #d1d5db;
    border-radius: 50%;
    margin-right: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.format-option.selected .radio-circle {
    border-color: #3b82f6;
}

.radio-inner {
    width: 0.75rem;
    height: 0.75rem;
    background-color: #3b82f6;
    border-radius: 50%;
}

.format-details {
    flex-grow: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.format-name {
    font-weight: 600;
    color: #111827;
}

.format-price {
    color: #4b5563;
}

.action-buttons {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.divider {
    height: 1px;
    background-color: #d1d5db;
    margin: 3rem 0;
}

/* Products Section */
.products-section h2 {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.section-subtitle {
    color: #6b7280;
    margin-top: 0;
    margin-bottom: 2rem;
    font-size: 1.1rem;
}

.products-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
}

@media (min-width: 768px) {
    .products-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

.product-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    position: relative;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    border: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
}

.product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.badge-free-shipping {
    position: absolute;
    top: 0;
    right: 0;
    background-color: #10b981;
    color: white;
    font-size: 0.75rem;
    font-weight: bold;
    padding: 0.25rem 0.75rem;
    border-bottom-left-radius: 0.5rem;
    border-top-right-radius: 12px;
}

.product-info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    margin-bottom: 2rem;
}

.product-info h3 {
    font-size: 1.25rem;
    font-weight: bold;
    margin-top: 0;
    margin-bottom: 0.5rem;
    color: #1f2937;
}

.product-info p {
    color: #6b7280;
    line-height: normal; /* default loose 1.5 might be too much if we want compact */
    margin-bottom: 0; /* Removing bottom margin to handle spacing via gap/padding */
}

.description-block {
    margin-bottom: 0.25rem;
}

.desc-label {
    font-weight: 700;
    color: #1f2937;
    margin-right: 0.25rem;
}

.desc-text {
    font-size: 0.875rem;
    line-height: 1.4 !important;
    color: #4b5563;
    margin: 0;
}

.product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
}

.price {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1f2937;
}

/* Buttons */
.btn {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: background-color 0.2s;
    font-size: 1rem;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-primary {
    background-color: #2563eb;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background-color: #1d4ed8;
}

.btn-success {
    background-color: #10b981;
    color: white;
}

.btn-success:hover {
    background-color: #059669;
}

.btn-text {
    background: transparent;
    color: #4b5563;
}

.btn-text:hover {
    color: #1f2937;
    text-decoration: underline;
}


.full-width {
    width: 100%;
}

.custom-promo {
  margin-bottom: 3rem;
}

.promo-content {
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.75rem;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.promo-content h2 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e3a8a;
  margin: 0 0 0.5rem 0;
}

.promo-content p {
  color: #1d4ed8;
  margin: 0;
}

@media (max-width: 640px) {
  .promo-content {
    flex-direction: column;
    text-align: center;
  }
}

.plan-features {
    list-style-type: none;
    padding: 0;
    margin: 1rem 0;
    font-size: 0.9rem;
    color: #6b7280;
}

.plan-features li {
    margin-bottom: 0.5rem;
}

.bg-orange-500 {
    background-color: #f97316 !important;
}

.mt-4 {
    margin-top: 1rem;
}

.mt-2 {
    margin-top: 0.5rem;
}

.price-container {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    /* margin-bottom: 1rem; */
}
</style>
