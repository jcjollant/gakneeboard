<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
    title: { type: String, default: '?'},
    subtitle: { type: String, default: 'Click header to configure'},
})

const title = ref('')

function loadProps(props) {
    title.value = props.title;
}

onMounted(() => {
    loadProps(props)
})


</script>

<template>
    <div class="placeHolder">
        <div>
            <div>{{ title }}</div>
            <div class="small">{{subtitle}}</div>
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
    opacity: .4;
    height: 200px;
    width: 100%;
}
.small {
    font-size: 0.8rem;
    font-weight: normal;
}
</style>