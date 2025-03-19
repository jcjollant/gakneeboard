import { loadDemo, notesTitle, visitSkipBanner, replaceTile, TileTypeLabel, displaySelection, checkTileSpan, checkTileVisible, checkTileTitle, radioTitle } from './shared'

const labelBlank = "Blank"
const labelWORD = "W O R D"
const labelCompass = "Compass"
const labelGrid = "Grid"

function testWord(word) {
  const letters = word.split('')
  for(let index = 0; index < letters.length; index++) {
    cy.get('.letter' + index).contains(letters[index])
  }
}

describe('Notes Tile', () => {

  it('Notes Tile', () => {
    visitSkipBanner()
    loadDemo()

    checkTileTitle(0, 3, notesTitle)

    // Switch to Display mode selection
    displaySelection(0, 3)
    const expectedDisplayModes = [ labelBlank, labelWORD, labelCompass, labelGrid]
    for(const displayMode of expectedDisplayModes) {
      cy.get('.modesList').contains(displayMode)
    }

    cy.get(`[aria-label="${labelBlank}"]`).click()
    // Should be back to blank mode
    cy.get('.page0 > .tile3 > .stealth')
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        // console.log('>>>>', template)
        expect(template.data[0].data[3].data.mode === undefined).to.equal(true)
      })

    displaySelection(0, 3, labelWORD)
    cy.get('.modeWord .letterWatermark').contains('C')

    displaySelection(0, 3, labelCompass)
    cy.get('.page0 > .tile3 .modeCompass')
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        // console.log('>>>>', template)
        expect(template.data[0].data[3].data.mode).to.equal('compass')
      })

    displaySelection(0, 3, labelGrid)
    cy.get('.page0 > .tile3 .modeGrid')
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        // console.log('>>>>', template)
        expect(template.data[0].data[3].data.mode).to.equal('grid')
      })

    // Two notes side by side should merge when both are notes
    replaceTile(0,2,TileTypeLabel.notes)
    // 2 is blank, 3 is grid
    checkTileSpan(0,2,false)
    checkTileVisible(0,3, true)
    // Switch 3 back to blank
    displaySelection(0, 3, labelBlank)
    // now they should merge
    checkTileSpan(0, 2, true)
    checkTileVisible(0, 3, false)
    // Switch 2 to compass
    displaySelection(0, 2, labelCompass)
    // They should not merge
    checkTileSpan(0, 2, false)
    checkTileVisible(0, 3, true)

    replaceTile(0,2,TileTypeLabel.radios)
    checkTileSpan(0, 2, false)
    checkTileVisible(0, 3, true)
  })

  it('Merge Button', () => {
    visitSkipBanner()
    loadDemo()

    // First attempt with cancel
    displaySelection(0, 3)
    cy.get('.tile3 .expandable').click()
    cy.get('.p-confirm-dialog-reject').click()
    checkTileTitle(0,2,radioTitle)

    // second attempt with confirm
    displaySelection(0, 3)
    cy.get('.tile3 .expandable').click()
    cy.get('.p-confirm-dialog-accept').click()
    checkTileTitle(0,2,notesTitle)

    // confirm template has been saved with proper values
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        // console.log('>>>>', template)
        expect(template.data[0].data[2].name).to.equal('notes')
        expect(template.data[0].data[3].name).to.equal('notes')
      })
  })

  it('Can customize word', () => {
    visitSkipBanner()
    loadDemo()

    checkTileTitle(0, 3, notesTitle)

    // switch to WORD mode
    displaySelection(0, 3,  labelWORD)

    // test default is craft
    testWord('CRAFT')

    // Change word
    cy.get('.page0 .tile3 .letter0').click()
    cy.get('.p-inputtext').type('{selectAll}PTAC', {delay:0})
    // but don't apply
    cy.get('.p-button-link').click()
    // Should not modify
    testWord('CRAFT')

    // try again for real
    cy.get('.page0 .tile3 .letter0').click()
    cy.get('.p-inputtext').type('{selectAll}PTAC', {delay:0})
    cy.get('[aria-label="Apply"]').click()
    testWord('PTAC')

    // Make sure the value has been saved in the template
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        // console.log('>>>>', template)
        expect(template.data[0].data[3].data.mode).to.equal('word')
        expect(template.data[0].data[3].data.word).to.equal('PTAC')
      })
  })

  it('Can memorize compass', () => {
    visitSkipBanner()
    loadDemo()

    checkTileTitle(0, 3, notesTitle)

    // switch to compass mode
    displaySelection(0, 3,  labelCompass)

    // Make sure the value has been saved in the template
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        // console.log('>>>>', template)
        expect(template.data[0].data[3].data.mode).to.equal('compass')
        expect(template.data[0].data[3].data.comp).not.to.equal('false')
      })

    // change settings 
    cy.get('.modeCompass > .tileContent').click()
    cy.get('.miniSection').contains('Compass Mode')
    cy.get('.selected').contains('Heading')
    cy.get('.choiceEither').contains('Heading')
    cy.get('.choiceOr').contains('Hold')
    cy.get('.choiceOr').click()
    cy.get('.selected').contains('Hold')
    // cancel and come back
    cy.get('.p-button-link').click()
    cy.get('.modeCompass > .tileContent').click()
    // Headoign should still be selectied
    cy.get('.selected').contains('Heading')
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        // console.log('>>>>', template)
        expect(template.data[0].data[3].data.mode).to.equal('compass')
        expect(template.data[0].data[3].data.comp).not.to.equal('false')
      })
    // Now select Hold and 
    cy.get('.choiceOr').click()
    cy.get('[aria-label="Apply"]').click()
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        // console.log('>>>>', template)
        expect(template.data[0].data[3].data.mode).to.equal('compass')
        expect(template.data[0].data[3].data.comp).to.equal(false)
      })
  })

})