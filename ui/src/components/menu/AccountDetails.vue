<template>
    <Dialog v-bind="$attrs" modal :header="showSettings ? 'Account Settings' : 'Account Details'">
      <div class="accountDialog">
        <div class="account mb-5" v-if="!showSettings">
            <div class="key">Name</div><div class="value accountName">{{user.name}}</div>
            <div class="key">Home Airport</div>
            <div class="value" @click="showAirportSelection=true" style="cursor: pointer; text-decoration: underline;">
                <span v-if="user.homeAirport">{{user.homeAirport}}</span>
                <span v-else style="color: grey;">(Not Set)</span>
            </div>
            <div style="grid-column: span 2"><hr></div>
            <div class="key">Account Type</div>
            <div class="value accountType">
              <div :class="{unlimited: user.accountType == AccountType.lifetime}">{{Formatter.accountType(user.accountType)}}</div>
              <UpdateButton @click="onUpdateAccount" :manage="user.accountType != AccountType.simmer"/>
            </div>
            <div class="key">Kneeboards</div>
            <div class="value">
                <div class="templatesCount" :class="{'maxedOut':user.templates.length > user.maxTemplateCount }">{{user.templates.length}} / {{ user.maxTemplateCount }}</div>
            </div>
            <div class="key">Pages</div>
            <div class="value">
              <div class="pagesCount" :class="{'maxedOut':user.pageCount > user.maxPageCount }">{{ user.pageCount }} / {{ user.maxPageCount }}</div>
            </div>
            <div class="key">Print Credit</div>
            <div v-if="user.accountType == AccountType.beta" class="value">
              <div class="unlimited" >Unlimited</div>
            </div>
            <div v-else class="value">
                <div class="printCredits" :class="{'maxedOut':user.printCredits == 0 }">{{ user.printCredits }}</div>
            </div>
            <div style="grid-column: span 2"><hr></div>
            <div class="key">Ambassador Link</div>
            <div class="value">
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <Button label="Copy" icon="pi pi-copy" size="small" @click="copyAmbassadorLink" title="Send this link to people you want to help" />
                    <Button icon="pi pi-qrcode" size="small" @click="showQrcode = true" title="Show QR Code" />
                    <Button icon="pi pi-question-circle" text rounded @click="UserUrl.open(UserUrl.ambassador)" title="Tell me how this works" />
                </div>
            </div>
        </div>
        
        <div class="account mb-5" v-else>
            <div class="key">Airports Cached</div>
            <div class="value" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <div class="airportCount">{{ airportCount }}</div>
                <Button icon="pi pi-trash" text severity="danger" @click="deleteAirports" v-if="airportCount > 0" title="Empty Airports Cache" />
            </div>
            <div class="key">Kneeboards Cached</div>
            <div class="value" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <div class="templateCount">{{ templateCount }}</div>
                <Button icon="pi pi-trash" text severity="danger" @click="deleteTemplates" v-if="templateCount > 0" title="Empty Kneeboards Cache" />
            </div>
        </div>

        <div class="actions">
          <div style="flex-grow: 1; text-align: left;">
             <Button icon="pi pi-cog" :text="!showSettings" rounded @click="showSettings = !showSettings" :title="showSettings ? 'Back to Details' : 'Settings'" />
          </div>
          <Button link label="Sign Out" class="btnSignOut" @click="emits('signout')"></Button>
          <Button label="Stay In Pattern" @click="emits('close')"></Button>
        </div>
      </div>
    </Dialog>
    <Dialog v-model:visible="showQrcode" modal header="Ambassador QR Code" :style="{ width: '300px' }">
        <div style="display: flex; justify-content: center;">
            <QrcodeVue :value="ambassadorLink" :size="200" level="H" />
        </div>
    </Dialog>

    <Dialog v-model:visible="showAirportSelection" modal header="Select Home Airport" :style="{ width: '35rem' }">
        <AirportInput code="" :auto="true" :expanded="true"
            @valid="onAirportSelected" />
    </Dialog>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed } from 'vue';
import { AccountType } from '@checklist/shared';
import { CheckoutService } from '../../services/CheckoutService'
import { LocalStoreService } from '../../services/LocalStoreService';
import { CurrentUser } from '../../assets/CurrentUser';
import { Formatter } from '../../lib/Formatter';
import { UserUrl } from '../../lib/UserUrl';
import { useToast } from 'primevue/usetoast';
import { useToaster } from '../../assets/Toaster';
import { useRouter } from 'vue-router';
import { Airport } from '../../models/Airport';

import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import UpdateButton from './UpdateButton.vue';
import { currentUser } from '../../assets/data';
import QrcodeVue from 'qrcode.vue'
import AirportInput from '../shared/AirportInput.vue';


const emits = defineEmits(['close','signout'])
const airportCount = ref(0)
const templateCount = ref(0)
const pagesCount = ref(0)
const showSettings = ref(false)
const showQrcode = ref(false)
const showAirportSelection = ref(false)
const props = defineProps({
  user: {type: CurrentUser, required: true}
})
const router = useRouter()
const toaster = useToaster(useToast())
const user = ref(currentUser)

const unsubscribe = ref<(() => void) | undefined>(undefined)

onMounted(() => {
    loadProps(props)
    airportCount.value = LocalStoreService.airportRecentsGet().length
    templateCount.value = LocalStoreService.templateCount()
    unsubscribe.value = LocalStoreService.subscribe(() => {
        airportCount.value = LocalStoreService.airportRecentsGet().length
        templateCount.value = LocalStoreService.templateCount()
    })
})

onUnmounted(() => {
    if (unsubscribe.value) unsubscribe.value()
})

watch( props, () => {
    loadProps((props))
})

function loadProps(props:any) {
  user.value = props.user
  pagesCount.value = props.user.maxPageCount
    // refresh total values
    user.value = props.user
    const total = user.value.templates.reduce( (acc, template:any) => {
        acc.pages += template.pages
        acc.versions += template.ver
        return acc
    }, {pages:0,versions:0})
    // console.log('[Session.onAccountDetails] ', total)
    pagesCount.value = total.pages
}

function onUpdateAccount() {
    emits('close')
    if(user.value.accountType != AccountType.simmer) {
        toaster.info('Calling Tower', 'Stand By...')
        CheckoutService.manage(user.value).then( (url:string) => {
        // console.log('[PricingPlans.onPlan]',url)
        window.location.href = url
    }).catch( (err:any) => {
        console.error(err)
    })
  } else {
    router.push('/plans')
  }
}

function deleteAirports() {
    LocalStoreService.airportRemoveAll()
    airportCount.value = 0
    toaster.success('Local Storage', 'Airports deleted')
}

function deleteTemplates() {
    LocalStoreService.templateRemoveAll()
    templateCount.value = 0
    toaster.success('Local Storage', 'Kneeboards deleted')
}

const ambassadorLink = computed(() => {
    return `${UserUrl.main}/?utm_source=ambassador&utm_medium=referral&utm_campaign=${user.value.sha256.slice(-10)}`
})

function copyAmbassadorLink() {
    navigator.clipboard.writeText(ambassadorLink.value).then(() => {
        toaster.success('Clipboard', 'Ambassador link copied')
    })
}

async function onAirportSelected(airport: Airport) {
    showAirportSelection.value = false
    toaster.info('Home Airport', `Changing to ${airport.code}`)
    const success = await user.value.setHomeAirport(airport.code)
    if (success) {
        toaster.success('Account Updated', `Home airport set to ${airport.code}`)
    } else {
        toaster.error('Update Failed', `Could not save home airport`)
    }
}

</script>

<style scoped>
.account {
  display: grid;
  grid-template-columns: auto auto;
  gap: 10px;
  align-items: center;
}
.accountDialog {
  width: 400px;
}
.accountType {
  display: flex;
  align-items: center;
  gap: 10px;
}
.key {
  font-weight: bold;
  text-align: right;
}
.actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
}
.maxedOut {
    font-weight: bold;
    background-color: orange;
    border-radius: 3px;
    padding: 0 5px; 
}
.value {
    display: flex;
    justify-content: space-between;
    text-align: center;
}
.unlimited {
    color: black;
    background-color: orange;
    border-radius: 3px;
    justify-content: center;
    align-items: center;
    font-size: 10px;
    font-family: var(--font-family);
    transition-duration: 0.2s;
    padding: 4px 10px;
}
</style>