/**
 * Visual snapshot tests for Weather (ATIS) tile layout variants.
 * 
 * Covers Full ATIS notepad, Compact ATIS, Flight Categories,
 * and expanded (span-2) mode.
 * 
 * Run:   npm run test:snapshots
 * Update baselines: npm run test:snapshots:update
 */
import { loadTestTileWithData, loadTestPage, PageTypeLabel, viewport } from '../shared.js'

describe('Weather Tile — Layout Snapshots', () => {
  beforeEach(() => {
    viewport()
  })

  it('Full ATIS (default, 5 lines)', () => {
    loadTestTileWithData({
      name: 'atis',
      data: {},
      span2: false,
      hide: false
    })
    cy.get('.tile .tileContent').should('be.visible')
    cy.wait(300)
    cy.matchImageSnapshot('weather-full-default')
  })

  it('Full ATIS with 3 lines', () => {
    loadTestTileWithData({
      name: 'atis',
      data: { lines: 3 },
      span2: false,
      hide: false
    })
    cy.get('.tile .tileContent').should('be.visible')
    cy.wait(300)
    cy.matchImageSnapshot('weather-full-3lines')
  })

  it('Compact ATIS', () => {
    loadTestTileWithData({
      name: 'atis',
      data: { mode: 'compact' },
      span2: false,
      hide: false
    })
    cy.get('.tile .tileContent').should('be.visible')
    cy.wait(300)
    cy.matchImageSnapshot('weather-compact')
  })

  it('Flight Categories mode', () => {
    loadTestTileWithData({
      name: 'atis',
      data: { mode: 'categories' },
      span2: false,
      hide: false
    })
    cy.get('.tile .tileContent').should('be.visible')
    cy.wait(300)
    cy.matchImageSnapshot('weather-categories')
  })

  it('Full ATIS expanded (span-2)', () => {
    const data = [
      { name: 'atis', data: {}, span2: true },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .tileContentEx').should('be.visible')
    cy.wait(300)
    cy.matchImageSnapshot('weather-expanded')
  })

  it('Compact expanded (span-2)', () => {
    const data = [
      { name: 'atis', data: { mode: 'compact' }, span2: true },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .tileContent').should('be.visible')
    cy.wait(300)
    cy.matchImageSnapshot('weather-compact-expanded')
  })

  it('Watermarks hidden', () => {
    loadTestTileWithData({
      name: 'atis',
      data: { showWatermarks: false },
      span2: false,
      hide: false
    })
    cy.get('.tile .tileContent').should('be.visible')
    cy.wait(300)
    cy.matchImageSnapshot('weather-no-watermarks')
  })
})
