/**
 * Visual snapshot tests for Notes tile layout variants.
 * 
 * Covers Blank (empty), Watermark (BANNER, pills), Compass (headings), 
 * Hold (new mode), and Grid layouts.
 * 
 * Run:   npm run test:snapshots
 * Update baselines: npm run test:snapshots:update
 */
import { loadTestTileWithData, loadTestPage, PageTypeLabel, viewport } from '../shared.js'

describe('Notes Tile — Layout Snapshots', () => {
  beforeEach(() => {
    viewport()
  })

  it('Blank Mode — Empty', () => {
    loadTestTileWithData({
      name: 'notes',
      data: {
        mode: ''
      }
    })
    cy.get('.tile .tileContent').should('be.visible')
    cy.wait(300)
    cy.get('.tile').matchImageSnapshot('notes-blank-empty')
  })

  it('Watermark Mode — CRAFT Banner', () => {
    loadTestTileWithData({
      name: 'notes',
      data: {
        mode: 'watermark',
        word: 'CRAFT'
      }
    })
    cy.get('.tile .blank-grid').should('be.visible')
    cy.wait(300)
    cy.get('.tile').matchImageSnapshot('notes-watermark-craft')
  })

  it('Watermark Mode — Everything Enabled', () => {
    loadTestTileWithData({
      name: 'notes',
      data: {
        mode: 'watermark',
        word: 'WARNMM',
        pills: ['CTO', 'CTL', 'APCH'],
        cols: ['ALT', 'HDG', 'FREQ']
      }
    })
    cy.get('.tile .blank-grid').should('be.visible')
    cy.wait(300)
    cy.get('.tile').matchImageSnapshot('notes-watermark-all')
  })

  it('Compass Mode — Numerical Headings', () => {
    loadTestTileWithData({
      name: 'notes',
      data: {
        mode: 'compass'
      }
    })
    cy.get('.tile .modeCompass').should('be.visible')
    cy.wait(300)
    cy.get('.tile').matchImageSnapshot('notes-compass-headings')
  })

  it('Hold Mode — Pattern Compass', () => {
    loadTestTileWithData({
      name: 'notes',
      data: {
        mode: 'hold'
      }
    })
    cy.get('.tile .modeCompass').should('be.visible')
    cy.wait(300)
    cy.get('.tile').matchImageSnapshot('notes-hold-pattern')
  })

  it('Grid Mode', () => {
    loadTestTileWithData({
      name: 'notes',
      data: {
        mode: 'grid'
      }
    })
    cy.get('.tile .modeGrid').should('be.visible')
    cy.wait(300)
    cy.get('.tile').matchImageSnapshot('notes-grid')
  })

  it('Legacy Migration — Compass with comp:false', () => {
    loadTestTileWithData({
      name: 'notes',
      data: {
        mode: 'compass',
        comp: false
      }
    })
    // Should render as Hold mode
    cy.get('.tile .modeCompass').should('be.visible')
    cy.wait(300)
    cy.get('.tile').matchImageSnapshot('notes-hold-migration')
  })

  it('Grid Mode — Expanded (Span-2)', () => {
    const data = [{
      name: 'notes',
      span2: true,
      data: {
        mode: 'grid'
      }
    }]
    loadTestPage(PageTypeLabel.tiles, data)
    cy.get('.tile0 .modeGrid').should('be.visible')
    cy.wait(300)
    cy.get('.tile0').matchImageSnapshot('notes-grid-expanded')
  })
})
