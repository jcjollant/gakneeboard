import { checkImageContentTestTile, loadTestTileWithData, loadTilePage, lostCommsTitle, TileTypeLabel } from '../shared'

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
    })

    it('Has correct display mode selection', () => {
        loadTilePage(TileTypeLabel.radios)

        // Open settings (Tile 0 is the radio tile)
        cy.get('.tile0 .settingsButton').click({ force: true })

        // Check display modes in settings
        // They are buttons in OneChoice, verify labels exist
        cy.get('.radio-settings').contains(labelFrequencies)
        cy.get('.radio-settings').contains(labelLostCommsVFR)
        cy.get('.radio-settings').contains(labelLostCommsIFR)
        cy.get('.radio-settings').contains(labelServiceVolumes)

        // Select Service Volumes
        cy.get('.display-mode-selector').contains(labelServiceVolumes).click()

        // Apply settings
        cy.get('[aria-label="Apply"]').click()

        // Check tile content updated
        // Service volumes should be visible (VorServiceVolumes component)
        cy.get('.tile0 img[src*="service-volumes.png"]').should('exist')

        // Re-open settings and switch back to Frequencies
        cy.get('.tile0 .settingsButton').click({ force: true })
        cy.get('.display-mode-selector').contains(labelFrequencies).click()
        cy.get('[aria-label="Apply"]').click()
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
        for (const field of expectedLostCommsFields) {
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

    it('Service Volumes', () => {
        loadTestTileWithData(serviceVolumeTileData)
        checkImageContentTestTile('/tiles/service-volumes.png')
    })

    it('Shows Lost Comms IFR', () => {
        loadTestTileWithData(lostCommsIFRTileData)
        checkImageContentTestTile('/tiles/lostcomms-ifr.png')
    })
})
