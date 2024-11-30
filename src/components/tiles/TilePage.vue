<template>
    <div class="tiles pageTiles">
        <Tile v-for="tile in tiles" :tile="tile" @update="onUpdate" @toast="onToast" />
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

import Tile from './Tile.vue'

const emits = defineEmits(['toast','update'])

// Props management
const props = defineProps({
    data: { type: Object, default: null},
})

function loadProps(props) {
  // console.log('[TilePage.loadProps]', typeof props.data, JSON.stringify(props.data))
  if(!props.data) return;
  // build tiles id
  for(let index=0; index < props.data.length; index++) {
    props.data[index].id = index
  }
  tiles.value = props.data
}

onMounted(() => {
    // console.log('Tile mounted')
    loadProps(props)
})

watch( props, async() => {
    // console.log("Airport props changed " + JSON.stringify(props));
    loadProps(props)
})

// end of props management

const tiles=ref()

function onToast(data) {
  emits('toast', data)
}

function onUpdate(newTileData) {
  const newPageData = tiles.value
  // update the correct tile
  newPageData[newTileData.id] = newTileData;
  emits('update', newPageData)
}

</script>

<style scoped>
.tiles {
  display: grid;
  grid-template-columns: auto auto;
  gap: 1px 2px;
}
</style>