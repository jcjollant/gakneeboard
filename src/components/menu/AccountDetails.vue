<template>
    <Dialog modal header="Account Details">
      <div class="accountDialog">
        <div class="account mb-5">
            <div class="key">Name</div><div class="value accountName">{{user.name}}</div>
            <div class="key">Account Type</div>
            <div class="value accountType">
              <div :class="{unlimited: user.accountType == AccountType.lifetime}">{{Formatter.accountType(user.accountType)}}</div>
              <UpdateButton @click="onUpdateAccount" :manage="user.accountType != AccountType.simmer"/>
            </div>
            <div class="key">Templates</div>
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
        </div>
        <div class="actions">
          <Button link label="Sign Out" class="btnSignOut" @click="emits('signout')"></Button>
          <Button label="Stay In Pattern" @click="emits('close')"></Button>
        </div>
      </div>
    </Dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { AccountType } from '../../models/AccounType';
import { CheckoutService } from '../../services/CheckoutService'
import { CurrentUser } from '../../assets/CurrentUser';
import { Formatter } from '../../lib/Formatter';
import { useToast } from 'primevue/usetoast';
import { useToaster } from '../../assets/Toaster';
import { useRouter } from 'vue-router';

import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import UpdateButton from './UpdateButton.vue';
import { currentUser } from '../../assets/data';


const emits = defineEmits(['close','signout'])
const pagesCount = ref(0)
const props = defineProps({
  user: {type: CurrentUser, required: true}
})
const router = useRouter()
const toaster = useToaster(useToast())
const user = ref(currentUser)

onMounted(() => {
    loadProps(props)
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

</script>

<style scoped>
.account {
  display: grid;
  grid-template-columns: auto auto;
  gap: 10px;
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