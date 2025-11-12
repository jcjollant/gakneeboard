<template>
  <div class="tile-test-container">
    <div class="tile-wrapper">
      <Tile :tile="testTile" @update="onTileUpdate" />
    </div>
    <div class="controls">
      <button @click="clearTile" class="clear-btn">Clear</button>
      <button @click="copyToClipboard" class="copy-btn">Copy Tile Data</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { TileData } from '../model/TileData'
import { TileType } from '../model/TileType'
import Tile from '../components/tiles/Tile.vue'
import { useToaster } from '../assets/Toaster'
import { useToast } from 'primevue/usetoast'

const testTile = ref<TileData>(new TileData(TileType.selection))
const toaster = useToaster(useToast())

onMounted(() => {
  loadTileFromStorage()
})

function loadTileFromStorage() {
  const storedTile = localStorage.getItem('test-tile')
  // console.debug('[TileTest.loadTileFromStorage] ', storedTile)
  if (storedTile) {
    try {
      const tileData = JSON.parse(storedTile)
      testTile.value = TileData.copy(tileData)
    } catch (error) {
      console.error('Failed to parse stored tile data:', error)
      testTile.value = new TileData(TileType.selection)
    }
  } else {
    testTile.value = new TileData(TileType.selection)
  }
}

function onTileUpdate(newTileData: TileData) {
  testTile.value = newTileData
  saveTile()
}

function saveTile() {
  localStorage.setItem('test-tile', JSON.stringify(testTile.value))
}

function clearTile() {
  localStorage.removeItem('test-tile')
  testTile.value = new TileData(TileType.selection)
}

function copyToClipboard() {
  navigator.clipboard.writeText(JSON.stringify(testTile.value, null, 2))
  toaster.success('Copied', 'Tile data copied to clipboard')
}
</script>

<style scoped>
.tile-test-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: var(--background-color, #f5f5f5);
}

.tile-wrapper {
  margin-bottom: 20px;
}

.controls {
  display: flex;
  gap: 10px;
}

.clear-btn, .copy-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.clear-btn {
  background-color: #f44336;
  color: white;
}

.clear-btn:hover {
  background-color: #da190b;
}

.copy-btn {
  background-color: #FF9800;
  color: white;
}

.copy-btn:hover {
  background-color: #F57C00;
}
</style>