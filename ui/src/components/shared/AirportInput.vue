<template>
    <div class="airportCode" :class="{page:page, 'expanded-mode': showRecent, 'large-mode': large, 'route-mode': isRouteMode}">
        <div class="input-and-name">
            <div class="airport-input-group" @click="codeInput?.focus()">
                <div class="label-group" :class="{page:page, 'route-active': !!routeCodeModel}">
                    <font-awesome-icon v-if="routeCodeModel" class="route-icon" icon="route" title="Route selection active" />
                    {{label}}
                </div>
            <input ref="codeInput" class="code-input" :class="{large:large}" v-model="code" @input="onCodeUpdate" />
        </div>
        <div class="nameGroup" :class="{'route-name-group': isRouteMode}">
            <span class="airportName" :class="{valid: valid, page:page}">{{ name }}</span>
        </div>
    </div>
    <div v-if="showRecent" class="frequentAirportList" :class="{expanded: showRecent}">
            <button type="button" v-for="ra in recentAirports" class="recentAirport" :class="{active: ra.activeRoute}" @click="onRecentAirport(ra)">
                <font-awesome-icon v-if="ra.type != 'recent'" :icon="ra.type === 'home' ? 'house' : 'route'" style="margin-right: 4px; font-size: 0.7rem;"/>{{ ra.code }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { Airport } from '../../models/Airport.ts'
import { Route, RouteCode } from '@gak/shared'
import { getAirport } from '../../services/AirportDataService'
import { LocalStoreService } from '../../services/LocalStoreService'
import { sessionAirports, currentUser } from '../../assets/data'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useToast } from 'primevue/usetoast'
import { useToaster } from '../../assets/Toaster'

const emits = defineEmits(['valid', 'invalid'])

const props = defineProps({
    code: { type: String, default: ''},
    label: { type: String, default: 'Code'},
    page: {type: Boolean, default: false},
    showRecent: {type: Boolean, default: false},
    large: {type: Boolean, default: false},
    route: {type: Object as () => Route, default: undefined},
    defaultToLastKnown: { type: Boolean, default: false }
})
const recentAirports = ref<RecentAirport[]>([])
const code = ref()
const codeInput = ref<HTMLInputElement|null>(null)
const model = defineModel<Airport|undefined>()
const routeCodeModel = defineModel<RouteCode|undefined>('routeCode')
const name = ref('')
const valid = ref(false)
let timeoutId:ReturnType<typeof setTimeout>|undefined = undefined
const toaster = useToaster( useToast())
let unsubscribe: (() => void) | undefined = undefined

const isRouteMode = computed(() => !!props.route)

class RecentAirport {
    code: string
    type: 'home' | 'recent' | 'route'
    activeRoute: boolean
    routeCode?: RouteCode
    constructor(code: string, type: 'home' | 'recent' | 'route', activeRoute: boolean = false, routeCode?: RouteCode) {
        this.code = code
        this.type = type
        this.activeRoute = activeRoute
        this.routeCode = routeCode
    }
}

async function loadProps(props:any) {
    // console.log('[AirportInput.loadProps]', props)
    if(model.value) {
        const airport = model.value as Airport;
        if(airport.isValid()) {
             code.value = airport.code
             name.value = airport.name
             valid.value = true
        }
    } else {
        let initialCode = props.code
        if (!initialCode && props.defaultToLastKnown) {
            const lastKnown = LocalStoreService.getLastKnownAirportCode()
            if (lastKnown) {
                initialCode = lastKnown
            }
        }
        code.value = initialCode
        try {
            fetchAirport()
        } catch (e) {
            // Airport not in local store, will be fetched by AirportInput
            console.log(`[AirportInput.loadProps] Airport ${initialCode} not found`, e)
        }
    }
}

onMounted(() => {
    // console.log('Airport mounted with ' + JSON.stringify(props.params))
    // get this airport data from parameters
    loadProps(props)
    sessionAirports.addListener(refreshRecentAirportList)
    refreshRecentAirportList()
    unsubscribe = LocalStoreService.subscribe(refreshRecentAirportList)
})

onUnmounted(() => {
    if (unsubscribe) unsubscribe()
})

watch(props, async () => {
    // console.log("Airport props changed " + JSON.stringify(props));
    loadProps(props)
    refreshRecentAirportList()
})

watch(model, () => {
    loadProps(props)
    refreshRecentAirportList()
})

function fetchAirport() {
    // console.log('[AirportInput.fetchAirport]', code.value, code.value.length)
    if(!code.value || code.value.length < 3) return

    getAirport( code.value)
        .then( a => {
            // console.log('[AirportInput.fetchAirport] received', a)
            const airport = Airport.copy(a)
            // console.log('[AirportInput.fetchAirport] copied', airport)
            if( airport.isValid()) {
                // console.debug('[AirportInput.fetchAirport] valid', airport)
                name.value = airport.name
                code.value = airport.code
                valid.value = true
                model.value = airport
                LocalStoreService.setLastKnownAirportCode(airport.code)
                emits('valid', airport)
            } else { // airport is unknown
                toaster.warning( 'Invalid Airport', code.value + ' may not be valid');
                valid.value = false
                name.value = "Unknown"
                // model.value = invalidAirport
                // emits('invalid', code.value)
            }
        })
}

// gets invoked as airport code is typed into the input field
// We are after runways
function onCodeUpdate() {
    // console.log(airportCode.value)
    // console.log('[AirportEdit.onCodeUpdate]',Date.now())
    if (code.value) {
        code.value = code.value.toUpperCase()
    }
    name.value = `...`
    valid.value = false
    routeCodeModel.value = undefined
    
    if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = undefined
    }

    // only load the new code after a short delay to avoid sending useless query
    if( code.value && code.value.length > 2) {
        timeoutId = setTimeout( () => {
            name.value = `fetching ${code.value} ...`
            fetchAirport()
        }, 500)
    }
}

function onRecentAirport(ra: RecentAirport) {
    if (ra.type === 'route' && ra.routeCode) {
        if (routeCodeModel.value === ra.routeCode) {
            routeCodeModel.value = undefined
        } else {
            routeCodeModel.value = ra.routeCode
        }
    } else {
        routeCodeModel.value = undefined
    }

    const airportCode = ra.code
    try {
        const airport:Airport = LocalStoreService.airportGet(airportCode)
        // console.log('[AirportInput.onRecentAirport]', airportCode, airport)
        code.value = airport.code
        name.value = airport.name
        valid.value = true
        model.value = airport
        LocalStoreService.setLastKnownAirportCode(airport.code)
        emits('valid', airport)
    } catch(e) { 
        console.warn('[AirportInput] onRecentAirport failed',e)
        // Fallback with a fetch
        code.value = airportCode
        fetchAirport()
    }
}

function refreshRecentAirportList() {
    const freshRecentAirports: RecentAirport[] = []

    const addIfUnique = (code:string|undefined, type: 'recent' | 'route' | 'home', activeRoute: boolean = false, rc?: RouteCode) => {
        if(!code) return
        if(freshRecentAirports.find(a => a.code === code)) return
        freshRecentAirports.push(new RecentAirport(code, type, activeRoute, rc))
    }

    // Route Airports, preventing duplicates
    if(props.route) {
        // activeRoute depends on routeCodeModel if defined, otherwise legacy fallback to props.route presence
        const isDepActive = routeCodeModel.value !== undefined ? routeCodeModel.value === 'dep' : (isRouteMode.value && model.value?.code === props.route.dep)
        const isDstActive = routeCodeModel.value !== undefined ? routeCodeModel.value === 'dst' : (isRouteMode.value && model.value?.code === props.route.dst)
        const isAltActive = routeCodeModel.value !== undefined ? routeCodeModel.value === 'alt' : (isRouteMode.value && model.value?.code === props.route.alt)
        addIfUnique(props.route.dep, 'route', !!isDepActive, 'dep')
        addIfUnique(props.route.dst, 'route', !!isDstActive, 'dst')
        addIfUnique(props.route.alt, 'route', !!isAltActive, 'alt')
    }

    if(currentUser.homeAirport) {
        addIfUnique(currentUser.homeAirport, "home")
    }

    let recent = LocalStoreService.airportRecentsGet(10).sort();
    // recent.forEach(a => addIfUnique(a, 'recent')) ... wait, let's just make sure we do it right
    recent.forEach(a => addIfUnique(a, 'recent'))
    // return the first 10 elements
    recentAirports.value = freshRecentAirports.slice(0, 10)
}

</script>

<style scoped>
.airportCode {
    display: flex;
    flex-flow: column;
    font-size: 0.8rem;
    line-height: 1.5rem;
    text-align: left;
    gap:5px;
}
.airportCode.large-mode .nameGroup {
    height: 2.5rem;
    align-items: center;
}

.airportCode.large-mode .airportName {
    font-size: 1.2rem;
    line-height: 1.2;
    height: auto;
}

.airportCode.large-mode .airport-input-group {
    height: 2.5rem;
}

.airportCode.large-mode .label-group {
    font-size: 1.2rem;
    padding-left: 15px;
    padding-right: 15px;
    width: auto;
    min-width: 3rem; 
}

.airportCode.large-mode .code-input {
    font-size: 1.2rem;
    padding-left: 15px;
    padding-right: 15px;
}


.airportName {
    overflow: hidden;
    line-height: 22px;
    height: 22px;
    font-size: 0.7rem;
}
.airportName.page {
    font-size: 0.9rem;
}
.recentAirport {
    border-radius: 3px;
    color: white;
    background-color: var(--bg-secondary);
    cursor: pointer;
    padding: 2px 8px;
    border: none;
    font-family: inherit;
    font-size: inherit;
}
.recentAirport:hover {
    background-color: var(--bg-hover);
}
.recentAirport.active {
    background-color: var(--route-background);
}
.frequentAirportList {
    display: flex;
    font-size: 0.7rem;
    line-height: 22px;
    height: 22px;
    overflow: hidden;
    gap: 5px;
    align-items: center;
    flex-wrap: wrap;
}
.valid {
    font-weight: bold;
}

.airport-input-group {
    display: flex;
    align-items: stretch;
    width:fit-content;
    border: 1px solid var(--surface-border, #d1d5db);
    border-radius: 6px;
    overflow: hidden;
    height: 1.5rem;
    box-sizing: border-box;
}

.label-group {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ccc;
    color: black;
    padding: 0 10px;
    width: auto;
    min-width: 2.5rem;
    font-size: 0.8rem;
    box-sizing: border-box;
    border-right: 1px solid var(--surface-border, #d1d5db);
}

.label-group.route-active {
    color:white;
    background-color: var(--route-background);
}

.route-active .label-group {
    border-color: var(--route-background);
}

.label-group.page {
    width: 5.5rem;
}

.route-icon {
    margin-right: 5px;
    font-size: 0.9em;
}

.code-input {
    border: none;
    outline: none;
    width: 60px;
    padding: 0 5px;
    font-size: 0.8rem;
    background: var(--surface-card, #ffffff);
    color: var(--text-color, #333);
    font-family: inherit;
    box-sizing: border-box;
    text-transform: uppercase;
}

.code-input.large {
    padding: 0 10px;
    width: 90px;
}

.nameGroup {
    display: flex;
    justify-content: space-between;
    height: 22px;
}

.input-and-name {
    display: flex;
    gap: 5px;
}
</style>