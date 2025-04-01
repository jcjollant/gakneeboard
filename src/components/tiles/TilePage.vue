<template>
    <div class="tiles pageTiles">
        <Tile v-for="(tile,index) in tiles" v-show="!tile.hide" 
          :tile="tile" :class="[{'span-2':tile.span2},`tile${index}`]" 
          @update="onUpdate(index,$event)" @expand="onExpand(index, $event)" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { TileType } from '../../model/TileType'
import { DisplayModeAirport, DisplayModeAtis, DisplayModeNotes, DisplayModeRadios } from '../../model/DisplayMode'
import { useConfirm } from "primevue/useconfirm";
import { TileData } from '../../model/TileData';

import Tile from './Tile.vue'

const confirm = useConfirm()
const emits = defineEmits(['update'])
const props = defineProps({
    data: { type: Object, default: null},
})
const tiles=ref<TileData[]>([])
const debouncedMerge = debounce(resolveMergedTiles)


function loadProps(props:any) {
  // console.log('[TilePage.loadProps]', typeof props.data, JSON.stringify(props.data))
  if(!props.data || !Object.keys(props.data).length) { // we need to prime the tiles
      // console.log('[TilePage.loadProps] no data')

      let newData:TileData[] = []
      // create 6 empty tiles
      const emptyTile:TileData = {name:'',data:{},span2:false,hide:false}
      for(let index = 0; index<6; index++) {
          newData.push(emptyTile)
      }
      tiles.value = newData;
      // console.log('[TilePage.loadProps]', JSON.stringify(tiles.value))
  } else { // we have usable data
    tiles.value = props.data.map( TileData.copy)
  }
  // console.log('[TilePage.loadProps] tiles', tiles.value)
  resolveMergedTiles()
}

onMounted(() => {
    // console.log('Tile mounted')
    loadProps(props)
})

watch( props, async() => {
    // console.log("[TilePage.watch]" + JSON.stringify(props));
    loadProps(props)
})

// end of props management


/**
 * Creates a debounced function that delays invoking the provided function
 * until after 500ms have elapsed since the last time it was invoked.
 */
 function debounce(func: Function): Function {
  // console.log('[TilePage.debounce]', func)
  let timeout: NodeJS.Timeout | undefined = undefined;
  
  return function(...args: any[]): void {
    if (timeout) {
      // console.log('[TilePage.debounce] clear timeout')
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, 1000);
  };
}

function onExpand(index:number, newTileData:TileData) {
  // console.log('[TilePage.onExpand]', index)
  const rightTile = index % 2
  tiles.value[index] = newTileData;

  const message = "This will overwrite tile to the " + (rightTile ? 'left' : 'right');
  confirm.require({
      message: message,
      header: "Replace Tile",
      rejectLabel: 'Do Not Replace',
      acceptLabel: 'Yes, Replace',
      accept: () => {
        // console.log('[TilePage.onExpand] Replace')
        // Which index is receiving the information?
        const to = rightTile ? index - 1 : index + 1;
        const copy = new TileData(newTileData.name, newTileData.data)
        tiles.value[to] = copy;
        // console.log('[TilePage.onExpand] copy from', tiles.value[index])
        // console.log('[TilePage.onExpand] copy   to', tiles.value[to])
        resolveMergedTiles()
        emits('update', tiles.value)
      }
    })
}

function onUpdate(index:number, newTileData:TileData) {
  // console.log('[TilePage.onUpdate]', index, newTileData)
  // update the correct tile
  tiles.value[index] = newTileData;
  resolveMergedTiles()
  emits('update', tiles.value)
}

function resolveMergedTiles() {
  // console.log('[TilePage.resolveMergedTiles]', tiles.value)
  // apply spanned tile processing
  for( const index of [0,2,4]) {
    // we merge two tiles if they are side by side and are blanks notes tiles
    const leftTile = tiles.value[index];
    const rightTile = tiles.value[index+1];
    let shouldMerge = leftTile.name == rightTile.name
    // console.log('[TilePage.resolveMergedTiles]', leftTile.name, rightTile.name)
    if( shouldMerge) {
      if(leftTile.name == TileType.notes) {
        shouldMerge = resolveModeMatch(leftTile, rightTile, DisplayModeNotes.Blank)
      } else if( leftTile.name == TileType.atis) {
        // console.log('[TilePage.resolveMergedTiles]', leftTile, rightTile)
        const modeMatch = resolveModeMatch(leftTile, rightTile, DisplayModeAtis.FullATIS)
        shouldMerge = modeMatch && leftTile.data['mode'] != DisplayModeAtis.CompactATIS;
      } else if( leftTile.name == TileType.radios) {
        shouldMerge = resolveModeMatch(leftTile, rightTile, DisplayModeRadios.FreqList)
      } else if( leftTile.name == TileType.airport) {
        if(resolveModeMatch(leftTile, rightTile, DisplayModeAirport.OneRunway)) {
          const codeMatch = leftTile.data['code'] == rightTile.data['code']
          const leftMode = leftTile.data['mode']
          if(!leftMode || leftMode == DisplayModeAirport.OneRunway) {
            // one runway we need code and runway to match
            shouldMerge = codeMatch && leftTile.data['rwy'] == rightTile.data['rwy']
          } else { // other modes, we just need code
            shouldMerge = codeMatch
          }
        } else {
          shouldMerge = false
        }
      } else {
        shouldMerge = false
      }
    }

    // console.log('[TilePage.resolveMergedTiles]', index, shouldMerge)
    tiles.value[index].span2 = shouldMerge
    tiles.value[index + 1].hide = shouldMerge
  }
}

function resolveModeMatch(leftTile:TileData, rightTile:TileData, defaultMode:string) {
  const leftMode = leftTile.data && leftTile.data['mode'] ? leftTile.data['mode'] : defaultMode
  const rightMode = rightTile.data && rightTile.data['mode'] ? rightTile.data['mode'] : defaultMode
  return (leftMode == rightMode)
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