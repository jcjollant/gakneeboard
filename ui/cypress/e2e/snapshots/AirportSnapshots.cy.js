/**
 * Visual snapshot tests for Airport tile layout variants.
 * 
 * These tests capture baseline screenshots of every Airport tile configuration
 * and diff against them on subsequent runs to catch layout regressions.
 * 
 * Mock airport data is used for deterministic rendering.
 * 
 * Run:   npm run test:snapshots
 * Update baselines: npm run test:snapshots:update
 */
import { loadTestPage, PageTypeLabel, viewport } from '../shared.js'

function mockAllAPIs() {
  // Mock backend session (App.vue getBackend) — register first so airport mocks take priority
  cy.intercept('GET', /api\.kneeboard\.ga\/\?version=.*/, {
    statusCode: 200,
    body: { version: 'mock', aced: 0, camv: 0, user: null }
  }).as('backendSession')

  // Mock notams and metar
  cy.intercept('GET', '**/notams/**', { statusCode: 200, body: [] }).as('getNotams')
  cy.intercept('GET', '**/metar/**', { statusCode: 200, body: null }).as('getMetar')

  // Mock airport API responses  
  cy.fixture('airportKRNT').then(krnt => {
    cy.fixture('airportKBFI').then(kbfi => {
      // Group airport requests (e.g., airports/KRNT-KBFI or airports/KRNT)
      cy.intercept('GET', '**/airports/**', {
        statusCode: 200,
        body: [krnt, kbfi]
      }).as('getAirports')

      // Single airport fallback
      cy.intercept('GET', '**/airport/KRNT**', { statusCode: 200, body: krnt })
      cy.intercept('GET', '**/airport/KBFI**', { statusCode: 200, body: kbfi })
    })
  })
}

describe('Airport Tile — Layout Snapshots', () => {
  beforeEach(() => {
    viewport()
    mockAllAPIs()
  })

  it('Default single runway (KRNT 16-34)', () => {
    const data = [
      { name: 'airport', data: { code: 'KRNT', rwy: '16-34', rwyOrientation: 'vertical' } },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .airportCode', { timeout: 10000 }).should('contain', 'KRNT')
    cy.wait(500)
    cy.matchImageSnapshot('airport-krnt-default')
  })

  it('Magnetic orientation (KBFI 14L-32R)', () => {
    const data = [
      { name: 'airport', data: { code: 'KBFI', rwy: '14L-32R', rwyOrientation: 'magnetic', corners: ['weather', 'twr', 'field', 'tpa'] } },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .airportCode', { timeout: 10000 }).should('contain', 'KBFI')
    cy.wait(500)
    cy.matchImageSnapshot('airport-kbfi-magnetic')
  })

  it('Two airports side by side', () => {
    const data = [
      { name: 'airport', data: { code: 'KRNT', rwy: '16-34' } },
      { name: 'airport', data: { code: 'KBFI', rwy: '14L-32R', corners: ['weather', 'twr', 'field', 'tpa'] } },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .airportCode', { timeout: 10000 }).should('contain', 'KRNT')
    cy.get('.tile1 .airportCode', { timeout: 10000 }).should('contain', 'KBFI')
    cy.wait(500)
    cy.matchImageSnapshot('airport-two-side-by-side')
  })

  it('Custom corner fields', () => {
    const data = [
      { name: 'airport', data: { code: 'KRNT', rwy: '16-34', corners: ['weather', 'field', 'tpa', 'twr'] } },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .airportCode', { timeout: 10000 }).should('contain', 'KRNT')
    cy.wait(500)
    cy.matchImageSnapshot('airport-custom-corners')
  })
  it('Two runways vertical (KBFI)', () => {
    const data = [
      { name: 'airport', data: { code: 'KBFI', rwys: ['14L-32R', '14R-32L'], rwyOrientation: 'vertical' } },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .airportCode', { timeout: 10000 }).should('contain', 'KBFI')
    cy.wait(500)
    cy.matchImageSnapshot('airport-kbfi-two-rwys-vertical')
  })

  it('Two runways magnetic (KBFI)', () => {
    const data = [
      { name: 'airport', data: { code: 'KBFI', rwys: ['14L-32R', '14R-32L'], rwyOrientation: 'magnetic' } },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .airportCode', { timeout: 10000 }).should('contain', 'KBFI')
    cy.wait(500)
    cy.matchImageSnapshot('airport-kbfi-two-rwys-magnetic')
  })

  it('Span2 with 8 corner values (KRNT)', () => {
    const data = [
      { 
        name: 'airport', 
        span2: true, 
        data: { 
          code: 'KRNT', 
          rwy: '16-34', 
          corners: [
            'weather', 
            'twr', 
            'field', 
            '#FGND', 
            '#FCD/P', 
            'tpa', 
            '?Custom?Value', 
            '#FUNICOM'
          ] 
        } 
      },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .airportCode', { timeout: 10000 }).should('contain', 'KRNT')
    cy.wait(500)
    cy.matchImageSnapshot('airport-krnt-span2-8corners')
  })
})
