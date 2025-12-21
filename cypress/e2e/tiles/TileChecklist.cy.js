import { loadTilePage, TileTypeLabel, settingsOpen } from '../shared'

describe('Checklist Tile', () => {
  it('Checklist Tile', () => {
    loadTilePage(TileTypeLabel.checklist)

    const title = 'Checklist'
    const title3 = 'Name3'

    // check we have header
    cy.get('.tile .headerTitle').contains(title)

    // Edit mode
    settingsOpen(0)

    // Verify Settings Dialog Open
    cy.get('.tile-settings-dialog').should('be.visible')
    cy.get('.tile-settings-dialog .settings-title').contains('Checklist Tile Settings')

    // Verify content
    cy.get('.checklistNameAddon').contains('Name')
    cy.get('.p-inputgroup > .p-inputtext').should('have.value', '')

    // Change title
    cy.get('.p-inputgroup > .p-inputtext').type('{selectall}').type(title3)

    // Change theme to Green
    cy.get('.theme .theme-green').click()

    // Apply
    cy.get('.p-dialog-footer [aria-label="Apply"]').click()

    // Verify changes
    // Verify changes
    cy.get('.tile .headerTitle').contains(title3)
    // cy.get('.checklistMain .list').should('have.class', 'theme-green') // ChecklistViewer doesn't have .list or theme class on container

    // Add items via Editor
    settingsOpen(0)

    // Add an item
    cy.get('.add-buttons button').contains('Challenge/Response').click()
    cy.get('.item-edit input[placeholder="Challenge (Required)"]').type('Challenge 1')
    cy.get('.item-edit input[placeholder="Response (Optional)"]').type('Response 1{enter}')

    // Add second item (to verify theme zebra striping)
    cy.get('.add-buttons button').contains('Challenge/Response').click()
    cy.get('.item-edit').last().find('input[placeholder="Challenge (Required)"]').type('Challenge 2')
    cy.get('.item-edit').last().find('input[placeholder="Response (Optional)"]').type('Response 2{enter}')

    // Apply
    cy.get('.p-dialog-footer [aria-label="Apply"]').click()

    // Verify items
    cy.get('.checklistMain .challenge').contains('Challenge 1')
    cy.get('.checklistMain .response').contains('Response 1')

    cy.get('.checklistMain .challenge').contains('Challenge 2')
    // Verify theme on second item (index 1) which should have the theme class
    cy.get('.checklistMain .item').eq(1).find('.response').should('have.class', 'theme-green')

  })

})