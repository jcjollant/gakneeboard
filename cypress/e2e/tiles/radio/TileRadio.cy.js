import { displaySelection, loadDemo, lostCommsTitle, notesTitle, radioTitle, serviceVolumeTitle, TileTypeLabel, visitSkipBanner, replaceTile, viewport, loadTestTileWithData, loadTestTile, displayModesCheck } from '../../shared'
import { checkImageContentTestTile } from '../../shared'
const labelFrequencies = 'Frequencies'
const labelLostCommsVFR = 'Lost Comms VFR'
const labelLostCommsIFR = 'Lost Comms IFR'
const labelServiceVolumes = 'Service Volumes'

describe('Radios Tile', () => {

  let lostCommsVFRTileData
  let lostCommsIFRTileData
  let fifteenFreqTileData
  let serviceVolumeTileData

  before(() => {
    cy.fixture('radioTileVFRLostComms').then(data => lostCommsVFRTileData = data)
    cy.fixture('radioTileIFRLostComms').then(data => lostCommsIFRTileData = data)
    cy.fixture('radioTile15Freq').then(data => fifteenFreqTileData = data)
    cy.fixture('radioTileServiceVolumes').then(data => serviceVolumeTileData = data)

    cy.wrap(
        Cypress.automation('remote:debugger:protocol', {
            command: 'Browser.grantPermissions',
            params: {
              permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
              origin: window.location.origin,
            },
        }),
    );    
  })

  it('Has correct display mode selection', () => {
    loadTestTile(TileTypeLabel.radios)

    // test tile title updated
    cy.get('.headerTitle').contains('Radios Tile Mode')

    const expectedDisplayModes = [ labelFrequencies, labelLostCommsVFR, labelLostCommsIFR, labelServiceVolumes]
    displayModesCheck(expectedDisplayModes, true)

    // check display mode is saved correctly in local storage
    cy.get(`[aria-label="${labelServiceVolumes}"]`).click()

    // copy data to clipboard
    cy.get('.copy-btn').click()

    // read clipboard data
    cy.window().then((win) => {
      win.navigator.clipboard.readText().then((text) => {
          const tileData = JSON.parse(text)
          expect(tileData.data['mode']).to.equal('sv')
      });
    });    

  })

  it('Displays Lost Comms VFR', () => {
    loadTestTileWithData(lostCommsVFRTileData)

    // test tile title updated
    cy.get('.headerTitle').contains(lostCommsTitle)

    // check Nordo Fields
    cy.get('[title="Unlawful Interference (aka Hijack)"]')
    cy.get('[title="Lost Communications"]')
    cy.get('[title="Declare Emergency"]')

    const expectedLostCommsFields = ['Signal', 'Ground', 'Air', 'T/O', 'Land', 'Taxi', 'STOP', 'Give Way', 'Taxi Off Rwy', 'Use Extreme Caution', 'Start', '7500', '7600', '7700']
    for(const field of expectedLostCommsFields) {
      cy.get(`.tile`).contains(field)
    }
  })

  it('Displays 15 frequencies without overflow', () => {
    loadTestTileWithData(fifteenFreqTileData)

    // Verify radio tile is loaded
    cy.get('.tile').should('exist')
    cy.get('.freqList').should('exist')
    
    // Count frequency boxes
    cy.get('.freqList > div').should('have.length', 15)
    
    // Check that all frequencies are visible (not overflowing)
    cy.get('.freqList').then($freqList => {
      const listHeight = $freqList[0].scrollHeight
      const visibleHeight = $freqList[0].clientHeight
      expect(listHeight).to.equal(visibleHeight)
    })
    
    // test .freqList.three height is less or equal to 240px
    cy.get('.freqList.three').then($freqList => {
      const listHeight = $freqList[0].scrollHeight
      // less or equal to 240px
      expect(listHeight).to.be.at.most(240)
    })


  })

  it.skip('Radio Tile', () => {
    visitSkipBanner()
    loadDemo('Tiles')

    cy.intercept({method: 'GET',url: '**/airports/**',}).as('getAirports');
    
    // Check all fields are present in Radio flow
    cy.fixture('radioFlow').then((radioFlow) => {
      for(let index=0; index<radioFlow.length; index++) {
        cy.get(`.freq${index}`).contains(radioFlow[index].freq)
        cy.get(`.freq${index}`).contains(radioFlow[index].name)
        cy.get(`.freq${index} > .freq`).should('have.class',radioFlow[index].class)
      }
    })

    cy.wait('@getAirports').its('response.statusCode').should('equal', 200)

    // check header is the expected one
    cy.get('.page1 .tile5 > .headerTitle').contains(radioTitle)

    // Switch to Display mode selection
    displaySelection(1, 5)

    // bring back normal mode
    displaySelection(1, 5)
    cy.get('.page1 .tile5 .modesList').should('not.exist')

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
    cy.get('.recentAirportList > :nth-child(4)').click()
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
    cy.get('[aria-label="122.950 UNICOM"]').click()
    cy.get('[aria-label="121.600 GND"]').click()
    cy.get('[aria-label="110.600 PAE VOR/DME"]').click()
    cy.get('[aria-label="119.200 Apch Dep(017-079 SEA RWY 34),Apch Dep(028-160 SEA RWY 16),BELL..."]').click()
    // close lookup
    cy.get('.p-dialog-header-icon').click()
    // Test textarea content
    cy.get('.p-inputtextarea').should('have.value','124.700,KRNT CTAF,CTAF\n122.950,KRNT UNICOM,Ground\n121.600,KRNT GND,Ground\n110.600,PAE VOR/DME,Navaid\n119.200,SEATTLE-TACOMA APPROACH CONTROL,TRACON')

    // Apply and check classes
    cy.get('[aria-label="Apply"]').click()
    cy.get('.freq0 > .freq').should('have.class','ctaf')
    cy.get('.freq1 > .freq').should('have.class','ground')
    cy.get('.freq2 > .freq').should('have.class','ground')
    cy.get('.freq3 > .freq').should('have.class','navaid')
    cy.get('.freq4 > .freq').should('have.class','tracon')

    // switch left tile to radio so it doesnt merge
    replaceTile(1,4,TileTypeLabel.radios)
    // Switch tile type to notes then come back to radio
    replaceTile(1,5,TileTypeLabel.notes)
    cy.get('.page1 > .tile5 > .headerTitle > div').contains(notesTitle)
    // Change tile back to Radio 
    cy.get('.page1 > .tile5 > .headerTitle').click()
    replaceTile(1,5,TileTypeLabel.radios)

    // Header should be back to Radio
    cy.get('.page1 > .tile5 > .headerTitle > div').contains(radioTitle)
    // check we have the placeholder
    cy.get('.placeHolder').contains('No Radios')
    cy.get('.placeHolder').contains('Click Here to Add Frequencies')
  })

  it.skip( 'Shows correct icon', () => {
    visitSkipBanner()
    loadDemo()
    viewport()

    cy.get('.page0 .tile2 .freqList').click()
    cy.get('.p-inputtextarea').type('{selectall}{backspace}')
    const list = ['123-456-7890,KAWO CD,Phone','123.450,Weather,Weather','222.222,Test,Navaid','333.500,CTAF,CTAF']
    cy.get('.p-inputtextarea').type( list.join('\n'), {delay:0})
    cy.get('[aria-label="Apply"]').click()

    cy.get('.tile2 .freq0 .freqType').should('not.exist')
    cy.get('.tile2 .freq1 .freqType').should('have.class', 'fa-cloud-sun-rain')
    cy.get('.tile2 .freq2 .freqType').should('have.class', 'fa-tower-cell')
    cy.get('.tile2 .freq3 .freqType').should('have.class', 'fa-plane')
  })

  it('Service Volumes', () => {
    loadTestTileWithData(serviceVolumeTileData)
    checkImageContentTestTile('/tiles/service-volumes.png')
  })
  it('Shows Lost Comms IFR', () => {
    loadTestTileWithData(lostCommsIFRTileData)
    checkImageContentTestTile('/tiles/lostcomms-ifr.png')
  })
})
