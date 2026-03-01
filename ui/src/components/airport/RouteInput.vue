<template>
    <div class="route-input">
        <Button class="route-btn" 
            :severity="model === 'dep' ? 'primary' : 'secondary'"
            @click="select('dep')"
            :disabled="!route?.dep">
            <div class="btn-content">
                <span class="btn-label">Departure</span>
                <span class="btn-code">{{ route?.dep || '---' }}</span>
            </div>
        </Button>

        <Button class="route-btn" 
            :severity="model === 'dst' ? 'primary' : 'secondary'"
            @click="select('dst')"
            :disabled="!route?.dst">
            <div class="btn-content">
                <span class="btn-label">Destination</span>
                <span class="btn-code">{{ route?.dst || '---' }}</span>
            </div>
        </Button>

        <Button class="route-btn" 
            :severity="model === 'alt' ? 'primary' : 'secondary'"
            @click="select('alt')"
            :disabled="!route?.alt">
            <div class="btn-content">
                <span class="btn-label">Alternate</span>
                <span class="btn-code">{{ route?.alt || '---' }}</span>
            </div>
        </Button>
    </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import { Route } from '@gak/shared';

const props = defineProps<{
    route?: Route
}>();

const model = defineModel<'dep' | 'dst' | 'alt' | undefined>();

const emit = defineEmits<{
    (e: 'selection', code: string): void
}>();

function select(type: 'dep' | 'dst' | 'alt') {
    const code = props.route?.[type];
    if (code) {
        model.value = type;
        emit('selection', code);
    }
}
</script>

<style scoped>
.route-input {
    display: flex;
    justify-content: center;
    gap: 10px;
    width: 100%;
}

.route-btn {
    flex: 1;
    padding: 4px 8px;
    display: flex;
    justify-content: center;
}

.btn-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

.btn-label {
    font-size: 0.9rem;
    font-weight: bold;
}

.btn-code {
    font-size: 0.75rem;
    font-weight: normal;
    opacity: 0.8;
}

:deep(.p-button-label) {
    width: 100%;
}
</style>
