<template>
    <div class="ticket-manager">
        <h2>Manage Tickets</h2>
        <div class="input-group">
            <button @click="fetchTickets" :disabled="loadingTickets">{{ loadingTickets ? 'Loading...' : 'Fetch Open Tickets' }}</button>
        </div>
        
        <div v-if="tickets.length > 0" class="tickets-list">
            <h3>Open Tickets ({{ tickets.length }})</h3>
            <div class="ticket-cards">
                <div v-for="ticket in tickets" :key="ticket.id" class="ticket-item">
                    <div class="ticket-header">
                        <span class="ticket-id">#{{ ticket.id }}</span>
                        <span class="ticket-severity" :class="'severity-' + ticket.severity">Severity: {{ ticket.severity }}</span>
                        <button @click="closeTicket(ticket.id)" class="close-btn">Close</button>
                    </div>
                    <div class="ticket-time">{{ new Date(ticket.createTime).toLocaleString() }}</div>
                    <div class="ticket-message">{{ ticket.message }}</div>
                </div>
            </div>
        </div>
        <div v-else-if="ticketsLoaded" class="success-message">
            <h3>No Open Tickets</h3>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { currentUser } from '../../assets/data'
import { UrlService } from '../../services/UrlService'
import { useToaster } from '../../assets/Toaster'
import { useToast } from 'primevue/usetoast'

const toaster = useToaster(useToast())
const tickets = ref<any[]>([])
const loadingTickets = ref(false)
const ticketsLoaded = ref(false)

function fetchTickets() {
    if (loadingTickets.value) return
    loadingTickets.value = true
    tickets.value = []
    ticketsLoaded.value = false
    
    currentUser.getUrl(UrlService.root + 'tickets').then(res => {
        tickets.value = res.data
        loadingTickets.value = false
        ticketsLoaded.value = true
    }).catch((err: any) => {
        toaster.error('Failed to fetch tickets', err.message)
        loadingTickets.value = false
    })
}

function closeTicket(id: number) {
    if (!confirm('Are you sure you want to close ticket #' + id + '?')) return
    
    currentUser.postUrl(UrlService.root + 'tickets/' + id + '/close', {}).then(() => {
        toaster.success('Ticket Closed', 'Ticket #' + id + ' has been closed')
        // Remove from list
        tickets.value = tickets.value.filter(t => t.id !== id)
    }).catch((err: any) => {
        toaster.error('Failed to close ticket', err.message)
    })
}
</script>

<style scoped>
.ticket-manager {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.ticket-manager h2 {
    margin-top: 0;
    color: #2c3e50;
}

.input-group {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.input-group button {
    padding: 0.75rem 1.5rem;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.3s ease;
}

.input-group button:hover {
    background: #2980b9;
}

.input-group button:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
}

.success-message {
    background-color: #dcfce7;
    border: 1px solid #22c55e;
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 1rem;
    margin-top: 1rem;
}

.success-message h3 {
    color: #15803d;
    margin: 0;
}

.tickets-list {
    margin-top: 2rem;
}

.ticket-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    width: 100%;
}

.ticket-item {
    background: white;
    border: 1px solid #e1e8ed;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    flex: 1 1 250px;
    max-width: 100%;
}

.ticket-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.ticket-id {
    font-weight: bold;
    color: #2c3e50;
    margin-right: 1rem;
}

.ticket-severity {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 500;
}

.severity-1 { background-color: #fee2e2; color: #b91c1c; }
.severity-2 { background-color: #ffedd5; color: #c2410c; }
.severity-3 { background-color: #fef3c7; color: #b45309; }
.severity-4 { background-color: #e0f2fe; color: #0369a1; }
.severity-5 { background-color: #f1f5f9; color: #64748b; }

.ticket-time {
    color: #7f8c8d;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
}

.ticket-message {
    color: #2c3e50;
    line-height: 1.5;
}

.close-btn {
    padding: 0.4rem 0.8rem;
    background-color: #ef4444;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: background 0.2s;
}

.close-btn:hover {
    background-color: #dc2626;
}
</style>
