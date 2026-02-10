<template>
    <Dialog v-model:visible="visible" modal :header="headerTitle" :style="{ width: '50rem', maxHeight: '90vh' }" :closable="true" @update:visible="onUpdateVisible">
        <div class="scrollable-content">
            <NotamList 
                v-for="group in groupedNotams" 
                :key="group.type" 
                :title="group.type" 
                :notams="group.notams" 
                :showRaw="showRaw" 
            />
        </div>
        
        <template #footer>
            <div class="dialog-footer">
                <div class="footer-left">
                    <a href="https://notams.aim.faa.gov/notamSearch/nsapp.html#/" target="_blank" class="faa-link">Official FAA Notam Search</a>
                    <label class="checkbox-label">
                        <input type="checkbox" v-model="showRaw" />
                        Show Raw Text
                    </label>
                </div>
                <Button label="Close" @click="closeDialog" />
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { Notam } from '../../models/Notam';
import NotamList from './NotamList.vue';

const props = defineProps({
    visible: { type: Boolean, default: false },
    notams: { type: Array as () => Notam[], default: () => [] },
    airportCode: { type: String, default: '' },
    airportName: { type: String, default: '' }
});

const emits = defineEmits(['update:visible', 'close']);

const visible = ref(props.visible);
const showRaw = ref(false);

watch(() => props.visible, (val) => {
    visible.value = val;
});

const headerTitle = computed(() => {
    if (props.airportName) {
        return `NOTAMs for ${props.airportName} (${props.airportCode})`;
    }
    return `NOTAMs for ${props.airportCode}`;
});

const groupedNotams = computed(() => {
    const groups: Record<string, Notam[]> = {};
    
    props.notams.forEach(notam => {
        const type = notam.type || 'General';
        
        if (!groups[type]) {
            groups[type] = [];
        }
        groups[type].push(notam);
    });
    
    // Convert to array of objects for sorting
    const sortedGroups = Object.keys(groups).map(type => ({
        type,
        notams: groups[type]
    }));

    // Custom sort order
    sortedGroups.sort((a, b) => {
        const typeA = a.type.toLowerCase();
        const typeB = b.type.toLowerCase();
        
        if (typeA === 'obstruction') return 1;
        if (typeB === 'obstruction') return -1;
        
        // Default alphabetical sort for others
        return typeA.localeCompare(typeB);
    });
    
    return sortedGroups;
});

function onUpdateVisible(val: boolean) {
    emits('update:visible', val);
    if (!val) {
        emits('close');
    }
}

function closeDialog() {
    visible.value = false;
    emits('update:visible', false);
    emits('close');
}
</script>

<style scoped>
.scrollable-content {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.footer-left {
    display: flex;
    align-items: center;
    gap: 20px;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    font-size: 0.9em;
    user-select: none;
}

.faa-link {
    color: #007bff;
    text-decoration: none;
    font-size: 0.9em;
}

.faa-link:hover {
    text-decoration: underline;
}
</style>
