<template>
    <div class="product-page">
        <Menu :showSession="false"></Menu>
        <SignIn v-model:visible="showSignIn" @close="showSignIn=false" @authentication="onAuthentication" />
        <div class="container">
            <div class="product-info">
                <h1>{{ product.displayName }}</h1>
                <p class="description">{{ product.description }}</p>
                
                <div v-if="freeCoupon" class="coupon-banner">
                    Coupon Applied: {{ couponCode }}
                </div>

                <div class="price-section">
                    <div v-if="freeCoupon" class="price-container">
                        <span class="price original-price">${{ product.price }}</span>
                        <span class="price free-price">Free</span>
                    </div>
                    <span v-else class="price">${{ product.price }}</span>
                    <button v-if="currentUser.loggedIn" class="buy-button" @click="onBuy">
                        Order Laminated Print
                    </button>
                    <button v-else class="buy-button" @click="onSignIn">
                        Sign In to Order Laminated Print
                    </button>
                    <p class="shipping-note">Free Shipping to US & CA</p>
                </div>
            </div>

            <div class="product-preview">
                <div v-for="(page, index) in template.data" :key="index" class="page-wrapper">
                    <Page :data="page" :format="template.format" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { PRODUCTS } from '@gak/shared'
import { DemoData } from '../assets/DemoData'
import { SheetName } from '../assets/sheetData'
import { CheckoutService } from '../services/CheckoutService'
import { currentUser } from '../assets/data'
import { useToaster } from '../assets/Toaster'
import { useToast } from 'primevue/usetoast'
import Menu from '../components/menu/Menu.vue'
import Page from '../components/page/Page.vue'
import { Template } from '../models/Template'
import SignIn from '../components/signin/SignIn.vue'

const route = useRoute()
const toast = useToast()
const toaster = useToaster(toast)
const product = PRODUCTS.find(p => p.id === 'ref-card-lam') || PRODUCTS[0]
const template = ref<Template>(Template.noTemplate())
const couponCode = ref(route.query.coupon as string | undefined)
const freeCoupon = computed(() => {
    return couponCode.value && product.freeCoupons && product.freeCoupons.includes(couponCode.value)
})
const showSignIn = ref(false)

onMounted(() => {
    const t = DemoData.fromName(SheetName.reference)
    if (t) template.value = t
    
    if (freeCoupon.value) {
        toaster.success('Coupon', `Coupon code "${couponCode.value}" applied!`)
    } else if (couponCode.value) {
        toaster.error('Coupon', `Coupon code "${couponCode.value}" is invalid`)
    }
})

function onAuthentication(newUser:any) {
    showSignIn.value = false
    if(newUser) {
        toaster.success('Clear', 'Welcome ' + newUser.name)
        // router.push({name:'Home',query:{_r:Date.now()}})
    } else {
        toaster.warning('Engine Roughness', 'Authentication failed')
    }
}

function onBuy() {
    toaster.info('Processing', 'Redirecting to checkout...')
    CheckoutService.product(product.id, currentUser, couponCode.value)
        .then(url => {
            window.location.href = url
        })
        .catch(err => {
            toaster.error('Error', 'Failed to initiate checkout')
            console.error(err)
        })
}

function onSignIn() {
    // Redirect to login page, preserving the current path and query (coupon)
    showSignIn.value = true
}


</script>

<style scoped>
.product-page {
    background: url('/182-cockpit.jpg') no-repeat center center fixed;
    background-size: cover;
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 3rem;
    background: rgba(255, 255, 255, 0.2); /* Glassmorphism effect */
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.product-info {
    text-align: center;
}

.description {
    font-size: 1.2rem;
    color: #4b5563;
    margin-bottom: 2rem;
}

.coupon-banner {
    background-color: #dcfce7;
    color: #166534;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    display: inline-block;
    margin-bottom: 1rem;
    font-weight: 600;
}

.price-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.price {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1e3a8a;
}

.buy-button {
    background-color: #f97316;
    color: white;
    border: none;
    padding: 1rem 3rem;
    font-size: 1.2rem;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.buy-button:hover {
    background-color: #ea580c;
}

.shipping-note {
    font-size: 0.9rem;
    color: #6b7280;
}

.product-preview {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
    transform: scale(0.7);
    transform-origin: top center;
}

.page-wrapper {
    /* Wrap to control layout */
    margin-bottom: 2rem;
}

.price-container {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.original-price {
    text-decoration: line-through;
    color: #9ca3af;
    font-size: 2rem;
}

.free-price {
    color: #16a34a;
    font-size: 2.5rem;
}
</style>
