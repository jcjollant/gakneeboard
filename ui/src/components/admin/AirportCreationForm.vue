<template>
    <div class="airport-creation-form">
        <h2>Create New Airport</h2>
        <div class="form-grid">
            <div class="field">
                <label for="code">Code</label>
                <InputText id="code" v-model="request.code" placeholder="e.g. KSEA" />
            </div>
            <div class="field">
                <label for="name">Name</label>
                <InputText id="name" v-model="request.name" placeholder="Airport Name" />
            </div>
            <div class="field">
                <label for="elevation">Elevation (ft)</label>
                <InputNumber id="elevation" v-model="request.elevation" />
            </div>
            <div class="field">
                <label for="tpa">Traffic Pattern Altitude (ft)</label>
                <InputNumber id="tpa" v-model="request.trafficPatternAltitude" placeholder="Optional" />
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <h3>Frequencies</h3>
                <Button icon="pi pi-plus" label="Add" size="small" @click="addFrequency" text />
            </div>
            <div class="list-container">
                <div v-for="(freq, index) in request.frequencies" :key="index" class="list-item">
                    <InputText v-model="freq.name" placeholder="Name (e.g. TOWER)" class="w-40" />
                    <InputNumber v-model="freq.mhz" :minFractionDigits="1" :maxFractionDigits="3" placeholder="MHz" class="w-24" />
                    <Button icon="pi pi-trash" severity="danger" text @click="removeFrequency(index)" class="ml-auto" />
                </div>
                <div v-if="request.frequencies.length === 0" class="empty-state">No frequencies added</div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <h3>Runways</h3>
                <Button icon="pi pi-plus" label="Add" size="small" @click="addRunway" text />
            </div>
            <div class="list-container">
                <div v-for="(rwy, index) in request.runways" :key="index" class="list-item">
                    <InputText v-model="rwy.name" placeholder="Name (e.g. 16L/34R)" class="w-12" />
                    <InputNumber v-model="rwy.length" placeholder="Length (ft)" class="w-12 mr-4" />
                    <InputNumber v-model="rwy.width" placeholder="Width (ft)" class="w-12" />
                    <Button icon="pi pi-trash" severity="danger" text @click="removeRunway(index)" class="ml-auto" />
                </div>
                <div v-if="request.runways.length === 0" class="empty-state">No runways added</div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <h3>JSON Data</h3>
                <Button icon="pi pi-copy" label="Copy" size="small" @click="copyJson" text />
            </div>
            <p class="help-text">You can edit the JSON directly to update the form.</p>
            <Textarea 
                v-model="jsonText" 
                rows="10" 
                class="w-full font-mono"
                @input="onJsonInput"
                @blur="onJsonBlur"
            />
        </div>

        <div class="actions">
            <Button label="Create Airport" @click="submit" :loading="loading" :disabled="!isValid" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import { createAirport } from '../../services/AirportDataService';
import { AirportCreationRequest, RequestFrequency, RequestRunway } from '../../models/AirportCreationRequest';

const toast = useToast();
const loading = ref(false);

const request = reactive<AirportCreationRequest>({
    code: '',
    name: '',
    elevation: 0,
    trafficPatternAltitude: undefined,
    frequencies: [],
    runways: []
});

const isValid = computed(() => {
    return request.code.length >= 3 && request.name.length > 0;
});

function addFrequency() {
    request.frequencies.push({ name: '', mhz: undefined } as RequestFrequency);
}

function removeFrequency(index: number) {
    request.frequencies.splice(index, 1);
}

function addRunway() {
    request.runways.push({ name: '', length: undefined, width: undefined } as RequestRunway);
}

function removeRunway(index: number) {
    request.runways.splice(index, 1);
}

async function submit() {
    if (!isValid.value) return;
    loading.value = true;
    try {
        await createAirport(request);
        toast.add({ severity: 'success', summary: 'Success', detail: `Airport ${request.code} created`, life: 3000 });
        // Reset form or redirect? resetting form for now as it's an admin tool
        request.code = '';
        request.name = '';
        request.elevation = 0;
        request.trafficPatternAltitude = undefined;
        request.frequencies = [];
        request.runways = [];
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to create airport', life: 5000 });
    } finally {
        loading.value = false;
    }
}

// JSON handling
const jsonText = ref(JSON.stringify(request, null, 2));
const isEditingJson = ref(false);

watch(request, (newVal) => {
    if (!isEditingJson.value) {
        jsonText.value = JSON.stringify(newVal, null, 2);
    }
}, { deep: true });

function onJsonInput() {
    isEditingJson.value = true;
    try {
        const parsed = JSON.parse(jsonText.value);
        // Validate minimally or just blindly assign? 
        // Let's do a basic structural check if needed, but for now trusting the user input
        Object.assign(request, parsed);
    } catch (e) {
        // Ignore parse errors while typing
    }
}

function onJsonBlur() {
    isEditingJson.value = false;
    // Reformat
    try {
        const parsed = JSON.parse(jsonText.value);
        Object.assign(request, parsed); // Ensure sync
        jsonText.value = JSON.stringify(request, null, 2);
    } catch (e) {
        // If invalid JSON on blur, maybe revert or keep as is?
        // Let's revert to valid state from request if parse fails
        jsonText.value = JSON.stringify(request, null, 2);
    }
}

async function copyJson() {
    try {
        await navigator.clipboard.writeText(jsonText.value);
        toast.add({ severity: 'success', summary: 'Copied', detail: 'JSON copied to clipboard', life: 2000 });
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to copy to clipboard', life: 3000 });
    }
}
</script>

<style scoped>
.airport-creation-form {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    max-width: 800px;
    margin: 0 auto;
}

h2 {
    color: #2c3e50;
    margin-bottom: 2rem;
}

h3 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.1rem;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 3fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.field label {
    font-weight: 500;
    color: #2c3e50;
}

.section {
    margin-bottom: 2rem;
    border: 1px solid #e1e8ed;
    border-radius: 6px;
    padding: 1rem;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.list-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.list-item {
    display: flex;
    gap: 1.5rem;
    align-items: center;
}

.w-24 {
    width: 6rem;
}

.w-28 {
    width: 8rem;
}

.w-40 {
    width: 15rem;
}

.flex-1 {
    flex: 1;
}

.ml-auto {
    margin-left: auto;
}

.mr-4 {
    margin-right: 1rem;
}

.empty-state {
    color: #7f8c8d;
    font-style: italic;
    text-align: center;
    padding: 1rem;
}

.actions {
    display: flex;
    justify-content: flex-end;
}

.w-full {
    width: 100%;
}

.font-mono {
    font-family: monospace;
}

.help-text {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.5rem;
}
</style>
