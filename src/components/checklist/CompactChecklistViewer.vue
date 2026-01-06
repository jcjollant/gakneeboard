<template>
    <div class="compact-viewer">
        <template v-for="(section, index) in sections" :key="index">
            <div class="section-container">
                <!-- Section Title -->
                <div v-if="section.title" 
                     class="section-title"
                     :style="{ color: getSectionTitleColor(section) }">
                    {{ section.title }}
                </div>
                
                <!-- Items -->
                <div class="items-container">
                    <span v-for="(item, itemIndex) in section.items" 
                          :key="itemIndex" 
                          class="compact-item"
                          :style="{ backgroundColor: accentColor }">
                        <span class="challenge">{{ item.challenge }}</span>
                        <span v-if="item.response" class="response">: {{ item.response }}</span>
                    </span>
                </div>
            </div>
        </template>
        <div v-if="sections.length === 0" class="no-items">
            No Items
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { ChecklistItem, ChecklistItemType, ChecklistTheme, ChecklistThemeColors } from '../../models/Checklist'
import { ChecklistView } from '../../models/ChecklistView'

const props = defineProps({
    view: { type: ChecklistView, required: true },
})

interface SectionGroup {
    title: string;
    type: ChecklistItemType; // strong, emergent, etc. from the section header item
    items: ChecklistItem[];
}

const theme = ref<ChecklistTheme>(ChecklistTheme.yellow)

// Map themes to their "Accent" (strong) color
const accentColor = computed(() => {
    return ChecklistThemeColors[theme.value]?.light ?? ChecklistThemeColors[ChecklistTheme.yellow].light;
})

const sections = computed(() => {
    const groups: SectionGroup[] = [];
    let currentGroup: SectionGroup | null = null;

    // Helper to start a new group
    const startGroup = (title: string, type: ChecklistItemType = ChecklistItemType.undefined) => {
        currentGroup = {
            title,
            type,
            items: []
        };
        groups.push(currentGroup);
    };

    // If first item is not a section, create a default group
    if (props.view.items.length > 0 && !props.view.items[0].section) {
        startGroup('');
    }

    props.view.items.forEach(item => {
        if (item.section) {
            // It's a section header
            startGroup(item.section, item.type);
        } else if (item.type !== ChecklistItemType.blank) {
            // It's a regular item (skip blanks for compact view usually, or render them? 
            // User said "Compact", usually implies skipping spacers, but let's just include non-blank items)
            if (!currentGroup) {
                 // Should have been handled by the initial check, but just in case
                 startGroup('');
            }
            if (currentGroup) {
                currentGroup.items.push(item);
            }
        }
    });

    // Filter out empty groups if any
    return groups.filter(g => g.items.length > 0 || g.title);
})

function getSectionTitleColor(section: SectionGroup) {
    return 'black'
    // if (section.type === ChecklistItemType.strong) {
    //     return accentColor.value;
    // }
    // return 'white';
}

function loadProps() {
    if (props.view) {
        theme.value = props.view.theme;
    }
}

onMounted(() => {
    loadProps()
})

watch(() => props.view, () => {
    loadProps()
}, { deep: true })

</script>

<style scoped>
.compact-viewer {
    display: flex;
    flex-flow: column;
    width: 100%;
    padding: 2px;
    gap: 5px;
}

.section-container {
    display: flex;
    flex-flow: row; /* "each child is a section along with its items" - wait. 
    User said: "The parent component should use display:flex with flex-flow:column, each child in this component is a section along with its tems. The section should also be a display:flex with flex-flow:row." 
    So section container is flex row. */
    align-items: baseline;
    flex-wrap: wrap;
    gap: 2px;
    margin-bottom: 5px;
}

.section-title {
    font-weight: bold;
    margin-right: 5px;
    white-space: nowrap;
}

.items-container {
    display: contents; /* If the section container is the flex row, and items should just flow inline with the title? 
    Or did the user mean "The section container" contains title AND items, and THEY are flex row?
    "The section should also be a display:flex with flex-flow:row"
    Yes, title and items in one row (wrapping). */
}

.compact-item {
    display: inline-flex;
    align-items: center;
    border-radius: 4px; /* "border radius" */
    padding: 2px 6px;
    /* font-weight: bold; */
    font-size: 0.9em;
    margin-right: 2px;
}

.response {
    margin-left: 2px;
    font-weight: normal; 
    opacity: 0.9;
}

.no-items {
    color: grey;
    font-style: italic;
    padding: 10px;
}
</style>
