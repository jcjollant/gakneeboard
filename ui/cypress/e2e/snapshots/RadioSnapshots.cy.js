/**
 * Visual snapshot tests for Radio tile layout variants.
 * 
 * Covers frequency list layouts (small/medium/large grids),
 * VFR Lost Comms, IFR Lost Comms, and Service Volumes.
 * 
 * Run:   npm run test:snapshots
 * Update baselines: npm run test:snapshots:update
 */
import { loadTestTileWithData, loadTestPage, PageTypeLabel, viewport } from '../shared.js'

describe('Radio Tile — Layout Snapshots', () => {
  beforeEach(() => {
    viewport()
  })

  it('Frequency list — 4 frequencies (2-column large)', () => {
    loadTestTileWithData({
      name: 'radios',
      data: {
        mode: '',
        list: [
          { value: '127.750', name: 'KBFI ATIS', type: 'w' },
          { value: '120.600', name: 'KBFI Tower', type: 'tw' },
          { value: '121.900', name: 'KBFI Ground', type: 'g' },
          { value: '124.700', name: 'KRNT CTAF', type: 'ct' }
        ],
        sv: 't',
        colorScheme: 'light'
      },
      span2: false,
      hide: false
    })
    cy.get('.tile .freqList').should('be.visible')
    cy.wait(300)
    cy.get('.tile').matchImageSnapshot('radio-4freq-large')
  })

  it('Frequency list — 8 frequencies (2-column medium)', () => {
    loadTestTileWithData({
      name: 'radios',
      data: {
        mode: '',
        list: [
          { value: '127.750', name: 'KBFI ATIS', type: 'w' },
          { value: '120.600', name: 'KBFI Tower', type: 'tw' },
          { value: '121.900', name: 'KBFI Ground', type: 'g' },
          { value: '124.700', name: 'KRNT CTAF', type: 'ct' },
          { value: '126.950', name: 'KRNT ATIS', type: 'w' },
          { value: '119.200', name: 'SEA Approach', type: '?' },
          { value: '120.100', name: 'SEA Departure', type: '?' },
          { value: '128.500', name: 'SEA Center', type: '?' }
        ],
        sv: 't',
        colorScheme: 'light'
      },
      span2: false,
      hide: false
    })
    cy.get('.tile .freqList').should('be.visible')
    cy.wait(300)
    cy.get('.tile').matchImageSnapshot('radio-8freq-medium')
  })

  it('Frequency list — 8 frequencies expanded', () => {
    const data = [{
      name: 'radios',
      expanded: true,
      data: {
        mode: '',
        list: [
          { value: '127.750', name: 'KBFI ATIS', type: 'w' },
          { value: '120.600', name: 'KBFI Tower', type: 'tw' },
          { value: '121.900', name: 'KBFI Ground', type: 'g' },
          { value: '124.700', name: 'KRNT CTAF', type: 'ct' },
          { value: '126.950', name: 'KRNT ATIS', type: 'w' },
          { value: '119.200', name: 'SEA Approach', type: '?' },
          { value: '120.100', name: 'SEA Departure', type: '?' },
          { value: '128.500', name: 'SEA Center', type: '?' }
        ],
        sv: 't',
        colorScheme: 'light'
      }
    }]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .freqList').should('be.visible')
    cy.wait(300)
    cy.get('.tile0').matchImageSnapshot('radio-8freq-span2')
  })

  it('Frequency list — 15 frequencies (3-column small)', () => {
    cy.fixture('radioTile15Freq').then(data => {
      loadTestTileWithData(data)
      cy.get('.tile .freqList').should('be.visible')
      cy.wait(300)
      cy.get('.tile').matchImageSnapshot('radio-15freq-small')
    })
  })

  it('Frequency list — 15 frequencies span-2', () => {
    cy.fixture('radioTile15Freq').then(fixtureData => {
      const data = [{
        name: 'radios',
        span2: true,
        data: fixtureData.data
      }]
      loadTestPage(PageTypeLabel.tiles, data)
      cy.get('.tile0 .freqList').should('be.visible')
      cy.wait(300)
      cy.get('.tile0').matchImageSnapshot('radio-15freq-span2')
    })
  })

  it('VFR Lost Comms', () => {
    cy.fixture('radioTileVFRLostComms').then(data => {
      loadTestTileWithData(data)
      cy.get('.tile .tileContent').should('be.visible')
      cy.wait(300)
      cy.get('.tile').matchImageSnapshot('radio-vfr-lostcomms')
    })
  })

  it('IFR Lost Comms', () => {
    cy.fixture('radioTileIFRLostComms').then(data => {
      loadTestTileWithData(data)
      cy.get('.tile .tileContent').should('be.visible')
      cy.wait(300)
      cy.get('.tile').matchImageSnapshot('radio-ifr-lostcomms')
    })
  })

  it('Service Volumes', () => {
    cy.fixture('radioTileServiceVolumes').then(data => {
      loadTestTileWithData(data)
      cy.get('.tile .tileContent').should('be.visible')
      cy.wait(300)
      cy.get('.tile').matchImageSnapshot('radio-service-volumes')
    })
  })
})
