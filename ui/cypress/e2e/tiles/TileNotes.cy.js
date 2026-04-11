import { checkTestPageTileTitle, loadTestPage, notesTitle, PageTypeLabel } from '../shared'

const labelBlank = "Blank"
const labelWORD = "W O R D"
const labelCompass = "Compass"
const labelGrid = "Grid"

function testWord(word) {
  const letters = word.split('')
  for (let index = 0; index < letters.length; index++) {
    cy.get('.letter' + index).contains(letters[index])
  }
}

const notesTilesData = [
  { name: 'notes', data: {} },
  { name: 'notes', data: { mode: "blank" } },
  { name: 'notes', data: { mode: 'blank', word: 'CRAFT' } },
  { name: 'notes', data: { mode: 'blank', word: 'RAFT' } },
  { name: 'notes', data: { mode: 'compass' } },
  { name: 'notes', data: { mode: 'hold' } },
  { name: 'notes', data: { mode: 'grid' } },
  { name: 'notes', data: { mode: 'compass', comp: false } },
]

function loadNotesTestPage() {
  loadTestPage(PageTypeLabel.tiles, notesTilesData)
}


describe('Notes Tile', () => {

  it('Loads Notes Tiles with various display modes', () => {
    loadNotesTestPage()

    checkTestPageTileTitle(0, notesTitle)
    checkTestPageTileTitle(1, notesTitle)
    checkTestPageTileTitle(2, notesTitle)
    checkTestPageTileTitle(3, notesTitle)
    checkTestPageTileTitle(4, notesTitle)
    checkTestPageTileTitle(5, notesTitle)
    checkTestPageTileTitle(6, notesTitle)
    checkTestPageTileTitle(7, notesTitle)

    // Tile 0 has stealth class
    cy.get('.tile0 > .tile > .headerTitle').should('have.class', 'stealth')
    // Tile 1 also has stealth class (it's blank)
    cy.get('.tile1 > .tile > .headerTitle').should('have.class', 'stealth')

    // Tile 2 CRAFT
    cy.get('.tile2 > .tile > .tileContent > .letter0').contains('C')
    cy.get('.tile2 > .tile > .tileContent > .letter1').contains('R')
    cy.get('.tile2 > .tile > .tileContent > .letter2').contains('A')
    cy.get('.tile2 > .tile > .tileContent > .letter3').contains('F')
    cy.get('.tile2 > .tile > .tileContent > .letter4').contains('T')

    // Tile 3 RAFT
    cy.get('.tile3 > .tile > .tileContent > .letter0').contains('R')
    cy.get('.tile3 > .tile > .tileContent > .letter1').contains('A')
    cy.get('.tile3 > .tile > .tileContent > .letter2').contains('F')
    cy.get('.tile3 > .tile > .tileContent > .letter3').contains('T')

    // Tile 4 compass
    cy.get('.tile4 .modeCompass')

    // Tile 5 hold
    cy.get('.tile5 .modeCompass') // Both use .modeCompass class

    // Tile 6 grid
    cy.get('.tile6 .modeGrid')

    // Tile 7 migration (compass + comp=false => hold)
    cy.get('.tile7 .modeCompass')
  })


  it('Can customize word', () => {
    loadNotesTestPage()

    cy.get('.tile2 .fa-gear').click({ force: true })
    // Type a new custome word
    cy.wait(200)
    cy.get('#acronym-input').type('{selectall}{backspace}CUSTOM')
    cy.get('[aria-label="Apply"]').click()
    cy.get('.tile2 > .tile > .tileContent > .letter0').contains('C')
    cy.get('.tile2 > .tile > .tileContent > .letter1').contains('U')
    cy.get('.tile2 > .tile > .tileContent > .letter2').contains('S')
    cy.get('.tile2 > .tile > .tileContent > .letter3').contains('T')
    cy.get('.tile2 > .tile > .tileContent > .letter4').contains('O')
    cy.get('.tile2 > .tile > .tileContent > .letter5').contains('M')
  })


})