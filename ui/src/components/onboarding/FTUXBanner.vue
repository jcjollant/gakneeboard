<template>
  <Transition name="slide-up">
    <div v-if="isVisible" class="ftux-banner" :class="{ 'expanded': showVideo }">
      <div v-if="!showVideo" class="banner-content">
        <div class="banner-text">
          <span class="welcome-badge">New!</span>
          <h3 class="welcome-title">Welcome to GA Kneeboard!</h3>
          <p class="welcome-subtitle">Customize this layout to match your flight plan and frequencies.</p>
        </div>
        
        <div class="banner-actions">
          <button class="btn-tour" @click="startTour">
            <font-awesome-icon icon="person-walking-dashed-line-arrow-right" class="btn-icon" />
            Take 15s Tour
          </button>
          
          <button class="btn-video" @click="showVideo = true">
            <font-awesome-icon icon="play" class="btn-icon" />
            Watch 40s Primer
          </button>
        </div>
      </div>

      <div v-else class="video-container">
        <div class="video-header">
          <h3 class="video-title">GA Kneeboard in 40 seconds</h3>
          <button class="btn-close-video" @click="showVideo = false">
            <font-awesome-icon icon="xmark" /> Close Video
          </button>
        </div>
        <div class="iframe-wrapper">
          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/yJpIyj0z5lQ?autoplay=1" 
            title="GA Kneeboard Primer" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen
          ></iframe>
        </div>
      </div>
      
      <button v-if="!showVideo" class="btn-close" @click="dismiss" aria-label="Dismiss">
        <font-awesome-icon icon="xmark" />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { OnboardingService } from '../../services/OnboardingService'
import { LocalStoreService } from '../../services/LocalStoreService'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { UserUrl } from '../../lib/UserUrl'

const isVisible = ref(false)
const showVideo = ref(false)

onMounted(() => {
  // Show banner with a slight delay for effect
  setTimeout(() => {
    if (!LocalStoreService.hasDismissedFtuxBanner()) {
      isVisible.value = true
    }
  }, 1000)
})

watch(() => OnboardingService.isBannerForced.value, (newVal) => {
  if (newVal) {
    isVisible.value = true
    showVideo.value = false // Ensure it's not in video mode when forced
  }
})

function startTour() {
  isVisible.value = false
  OnboardingService.startVfrTour()
}

function dismiss() {
  isVisible.value = false
  LocalStoreService.dismissFtuxBanner()
}
</script>

<style scoped>
.ftux-banner {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: calc(100% - 4rem);
  max-width: 900px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 1.25rem 2rem;
  box-shadow: 
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #1e3a8a;
  box-sizing: border-box;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.ftux-banner.expanded {
  padding: 1.5rem;
  max-width: 1000px;
  flex-direction: column;
  align-items: stretch;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 3rem;
  flex: 1;
}

.banner-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.welcome-badge {
  display: inline-block;
  background: #f97316;
  color: white;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  width: fit-content;
  margin-bottom: 0.25rem;
}

.welcome-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.welcome-subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: #64748b;
  font-weight: 500;
}

.banner-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-tour {
  background: #1e3a8a;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(30, 58, 138, 0.2);
}

.btn-tour:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(30, 58, 138, 0.3);
}

.btn-tour:active {
  transform: translateY(0);
}

.btn-video {
  color: #1e3a8a;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  transition: all 0.2s;
  background: rgba(30, 58, 138, 0.05);
  border: none;
  cursor: pointer;
}

.btn-video:hover {
  background: rgba(30, 58, 138, 0.1);
  color: #1d4ed8;
}

.btn-icon {
  font-size: 1rem;
}

.btn-close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1.25rem;
  transition: color 0.2s;
  margin-left: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #1e3a8a;
}

/* Video Container */
.video-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.video-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.btn-close-video {
  background: rgba(30, 58, 138, 0.05);
  border: none;
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  color: #1e3a8a;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-close-video:hover {
  background: rgba(30, 58, 138, 0.1);
}

.iframe-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from {
  transform: translate(-50%, 100px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translate(-50%, 100px);
  opacity: 0;
}

/* Responsive */
@media (max-width: 850px) {
  .ftux-banner {
    bottom: 1rem;
    width: calc(100% - 2rem);
    padding: 1rem;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .banner-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
    width: 100%;
  }
  
  .banner-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .btn-tour {
    flex: 1;
    justify-content: center;
  }
  
  .btn-close {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
  }
}
</style>
