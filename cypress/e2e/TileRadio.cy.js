import { placeHolderSubtitle, radioFlowTitle, visitSkipBanner, loadDemo, lostCommsTitle, serviceVolumeTitle } from './shared'

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

    // check header is the expected one
    cy.get('.page1 .tile5 > .headerTitle').contains(radioFlowTitle)

    // Swicth to Display mode selection
    cy.get('.page1 > .tile5 > .headerTitle').click()
    const expectedDisplayModes = ['Freq. List', 'Lost Comms', 'VOR Service Volumes']
    for(const displayMode of expectedDisplayModes) {
      cy.get('.modesList').contains(displayMode)
    }

    // Clicking on the header should bring back normal mode
    cy.get('.page1 > .tile5 > .headerTitle').click()

    // Switch to edit mode
    cy.get(`.freqList`).click()
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
    cy.get('.page1 > .tile5 > .headerTitle > .p-button').click({force: true})
    cy.get('[aria-label="Notes"]').click()
    cy.get('.page1 > .tile5 > .headerTitle > div').contains('Notes')
    // Change tile back to Radio 
    cy.get('.page1 > .tile5 > .headerTitle').click()
    cy.get('.page1 > .tile5 > .headerTitle > .p-button').click({force: true})
    cy.get('[aria-label="Radios"]').click()

    // Header should be back to Radio
    cy.get('.page1 > .tile5 > .headerTitle > div').contains(radioFlowTitle)
    // check we have the placeholder
    cy.get('.placeHolder').contains('No Radios')
    cy.get('.placeHolder').contains('Click Here to Add Frequencies')
  })

  it('Lost Comms', () => {
    visitSkipBanner()
    loadDemo('Tiles')
    cy.get('.page1 > .tile5 > .headerTitle').click()

    // switch to Lost comms
    cy.get('[aria-label="Lost Comms"]').click()
    // test tile title updated
    cy.get('.page1 > .tile5 > .headerTitle').contains(lostCommsTitle)

    // check Nordo Fields
    cy.get('[title="Unlawful Interference (aka Hijack)"]')
    cy.get('[title="Lost Communications"]')
    cy.get('[title="Declare Emergency"]')

    const expectedLostCommsFields = ['Signal', 'Ground', 'Air', 'T/O', 'Land', 'Taxi', 'STOP', 'Give Way', 'Taxi Off Rwy', 'Use Extreme Caution', 'Start', '7500', '7600', '7700']
    for(let i=0; i<expectedLostCommsFields.length; i++) {
      cy.get(`.page1 .tile5`).contains(expectedLostCommsFields[i])
    }

    // test localstore has the correct data
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        // console.log('>>>>', template)
        expect(template.data[1].data[5].data['mode']).to.equal('nordo')
      })



  })

  it('Service Volumes', () => {
    visitSkipBanner()
    loadDemo('Tiles')
    cy.get('.page1 > .tile5 > .headerTitle').click()

    // switch to Service Volumes
    cy.get('[aria-label="VOR Service Volumes"]').click()
    // test tile title updated
    cy.get('.page1 > .tile5 > .headerTitle').contains(serviceVolumeTitle)

    const expectedVolumes = [
      {label:'(T)', src:'/tiles/vorsv-terminal.png'}, 
      {label:'(L)', src:'/tiles/vorsv-low.png'}, 
      {label:'(H)', src:'/tiles/vorsv-high.png'}, 
      {label:'(VL)', src:'/tiles/vorsv-vl.png'}, 
      {label:'(VH)', src:'/tiles/vorsv-vh.png'},
    ]
    cy.get('.page1 .tile5 .volumeChoice').children().should('have.length', expectedVolumes.length)
    for(let index = 0; index < expectedVolumes.length; index++) {
      const volume = expectedVolumes[index]
      cy.get('.page1 .tile5 .volumeChoice .choice' + index).contains(volume.label)
      cy.get('.page1 .tile5 .volumeChoice .choice' + index).click()
      cy.get('.serviceVolume').should('have.attr', 'src', volume.src)
    }

    // test localstore has the correct data
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        expect(template.data[1].data[5].data['mode']).to.equal('sv')
        expect(template.data[1].data[5].data['sv']).to.equal('vh')
      })

  })
})
