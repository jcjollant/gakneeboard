import { visitAndCloseBanner, newPage, visitSkipBanner, newTemplate } from '../shared'

function testEditMode(present = true) {
  if (present) {
    const expectedStrips = ['ATIS', 'CRAFT', 'Radio', 'Taxi', 'Notes']
    cy.get('.selectionStrip > .list').children().should('have.length', expectedStrips.length + 1)
    for (const type of expectedStrips) {
      cy.get('.selectionStrip').contains(type)
    }
  } else {
    cy.get('.selectionStrip').should('not.exist')
  }
}

describe('Strip Page', () => {
  it('Basic flow', () => {
    cy.viewport(1300, 768)
    visitSkipBanner()
    newTemplate()

    cy.get('.page0 > .list > [aria-label="Strips"]').click()

    // should see FTUX
    cy.get('.placeHolder').contains('No Strip')
    cy.get('.placeHolder').contains('Add New Strips Below')

    testEditMode(true)

    // As user I should be able to leave edit mode with the done button
    cy.get('.selectionStrip .fa-check').click()
    testEditMode(false)
    // Placeholder should be refreshed
    cy.get('.placeHolder').contains('Click Header to Configure')

    // As user I can enter edit mode when clicking the header
    cy.get('.page0 > .headerTitle').click()
    testEditMode(true)

    // As User I can add strips of all kinds
    cy.get('.stripAtis').click()
    let expectedStrips = 1
    cy.get('.stripList').children().should('have.length', expectedStrips)
    cy.get('.strip0').contains('INFO')

    cy.get('.stripRadio').click()
    cy.get('.stripList').children().should('have.length', ++expectedStrips)
    cy.get('.strip1').contains('AIRPORT')

    cy.get('.stripTaxi').click()
    cy.get('.stripList').children().should('have.length', ++expectedStrips)
    cy.get('.strip2').contains('TAXI to')

    cy.get('.stripCraft').click()
    cy.get('.stripList').children().should('have.length', ++expectedStrips)
    cy.get('.strip3').contains('CLEARED')

    cy.get('.stripNotes').click()
    cy.get('.stripList').children().should('have.length', ++expectedStrips)

    // As User I can move strings about
    cy.get('.strip0 .stripAction > .actionDown').click()
    // First and second should be swapped
    cy.get('.strip1').contains('INFO')
    cy.get('.strip0').contains('AIRPORT')
    cy.get('.strip2').contains('TAXI to')
    // Revert
    cy.get('.strip1 .stripAction > .actionUp').click()
    // Should be back to original
    cy.get('.strip0').contains('INFO')
    cy.get('.strip1').contains('AIRPORT')
    cy.get('.strip2').contains('TAXI to')

    // As User I can delete strips
    // Delete the first one (ATIS)
    cy.get('.strip0 .stripAction > .actionRemove').click()
    cy.get('.stripList').children().should('have.length', --expectedStrips)
    // Radio should have moved up
    cy.get('.strip0').contains('AIRPORT')

    // Delete the second one (Radio)
    cy.get('.strip0 .stripAction > .actionRemove').click()
    cy.get('.stripList').children().should('have.length', --expectedStrips)
    cy.get('.strip0').contains('TAXI to')

    // Delete the third one (Taxi)
    cy.get('.strip0 .stripAction > .actionRemove').click()
    cy.get('.stripList').children().should('have.length', --expectedStrips)

    // Delete the fourth (Craft)
    cy.get('.strip0 .stripAction > .actionRemove').click()
    cy.get('.stripList').children().should('have.length', --expectedStrips)

    // As user I can exit edit mode via header click
    cy.get('.page0 > .headerTitle').click()
    testEditMode(false)
  })
})