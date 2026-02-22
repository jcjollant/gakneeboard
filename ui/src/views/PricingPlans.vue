<!-- PricingPlans.vue -->
<template>
  <Menu></Menu>
  <div class="pricing-container">
    <!-- Out of Credits Banner -->
    <div v-if="showOutOfCreditsBanner" class="out-of-credits-banner">
      <div class="banner-content">
        <div class="banner-icon">
          <img class="banner-image" src="/assets/lowfuel.png" alt="Low Fuel gauges"></img>
        </div>
        <div class="banner-text">
          <h3>You are low on Print Credits!</h3>
          <p>Upgrade your plan to continue printing now or wait for the monthly refill.</p>
        </div>
      </div>
    </div>
    
    <div class="pricing-header">
      <h2>Simple, Transparent Pricing</h2>
      <p>Choose the plan that's right for you<br>For perspective, a C172 burns $8.82 of fuel during taxi</p>
      <!-- <EitherOr v-model="monthly" either="Monthly" or="Anually" /> -->
    </div>
    

    <div class="pricing-grid">
      <div 
        v-for="plan in plans" 
        :key="plan.displayName" 
        :class="['plan-card', { 'popular': plan.id === bestValuePlan, 'unpopular' : plan.id !== bestValuePlan }]"
      >
        <div v-if="plan.id === bestValuePlan" class="popular-badge">Best Value</div>
        
        <div class="plan-header">
          <h3>{{ plan.displayName }}</h3>
          <div class="price">
            <span class="amount">{{ plan.displayPrice}}</span>
            <span class="period" v-if="plan.chargeFrequency === 'monthly'">/month</span>
            <span class="period" v-if="plan.chargeFrequency === 'yearly'">/year</span>
          </div>
          <p v-for="subtitle in plan.subtitles" class="description">{{ subtitle }}</p>
        </div>

        <div class="plan-content">
          <ul class="features-list">
            <li v-for="(value) in [{name:'Prints per Month', quota: plan.quotas.prints}, {name:'Pages', quota: plan.quotas.pages}, {name:'Kneeboards', quota: plan.quotas.templates}]" key="name">
              <span>                
                <svg class="icon check" viewBox="0 0 24 24">
                  <path d="M20 6L9 17L4 12"></path>
                </svg>
              </span>
              <span class="feature-text">
                {{value.name}} : 
                <span v-if="value.quota === -1" class="unlimited-badge">Unlimited</span>
                <span v-else>{{ value.quota }}</span>
              </span>
            </li>

            <li v-for="(value) in [
              {name:'METARs', enabled: plan.features.metars},
              {name:'NOTAMs', enabled: plan.features.notams},
              {name:'Exports to EFB', enabled: plan.features.export}, 
              {name:'Restore Old Versions', enabled: plan.features.restoreOldVersion}]">
              <span>
                <svg v-if="value.enabled" class="icon check" viewBox="0 0 24 24">
                  <path d="M20 6L9 17L4 12"></path>
                </svg>
                <svg v-else class="icon x" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6L18 18"></path>
                </svg>
              </span>
              <span class="feature-text">
                {{ value.name }}
              </span>
            </li>
          </ul>
        </div>

        <div class="plan-footer">
          <button v-if="plan.active" :class="['subscribe-button', 'primary']" @click="onPlan(plan)">
            {{ currentUser.loggedIn ? 'Select Plan' : 'Sign In to Select Plan' }}
          </button>
          <div v-else>Comming Soon</div>
        </div>
      </div>

    </div>
    <div class="pricing-footer">
      <p>Not ready for a subscription? All accounts start with the <strong>Flight Simmer</strong> plan, which includes 4 print credits, 1 template, and 2 pages.</p>
    </div>
    <SignIn v-model:visible="showSignIn" @close="showSignIn=false" @authentication="onAuthentication" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router';
import { CheckoutService } from '../services/CheckoutService';
import { currentUser } from '../assets/data';
import { useToast } from 'primevue/usetoast'
import { useToaster } from '../assets/Toaster';

import Menu from '../components/menu/Menu.vue';
import SignIn from '../components/signin/SignIn.vue';
import { AccountType, PlanDescription } from '@gak/shared';

const toaster = useToaster(useToast())
const route = useRoute()
const showSignIn = ref(false)

// Check if user came here due to being out of print credits
const showOutOfCreditsBanner = computed(() => {
  return route.query.reason === 'out-of-credits'
})

// import plans from '../constants/Plans'
import { PLANS, bestValuePlan } from '@gak/shared'

const plans = PLANS.filter( p => p.show )
const router = useRouter()

function onPlan(plan:PlanDescription) {
  // console.log('[PricingPlans.onPlan]',code)

  if (!currentUser.loggedIn) {
    showSignIn.value = true
    return
  }

  if( plan.accountType == AccountType.simmer) {
    // There is no change in type, just go back to the home page
    router.push('/')
  } else {
    toaster.info('Calling Tower', 'Stand By...')
    CheckoutService.plan(plan.id, currentUser).then( (url:string) => {
      // console.log('[PricingPlans.onPlan]',url)
      window.location.href = url
    }).catch( (err:any) => {
      console.error(err)
    })
  }
}

function onAuthentication(newUser: any) {
  showSignIn.value = false
  if (newUser) {
    toaster.success('Clear', 'Welcome ' + newUser.name)
  } else {
    toaster.warning('Engine Roughness', 'Authentication failed')
  }
}

</script>

<style scoped>
.out-of-credits-banner {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  border: 2px solid #F59E0B;
  border-radius: 0.75rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.banner-icon {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  background-color: #F59E0B;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.banner-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.banner-text h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #92400E;
  text-align: center;
}

.banner-text p {
  margin: 0;
  color: #92400E;
  font-size: 1rem;
}

.banner-image {
  width: 64px;
}

@media (max-width: 640px) {
  .banner-content {
    flex-direction: column;
    text-align: center;
  }
  
  .banner-icon {
    align-self: center;
  }
}

.pricing-container {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    color: #1e3a8a;
    background: #f8fafc;
    min-height: 100vh;
    padding: 2rem 0;
}

.pricing-header {
  text-align: center;
  margin-bottom: 5rem;
}

.pricing-header h2 {
    font-size: 2.5rem;
    font-weight: bold;
    color: #1e3a8a;
    margin-bottom: 1rem;
}

.pricing-header p {
  font-size: 1.125rem;
  color: #4B5563;
}

.pricing-grid {
  display: grid;
  gap: 2rem;
  max-width: 72rem;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .pricing-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.pricing-footer {
  text-align: center;
  margin-top: 2rem;
  font-size: 0.875rem;
  color: #6B7280;
}

.plan-card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.plan-card.popular {
    border: 3px solid #f97316;
    transform: scale(1.05);
}
.plan-card.unpopular {
    padding-top: 1.70rem;
}

.popular-badge {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    background: #f97316;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
}

.plan-header {
  padding: 1.5rem;
  text-align: center;
}

.plan-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
}

.price {
  margin-top: 1rem;
}

.price .amount {
  font-size: 2.25rem;
  font-weight: 700;
}

.price .period {
  color: #4B5563;
}

.description {
  color: #4B5563;
  margin-top: 0.5rem;
}

.plan-content {
  flex-grow: 1;
  padding: 1.5rem;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.features-list li {
  display: flex;
  align-items: center;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
  margin-right: 0.5rem;
}

.icon.check {
  color: #10B981;
}

.icon.x {
  color: #EF4444;
}

.feature-text {
  color: #374151;
}

.plan-footer {
  padding: 1.5rem;
}

.subscribe-button {
  width: 100%;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  background-color: #F3F4F6;
  color: #1F2937;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.subscribe-button:hover {
  background-color: #E5E7EB;
}

.subscribe-button.primary {
  /* background-color: darkorange;
  color: black; */
  background-color: #3B82F6;
  color: white;
}

.subscribe-button.primary:hover {
  background-color: #2563EB;
  color: white;
}

.unlimited-badge {
  background-color: #10B981;
  color: white;
  padding: 0.05rem 0.4rem;
  border-radius: 9999px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-left: 0.25rem;
  display: inline-block;
  vertical-align: middle;
}
</style>
