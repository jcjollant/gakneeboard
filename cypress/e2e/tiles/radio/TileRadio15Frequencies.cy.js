describe('Radio Tile 15 Frequencies Test', () => {
  let tileData, frequencies

  before(() => {
    cy.fixture('radioTileData').then(data => tileData = data)
  })

  it('should display 15 frequencies without overflow', () => {

    const radioTileDataString = JSON.stringify(tileData)
    // console.debug(radioTileDataString)
    cy.setLocalStorage('test-tile', radioTileDataString)
    cy.visit('/?test=tile')
    
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
})