<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
    title: { type: String, default: '?'},
})

function loadProps(props) {
    title.value = props.title;
}

onMounted(() => {
    loadProps(props)
})

const title = ref('')

</script>

<template>
    <div class="placeHolder">
        <div>
            <div>{{title}}</div>
            <div class="small">Click header to configure</div>
        </div>
    </div>

</template>

<style scoped>
.placeHolder {
    display: flex;
    justify-content: center;
    align-content: center;
    flex-direction: column;
    font-weight: 600;
    font-size: x-large;
    opacity: .3;
    height: 200px;
}
.small {
    font-size: 0.8rem;
    font-weight: normal;
}
</style>