<template>
    <Dialog v-model:visible="visible" modal :draggable="true" :closable="true" 
        :style="{ width: '50vw', maxWidth: '600px' }" 
        @update:visible="onUpdateVisible"
        class="tile-settings-dialog">
        
        <template #header>
            <div class="header-content">
                <div class="mini-grid">
                    <!-- Placeholder for mini-grid visualization based on tile prop -->
                    <div class="grid-icon mini-grid-css">
                        <div v-for="i in 6" :key="i" class="mini-cell" 
                            :class="{ active: (i-1) === index }"></div>
                    </div>
                </div>
                <div class="settings-title">{{ title }}</div>
            </div>
        </template>

        <div class="settings-body">
            <slot @update="console.log('update')"></slot>
        </div>

        <template #footer>
            <ActionBar :video="video" :help="help" :canApply="canApply" :showCancel="true" class="actionBar"
                @apply="emits('apply', editingTileData)" @cancel="closeDialog" />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, provide } from 'vue';
import { TileData } from '../../models/TileData';
import ActionBar from '../shared/ActionBar.vue';
import Dialog from 'primevue/dialog';

const emits = defineEmits(['close', 'apply']);

const props = defineProps({
    tile: { type: TileData, required: true },
    video: { type: String, default: undefined },
    help: { type: String, default: undefined },
    canApply: { type: Boolean, default: false },
    index: { type: Number, default: -1 },
});

const editingTileData = ref<TileData | null>(null);

// Manage visibility internally to satisfy v-model, but sync with parent lifecycle
const visible = ref(true);

function closeDialog() {
    visible.value = false;
    emits('close');
}

function onUpdateVisible(val: boolean) {
    if (!val) {
        emits('close');
    }
}

// Provide a method for children to communicate updates
function handleChildUpdate(data: TileData) {
    // Refresh the temporary editing tile data which may or may not be applied
    editingTileData.value = data;
    // console.log('[TileSettings] child update', data);
}
provide('tileSettingsUpdate', handleChildUpdate);


// onMounted(() => {
//     console.debug('[TileSettings] props', props);
// });

const title = computed(() => {
    if (!props.tile) return 'Settings';
    // Capitalize first letter
    const name = props.tile.name.charAt(0).toUpperCase() + props.tile.name.slice(1);
    return `${name} Tile Settings`;
});
</script>

<style scoped>
/* Scoped styles for header content since Dialog header slot replaces default */
.header-content {
    display: flex;
    align-items: center;
    gap: 10px;
}

.settings-title {
    font-weight: bold;
    font-size: 1.1rem;
}

.settings-body {
    /* PrimeVue Dialog has default padding, adjust as needed */
    padding-top: 10px; 
    flex: 1; /* Ensure it takes available space */
    overflow-y: auto;
    background-color: var(--bg-primary);
}

/* Default colors if variables not defined */
:root {
    --bg-primary: white;
    --bg-secondary: #f0f0f0;
}

.mini-grid-css {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2px;
}
.mini-cell {
    width: 5px;
    height: 5px;
    background-color: darkgrey;
    border-radius: 1px;
}
.mini-cell.active {
    background-color: var(--primary-color, blue);
}
.actionBar {
    position: relative;
    bottom: auto;
}
</style>
