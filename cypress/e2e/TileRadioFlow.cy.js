import { visitAndCloseBanner, newPage } from './shared'

describe('Radio Flow Tile', () => {
  it('Radio Flow Tile', () => {
    visitAndCloseBanner()
    // Check all fields are present in Radio flow
    cy.fixture('radioFlow').then((radioFlow) => {
      for(let index=0; index<radioFlow.length; index++) {
        cy.get(`.freqList > :nth-child(${index+1})`).contains(radioFlow[index].freq)
        cy.get(`.freqList > :nth-child(${index+1})`).contains(radioFlow[index].name)
      }
    })

    // check header is present
    cy.get('.pageTwo > :nth-child(6) > .header > div').contains('Radio Flow')

    // Switch to edit mode
    cy.get('.pageTwo > :nth-child(6) > .header > div').click()
    // check it has hint
    cy.get('.actionBar > .p-button-icon-only')

  })
})