<template>
    <div class="aptCharts">
        <div class="charts-list">
            <Button v-if="airport?.diagram" label="Airport Diagram" icon="pi pi-map" class="chart-button" @click="openChart(airport.diagram)" />
            <Button v-if="airport?.notice" label="Notices" icon="pi pi-info-circle" class="chart-button" @click="openChart(airport.notice, ChartType.Notice)" />
            <Button v-for="chart in airport?.iap" :key="chart.pdf" :label="chart.name" icon="pi pi-file-pdf" class="chart-button" @click="openChart(chart.pdf)" />
            <div v-if="!airport?.diagram && !airport?.notice && (!airport?.iap || airport.iap.length === 0)" class="no-charts">
                No charts available
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { Airport } from '../../models/Airport';
import Button from 'primevue/button';
import { DiagramService, ChartType } from '../../services/DiagramService';

defineProps({
    airport: {
        type: Object as PropType<Airport>,
        required: false
    }
});

function openChart(pdf: string, type: ChartType = ChartType.Diagram) {
    if (pdf) {
        const url = DiagramService.getSourceUrl(pdf, type);
        window.open(url, '_blank');
    }
}
</script>

<style scoped>
.aptCharts {
    height: var(--tile-content-height);
    overflow-y: auto;
    padding: 10px;
}

.charts-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.chart-button {
    width: 100%;
    text-align: left;
    font-size: 0.9rem;
    padding: 8px 12px;
}

.no-charts {
    text-align: center;
    color: #666;
    margin-top: 20px;
}
</style>
