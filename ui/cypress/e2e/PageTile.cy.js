import { visitAndCloseBanner, newPage, visitSkipBanner, newTemplate } from './shared'

describe('Tile Page', () => {
  it('Basic flow', () => {
    visitSkipBanner()
    newTemplate()
    // set left page to cover
    cy.get('.page0 > .list > [aria-label="Tiles"]').click()

    const expectedTiles = ['Airport', 'Weather', 'Checklist', 'IFR', 'Fuel', 'Navlog', 'Notes', 'Radios', 'Sunlight']
    for(let tileIndex = 1; tileIndex <= 6; tileIndex++) {
      for(const tile of expectedTiles) {
        cy.get(`:nth-child(${tileIndex}) > .tileContent > [aria-label="${tile}"]`)
      }
    }
  })
})