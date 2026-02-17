<template>
    <div class="contentPage" :class="{'fullpage': isFullPage}">
        <PlaceHolder title="Loading" subtitle="Page Content Will Show Here"></PlaceHolder>
    </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue';
import PlaceHolder from '../shared/PlaceHolder.vue';
import { TemplateFormat } from '@gak/shared';

const props = defineProps({
    format: { type: String, default: TemplateFormat.Kneeboard }
})

const isFullPage = computed(() => props.format === TemplateFormat.FullPage)
</script>