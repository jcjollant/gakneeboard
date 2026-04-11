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
    cy.get('.tile').matchImageSnapshot('weather-full-default')
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
    cy.get('.tile').matchImageSnapshot('weather-full-3lines')
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
    cy.get('.tile').matchImageSnapshot('weather-compact')
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
    cy.get('.tile').matchImageSnapshot('weather-categories')
  })

  it('Full ATIS expanded (span-2)', () => {
    const data = [
      { name: 'atis', data: {}, expanded: true },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .tileContentEx').should('be.visible')
    cy.wait(300)
    cy.get('.tile0').matchImageSnapshot('weather-full-expanded')
  })

  it('Full ATIS expanded (span-2) — 2 lines', () => {
    const data = [
      { name: 'atis', data: { lines: 2 }, expanded: true },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .tileContentEx').should('be.visible')
    cy.wait(300)
    cy.get('.tile0').matchImageSnapshot('weather-full-expanded-2lines')
  })

  it('Full ATIS expanded (span-2) — 3 lines', () => {
    const data = [
      { name: 'atis', data: { lines: 3 }, expanded: true },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .tileContentEx').should('be.visible')
    cy.wait(300)
    cy.get('.tile0').matchImageSnapshot('weather-full-expanded-3lines')
  })

  it('Full ATIS expanded (span-2) — 4 lines', () => {
    const data = [
      { name: 'atis', data: { lines: 4 }, expanded: true },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .tileContentEx').should('be.visible')
    cy.wait(300)
    cy.get('.tile0').matchImageSnapshot('weather-full-expanded-4lines')
  })

  it('Compact expanded (span-2)', () => {
    const data = [
      { name: 'atis', data: { mode: 'compact' }, expanded: true },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .tileContent').should('be.visible')
    cy.wait(300)
    cy.get('.tile0').matchImageSnapshot('weather-compact-expanded')
  })

  it('Compact expanded (span-2) — 2 lines', () => {
    const data = [
      { name: 'atis', data: { mode: 'compact', lines: 2 }, expanded: true },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .tileContent').should('be.visible')
    cy.wait(300)
    cy.get('.tile0').matchImageSnapshot('weather-compact-expanded-2lines')
  })

  it('Compact expanded (span-2) — 3 lines', () => {
    const data = [
      { name: 'atis', data: { mode: 'compact', lines: 3 }, expanded: true },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .tileContent').should('be.visible')
    cy.wait(300)
    cy.get('.tile0').matchImageSnapshot('weather-compact-expanded-3lines')
  })

  it('Compact expanded (span-2) — 4 lines', () => {
    const data = [
      { name: 'atis', data: { mode: 'compact', lines: 4 }, expanded: true },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .tileContent').should('be.visible')
    cy.wait(300)
    cy.get('.tile0').matchImageSnapshot('weather-compact-expanded-4lines')
  })

  it('Flight Categories expanded (span-2)', () => {
    const data = [
      { name: 'atis', data: { mode: 'categories' }, expanded: true },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .tileContent').should('be.visible')
    cy.wait(300)
    cy.get('.tile0').matchImageSnapshot('weather-categories-expanded')
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
    cy.get('.tile').matchImageSnapshot('weather-full-no-watermarks')
  })

  it('Watermarks hidden — Expanded (span-2)', () => {
    const data = [
      { name: 'atis', data: { showWatermarks: false }, expanded: true },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .tileContentEx').should('be.visible')
    cy.wait(300)
    cy.get('.tile0').matchImageSnapshot('weather-full-expanded-no-watermarks')
  })

  it('Watermarks hidden — Expanded (span-2) — 3 lines', () => {
    const data = [
      { name: 'atis', data: { showWatermarks: false, lines: 3 }, expanded: true },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .tileContentEx').should('be.visible')
    cy.wait(300)
    cy.get('.tile0').matchImageSnapshot('weather-full-expanded-3lines-no-watermarks')
  })

  it('Watermarks hidden — Expanded (span-2) — 2 lines', () => {
    const data = [
      { name: 'atis', data: { showWatermarks: false, lines: 2 }, expanded: true },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
      { name: '', data: {} },
    ]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .tileContentEx').should('be.visible')
    cy.wait(300)
    cy.get('.tile0').matchImageSnapshot('weather-full-expanded-2lines-no-watermarks')
  })
})
