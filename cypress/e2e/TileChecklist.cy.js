import { placeHolderSubtitle, visitSkipBanner, loadDemo } from './shared'

describe('Checklist Tile', () => {
  it('Checklist Tile', () => {
    visitSkipBanner()
    loadDemo('Tiles')

    const title = 'Power OFF stalls'
    const title3 = 'Name3'

    // check we have header
    cy.get('.page1 > :nth-child(1) > .headerTitle > div').contains(title)
    cy.get(':nth-child(1) > .response').contains('Made')
    cy.get(':nth-child(2) > .response').contains('Bugged')
    cy.get(':nth-child(2)').should('have.class', 'theme-blue')

    // Edit mode 
    cy.get('.page1 > :nth-child(1) > .headerTitle > div').click()
    cy.get('.oneLine > .p-inputgroup > .p-inputgroup-addon').contains('Name')
    cy.get('.p-inputgroup > .p-inputtext').should('have.value', title)
    cy.get('.p-dropdown-label').contains('Blue')
    // Information icon
    cy.get('.actionBarHelp')
    // Change title but cancel
    cy.get('.p-inputgroup > .p-inputtext').type('{selectall}').type('Name1')
    // Title should be updated for now
    cy.get('.page1 > :nth-child(1) > .headerTitle > div').contains('Name1')
    cy.get('.p-dropdown').type('G').type('{enter}')
    // Cancel
    cy.get('[aria-label="Cancel"]').click()
    // Title goes back
    cy.get('.page1 > :nth-child(1) > .headerTitle > div').contains(title)
    // Color sdhould not change
    cy.get(':nth-child(2)').should('have.class', 'theme-blue')

    // Change title and color to green
    cy.get('.page1 > :nth-child(1) > .headerTitle > div').click()
    // Change title
    cy.get('.p-inputgroup > .p-inputtext').type('{selectall}').type(title3)
    // change color to green
    cy.get('.p-dropdown').type('G').type('{enter}')
    cy.get('[aria-label="Apply"]').click()
    // Title should have changed
    cy.get('.page1 > :nth-child(1) > .headerTitle > div').contains(title3)
    // Color should be green
    cy.get(':nth-child(2)').should('have.class', 'theme-green')

    // remove all entries 
    cy.get('.page1 > :nth-child(1) > .headerTitle > div').click()
    cy.get('.p-inputtextarea').type('{selectall}{backspace}')
    // Apply changes
    cy.get('[aria-label="Apply"]').click()
    // There should be no items
    cy.get('.placeHolder').contains('No Items')
    cy.get('.placeHolder').contains(placeHolderSubtitle)

  })

})