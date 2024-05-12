<script setup>
import { watch } from 'vue';
import { onMounted,ref } from 'vue';


const label = ref('')
const value = ref('')
const position = ref('')

const props = defineProps({
    label: { type: String, default: '-'},
    value: { type: String, default: '-'},
    position: { type:String, default: 'Top'}
})

function loadProps(newProps) {
    if( newProps == undefined) {
        label.value = '-'
        value.value = '-'
        position.value = 'TL'
    } else {
        label.value = newProps.label
        value.value = newProps.value
        position.value = newProps.position
    }
}

onMounted(() => {
    loadProps(props)
})

watch( props, () => {
    loadProps(props)
})

</script>

<template>
    <div>
        <div @click="toggleSelection">
            <div v-if="position=='Top'">
                <div>{{value}}</div>
                <div class="label">{{label}}</div>
            </div>
            <div v-else>
                <div class="label">{{label}}</div>
                <div>{{value}}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .label {
        padding: 0;
        font-size:9px;
    }

    .ctList {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .ctItem {
        display: flex;
        align-items: center;
    }
    .ml-2 {
        margin-left: 0.5rem;
    }

</style>