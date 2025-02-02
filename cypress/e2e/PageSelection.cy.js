import { visitSkipBanner, newTemplate, pageNameCover, pageNameNavlog, pageNameNotes, pageNameInstrumentApproach, replacePage } from './shared'

function ejectAndConfirm() {

}

describe('Selection Page', () => {

  it('Try All Pages', () => {
    visitSkipBanner()
    newTemplate()

    // Tiles on Page 1
    cy.get('.page0 > .list > [aria-label="Tiles"]').click()
    cy.get('.page0 > :nth-child(6) > .headerTitle').contains('Tile Selection')

    // Checklist on page 2
    cy.get('.page1 > .list > [aria-label="Checklist"]').click()
    cy.get('.page1 > .headerTitle').contains('Checklist')

    // Cover on page 2
    replacePage(1, pageNameCover)
    cy.get('.titleContainer > .title').contains('Title')
    // open edit mode to enable heading
    cy.get('.page1 > .main').click()

    // Instrument Approaches on Page 2
    replacePage(1, pageNameInstrumentApproach)
    cy.get('.contentPage > .headerTitle').contains('Instrument Approach')

    // navlog on page 2
    replacePage(1, pageNameNavlog)
    cy.get('.contentPage > :nth-child(1) > .headerTitle').contains('NavLog')

    // Notes on page 2
    replacePage(1, pageNameNotes)
    cy.get('.contentPage > .headerTitle').contains('Notes')

  })
})
