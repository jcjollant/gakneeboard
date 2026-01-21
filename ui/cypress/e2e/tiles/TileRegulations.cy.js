import { checkImageContentTestTile, loadTestPage, PageTypeLabel, loadTestTileWithData } from '../shared'

const regulationsData = [
    { name: 'regulations', data: {} }
]

function loadRegulationsTestPage() {
    loadTestPage(PageTypeLabel.tiles, regulationsData)
}

describe('Regulations Tile', () => {
    const definitionsOfNightTileData = {
        name: 'regulations',
        data: { mode: 'night' }
    }

    const supplementalOxygenTileData = {
        name: 'regulations',
        data: { mode: 'oxygen' }
    }

    const minimumSafeAltitudesTileData = {
        name: 'regulations',
        data: { mode: 'msa' }
    }

    it('Displays Definitions of Night (Default)', () => {
        loadTestTileWithData(definitionsOfNightTileData)

        // Tile 0 should be Regulations
        cy.get('.headerTitle').contains('Definitions of Night')
        checkImageContentTestTile('/tiles/nights.png')

        cy.get('.regulations > .clickable')
            .should('contain', '61.57')
            .should('contain', '91.209')
            .should('contain', 'FAR 1.1')
    })

    it('Displays Supplemental Oxygen', () => {
        loadTestTileWithData(supplementalOxygenTileData)

        // Check title and image
        cy.get('.headerTitle').contains('Supplemental Oxygen')
        checkImageContentTestTile('/tiles/oxygen-requirements.png')

        cy.get('.regulations > .clickable')
            .should('contain', '91.211')
    })

    it('Displays Minimum Safe Altitudes', () => {
        loadTestTileWithData(minimumSafeAltitudesTileData)

        // Check title and image
        cy.get('.headerTitle').contains('Minimum Safe Altitudes')
        checkImageContentTestTile('/tiles/safe-altitudes.png')

        // Verify RegLink
        cy.get('.regulations > .clickable')
            .should('contain', '91.119')
    })
})
