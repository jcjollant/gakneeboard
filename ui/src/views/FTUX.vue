<template>
    <div class="landing-page">
        <!-- Navigation -->
        <nav class="navbar">
            <div class="nav-container">
                <div class="nav-logo">
                    <img src="/favicon.png" class="nav-logo-img" alt="GA Kneeboard">
                    GA Kneeboard
                </div>
                <div class="nav-menu" :class="{ active: mobileMenuOpen }">
                    <a href="#pricing" class="nav-link">Pricing</a>
                    <button class="nav-btn" @click="loadDemo()">Get Started</button>
                </div>
                <div class="hamburger" @click="mobileMenuOpen = !mobileMenuOpen">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="hero">
            <div class="hero-container">
                <div class="hero-content">
                    <div v-if="greeting" class="greeting-badge">{{ greeting }}</div>
                    <h1 class="hero-title">Better Kneeboards For Safer Pilots</h1>
                    <p class="hero-subtitle">Improve your situational awareness and confidence with a custom kneeboard template that gives you exactly what you want when you need it.</p>
                    <button class="cta-primary" @click="loadDemo()">Create Your First Template</button>
                    <p class="trust-indicator">Join 190+ pilots using GA Kneeboard</p>
                </div>
                <div class="hero-visual">
                    <div class="visual-single">
                        <div class="visual-after" @click="loadDemo()">
                            <h4>Not Your Granddad's Kneeboard</h4>
                            <img src="/assets/solution.jpg" alt="Organized kneeboard" class="visual-image" />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Demo Section -->
        <section id="features" class="demo-section">
            <div class="container">
                <h2>Get Started For Free</h2>
                <div class="demo-grid">
                    <div v-for="(demo,index) in demos" :key="index" class="demo-card" @click="loadDemo(demo.page)">
                        <img :src="'/thumbnails/' + demo.img" :alt="demo.title" />
                        <h3>{{demo.title}}</h3>
                        <p>{{demo.description}}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Testimonials -->
        <section class="testimonials">
            <div class="container">
                <h2>Pilots Love GA Kneeboard</h2>
                <p class="section-subtitle">Actual feedback from pilots using the app</p>
                <div class="testimonial-grid">
                    <div class="testimonial">
                        <p>"I have been using The Entire Flight VFR & IFR flight pad but with your product I get the frequencies already added along with traffic pattern for the runway.  Thanks for the wonderful product."</p>
                        <cite>- Mike C.</cite>
                    </div>
                    <div class="testimonial">
                        <p>"I fly with my iPad but I really like having all the information handy as a quick reference. I have really enjoyed watching the product grow and become more useful."</p>
                        <cite>- Leonardo M.</cite>
                    </div>
                    <div class="testimonial">
                        <p>"I love the ability to enter the flight plan and the app populates the kneeboard with airport information ... frequencies, rwy drawings etc."</p>
                        <cite>- Trevor M.</cite>
                    </div>
                </div>
            </div>
        </section>

        <!-- Ready To Print -->
        <section class="ready-to-print">
            <div class="container">
                <h2>Ready To Print</h2>
                <div class="template-grid">
                    <div v-for="(template, index) in readyToPrintTemplates" :key="index" class="template-card" @click="loadDemo(template.page)">
                        <img :src="'/thumbnails/' + template.img" :alt="template.title" />
                        <h3>{{template.title}}</h3>
                        <p>{{template.description}}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Problem/Solution -->
        <section class="problem-solution">
            <div class="container">
                <div class="solution-grid">
                    <div class="problem">
                        <h3>The Problem</h3>
                        <ul>
                            <li>iPads are great moving maps, but...</li>
                            <li>Screens go dark in awkward moments</li>
                            <li>The data you want is buried in submenus</li>
                            <li>Your hand writing is even worse with a stylus</li>
                        </ul>
                    </div>
                    <div class="solution">
                        <h3>The Solution</h3>
                        <ul>
                            <li>Everything in one place</li>
                            <li>Customizable for VFR and IFR</li>
                            <li>Paper Never Runs out of battery</li>
                            <li>Write things down faster and cleaner</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- Pricing -->
        <section id="pricing" class="pricing">
            <div class="container">
                <!-- <div class="urgency-banner">
                    <span>Q4 Launch Special - Lock in founder pricing before rates increase!</span>
                </div> -->
                <h2>Our Plans</h2>
                <div class="pricing-grid">
                    <div v-for="(plan, index) in ftuxPlans" :key="plan.id" class="pricing-card" :class="{ popular: index === 1 }">
                        <div v-if="index === 1" class="badge">Most Popular</div>
                        <h3>{{ plan.displayName }}</h3>
                        <div class="price">{{ plan.displayPrice }}<span v-if="plan.chargeFrequency === 'monthly'">/month</span><span v-else-if="plan.chargeFrequency === 'yearly'">/year</span></div>
                        <p>{{ plan.subtitles?.[0] || ' ' }}</p>
                        <ul>
                            <li>{{ plan.quotas.prints === -1 ? 'Unlimited' : plan.quotas.prints }} prints per month</li>
                            <li>{{ plan.quotas.templates === -1 ? 'Unlimited' : plan.quotas.templates }} templates</li>
                            <li>{{ plan.quotas.pages === -1 ? 'Unlimited' : plan.quotas.pages }} pages</li>
                        </ul>
                        <button :class="index === 1 ? 'btn-primary' : 'btn-secondary'" @click="loadDemo()">Start Free</button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Banner -->
        <section class="banner-section">
            <div class="container flex-center">
                <GakBanner />
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SheetName, ThumbnailImage } from '../assets/sheetData'
import { useRouter, useRoute } from 'vue-router'
import { LocalStoreService } from '../services/LocalStoreService'
import { affiliates } from '../lib/affiliates'
import GakBanner from '../components/ads/GakBanner.vue'
import { PLANS } from '@gak/shared'

class Demo {
    title: string
    img: string
    description: string
    page: string
    constructor(title: string, img: string, description: string, page:string) {
        this.title = title
        this.img = img
        this.description = description
        this.page = page
    }
}

const demos = ref<Demo[]>([
    new Demo('VFR Flight', 'vfrflight.png', 'Perfect starting point for VFR flights', SheetName.vfrFlight),
    new Demo('Checklists', 'checklist-1.png', 'Professional checklists in multiple formats', SheetName.checklist),
    new Demo('Charts', 'charts.png', 'Airport diagrams and instrument plates', SheetName.charts),
    new Demo('IFR Flight', 'ifrflight.png', 'Complete IFR flight organization', SheetName.ifrFlight),
])

const readyToPrintTemplates = ref<Demo[]>([
    new Demo('Paper Navlog', ThumbnailImage.paperNavlog0, 'Traditional navigation log for flight planning', SheetName.paperNavlog),
    new Demo('Reference Card', ThumbnailImage.reference0, 'Quick reference for important information', SheetName.reference),
    new Demo('Acronyms', ThumbnailImage.acronyms0, 'Aviation acronyms and abbreviations', SheetName.acronyms),
    new Demo('IFR Training', ThumbnailImage.ifrTraining, 'Instrument training aids and procedures', SheetName.ifrStrips),
])

const router = useRouter()
const route = useRoute()
const affiliateKey = route.query.affiliate as string
const greeting = ref(affiliateKey && affiliates[affiliateKey]?.greeting ? affiliates[affiliateKey].greeting : '')
const mobileMenuOpen = ref(false)
const ftuxPlans = PLANS.filter((p) => p.showInFtux)


function loadDemo(page?: string) {
    const demoPage = page || demos.value[0].page
    router.push(`/demo/${demoPage}`)
    LocalStoreService.popupHide(3)
}

function skipDemo() {
    router.push('/')
    LocalStoreService.popupHide(3)
}

function goToPlans() {
    router.push('/plans')
}

</script>
<style scoped>
.landing-page {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    color: #1e3a8a;
}

/* Common Styles */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

section {
    padding: 4rem 0;
}

h2 {
    font-size: 2.5rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 3rem;
    color: #1e3a8a;
}

.section-subtitle {
    text-align: center;
    font-size: 1.125rem;
    color: #64748b;
    margin-top: -2rem;
    margin-bottom: 2rem;
}

/* Navigation */
.navbar {
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1e3a8a;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.nav-logo-img {
    width: 30px;
    height: 30px;
}

.nav-menu {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.nav-link {
    text-decoration: none;
    color: #64748b;
    font-weight: 500;
    transition: color 0.3s;
}

.nav-link:hover {
    color: #1e3a8a;
}

.nav-btn {
    background: #f97316;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.nav-btn:hover {
    background: #ea580c;
}

.hamburger {
    display: none;
    flex-direction: column;
    cursor: pointer;
}

.hamburger span {
    width: 25px;
    height: 3px;
    background: #1e3a8a;
    margin: 3px 0;
    transition: 0.3s;
}

/* Hero Section */
.hero {
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
    padding: 4rem 0;
}

.hero-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
}

.hero-title {
    font-size: 3rem;
    font-weight: bold;
    color: #1e3a8a;
    margin-bottom: 1rem;
    line-height: 1.2;
}

.greeting-badge {
    display: inline-block;
    background: #e0e7ff;
    color: #4338ca;
    padding: 0.5rem 3rem;
    border-radius: 9999px;
    font-weight: 600;
    font-size: 1.75rem;
    margin-bottom: 1rem;
    border: 1px solid #c7d2fe;
}

.hero-subtitle {
    font-size: 1.25rem;
    color: #64748b;
    margin-bottom: 2rem;
}

.cta-primary {
    background: #f97316;
    color: white;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.125rem;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    margin-bottom: 1rem;
}

.cta-primary:hover {
    background: #ea580c;
    transform: translateY(-2px);
}

.trust-indicator {
    color: #64748b;
    font-size: 0.875rem;
}

.visual-single {
    display: flex;
    justify-content: center;
    text-align: center;
}

.visual-after {
    padding: 1.5rem;
    border-radius: 12px;
    background: white;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    border-left: 4px solid #10b981;
    cursor: pointer;
    transition: all 0.3s;
    max-width: 500px;
    width: 100%;
}

.visual-after:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}

.visual-image {
    width: 100%;
    height: 300px;
    object-fit: cover;
    object-position: top;
    border-radius: 8px;
}

/* Card Styles - Shared between demo and template cards */
.demo-section, .ready-to-print {
    background: white;
}

.demo-grid, .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.demo-grid {
    margin-bottom: 3rem;
}

.demo-card, .template-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: all 0.3s;
    text-align: center;
}

.demo-card:hover, .template-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}

.demo-card img, .template-card img {
    width: 100%;
    height: 350px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.demo-card h3, .template-card h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #1e3a8a;
}

/* Testimonials */
.testimonials {
    background: #e2e8f0;
}

.testimonial-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.testimonial {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

/* Problem/Solution */
.problem-solution {
    background: #e2e8f0;
}

.solution-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    margin-bottom: 3rem;
}

.problem, .solution {
    text-align: center;
    padding: 2rem;
    border-radius: 12px;
}

.problem {
    background: #fef2f2;
    border: 2px solid #fecaca;
}

.solution {
    background: #f0fdf4;
    border: 2px solid #bbf7d0;
}

.problem ul, .solution ul {
    text-align: left;
}

.benefits {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
}

.benefit {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

/* Pricing */
.pricing {
    background: white;
}

.pricing-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    margin-bottom: 2rem;
}

.pricing-card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    position: relative;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
}

.pricing-card.popular {
    border: 3px solid #f97316;
    transform: scale(1.05);
}

.pricing-card ul {
    text-align: left !important;
}

.badge {
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    background: #f97316;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
}

.price {
    font-size: 3rem;
    font-weight: bold;
    color: #1e3a8a;
    margin: 1rem 0;
}

.price span {
    font-size: 1rem;
    color: #64748b;
}

.btn-primary, .btn-secondary {
    width: 100%;
    padding: 1rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 1rem;
}

.btn-primary {
    background: #f97316;
    color: white;
}

.btn-primary:hover {
    background: #ea580c;
}

.btn-secondary {
    background: #e2e8f0;
    color: #1e3a8a;
}

.btn-secondary:hover {
    background: #cbd5e1;
}

.pricing-card .btn-primary,
.pricing-card .btn-secondary {
    margin-top: auto !important;
}

/* Banner */
.banner-section {
    padding: 2rem 0;
    background: #e2e8f0;
    display: flex;
    justify-content: center;
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .hamburger {
        display: flex;
    }
    
    .nav-menu {
        position: fixed;
        left: -100%;
        top: 70px;
        flex-direction: column;
        background-color: white;
        width: 100%;
        text-align: center;
        transition: 0.3s;
        box-shadow: 0 10px 27px rgba(0,0,0,0.05);
        padding: 2rem 0;
    }
    
    .nav-menu.active {
        left: 0;
    }
    
    .hero-container {
        grid-template-columns: 1fr;
        text-align: center;
    }
    
    .hero-title {
        font-size: 2rem;
    }
    
    .solution-grid, .pricing-grid, .benefits {
        grid-template-columns: 1fr;
    }
    
    .pricing-card.popular {
        transform: none;
    }
}
</style>