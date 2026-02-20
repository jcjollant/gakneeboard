<template>
    <div class="aptCharts">
        <div class="charts-list">
            <!-- AIRPORT SECTION -->
            <div v-if="airport?.diagram || airport?.notice || airport?.supp" class="chart-category">
                <div class="category-header">AIRPORT</div>
                <div class="chart-row-horizontal">
                    <div v-if="airport?.diagram" class="chart-link" @click="openChart(airport.diagram)">
                        <i class="pi pi-map"></i>
                        <span class="chart-name">Diag</span>
                    </div>
                    <div v-if="airport?.notice" class="chart-link" @click="openChart(airport.notice, ChartType.Notice)">
                        <i class="pi pi-info-circle"></i>
                        <span class="chart-name">Info</span>
                    </div>
                    <div v-if="airport?.supp" class="chart-link" @click="openChart(airport.supp, ChartType.Supplement)">
                        <i class="pi pi-plus"></i>
                        <span class="chart-name">Supp</span>
                    </div>
                </div>
            </div>

            <!-- DEPARTURES SECTION -->
            <div v-if="airport?.dep?.length" class="chart-category">
                <div class="category-header">DEPARTURES</div>
                <div v-for="chart in airport.dep" :key="chart.pdf" class="chart-row" @click="openChart(chart.pdf)">
                    <i class="pi pi-file-pdf"></i>
                    <span class="chart-name">{{ chart.name }}</span>
                </div>
            </div>

            <!-- APPROACHES SECTION -->
            <div v-if="airport?.iap?.length" class="chart-category">
                <div class="category-header">APPROACHES</div>
                <div v-for="chart in airport.iap" :key="chart.pdf" class="chart-row" @click="openChart(chart.pdf)">
                    <i class="pi pi-file-pdf"></i>
                    <span class="chart-name">{{ chart.name }}</span>
                </div>
            </div>

            <div v-if="!airport?.diagram && !airport?.notice && !airport?.iap?.length && !airport?.dep?.length" class="no-charts">
                No charts available
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { Airport } from '../../models/Airport';
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
    background-color: var(--bg-color-secondary, #f8f9fa);
}

.charts-list {
    display: flex;
    flex-direction: column;
    padding-bottom: 20px;
}

.chart-category {
    margin-bottom: 4px;
}

.category-header {
    font-size: 0.65rem;
    font-weight: 800;
    color: var(--text-color-secondary, #666);
    padding: 6px 10px 2px 10px;
    letter-spacing: 0.05rem;
    background-color: var(--bg-color-tertiary, #eee);
}

.chart-row, .chart-row-horizontal {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    border-bottom: 1px solid var(--border-color, #ddd);
    background-color: var(--bg-color, #fff);
    transition: background-color 0.1s;
}

.chart-row-horizontal {
    padding: 0;
    gap: 0;
}

.chart-link {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 4px;
    border-right: 1px solid var(--border-color, #ddd);
}

.chart-link:last-child {
    border-right: none;
}

.chart-row:hover, .chart-link:hover {
    background-color: var(--bg-color-hover, #f0f0f0);
}

.chart-row i, .chart-link i {
    font-size: 0.85rem;
    color: var(--primary-color, #007bff);
    flex-shrink: 0;
}

.chart-name {
    font-size: 0.8rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.no-charts {
    text-align: center;
    color: #999;
    padding: 40px 10px;
    font-style: italic;
    font-size: 0.9rem;
}
</style>
