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
  { name: 'notes', data: { mode: 'word' } },
  { name: 'notes', data: { mode: 'word', word: 'RAFT' } },
  { name: 'notes', data: { mode: 'compass', comp: 'heading' } },
  { name: 'notes', data: { mode: 'grid' } },
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

    // Tile 0 has stealth class
    cy.get('.tile0 > .tile > .headerTitle').should('have.class', 'stealth')
    // Tile 1 does not have stealth class
    cy.get('.tile1 > .tile > .headerTitle').should('not.have.class', 'stealth')

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

    // Tile 5 grid
    cy.get('.tile5 .modeGrid')
  })

  it('Grows in wide mode', () => {
    loadNotesTestPage()

    // Enable wide mode
    cy.get('.tile2 .fa-gear').click({ force: true })
    cy.get('.choiceOr').click()
    cy.get('[aria-label="Apply"]').click()
    cy.get('.tile2').should('have.class', 'span-2')
    // tile 3 should be hidden
    cy.get('.tile3').should('have.css', 'display', 'none')
  })

  it('Can customize word', () => {
    loadNotesTestPage()

    cy.get('.tile2 .fa-gear').click({ force: true })
    // Type a new custome word
    cy.get('#acronym-input').type('{selectall}').type('CUSTOM')
    cy.get('[aria-label="Apply"]').click()
    cy.get('.tile2 > .tile > .tileContent > .letter0').contains('C')
    cy.get('.tile2 > .tile > .tileContent > .letter1').contains('U')
    cy.get('.tile2 > .tile > .tileContent > .letter2').contains('S')
    cy.get('.tile2 > .tile > .tileContent > .letter3').contains('T')
    cy.get('.tile2 > .tile > .tileContent > .letter4').contains('O')
    cy.get('.tile2 > .tile > .tileContent > .letter5').contains('M')
  })

})