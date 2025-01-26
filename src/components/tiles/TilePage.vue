<template>
    <div class="tiles pageTiles">
        <Tile v-for="(tile,index) in tiles" v-show="!tile.hide" 
          :tile="tile" :class="[{'span-2':tile.span2},`tile${index}`]" 
          @update="onUpdate" />
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { isBlankNote } from '../../assets/sheetData'

import Tile from './Tile.vue'

const emits = defineEmits(['update'])

// Props management
const props = defineProps({
    data: { type: Object, default: null},
})

function loadProps(props) {
  // console.log('[TilePage.loadProps]', typeof props.data, JSON.stringify(props.data))
  if(!props.data || !Object.keys(props.data).length) { // we need to prime the tiles
      // console.log('[TilePage.loadProps] no data')

      let newData = []
      // create 6 empty tiles
      for(let index = 0; index<6; index++) {
          newData.push({id:index,name:'',data:{}})
      }
      tiles.value = newData;
      // console.log('[TilePage.loadProps]', JSON.stringify(tiles.value))
  } else { // we have usable data
    // build tiles id
    for(let index=0; index < props.data.length; index++) {
      props.data[index].id = index
    }
    tiles.value = props.data
  }

  // apply spanned tile processing
  for( const index of [0,2,4]) {
    // we merge two tiles if they are side by side and are blanks notes tiles
    const leftTile = tiles.value[index];
    const rightTile = tiles.value[index+1];
    if(isBlankNote(leftTile) && isBlankNote(rightTile)) {
      tiles.value[index]['span2'] = true
      tiles.value[index + 1]['hide'] = true
    } else { 
      // force next tile hide to false so during tile selection, the next tile is displayed event if it was hidden before the selection
      tiles.value[index + 1]['hide'] = false
    }
  }
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

function onUpdate(newTileData) {
  // console.log('[TilePage.onUpdate]', newTileData)
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
.span-2 {
  grid-column: span 2;
  width: unset;
}
</style>