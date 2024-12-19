<template>
    <div class="aboutPopup">
      <div class="pageOptions mb-5">
        <OneChoice v-model="activeTopic" :choices="topics" class="mb-2" />
      </div>
      <div> <!-- About -->
        <div class="mb-2 justify"><strong>GA Kneeboard</strong> was created to save our bacon when the iPad fails. Its sheer convenience made it a primary source of flight information.</div>
        <div class="mb-2 justify"><strong>You can help</strong> in many ways : 
          <ol>
            <li>Suggest features you value as a pilot,</li>
            <li>Show off your kneeboards to fellow pilots,</li>
            <li>Make your templates public for community's benefit,</li>
            <li>Test the app and report issues,</li>
            <li>Support us via <a :href="UserUrl.patreon" target="_blank">Patreon</a>.</li>
          </ol>
        </div>
        <div class="justify"><strong>Special Thanks</strong> to Ash, Jason, Steve and Stewart whom have contributed invaluable feedback and suggestions since Day 1</div>
      </div>
      <div class="mb-5"> <!-- Help -->
        <div class="mb-5 justify"><a :href="UserUrl.blog" target="_blank">GA Kneeboard Blog</a> is the best source for updates and user guides. For example:</div>
        <div class="mb-5 guides">
          <Button v-for="guide in guides" :label="guide.name" @click="openUrl(guide.url)" severity="help"></Button>
        </div>
        <div class="mb-5 justify">last, GA Kneeboard public <a :href="UserUrl.facebookGroup" target="_blank">Facebook Group</a> is a good place to interract.</div>
      </div>
      <div class="warning-content mb-5"> <!-- Warnings -->
        <div class="topWarning">
          <i class='pi pi-exclamation-triangle bigIcon'></i>
          <span>Always confirm all data provided by this app</span>
          <i class='pi pi-exclamation-triangle bigIcon'></i>
        </div>
        <div class="warning-item mr-3">Airport information</div>
        <div>May not be current. Cross check with an official source before you fly.</div>
        <div class="warning-item mr-3">Traffic Pattern Altitude</div>
        <div>Is calculated by adding 1000ft to field elevation. This may not be true for your situation.</div>
        <div class="warning-item mr-3">Traffic Pattern Entry</div>
        <div>Are calculated theoretical values which may not apply for your situation.</div>
        <div class="warning-item mr-3">Weather Frequency</div>
        <div>Does not account for aircraft direction. Check chart supplements.</div>
        <div class="warning-item mr-3">Runway Frequency</div>
        <div>May not be displayed for airport that have a complex frequency allocation.</div>
        <div class="warning-item mr-3">Radio Flow Frequencies</div>
        <div>Are user defined (by you) and are not updated with data refresh.</div>
        <div class="warning-item mr-3">Magnetic Headings</div>
        <div>Are calculated with FAA variation data which can be quite old at some locations</div>
      </div>    
      <div class="actionDialog gap-2">
        <Button label="Privacy" @click="openUrl(UserUrl.privacy)" link></Button>
        <Button label="License" @click="openUrl(UserUrl.eula)" link></Button>
        <!-- <Button label="How Does It Work?" @click="emits('hdiw')" link></Button> -->
        <Button label="Got it" @click="emits('close')"></Button>
      </div>
    </div>

</template>

<script lang="ts" setup>
import { UserUrl } from '../lib/UserUrl';

function openUrl(url:string) {
  window.open(url, '_blank')
}

</script>