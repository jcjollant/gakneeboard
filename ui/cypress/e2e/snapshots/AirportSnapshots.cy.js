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
import { loadTestPage, PageTypeLabel, viewport, mockUser } from '../shared.js'

function mockAllAPIs(user = null) {
  // Mock backend session (App.vue getBackend) — register first so airport mocks take priority
  cy.intercept('GET', /api\.kneeboard\.ga\/\?version=.*/, {
    statusCode: 200,
    body: { version: 'mock', aced: 0, camv: 0, user: user }
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
  })

  it('Default single runway (KRNT 16-34)', () => {
    mockAllAPIs()
    const data = [
      { name: 'airport', data: { code: 'KRNT', rwy: '16-34', rwyOrientation: 'vertical' } },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .airportCode', { timeout: 10000 }).should('contain', 'KRNT')
    cy.wait(500)
    cy.get('.tile0').matchImageSnapshot('airport-krnt-default')
  })

  it('Magnetic orientation (KBFI 14L-32R)', () => {
    mockAllAPIs()
    const data = [
      { name: 'airport', data: { code: 'KBFI', rwy: '14L-32R', rwyOrientation: 'magnetic', corners: ['weather', 'twr', 'field', 'tpa'] } },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .airportCode', { timeout: 10000 }).should('contain', 'KBFI')
    cy.wait(500)
    cy.get('.tile0').matchImageSnapshot('airport-kbfi-magnetic')
  })

  it('Custom corner fields', () => {
    mockAllAPIs()
    const data = [
      { name: 'airport', data: { code: 'KRNT', rwy: '16-34', corners: ['weather', 'field', 'tpa', 'twr'] } },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .airportCode', { timeout: 10000 }).should('contain', 'KRNT')
    cy.wait(500)
    cy.get('.tile0').matchImageSnapshot('airport-custom-corners')
  })
  it('Two runways vertical (KBFI)', () => {
    mockAllAPIs()
    const data = [
      { name: 'airport', data: { code: 'KBFI', rwys: ['14L-32R', '14R-32L'], rwyOrientation: 'vertical' } },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .airportCode', { timeout: 10000 }).should('contain', 'KBFI')
    cy.wait(500)
    cy.get('.tile0').matchImageSnapshot('airport-kbfi-two-rwys-vertical')
  })

  it('Two runways magnetic (KBFI)', () => {
    mockAllAPIs()
    const data = [
      { name: 'airport', data: { code: 'KBFI', rwys: ['14L-32R', '14R-32L'], rwyOrientation: 'magnetic' } },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .airportCode', { timeout: 10000 }).should('contain', 'KBFI')
    cy.wait(500)
    cy.get('.tile0').matchImageSnapshot('airport-kbfi-two-rwys-magnetic')
  })

  it('Expanded with 8 corner values (KRNT)', () => {
    mockAllAPIs()
    const data = [
      { 
        name: 'airport', 
        expanded: true, 
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
    cy.get('.tile0').matchImageSnapshot('airport-krnt-span2-8corners')
  })

  it('Notes blocks and custom fields', () => {
    mockAllAPIs()
    const data = [
      { 
        name: 'airport', 
        data: { 
          code: 'KRNT', 
          rwy: '16-34', 
          corners: [
            'notes', 
            '?Custom?Label', 
            'notes', 
            '?My?Value'
          ] 
        } 
      },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .airportCode', { timeout: 10000 }).should('contain', 'KRNT')
    cy.wait(500)
    cy.get('.tile0').matchImageSnapshot('airport-notes-custom-fields')
  })

  it('Traffic Pattern — Hidden (None)', () => {
    mockAllAPIs()
    const data = [
      { name: 'airport', data: { code: 'KRNT', rwy: '16-34', pattern: 'None' } },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .airportCode').should('be.visible')
    cy.wait(500)
    cy.get('.tile0').matchImageSnapshot('airport-pattern-hidden')
  })

  it('Traffic Pattern — 45° Entry', () => {
    mockAllAPIs()
    const data = [
      { name: 'airport', data: { code: 'KRNT', rwy: '16-34', pattern: '45' } },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .airportCode').should('be.visible')
    cy.wait(500)
    cy.get('.tile0').matchImageSnapshot('airport-pattern-45entry')
  })

  it('Traffic Pattern — Midfield', () => {
    mockAllAPIs()
    const data = [
      { name: 'airport', data: { code: 'KRNT', rwy: '16-34', pattern: 'Mid' } },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .airportCode').should('be.visible')
    cy.wait(500)
    cy.get('.tile0').matchImageSnapshot('airport-pattern-midfield')
  })

  it('NOTAMs and IFR METAR', () => {
    // 1. Mock user with NOTAM/METAR access (combined in mockAllAPIs)
    const user = { sha256: 'test-user', accountType: 'pp', templates: [] }
    mockUser(user) // For localStorage
    mockAllAPIs(user) // For session intercept
    const mockNotams = [
      { id: '1', text: 'NOTAM 1: RWY 16/34 CLSD' },
      { id: '2', text: 'NOTAM 2: CRANE 200FT AGL 1NM NORTH' }
    ]
    cy.intercept('GET', '**/notams/KRNT', { statusCode: 200, body: mockNotams }).as('getNotams')

    // 3. Mock IFR METAR
    const mockMetar = {
      raw: 'KRNT 101853Z 16008KT 2SM -RA BR OVC008 12/10 A3002',
      fltCat: 'IFR',
      receiptTime: new Date().toISOString()
    }
    cy.intercept('GET', '**/metar/KRNT', { statusCode: 200, body: mockMetar }).as('getMetar')

    const data = [
      { name: 'airport', data: { code: 'KRNT', rwy: '16-34' } },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    
    // Wait for data load
    cy.wait(['@getNotams', '@getMetar'])
    
    // Safety checks
    cy.get('.tile0 .airportCode', { timeout: 10000 }).should('contain', 'KRNT')
    cy.get('.tile0 .notam-badge').should('contain', '2')
    cy.get('.tile0 .metar-badge').should('have.class', 'cat-ifr')
    
    cy.wait(500)
    cy.get('.tile0').matchImageSnapshot('airport-notams-ifr-metar')
  })

  it('Airport Diagram (KRNT)', () => {
    mockAllAPIs()
    const data = [
      { name: 'airport', data: { code: 'KRNT', mode: 'diag' } },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    
    // Safety checks
    cy.get('.tile0 .aptDiagram img', { timeout: 10000 }).should('be.visible')
    
    cy.wait(500)
    cy.get('.tile0').matchImageSnapshot('airport-krnt-diagram')
  })
})
