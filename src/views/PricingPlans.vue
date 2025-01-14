<!-- PricingPlans.vue -->
<template>
        <Menu></Menu>
  <div class="pricing-container">
    <div class="pricing-header">
      <h2>Simple, Transparent Pricing</h2>
      <p>Choose the plan that's right for you</p>
    </div>
    
    <div class="pricing-grid">
      <div 
        v-for="plan in plans" 
        :key="plan.name" 
        :class="['plan-card', { 'popular': plan.popular, 'unpopular' : !plan.popular }]"
      >
        <div v-if="plan.popular" class="popular-badge">
          Most Popular
        </div>
        
        <div class="plan-header">
          <h3>{{ plan.name }}</h3>
          <div class="price">
            <span class="amount">${{ plan.price }}</span>
            <span class="period">/month</span>
          </div>
          <p class="description">{{ plan.description }}</p>
        </div>

        <div class="plan-content">
          <ul class="features-list">
            <li v-for="(value, feature) in plan.features" :key="feature">
              <span v-if="typeof value === 'boolean'">
                <svg v-if="value" class="icon check" viewBox="0 0 24 24">
                  <path d="M20 6L9 17L4 12"></path>
                </svg>
                <svg v-else class="icon x" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6L18 18"></path>
                </svg>
              </span>
              <svg v-else class="icon check" viewBox="0 0 24 24">
                <path d="M20 6L9 17L4 12"></path>
              </svg>
              <span class="feature-text">
                {{ feature }} {{ typeof value === 'boolean' ? '' : ': ' + value }}
              </span>
            </li>
          </ul>
        </div>

        <div class="plan-footer">
          <button :class="['subscribe-button', { 'primary': plan.popular }]" @click="onPlan(plan)">
            {{ plan.price === "0" ? "Get Started" : "Subscribe Now" }}
          </button>
        </div>
      </div>
    </div>
    <div class="pricing-footer">(*) Content not backed up in the cloud. Consider saving your creations.</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Menu from '../components/menu/Menu.vue';

const plans = ref([
  {
    name: "Free",
    price: "0",
    description: "Every penny counts",
    features: {
      "Local Pages (*)": "10",
      "Saved Kneeboard Pages": "5",
      "Checklist": "Single",
      "Versioning": false,
      "Charts": false,
      "Exports": false
    },
    popular: false
  },
  {
    name: "Standard",
    price: "4.99",
    description: "Perfect for most Pilots",
    features: {
      "Local Pages (*)": "Unlimited",
      "Saved Kneeboard Pages": "20",
      "Checklist": "Single, Double",
      "Versioning": true,
      "Charts": true,
      "Exports": false
    },
    popular: true
  },
  {
    name: "Pro",
    price: "9.99",
    description: "For power users",
    features: {
      "Local Pages (*)": "Unlimited",
      "Saved Kneeboard Pages": "50 pages",
      "Checklist": "Single, Double, Triple",
      "Versioning": true,
      "Charts": true,
      "Exports": true
    },
    popular: false
  }
])

function onPlan(plan) {
  console.log('[PricingPlans.onPlan]',plan.name)
}
</script>

<style scoped>
.pricing-container {
  padding: 3rem 1rem;
}

.pricing-header {
  text-align: center;
  margin-bottom: 2rem;
}

.pricing-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  letter-spacing: -0.025em;
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
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  position: relative;
}

.plan-card.popular {
  border: 2px solid #3B82F6;
}

.plan-card.unpopular {
    padding-top: 1.70rem;
}

.popular-badge {
  background-color: #3B82F6;
  color: white;
  text-align: center;
  padding: 0.25rem;
  font-size: 0.875rem;
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
  background-color: #3B82F6;
  color: white;
}

.subscribe-button.primary:hover {
  background-color: #2563EB;
}
</style>