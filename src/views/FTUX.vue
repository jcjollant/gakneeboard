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
                    <a href="#features" class="nav-link">Features</a>
                    <a href="#pricing" class="nav-link">Pricing</a>
                    <button class="nav-btn" @click="scrollToFeatures">Get Started</button>
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
                    <h1 class="hero-title">Make Your Kneeboard Work For You</h1>
                    <p class="hero-subtitle">Improve your situational awareness and confidence with a custom kneeboard template that gives you exactly what you want when you need it.</p>
                    <button class="cta-primary" @click="scrollToFeatures">Create Your First Template Free</button>
                    <p class="trust-indicator">Join 150+ pilots using GA Kneeboard</p>
                </div>
                <div class="hero-visual">
                    <div class="visual-split">
                        <div class="visual-before">
                            <h4>Replace Confusion</h4>
                            <img src="/assets/renton-sectional.png" alt="Sectional chart" class="visual-image" />
                        </div>
                        <div class="visual-after">
                            <h4>By Clear Visuals</h4>
                            <img src="/assets/renton-tile.png" alt="Organized kneeboard" class="visual-image" />
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
                <div class="feature-callouts">
                    <div class="callout">
                        <div class="callout-icon">✅</div>
                        <h4>Custom Checklists</h4>
                    </div>
                    <div class="callout">
                        <div class="callout-icon">🛩️</div>
                        <h4>Airport Data</h4>
                    </div>
                    <div class="callout">
                        <div class="callout-icon">📻</div>
                        <h4>Comm Frequencies</h4>
                    </div>
                </div>
            </div>
        </section>

        <!-- Testimonials -->
        <section class="testimonials">
            <div class="container">
                <h2>Pilots Love GA Kneeboard</h2>
                <div class="testimonial-grid">
                    <div class="testimonial">
                        <div class="avatar">👨‍🎓</div>
                        <p>"Custom Checklists save my bacon multiple times a flight"</p>
                        <cite>- Student Pilot</cite>
                    </div>
                    <div class="testimonial">
                        <div class="avatar">👨‍✈️</div>
                        <p>"Traffic patterns visualization is a blessing for non towered airports"</p>
                        <cite>- Private Pilot</cite>
                    </div>
                    <div class="testimonial">
                        <div class="avatar">👩‍✈️</div>
                        <p>"I capture clearance way faster than my old CRAFT (on first pass)"</p>
                        <cite>- Instrument Pilot</cite>
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
                        <div class="problem-icon">🤹</div>
                        <ul>
                            <li>iPads are cluttered when they don't fail</li>
                            <li>The data you want is somewhere, right?</li>
                            <li>Was that a 0 or a 6?</li>
                        </ul>
                    </div>
                    <div class="solution">
                        <h3>The Solution</h3>
                        <div class="solution-icon">📋</div>
                        <ul>
                            <li>Everything in one place</li>
                            <li>Paper Never Runs out of battery</li>
                            <li>Write things down faster and cleaner</li>
                        </ul>
                    </div>
                </div>
                <div class="benefits">
                    <div class="benefit">
                        <h4>Checklists That Work For You</h4>
                    </div>
                    <div class="benefit">
                        <h4>The Right Data At The Right Time</h4>
                    </div>
                    <div class="benefit">
                        <h4>Optimized Notepads</h4>
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
                    <div class="pricing-card">
                        <h3>Flight Simmer</h3>
                        <div class="price">$0</div>
                        <p>Just Free - Try it out</p>
                        <ul>
                            <li>4 prints per month</li>
                            <li>1 template</li>
                            <li>2 pages</li>
                        </ul>
                        <button class="btn-secondary" @click="loadDemo(demos[0].page)">Start Free</button>
                    </div>
                    <div class="pricing-card">
                        <h3>Student Pilot</h3>
                        <div class="price">$2.99<span>/month</span></div>
                        <p>Occasional Use</p>
                        <ul>
                            <li>8 prints per month</li>
                            <li>Advanced print options</li>
                            <li>2 templates</li>
                            <li>4 pages</li>
                        </ul>
                        <button class="btn-primary" @click="loadDemo(demos[0].page)">Start Free</button>
                    </div>
                    <div class="pricing-card popular">
                        <div class="badge">Most Popular</div>
                        <h3>Private Pilot</h3>
                        <div class="price">$4.49<span>/month</span></div>
                        <p>Normal Use</p>
                        <ul>
                            <li>16 prints per month</li>
                            <li>Advanced print options</li>
                            <li>5 templates</li>
                            <li>20 pages</li>
                        </ul>
                        <button class="btn-primary" @click="loadDemo(demos[0].page)">Start Free</button>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { SheetName } from '../assets/sheetData'
import { routeToLocalTemplate } from '../assets/data'
import { useRouter } from 'vue-router'
import { LocalStore } from '../lib/LocalStore'
import { DemoData } from '../assets/DemoData'

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
    new Demo('VFR Flight', 'vfrflight.png', 'Perfect starting point for VFR flights', SheetName.skyhawk),
    new Demo('Checklists', 'checklist.png', 'Professional checklists in multiple formats', SheetName.checklist),
    new Demo('Charts', 'charts.png', 'Airport diagrams and instrument plates', SheetName.charts),
    new Demo('IFR Flight', 'ifrflight.png', 'Complete IFR flight organization', SheetName.ifrflight),
])

const router = useRouter()
const mobileMenuOpen = ref(false)


function loadDemo(page: string) {
    const templateData = DemoData.fromName(page)
    if(!templateData)  {
        console.log('[FTUX.loadDemo] Unknown Demo Template')
        return;
    }
    routeToLocalTemplate(router, templateData);
    LocalStore.popupHide(3)
}

function skipDemo() {
    router.push('/')
    LocalStore.popupHide(3)
}

function goToPlans() {
    router.push('/plans')
}

function scrollToFeatures() {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
}



</script>
<style scoped>
.landing-page {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    color: #1e3a8a;
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
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
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

.visual-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    text-align: center;
}

.visual-before, .visual-after {
    padding: 1rem;
    border-radius: 12px;
    background: white;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.visual-before {
    border-left: 4px solid #ef4444;
}

.visual-after {
    border-left: 4px solid #10b981;
}

.scattered-items, .organized-board {
    font-size: 2rem;
    margin-top: 1rem;
}

.visual-image {
    width: 200px;
    height: 200px;
    object-fit: contain;
    border-radius: 8px;
}

/* Sections */
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

/* Demo Section */
.demo-section {
    background: white;
}

.demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
}

.demo-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: all 0.3s;
    text-align: center;
}

.demo-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}

.demo-card img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.demo-card h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #1e3a8a;
}

.feature-callouts {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    text-align: center;
}

.callout-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
}

/* Testimonials */
.testimonials {
    background: #f8fafc;
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

.avatar {
    font-size: 3rem;
    margin-bottom: 1rem;
}

/* Problem/Solution */
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

.problem-icon, .solution-icon {
    font-size: 3rem;
    margin: 1rem 0;
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
    background: #f8fafc;
}

.urgency-banner {
    background: #f97316;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.countdown {
    font-weight: bold;
    font-size: 1.125rem;
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
}

.pricing-card.popular {
    border: 3px solid #f97316;
    transform: scale(1.05);
}

.badge {
    position: absolute;
    top: -10px;
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

.guarantee {
    text-align: center;
    color: #64748b;
    font-size: 0.875rem;
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
    
    .visual-split {
        grid-template-columns: 1fr;
    }
    
    .solution-grid {
        grid-template-columns: 1fr;
    }
    
    .pricing-grid {
        grid-template-columns: 1fr;
    }
    
    .pricing-card.popular {
        transform: none;
    }
    
    .feature-callouts, .benefits {
        grid-template-columns: 1fr;
    }
    
    .urgency-banner {
        flex-direction: column;
        gap: 1rem;
    }
}nials {
    background: #f8fafc;
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

.avatar {
    font-size: 3rem;
    margin-bottom: 1rem;
}

/* Problem/Solution */
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

.problem-icon, .solution-icon {
    font-size: 3rem;
    margin: 1rem 0;
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
    background: #f8fafc;
}

.urgency-banner {
    background: #f97316;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.countdown {
    font-weight: bold;
    font-size: 1.125rem;
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
}

.pricing-card.popular {
    border: 3px solid #f97316;
    transform: scale(1.05);
}

.badge {
    position: absolute;
    top: -10px;
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

.guarantee {
    text-align: center;
    color: #64748b;
    font-size: 0.875rem;
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
    
    .visual-split {
        grid-template-columns: 1fr;
    }
    
    .solution-grid {
        grid-template-columns: 1fr;
    }
    
    .pricing-grid {
        grid-template-columns: 1fr;
    }
    
    .pricing-card.popular {
        transform: none;
    }
    
    .feature-callouts, .benefits {
        grid-template-columns: 1fr;
    }
    
    .urgency-banner {
        flex-direction: column;
        gap: 1rem;
    }
}

.pricing-card {
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
}

.pricing-card .btn-primary,
.pricing-card .btn-secondary {
    margin-top: auto !important;
}

.pricing-card ul {
    text-align: left !important;
}
</style>