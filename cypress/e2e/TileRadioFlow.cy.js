import { visitAndCloseBanner, newPage, placeHolderSubtitle } from './shared'

describe('Radio Flow Tile', () => {
  it('Radio Flow Tile', () => {
    visitAndCloseBanner()

    // give it a sec to digest airports
    cy.wait(1000)


    // Check all fields are present in Radio flow
    cy.fixture('radioFlow').then((radioFlow) => {
      for(let index=0; index<radioFlow.length; index++) {
        cy.get(`.freqList > :nth-child(${index+1})`).contains(radioFlow[index].freq)
        cy.get(`.freqList > :nth-child(${index+1})`).contains(radioFlow[index].name)
      }
    })

    // check header is present
    cy.get('.pageTwo > :nth-child(6) > .headerTitle > div').contains('Radio Flow')

    // Switch to edit mode
    cy.get('.pageTwo > :nth-child(6) > .headerTitle > div').click()
    // check it has hint
    cy.get('.actionBar > .p-button-icon-only')

    // remove previous content
    cy.get('.p-inputtextarea').type('{selectall}{backspace}')

    // Open Lookup
    cy.get('[aria-label="Lookup"]').click()
    // test Airport box is populated
    cy.get('.p-inputgroup-addon').contains('Code')
    const expectedAirportCodes = ['KRNT', 'KBFI', 'W39', 'O26', 'KAWO']
    for( let code of expectedAirportCodes) {
      cy.get('.listAirports').contains(code)
    }
    // Click Renton
    cy.get('.listAirports > :nth-child(1)').click()
    // Hint should change
    cy.get('.tip').contains('Click on any frequency below to add them to your Radio Flow')
    // FielSets should change
    cy.get('.airportSpecific > :nth-child(1) > .p-fieldset-legend').contains('KRNT Local Frequencies')
    cy.fixture('krntLocalFreq').then((krntLocalFreq) => {
      for(let index=0; index<krntLocalFreq.length; index++) {
        cy.get('.listLocal').contains(krntLocalFreq[index].mhz + ' ' + krntLocalFreq[index].name)
      }
    })
    // Navaids
    cy.get('.listNavaids > .p-fieldset-legend').contains('KRNT Navaids')
    cy.fixture('krntNavaids').then((krntNavaids) => {
      for(let index=0; index<krntNavaids.length; index++) {
        cy.get('.listNavaids').contains(krntNavaids[index].mhz + ' ' + krntNavaids[index].name)
      }
    })
    // ATC
    cy.get(':nth-child(3) > .p-fieldset-legend').contains('SEATTLE-TACOMA APPROACH CONTROL')
    cy.fixture('krntAtcs').then((krntAtcs) => {
      for(let index=0; index<krntAtcs.length; index++) {
        cy.get('.listAtc').contains(krntAtcs[index].mhz)
      }
    })

    // add few frequencies
    cy.get('[aria-label="124.700 CTAF"]').click()
    cy.get('[aria-label="110.600 PAE VOR/DME"]').click()
    cy.get('[aria-label="119.200 Apch Dep(017-079 SEA RWY 34),Apch Dep(028-160 SEA RWY 16),BELL..."]').click()
    // close lookup
    cy.get('.p-dialog-header-icon').click()
    // Test textarea content
    cy.get('.p-inputtextarea').should('have.value','124.7,KRNT CTAF\n110.6,PAE VOR/DME\n119.2,SEATTLE-TACOMA APPROACH CONTROL')

    // Switch tile type to notes then coma back to radio
    // cy.get('.pageTwo > :nth-child(6) > .headerTitle > div').click()
    cy.get('.headerTitle > .p-button').click()
    cy.get('[aria-label="Notes"]').click()
    cy.get('.pageTwo > :nth-child(6) > .headerTitle > div').contains('Notes')
    // Change tile back to Radio FLow
    cy.get('.pageTwo > :nth-child(6) > .headerTitle > div').click()
    cy.get('.headerTitle > .p-button').click()
    cy.get('[aria-label="Radios"]').click()

    // Header should be back to RadioFlow
    cy.get('.pageTwo > :nth-child(6) > .headerTitle > div').contains('Radio Flow')
    // check we have the placeholder
    cy.get('.pageTwo > :nth-child(6) > :nth-child(2) > .placeHolder').contains('No Radios')
    cy.get('.pageTwo > :nth-child(6) > :nth-child(2) > .placeHolder').contains(placeHolderSubtitle)

  })
})
