import { displaySelection, loadDemo, maintenanceMode, replaceTile, TileTypeLabel, visitSkipBanner } from './shared'

describe('Navlog Tile', () => {
  it('Navlog Tile', () => {
    visitSkipBanner()
    loadDemo('Tiles')

    // swap tile for navlog

    replaceTile(0,4,TileTypeLabel.navlog)
    cy.get('.navlogTile > .headerTitle > div').contains('NavLog')
    cy.get('.placeHolder > :nth-child(1) > :nth-child(1)').contains('No Log')
    cy.get('.small').contains('Create a log in the navlog page')

    // Should not have data
    maintenanceMode()

    // load navlog demo
    visitSkipBanner()
    loadDemo('NavLog')

    // Check tile is there
    cy.get('.page1 > :nth-child(6) > .headerTitle').contains('NavLog')
    // tile should be populated
    cy.get(':nth-child(1)').should('have.class','entryClimb')
    cy.get(':nth-child(10)').should('have.class','entryDesc')
    cy.get('.nameArrival').contains('KELN (Arrival)')

    // check replace
    // cy.get('.page1 > :nth-child(6) > .headerTitle').trigger('mous')
    replaceTile(1,5)

  })

})