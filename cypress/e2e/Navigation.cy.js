import { currentVersionNumber, environment, visitAndCloseBanner } from './shared'

describe('Navigation', () => {
  it('HDIW / Version / Offset', () => {
    cy.visit(environment)

    cy.get('.hdiw').contains('Airports')
    cy.get('.hdiw').contains('Checklist')
    cy.get('.hdiw').contains('Navlog')

    // remove banner
    cy.contains('Got it').click()

    // check version number
    cy.get('.versionDialog').contains(currentVersionNumber)

    cy.get('#offsetPrev').should('have.class','noShow')
    cy.get('#offsetNext').should('have.class','noShow')
    cy.get('.sheetNumber').should('match',':empty')

  })

  it('Publication', () => {
    cy.intercept({
      method: 'GET',
      url: '/publication/**',
    }).as('getPublication');
    cy.visit(environment + '?t=RC')
    cy.wait('@getPublication').its('response.statusCode').should('equal', 200)

    // remove banner
    cy.contains('Got it').click()

    cy.get('#app').contains('C172 G1000')
    cy.get('#offsetPrev').should('have.class','noShow')
    cy.get('#offsetNext').should('not.have.class','noShow')
    cy.get('.pageOne').should('have.class','pageCover')
    cy.get('.pageTwo').should('have.class','pageChecklist')
    cy.get('.sheetNumber').contains('1/3')
    // click next
    cy.get('#offsetNext').click()
    // Now both should be visible
    cy.get('#offsetPrev').should('not.have.class','noShow')
    cy.get('#offsetNext').should('not.have.class','noShow')
    cy.get('.pageOne').should('have.class','pageChecklist')
    cy.get('.pageTwo').should('have.class','pageChecklist')
    cy.get('.sheetNumber').contains('2/3')
    // click next
    cy.get('#offsetNext').click()
    // Next should be hidden, prev should be visible
    cy.get('#offsetPrev').should('not.have.class','noShow')
    cy.get('#offsetNext').should('have.class','noShow')
    cy.get('.pageOne').should('have.class','pageChecklist')
    cy.get('.pageTwo').should('have.class','pageChecklist')
    cy.get('.sheetNumber').contains('3/3')
  })

  it('Print Dialog', () =>{
    visitAndCloseBanner()

    // Test print dialog show up
    cy.get('.menuIcon').click()
    cy.get('[aria-label="Print"]').click()
    // check title
    cy.get('.p-dialog-header').contains('Print')
    // Check Page options
    cy.get('.pageOptions').contains('Pages per sheet')
    cy.get('.pageOptions').contains('Back Page Orientation')
    cy.get('[aria-label="One"]')
    cy.get('[aria-label="Two"]')
    cy.get('[aria-label="Normal"]')
    cy.get('[aria-label="Flipped"]')
    // click do not print
    cy.get('.actionDialog > .p-button-link').click()
  })

  it('Demos', () => {
    visitAndCloseBanner()

    cy.get('.menuIcon').click()
    cy.get('[aria-label="Demo"]').click()
    cy.get('.p-dialog-header').contains('GA Kneeboard Demos')

    // Check demo pages description work
    const demoPages = [ 
      {i:1, l:'Default', t:'Default Demo'}, 
      {i:2, l:'Checklist',t:'A C172 preflight Checklist'}, 
      {i:3, l:'Tiles', t:'Every Tile Available on GA Kneeboard'}, 
      {i:4, l:'Navlog', t:'Navlog page along with six tiles'}, 
      ]
    for(const p of demoPages) {
      cy.get(`.demoGrid > :nth-child(${p.i})`).contains(p.l);
      cy.get(`.demoGrid > :nth-child(${p.i})`).title(p.t);
    }

    // load default demo
    cy.get(`.demoGrid > :nth-child(1)`).click()
    cy.get('.p-confirm-dialog-accept').click()
    cy.get('.pageOne').should('have.class','pageTiles')
    cy.get('.pageTwo').should('have.class','pageChecklist')

    // load Checklist demo
    cy.get('[aria-label="Demo"]').click()
    cy.get(`.demoGrid > :nth-child(2)`).click()
    cy.get('.p-confirm-dialog-accept').click()
    cy.get('.pageOne').should('have.class','pageChecklist')
    cy.get('.pageTwo').should('have.class','pageChecklist')

    // load Tiels demo
    cy.get('[aria-label="Demo"]').click()
    cy.get(`.demoGrid > :nth-child(3)`).click()
    cy.get('.p-confirm-dialog-accept').click()
    cy.get('.pageOne').should('have.class','pageTiles')
    cy.get('.pageTwo').should('have.class','pageTiles')

    // load Navlog demo
    cy.get('[aria-label="Demo"]').click()
    cy.get(`.demoGrid > :nth-child(4)`).click()
    cy.get('.p-confirm-dialog-accept').click()
    cy.get('.pageOne').should('have.class','pageNavlog')
    cy.get('.pageTwo').should('have.class','pageTiles')
  })

  it('Requires Sign in', () => {
    visitAndCloseBanner()

    cy.get('.menuIcon').click()
    cy.get('[aria-label="Load"]').click()
    cy.get('.p-toast-summary').contains('Squawk and Ident')
    cy.wait(3100)
    cy.get('[aria-label="Save"]').click()
    cy.get('.p-toast-summary').contains('Squawk and Ident')
  
  })
})