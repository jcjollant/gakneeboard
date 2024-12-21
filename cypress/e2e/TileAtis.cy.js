import { titleAtis, visitSkipBanner, loadDemo } from './shared'

describe('ATIS Tile', () => {
  it('ATIS Tile', () => {
    visitSkipBanner()
    loadDemo()

    // check header
    cy.get('.page0 .tile4 > .headerTitle > div').contains(titleAtis)

    // Check ATIS has all fields in full mode
    cy.get('.info').contains('Info')
    cy.get('.wind').contains('Wind')
    cy.get('.runway').contains('Rwy')
    cy.get('.visibility').contains('Vis')
    cy.get('.sky').contains('Sky')
    cy.get('.temperature').contains('Temp')
    cy.get('.altimeter').contains('Alt')

    // Edit mode
    cy.get('.page0 .tile4 > .headerTitle').click()

    // Check all display modes are showing up
    cy.get('[aria-label="Full Size ATIS"]')
    cy.get('[aria-label="Compact ATIS (x4)"]')
    cy.get('[aria-label="Flight Categories"]')
    cy.get('[aria-label="Cloud Clearance"]')
    
    // Check ATIS has all fields in compact mode
    cy.get('[aria-label="Compact ATIS (x4)"]').click()
    for(let index=1; index <=4; index++) {
      cy.get(`:nth-child(${index}) > .info`).contains('Info')
      cy.get(`:nth-child(${index}) > .wind`).contains('Wind')
      cy.get(`:nth-child(${index}) > .altimeter`).contains('Alt')
      cy.get(`:nth-child(${index}) > .runway`).contains('Rwy')
  
    }

    // Flight Categories
    cy.get('.page0 .tile4 > .headerTitle').click()
    cy.get('[aria-label="Flight Categories"]').click()
    const expectedCategories = ['LIFR','IFR','MVFR','VFR','3,000ft','1,000ft','500ft','1sm','3sm','5sm']
    // const tile4 = cy.get('.page0 .tile4')
    for(let index=0; index < expectedCategories.length; index++) {
      cy.get('.page0 .tile4').contains(expectedCategories[index])
    }

    // Cloud Clearance
    cy.get('.page0 .tile4 > .headerTitle').click()
    cy.get('[aria-label="Cloud Clearance"]').click()
    const expectedClearances = ['3:cc','3:152','5:111','1:152','1:cc','SVFR','3 sm','1,000ft','2,000ft','500ft','10k MSL','1k2 AGL']
    // const tile4 = cy.get('.page0 .tile4')
    for(let index=0; index < expectedClearances.length; index++) {
      cy.get('.page0 .tile4').contains(expectedClearances[index])
    }

  })

})