import { AtisTileDisplayModeLabels } from '../../../src/components/atis/AtisTileDisplayModeLabel'
import { TileTypeLabel, checkTileSpan, checkTileVisible, checkTileTitle, displaySelection, displaySelectionExpand, replaceTile, loadDemo, visitSkipBanner } from '../shared.js'
import { loadTestTile, displaySelectionTestTile, displayModesCheck} from '../shared.js'

const titlWeatherAt = "Weather @"
const titleDisplayMode = "Weather Tile Mode"
const titleFlightCategories = "Flight Categories"
const titleCloudClearance = "Cloud Clearance"
const departTitle = "Depart"
const atisTitle = "Weather"

const labelFullATIS = AtisTileDisplayModeLabels.fullATIS
const labelCompact = AtisTileDisplayModeLabels.compactATIS
const labelCategories = AtisTileDisplayModeLabels.categories
const labelCloudClearance = AtisTileDisplayModeLabels.cloudClearance

describe('ATIS Tile', () => {

  it('should contain all display modes', () => {
    loadTestTile(TileTypeLabel.atis)

    displaySelectionTestTile()
    const expectedDisplayModes = [ AtisTileDisplayModeLabels.fullATIS, AtisTileDisplayModeLabels.compactATIS, AtisTileDisplayModeLabels.categories, AtisTileDisplayModeLabels.cloudClearance]
    displayModesCheck(expectedDisplayModes, true)
  })

  it('Should Start Simple Mode', () => {
    loadTestTile(TileTypeLabel.atis)
    cy.get('.headerTitle').contains(titlWeatherAt)

    const expectedFields = [
      {class:'.info', label:'Info'},
      {class:'.wind', label:'Wind'},
      {class:'.wind > .clear', label:'Calm'},
      {class:'.wind > .gust', label:'G'},
      {class:'.wind > .wtrmrk', label:'Vrb'},
      {class:'.wind > .at', label:'@'},
      {class:'.runway', label:'Rwy'},
      {class:'.visibility', label:'Vis'},
      {class:'.visibility > .clear', label:'10+'},
      {class:'.visibility > .wtrmrk', label:'Ra'},
      {class:'.visibility > .wtrmrk', label:'Fg'},
      {class:'.visibility > .wtrmrk', label:'Br'},
      {class:'.sky', label:'Sky'},
      {class:'.sky > .clear', label:'CLR'},
      {class:'.sky > .wtrmrk', label:'Fw'},
      {class:'.sky > .wtrmrk', label:'Sc'},
      {class:'.sky > .wtrmrk', label:'Bk'},
      {class:'.sky > .wtrmrk', label:'Ov'},
      {class:'.temperature', label:'T°/DP'},
      {class:'.altimeter', label:'Alt'},
      {class:'.altimeter > .wtrmrk', label:'28'},
      {class:'.altimeter > .wtrmrk', label:'29'},
      {class:'.altimeter > .wtrmrk', label:'30'},
    ]

    for(const field of expectedFields) {
      cy.get(`${field.class}`).contains(field.label)
    }

  })


  it.skip('Weather Tile', () => {
    visitSkipBanner()
    loadDemo()

    // check header
    cy.get('.page0 .tile4 > .headerTitle > div').contains(titlWeatherAt)

    // Check ATIS has all fields in full mode
    cy.get('.info').contains('Info')
    cy.get('.wind').contains('Wind')
    cy.get('.runway').contains('Rwy')
    cy.get('.visibility').contains('Vis')
    cy.get('.sky').contains('Sky')
    cy.get('.temperature').contains('T°/DP')
    cy.get('.altimeter').contains('Alt')

    // Edit mode
    cy.get('.page0 .tile4 > .headerTitle > .displayButton').click({force: true})

    // Check all display modes are showing up
    cy.get(`[aria-label="${labelFullATIS}"]`)
    cy.get(`[aria-label="${labelCompact}"]`)
    cy.get(`[aria-label="${labelCategories}"]`)
    cy.get(`[aria-label="${labelCloudClearance}"]`)
    
    // Check ATIS has all fields in compact mode
    cy.get(`[aria-label="${labelCompact}"]`).click()
    for(let index=1; index <=4; index++) {
      cy.get(`:nth-child(${index}) > .info`).contains('Info')
      cy.get(`:nth-child(${index}) > .wind`).contains('Wind')
      cy.get(`:nth-child(${index}) > .altimeter`).contains('Alt')
      cy.get(`:nth-child(${index}) > .runway`).contains('Rwy')
    }

    // Flight Categories
    cy.get('.page0 .tile4 > .headerTitle > .displayButton').click({force: true})
    cy.get(`[aria-label="${labelCategories}"]`).click()
    const expectedCategories = ['LIFR','IFR','MVFR','VFR','3,000ft','1,000ft','500ft','1sm','3sm','5sm']
    for(let index=0; index < expectedCategories.length; index++) {
      cy.get('.page0 .tile4').contains(expectedCategories[index])
    }

    // Cloud Clearance
    displaySelection(0,4,labelCloudClearance)
    const expectedClearances = ['3:cc','3:152','5:111','1:152','1:cc','SVFR','3 sm','1,000ft','2,000ft','500ft','10k MSL','1k2 AGL']
    for(let index=0; index < expectedClearances.length; index++) {
      cy.get('.page0 .tile4').contains(expectedClearances[index])
    }
    const expectedFontSize = '12.8px' // 0.8 * 16
    const testFontSize = ['.left', '.right', '.above', '.below']
    for(let test of testFontSize) {
      cy.get(`.classCDLow ${test}`).should('have.css', 'font-size', expectedFontSize)
    }  

    // Two Full ATIS side by side should merge when both are Full
    replaceTile(0,5,TileTypeLabel.atis)
    // 4 is cloud clearance, 5 is Full. They should not merge
    checkTileSpan(0, 4, false)
    checkTileVisible(0, 5, true)
    displaySelection(0, 5, labelCloudClearance)

    // Switch both to full, starting with 4
    displaySelection(0, 4, labelFullATIS)
    displaySelection(0, 5, labelFullATIS)
    // now they should merge
    checkTileSpan(0, 4, true)
    checkTileVisible(0, 5, false)

    // Check expanded mode watermarks
    const expectedSkyExContent = ['Fw', 'Sc', 'Bk', 'Ov', 'CLR']
    for(let skyExContent of expectedSkyExContent) {
      cy.get('.skyEx').contains(skyExContent)
    }

    // Switch both to Compact
    displaySelection(0, 4, labelCompact)
    displaySelection(0, 5, labelCompact)
    // They should not merge
    checkTileSpan(0, 4, false)
    checkTileVisible(0, 5, true)

    // Switch both to full, starting with 5
    displaySelection(0, 5, labelFullATIS)
    displaySelection(0, 4, labelFullATIS)
    // now they should merge
    checkTileSpan(0, 4, true)
    checkTileVisible(0, 5, false)

    // Replace tile 5 with radios => Should not merge
    replaceTile(0,4,TileTypeLabel.radios)
    checkTileSpan(0, 4, false)
    checkTileVisible(0, 5, true)
  })

  it.skip('Merge Button', () => {
    visitSkipBanner()
    loadDemo()

    // First attempt with cancel
    displaySelectionExpand(0, 4, 0, false)
    checkTileTitle(0,5,departTitle)

    // second attempt with confirm
    displaySelectionExpand(0,4,0)
    checkTileTitle(0,5,atisTitle)

    // confirm template has been saved with proper values
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t!)
        expect(template.data[0].data[4].name).to.equal('atis')
        expect(template.data[0].data[5].name).to.equal('atis')
      })
    
    // revert to compact
    displaySelection(0,4,labelCompact)
    checkTileSpan(0, 4, false)
    // merge Flight categories
    displaySelectionExpand(0, 4, 2)
    checkTileSpan(0, 4, true)
    // revert to compact
    displaySelection(0,4,labelCompact)
    checkTileSpan(0, 4, false)
    // merge cloud clearance
    displaySelectionExpand(0, 4, 3)
    checkTileSpan(0, 4, true)
  })
})