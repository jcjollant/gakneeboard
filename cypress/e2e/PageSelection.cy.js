import { visitSkipBanner, newTemplate } from './shared'

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

    cy.get('.page1 > .headerTitle').click()
    cy.get('.headerTitle > .p-button').click()
    cy.get('.p-confirm-dialog-accept').click()
    cy.get('.contentPage > .headerTitle').contains('Page Selection')

    // Cover on page 2
    cy.get('[aria-label="Cover"]').click()
    cy.get('.titleContainer > .title').contains('Title')
    // Eject
    cy.get('.titleContainer > .title').click()
    cy.get('.headerTitle > .p-button').click()
    cy.get('.p-confirm-dialog-accept').click()
    cy.get('.contentPage > .headerTitle').contains('Page Selection')

    // Instrument Approaches on Page 2
    cy.get('.page1 > .list > [aria-label="Instrument Approach"]').click()
    cy.get('.contentPage > .headerTitle').contains('Instrument Approach')
    // Eject
    cy.get('.headerTitle > .p-button').click({force:true})
    cy.get('.p-confirm-dialog-accept').click()
    cy.get('.contentPage > .headerTitle').contains('Page Selection')

    // navlog on page 2
    cy.get('.page1 > .list > [aria-label="NavLog"]').click()
    cy.get('.contentPage > :nth-child(1) > .headerTitle').contains('NavLog')
    // Eject
    cy.get('.contentPage > :nth-child(1) > .headerTitle').click()
    cy.get('.headerTitle > .p-button').click()
    cy.get('.p-confirm-dialog-accept').click()
    cy.get('.contentPage > .headerTitle').contains('Page Selection')

    // Notes on page 2
    cy.get('.contentPage > .list > [aria-label="Notes"]').click()
    cy.get('.contentPage > .headerTitle').contains('Notes')
    // Eject should not require confirmation
    cy.get('.headerTitle > .p-button').click({force:true})
    cy.get('.contentPage > .headerTitle').contains('Page Selection')

  })
})
