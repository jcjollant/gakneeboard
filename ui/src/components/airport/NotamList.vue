<template>
    <div class="notam-group">
        <div class="group-header" @click="toggleCollapse">
            <span class="expand-icon">{{ collapsed ? '▶' : '▼' }}</span>
            <span class="group-title">{{ title }}</span>
            <div class="header-counts">
                <span v-if="currentNotams.length > 0" class="count-card active" title="Active Notams">{{ currentNotams.length }}</span>
                <span v-if="pendingNotams.length > 0" class="count-card pending" title="Pending Notams">{{ pendingNotams.length }}</span>
                <span v-if="notams.length === 0" class="count-card" title="No Notams">0</span>
            </div>

            <div class="filter-cards">
                <div 
                    v-for="filter in availableFilters" 
                    :key="filter.type + filter.label"
                    class="filter-card"
                    :class="[filter.type.toLowerCase(), { selected: selectedFilter?.type === filter.type && selectedFilter?.label === filter.label }]"
                    @click.stop="toggleFilter(filter)"
                >
                    {{ filter.label }}
                </div>
            </div>
        </div>
        
        <div v-if="!collapsed" class="notam-list">
            <!-- Current Notams -->
            <div v-for="(notam, index) in currentNotams" :key="'curr-'+(notam.id || index)" class="notam-item">
                <div class="status-indicator">
                    <span class="dot active"></span>
                </div>
                <div class="notam-text">{{ getNotamText(notam) }}</div>
            </div>

            <!-- Pending Notams -->
            <div v-for="(notam, index) in pendingNotams" :key="'pend-'+(notam.id || index)" class="notam-item">
                <div class="status-indicator">
                    <span class="dot pending"></span>
                </div>
                <div class="notam-text">
                    <span class="pending-time">[{{ formatPendingTime(notam.effectiveStart) }}]</span> 
                    {{ getNotamText(notam) }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Notam } from '../../models/Notam';

const props = defineProps({
    notams: { type: Array as () => Notam[], default: () => [] },
    title: { type: String, default: 'Notams' },
    showRaw: { type: Boolean, default: false }
});

const collapsed = ref(false);
const selectedFilter = ref<{ label: string, type: 'RWY' | 'TWY' } | null>(null);

function toggleCollapse(event: Event) {
    // Prevent collapse if clicking a filter card
    if ((event.target as HTMLElement).closest('.filter-card')) {
        return;
    }
    collapsed.value = !collapsed.value;
}

function getNotamText(notam: Notam): string {
    if (props.showRaw) {
        return notam.text;
    }
    return notam.plainText || notam.text;
}

function getNotamStatus(notam: Notam): 'active' | 'pending' {
    if (!notam.effectiveStart) return 'active'; // Default to active if no start time
    
    const now = new Date();
    const start = new Date(notam.effectiveStart);
    
    return start <= now ? 'active' : 'pending';
}

function formatPendingTime(dateStr?: string): string {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        // Format: "Feb 10 14:00" or similar concise format
        return date.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    } catch (e) {
        return dateStr;
    }
}

// Extraction Logic
const RWY_REGEX = /\b(?:RWY|RUNWAY)\s+(\d{2}[LRC]?)\b/gi;
const TWY_REGEX = /\b(?:TWY|TAXIWAY)\s+([A-Z](?:\d)?)\b/gi;

function extractEntities(text: string): { type: 'RWY' | 'TWY', label: string }[] {
    const entities: { type: 'RWY' | 'TWY', label: string }[] = [];
    let match;

    // Reset lastIndex because regex is global
    RWY_REGEX.lastIndex = 0;
    while ((match = RWY_REGEX.exec(text)) !== null) {
        entities.push({ type: 'RWY', label: match[1] });
    }

    TWY_REGEX.lastIndex = 0;
    while ((match = TWY_REGEX.exec(text)) !== null) {
        entities.push({ type: 'TWY', label: match[1] });
    }

    return entities;
}

const availableFilters = computed(() => {
    const counts = new Map<string, { type: 'RWY' | 'TWY', label: string, count: number }>();

    props.notams.forEach(notam => {
        const text = notam.plainText || notam.text || "";
        const entities = extractEntities(text);
        
        entities.forEach(ent => {
            const key = `${ent.type}-${ent.label}`;
            if (!counts.has(key)) {
                counts.set(key, { ...ent, count: 0 });
            }
            counts.get(key)!.count++;
        });
    });

    return Array.from(counts.values()).sort((a, b) => {
        if (a.type !== b.type) return a.type === 'RWY' ? -1 : 1;
        return a.label.localeCompare(b.label, undefined, { numeric: true });
    });
});

const filteredNotams = computed(() => {
    if (!selectedFilter.value) return props.notams;

    return props.notams.filter(notam => {
        const text = notam.plainText || notam.text || "";
        const entities = extractEntities(text);
        return entities.some(e => e.type === selectedFilter.value!.type && e.label === selectedFilter.value!.label);
    });
});

const currentNotams = computed(() => {
    return filteredNotams.value
        .filter(n => getNotamStatus(n) === 'active')
        .sort((a, b) => {
            const dateA = a.effectiveStart ? new Date(a.effectiveStart).getTime() : 0;
            const dateB = b.effectiveStart ? new Date(b.effectiveStart).getTime() : 0;
            return dateB - dateA; // Newest active first
        });
});

const pendingNotams = computed(() => {
    return filteredNotams.value
        .filter(n => getNotamStatus(n) === 'pending')
        .sort((a, b) => {
            const dateA = a.effectiveStart ? new Date(a.effectiveStart).getTime() : 0;
            const dateB = b.effectiveStart ? new Date(b.effectiveStart).getTime() : 0;
            return dateA - dateB; // Soonest pending first
        });
});

function toggleFilter(filter: { type: 'RWY'|'TWY', label: string }) {
    if (selectedFilter.value && selectedFilter.value.type === filter.type && selectedFilter.value.label === filter.label) {
        selectedFilter.value = null; // Deselect
    } else {
        selectedFilter.value = filter;
    }
}
</script>

<style scoped>
.notam-group {
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow: hidden;
}

.group-header {
    background-color: #f0f0f0;
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: bold;
    user-select: none;
    flex-wrap: wrap; /* Allow wrapping if many filters */
}

.group-header:hover {
    background-color: #e0e0e0;
}

.expand-icon {
    font-size: 0.8em;
    width: 12px;
}

.notam-list {
    display: flex;
    flex-direction: column;
    background-color: white;
}

.notam-item {
    display: flex;
    gap: 10px;
    padding: 10px;
    border-top: 1px solid #eee;
    font-size: 12px;
    text-align: left;
}

.notam-item:first-child {
    border-top: none;
}

.status-indicator {
    display: flex;
    align-items: flex-start;
    padding-top: 3px; /* Align with text roughly */
    flex-shrink: 0;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: block;
}

.dot.active {
    background-color: #e74c3c; /* Red */
}

.dot.pending {
    background-color: #f1c40f; /* Yellow */
}

.notam-text {
    white-space: pre-wrap;
    word-break: break-word;
}

.pending-time {
    font-weight: bold;
    color: #f39c12; /* Match or complement the yellow dot */
    margin-right: 4px;
}

.count-active { /* Keep for backward compatibility if needed, but likely unused now */
    color: #e74c3c;
}

.count-pending { /* Keep for backward compatibility if needed */
    color: #f39c12;
}

.header-counts {
    display: flex;
    gap: 6px;
    margin-left: 8px; /* Left aligned */
    margin-right: auto; /* Push filters to right */
}

.count-card {
    background-color: white;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 0.9em;
    font-weight: bold;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    min-width: 20px;
    text-align: center;
}

.count-card.active {
    color: #e74c3c;
    border: 1px solid #e74c3c; /* Optional: adds a bit more distinction */
}

.count-card.pending {
    color: #f39c12;
    border: 1px solid #f39c12; /* Optional */
}

.filter-cards {
    display: flex;
    gap: 4px;
    margin-left: auto; /* Push to right */
    flex-wrap: wrap;    /* Allow wrapping of filter cards */
    justify-content: flex-end; /* Align to right when wrapped */
    align-items: center;
}

.filter-card {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.85em;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    border: 1px solid transparent;
    transition: all 0.2s;
}

.filter-card:hover {
    filter: brightness(0.9);
}

.filter-card.selected {
    box-shadow: inset 0 0 0 2px white, 0 0 4px rgba(0,0,0,0.5); /* Highlight */
    transform: scale(1.05);
}

.filter-card.rwy {
    background-color: #c0392b; /* Reddish */
    color: white;
}

.filter-card.twy {
    background-color: black;
    color: white;
}

</style>
