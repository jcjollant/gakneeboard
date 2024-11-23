import { currentVersionNumber, environment, loadDemo, visitAndCloseBanner } from './shared'

describe('Navigation', () => {
  it('HDIW / Version / Offset', () => {
    cy.visit(environment)
    cy.viewport('macbook-16')

    cy.get('.hdiw').contains('Airports')
    cy.get('.hdiw').contains('Checklist')
    cy.get('.hdiw').contains('Navlog')

    // remove banner
    cy.contains('Got it').click()

    // check version number
    cy.get('.versionDialog').contains(currentVersionNumber)

    cy.get('#offsetPrev').should('have.class','noShow')
    cy.get('#offsetNext').should('have.class','noShow')

    // Load Checklist Demo and navigate offset
    loadDemo('checklist',true,false)

    cy.get('#offsetPrev').should('have.class','noShow')
    cy.get('#offsetNext').should('not.have.class','noShow')
    cy.get('.page0').should('be.visible')
    cy.get('.page1').should('be.visible')
    cy.get('.page2').should('not.be.visible')
    cy.get('.page3').should('not.be.visible')

    // move to next page (2 and 3)
    cy.get('#offsetNext').click()
    cy.get('#offsetPrev').should('not.have.class','noShow')
    cy.get('#offsetNext').should('not.have.class','noShow')
    cy.get('.page0').should('not.be.visible')
    cy.get('.page1').should('be.visible')
    cy.get('.page2').should('be.visible')
    cy.get('.page3').should('not.be.visible')

    // move to next page (3 and 4)
    cy.get('#offsetNext').click()
    cy.get('#offsetPrev').should('not.have.class','noShow')
    cy.get('#offsetNext').should('have.class','noShow')
    cy.get('.page0').should('not.be.visible')
    cy.get('.page1').should('not.be.visible')
    cy.get('.page2').should('be.visible')
    cy.get('.page3').should('be.visible')

    // previous page (2 and 3)
    cy.get('#offsetPrev').click()
    cy.get('#offsetPrev').should('not.have.class','noShow')
    cy.get('#offsetNext').should('not.have.class','noShow')
    cy.get('.page0').should('not.be.visible')
    cy.get('.page1').should('be.visible')
    cy.get('.page2').should('be.visible')
    cy.get('.page3').should('not.be.visible')

    // first page 1 and 2
    cy.get('#offsetPrev').click()
    cy.get('#offsetPrev').should('have.class','noShow')
    cy.get('#offsetNext').should('not.have.class','noShow')
    cy.get('.page0').should('be.visible')
    cy.get('.page1').should('be.visible')
    cy.get('.page2').should('not.be.visible')
    cy.get('.page3').should('not.be.visible')

  })

  it('iPad', () => {
    cy.viewport('ipad-mini')
    cy.visit(environment)
    cy.contains('Got it').click()
    cy.get('.menuIcon').click()
    cy.get('[aria-label="Print"]').should('not.exist')
    cy.get('[title="Print Active Template"]').should('not.have.a.property','label')

  })

  it('Publication', () => {
    cy.intercept({
      method: 'GET',
      url: '/publication/**',
    }).as('getPublication');
    cy.visit(environment + '?t=RC')
    cy.wait('@getPublication')

    // remove banner
    cy.contains('Got it').click()

    cy.get('#app').contains('C172 G1000')
    cy.get('#offsetPrev').should('have.class','noShow')
    cy.get('#offsetNext').should('not.have.class','noShow')
    cy.get('.page0').should('have.class','pageChecklist')
    cy.get('.page1').should('have.class','pageChecklist')
    cy.get('.page2').should('have.class','pageChecklist')
    cy.get('.page3').should('have.class','pageChecklist')
    cy.get('.page4').should('have.class','pageChecklist')
    cy.get('.page5').should('have.class','pageChecklist')

    // pages should have a version number
    cy.get('.page0 .version')
    cy.get('.page1 .version')
  })

  it('Print Dialog', () =>{
    visitAndCloseBanner()
    cy.viewport('macbook-16')

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
    cy.viewport('macbook-16')

    cy.get('.menuIcon').click()
    cy.get('#menuDemos').click()
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
    // cy.get('.p-confirm-dialog-accept').click()
    cy.get('.page0').should('have.class','pageTiles')
    cy.get('.page1').should('have.class','pageChecklist')

    // load Checklist demo
    loadDemo('checklist', false, false)
    cy.get('.page0').should('have.class','pageChecklist')
    cy.get('.page1').should('have.class','pageChecklist')

    // load Tiles demo
    loadDemo('tiles', false, false)
    cy.get('.page0').should('have.class','pageTiles')
    cy.get('.page1').should('have.class','pageTiles')

    // load Navlog demo
    loadDemo('navlog', false, false)
    cy.get('.page0').should('have.class','pageNavlog')
    cy.get('.page1').should('have.class','pageTiles')
  })

  it('Requires Sign in', () => {
    visitAndCloseBanner()
    cy.viewport('macbook-16')

    cy.get('.menuIcon').click()
    cy.get('#menuLoad').click()
    cy.get('.p-toast-summary').contains('Squawk and Ident')
    cy.wait(3100)
    cy.get('[aria-label="Save"]').click()
    cy.get('.p-toast-summary').contains('Squawk and Ident')
  
  })
})