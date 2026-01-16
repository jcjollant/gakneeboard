<template>
    <RegLink :regs="regs" :align="Alignment.Left" />
    <ImageContent src="service-volumes.png" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ImageContent from '../shared/ImageContent.vue';
import RegLink from '../regulations/RegLink.vue';
import { Alignment } from '../../models/Alignment';
import { Regulation } from '../../models/Regulation';

const regs = ref([Regulation.StandardServiceVolumes])
</script>
