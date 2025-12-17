<template>
    <div class="tiles pageTiles" :class="{'fullpage': isFullPage}">
        <Tile v-for="(tile,index) in tiles" v-show="!tile.hide" 
          :tile="tile" :class="[{'span-2':tile.span2},`tile${index}`]" 
          @update="onUpdate(index,$event)" 
          @settings="onSettingsOpen(index, $event)"/>
        
        <TileSettings v-if="editingTileIndex >= 0 && editingTileData" 
            :tile="editingTileData" 
            :canApply="true"
            :index="editingTileIndex"
            :help="tileLinks?.help"
            :video="tileLinks?.video"
             @close="onSettingsClose" @apply="onSettingsApply">
            <component :is="settingsComponent" 
                :tileData="editingTileData" 
                @update="onSettingsUpdate" />
        </TileSettings>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, shallowRef } from 'vue'
import { useConfirm } from "primevue/useconfirm";
import { TileData } from '../../models/TileData';
import { TileType } from '../../models/TileType';
import { TemplateFormat } from '../../models/TemplateFormat';

import Tile from './Tile.vue'
import TileSettings from './TileSettings.vue';
import AirportTileSettings from '../airport/AirportTileSettings.vue';
import { UserUrl } from '../../lib/UserUrl';

const confirm = useConfirm()
const emits = defineEmits(['update'])
const props = defineProps({
    data: { type: Object, default: null},
    format: { type: String, default: TemplateFormat.Kneeboard },
})

const isFullPage = computed(() => props.format === TemplateFormat.FullPage)
const totalTiles = computed(() => isFullPage.value ? 12 : 6)
const tiles=ref<TileData[]>([])

// Settings State
const editingTileIndex = ref(-1);
const editingTileData = ref<TileData | null>(null);

// this is how we pick the correct content
const settingsComponent = computed(() => {
  if (!editingTileData.value) return null;
  switch (editingTileData.value.name) {
    case TileType.airport:
      return AirportTileSettings;
    // add other cases here
    default:
      return null;
  }
});

function loadProps(props:any) {
  // console.log('[TilePage.loadProps]', typeof props.data, JSON.stringify(props.data))
  if(!props.data || !Object.keys(props.data).length) { // we need to prime the tiles
      // console.log('[TilePage.loadProps] no data')

      let newData:TileData[] = []
      // create empty tiles based on format (6 for kneeboard, 12 for full page)
      const emptyTile:TileData = {name:'',data:{},span2:false,hide:false}
      for(let index = 0; index < totalTiles.value; index++) {
          newData.push(emptyTile)
      }
      tiles.value = newData;
      // console.log('[TilePage.loadProps]', JSON.stringify(tiles.value))
  } else { // we have usable data
    // Copy existing data
    const tileData = props.data.map(TileData.copy);
    
    // If format is full page but we have fewer than 12 tiles, add empty tiles
    if (isFullPage.value && tileData.length < totalTiles.value) {
      const emptyTile:TileData = {name:'',data:{},span2:false,hide:false};
      for (let i = tileData.length; i < totalTiles.value; i++) {
        tileData.push(emptyTile);
      }
    }
    
    tiles.value = tileData;
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

// Some tile config has changed
function onUpdate(index:number, newTileData:TileData) {
  // console.debug('[TilePage.onUpdate]', index, newTileData)
  // update the correct tile
  tiles.value[index] = newTileData;

  // resolveMergedTiles()
  emits('update', tiles.value)
}

function onSettingsOpen(index: number, tileData: TileData) {
  editingTileIndex.value = index;
  editingTileData.value = TileData.copy(tileData); // Working copy
}

function onSettingsClose() {
  editingTileIndex.value = -1;
  editingTileData.value = null;
}

function onSettingsUpdate(newConfig: any) {
  // this comes from the child component inside the overlay
  editingTileData.value = newConfig;
}

// Help URL Centralized Logic
const tileUrls: Record<string, { help?: string, video?: string }> = {
    [TileType.airport]: {
        help: UserUrl.airportTileGuide,
        video: UserUrl.airportTileVideo
    },
}

const tileLinks = computed(() => {
  // console.debug('[TilePage.tileLinks]', editingTileData.value)
  if (!editingTileData.value) return undefined;
  return tileUrls[editingTileData.value.name];
});

function onSettingsApply(newTileData: TileData) {
  // console.debug('[TilePage.onSettingsApply]', editingTileIndex.value, editingTileData.value)
  if(editingTileIndex.value >= 0) {
    onUpdate(editingTileIndex.value, newTileData);
  }
  onSettingsClose();
}

function resolveMergedTiles() {
  // console.debug('[TilePage.resolveMergedTiles]', tiles.value)
  // apply spanned tile processing

  // Do not merge full page tiles
  if( isFullPage.value) {
    // Reset all span and hide flags
    for (const tile of tiles.value) {
      tile.span2 = false;
      tile.hide = false;
    }
    return;
  }

  for(const row of [0,1,2]) {
    const left = row * 2
    const right = left + 1
    if( tiles.value[left].span2) {
      tiles.value[left].hide = false
      tiles.value[right].span2 = false
      tiles.value[right].hide = true
    } else if(tiles.value[right].span2) {
      tiles.value[right].hide = false
      tiles.value[left].span2 = false
      tiles.value[left].hide = true
    } else { // neither is spanned, so show both
      tiles.value[left].hide = false
      tiles.value[right].hide = false
    }
  }
}

</script>

<style scoped>
.tiles {
  display: grid;
  grid-template-columns: auto auto;
  gap: 1px 2px;
}

.tiles.fullpage {
  grid-template-columns: auto auto auto;
}

.span-2 {
  grid-column: span 2;
  width: var(--tile-width-expanded);
}

.fullpage .span-2 {
  width: calc(var(--tile-width) * 2 + 2px); /* Two tile widths plus gap */
}
</style>
