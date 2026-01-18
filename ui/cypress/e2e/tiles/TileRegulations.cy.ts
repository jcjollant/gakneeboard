import { visitSkipBanner, loadDemo } from '../shared'

describe('Regulations Tile', () => {
    it('Displays Minimum Safe Altitudes mode', () => {
        visitSkipBanner()
        loadDemo('Tiles') // Assuming 'Tiles' demo has a regulations tile or we can add one

        // Click on the Regulations tile header to open settings/display modes
        // We need to find the Regulations tile. Since I'm not sure which one it is, I'll search for it or replace one.
        // Assuming there is a regulations tile or we can replace one.
        // Let's replace the first tile with Regulations if it's not one.

        cy.get('.page0 > .tile0 > .headerTitle').click()
        cy.get('.replaceButton').click({ force: true })
        cy.get('[aria-label="Regulations"]').click()

        // Now tile0 should be Regulations
        cy.get('.page0 > .tile0 > .headerTitle').contains('Definitions of Night') // Default mode

        // Change mode to Minimum Safe Altitudes
        cy.get('.page0 > .tile0 > .headerTitle').click()
        cy.get('.page0 > .tile0 > .tileContent').contains('Minimum Safe Altitudes').click()

        // Check if title changed
        cy.get('.page0 > .tile0 > .headerTitle').contains('Minimum Safe Altitudes')

        // Check if image is displayed
        cy.get('.page0 > .tile0 > .tileContent img').should('have.attr', 'src').and('include', 'safe-altitudes.png')

        // Check for the link
        cy.get('.page0 > .tile0 > .tileContent a')
            .should('contain', '91.119')
            .and('have.attr', 'href', 'https://www.ecfr.gov/current/title-14/chapter-I/section-91.119')
    })
})
