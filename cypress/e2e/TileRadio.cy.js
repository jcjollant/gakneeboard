import { placeHolderSubtitle, radioFlowTitle, visitSkipBanner, loadDemo } from './shared'

describe('Radios Tile', () => {
  it('Radio Tile', () => {
    visitSkipBanner()
    loadDemo('Tiles')
    
    // Check all fields are present in Radio flow
    cy.fixture('radioFlow').then((radioFlow) => {
      for(let index=0; index<radioFlow.length; index++) {
        cy.get(`.freqList > :nth-child(${index+1})`).contains(radioFlow[index].freq)
        cy.get(`.freqList > :nth-child(${index+1})`).contains(radioFlow[index].name)
      }
    })

    // check header is present
    cy.get('.page1 .tile5 > .headerTitle').contains(radioFlowTitle)

    // Switch to edit mode
    cy.get('.page1 > :nth-child(6) > .headerTitle > div').click()
    // check it has hint
    cy.get('.actionBarHelp')

    // remove previous content
    cy.get('.p-inputtextarea').type('{selectall}{backspace}')

    // Open Lookup
    cy.get('.lookupBtn').click()
    // test Airport box is populated
    cy.get('.p-inputgroup-addon').contains('Code')
    const expectedAirportCodes = ['KRNT', 'KBFI', 'W39', 'O26', 'KAWO']
    for( let code of expectedAirportCodes) {
      cy.get('.recentAirportList').contains(code)
    }
    // Click Renton
    cy.get('.recentAirportList > :nth-child(1)').click()
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
    cy.get('.p-inputtextarea').should('have.value','124.700,KRNT CTAF\n110.600,PAE VOR/DME\n119.200,SEATTLE-TACOMA APPROACH CONTROL')

    // Switch tile type to notes then coma back to radio
    cy.get('.page1 > :nth-child(6) > .headerTitle > .p-button').click({force: true})
    cy.get('[aria-label="Notes"]').click()
    cy.get('.page1 > :nth-child(6) > .headerTitle > div').contains('Notes')
    // Change tile back to Radio 
    cy.get('.page1 > :nth-child(6) > .headerTitle').click()
    cy.get('.page1 > :nth-child(6) > .headerTitle > .p-button').click({force: true})
    cy.get('[aria-label="Radios"]').click()

    // Header should be back to Radio
    cy.get('.page1 > :nth-child(6) > .headerTitle > div').contains(radioFlowTitle)
    // check we have the placeholder
    cy.get('.placeHolder').contains('No Radios')
    cy.get('.placeHolder').contains(placeHolderSubtitle)

    // Switch to Nordo mode
    cy.get('.page1 > :nth-child(6) > .headerTitle > div').click()
    cy.get('.choiceInactive').click()
    cy.get('[aria-label="Apply"]').click()

    // check Nordo Fields
    cy.get('[title="Unlawful Interference (aka Hijack)"]')
    cy.get('[title="Lost Communications"]')
    cy.get('[title="Declare Emergency"]')

    // test localstore has the correct data
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        // console.log('>>>>', template)
        expect(template.data[1].data[5].data['mode']).to.equal('nordo')
      })


    // switch back to list mode
    cy.get('.page1 > :nth-child(6) > .headerTitle > div').click()
    cy.get('.choiceInactive').click()
    cy.get('[aria-label="Apply"]').click()
    // Nordo controls should be gone
    cy.get('[title="Declare Emergency"]').should('not.exist')
  })

  it('Lost Comms', () => {
    visitSkipBanner()
    loadDemo('Tiles')
    cy.get('.page1 .tile5 > .headerTitle').click()
    // switch to lost comms
    cy.get('.page1 .tile5 .choiceInactive').click()
    cy.get('.page1 .tile5 [aria-label="Apply"]').click()
    const expectedLostCommsFields = ['Signal', 'Ground', 'Air', 'T/O', 'Land', 'Taxi', 'STOP', 'Give Way', 'Taxi Off Rwy', 'Use Extreme Caution', 'Start', '7500', '7600', '7700']
    for(let i=0; i<expectedLostCommsFields.length; i++) {
      cy.get(`.page1 .tile5`).contains(expectedLostCommsFields[i])
    }
  })
})
