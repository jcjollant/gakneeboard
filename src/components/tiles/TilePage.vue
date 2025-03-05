<template>
    <div class="tiles pageTiles">
        <Tile v-for="(tile,index) in tiles" v-show="!tile.hide" 
          :tile="tile" :class="[{'span-2':tile.span2},`tile${index}`]" 
          @update="onUpdate" @expand="onExpand(index, $event)" />
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { isSameAirportAndRunway, isSameTypeAndMode } from '../../assets/sheetData'
import { TileType } from '../../model/TileType'
import { DisplayModeAtis, DisplayModeNotes, DisplayModeRadios } from '../../model/DisplayMode'
import { useConfirm } from "primevue/useconfirm";

import Tile from './Tile.vue'

const confirm = useConfirm()
const emits = defineEmits(['update'])
const props = defineProps({
    data: { type: Object, default: null},
})
const tiles=ref([])

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
    if(isSameTypeAndMode(leftTile, rightTile, TileType.notes, DisplayModeNotes.Blank) 
      || isSameTypeAndMode(leftTile, rightTile, TileType.atis, DisplayModeAtis.FullATIS)
      || isSameTypeAndMode(leftTile, rightTile, TileType.radios, DisplayModeRadios.FreqList)
      || isSameAirportAndRunway(leftTile, rightTile)
      ) {
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


function onExpand(index) {
  // console.log('[TilePage.onExpand]', index)
  const message = "This will overwrite tile to the " + ((index % 2) ? 'left' : 'right');
  confirm.require({
      message: message,
      header: "Replace Tile",
      rejectLabel: 'Do Not Replace',
      acceptLabel: 'Yes, Replace',
      accept: () => {
        // console.log('[TilePage.onExpand] Replace')
        const to = (index % 2) ? index - 1 : index + 1;
        const from = JSON.parse( JSON.stringify(tiles.value[index]))
        tiles.value[to] = from;
        emits('update', tiles.value)
      }
    })
}

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
  width: var(--tile-width-expanded);
}
</style>