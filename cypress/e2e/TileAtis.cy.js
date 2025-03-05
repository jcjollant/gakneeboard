import { titleAtis, visitSkipBanner, loadDemo, TileTypeLabel, displaySelection, replaceTile, checkTileSpan, checkTileVisible, checkTileTitle, departTitle, atisTitle } from './shared'

const labelFullATIS = "Full Size ATIS"
const labelCloudCleance = "Cloud Clearance"
const labelCompact = "Compact ATIS (x4)"

describe('ATIS Tile', () => {
  it('ATIS Tile', () => {
    visitSkipBanner()
    loadDemo()

    // check header
    cy.get('.page0 .tile4 > .headerTitle > div').contains(titleAtis)

    // Check ATIS has all fields in full mode
    cy.get('.info').contains('Info')
    cy.get('.wind').contains('Wind')
    cy.get('.runway').contains('Rwy')
    cy.get('.visibility').contains('Vis')
    cy.get('.sky').contains('Sky')
    cy.get('.temperature').contains('Temp')
    cy.get('.altimeter').contains('Alt')

    // Edit mode
    cy.get('.page0 .tile4 > .headerTitle > .displayButton').click({force: true})

    // Check all display modes are showing up
    cy.get(`[aria-label="${labelFullATIS}"]`)
    cy.get(`[aria-label="${labelCompact}"]`)
    cy.get('[aria-label="Flight Categories"]')
    cy.get(`[aria-label="${labelCloudCleance}"]`)
    
    // Check ATIS has all fields in compact mode
    cy.get('[aria-label="Compact ATIS (x4)"]').click()
    for(let index=1; index <=4; index++) {
      cy.get(`:nth-child(${index}) > .info`).contains('Info')
      cy.get(`:nth-child(${index}) > .wind`).contains('Wind')
      cy.get(`:nth-child(${index}) > .altimeter`).contains('Alt')
      cy.get(`:nth-child(${index}) > .runway`).contains('Rwy')
  
    }

    // Flight Categories
    cy.get('.page0 .tile4 > .headerTitle > .displayButton').click({force: true})
    cy.get('[aria-label="Flight Categories"]').click()
    const expectedCategories = ['LIFR','IFR','MVFR','VFR','3,000ft','1,000ft','500ft','1sm','3sm','5sm']
    // const tile4 = cy.get('.page0 .tile4')
    for(let index=0; index < expectedCategories.length; index++) {
      cy.get('.page0 .tile4').contains(expectedCategories[index])
    }

    // Cloud Clearance
    displaySelection(0,4,labelCloudCleance)
    const expectedClearances = ['3:cc','3:152','5:111','1:152','1:cc','SVFR','3 sm','1,000ft','2,000ft','500ft','10k MSL','1k2 AGL']
    // const tile4 = cy.get('.page0 .tile4')
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
    displaySelection(0, 5, labelCloudCleance)


    // Switch both to full, starting witg 4
    displaySelection(0, 4, labelFullATIS)
    displaySelection(0, 5, labelFullATIS)
    // now they should merge
    checkTileSpan(0, 4, true)
    checkTileVisible(0, 5, false)

    // Switch both to Compact
    displaySelection(0, 4, labelCompact)
    displaySelection(0, 5, labelCompact)
    // They should not merge
    checkTileSpan(0, 4, false)
    checkTileVisible(0, 5, true)

    // Switch both to full, starting witg 5
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

  it('Merge Button', () => {
    visitSkipBanner()
    loadDemo()

    // First attempt with cancel
    displaySelection(0, 4)
    cy.get('.tile4 .expandable').click()
    cy.get('.p-confirm-dialog-reject').click()
    checkTileTitle(0,5,departTitle)

    // second attempt with confirm
    displaySelection(0, 4)
    cy.get('.tile4 .expandable').click()
    cy.get('.p-confirm-dialog-accept').click()
    checkTileTitle(0,5,atisTitle)

    // confirm template has been saved with proper values
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        // console.log('>>>>', template)
        expect(template.data[0].data[4].name).to.equal('atis')
        expect(template.data[0].data[5].name).to.equal('atis')
      })
  })
})