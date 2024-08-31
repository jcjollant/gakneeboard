import { visitAndCloseBanner, newPage } from './shared'

describe('Checklist Page', () => {
  it('Checklist work', () => {
    visitAndCloseBanner()
    newPage()
    // set both pages to checlist
    cy.get('.pageOne > .list > [aria-label="Checklist"]').click()
    cy.get('.pageTwo > .list > [aria-label="Checklist"]').click()
    cy.get('.pageOne > .headerTitle').contains("Checklist")
    cy.get('.pageTwo > .headerTitle').contains("Checklist")

    //  swicth to edit mode
    cy.get('.pageOne > .headerTitle').click()
    cy.get('.pageOne > .headerTitle').contains("Checklist")

    // cy.get('.p-inputgroup > .p-inputtext').contains('Checklist')
    // one list for now
    cy.get('.oneOrTwoLists').children().should('have.length', 1)

    // Check is has theme
    cy.get('.themeSelector > :nth-child(1)')
    // check it has hint
    cy.get('.actionBar > .p-button-icon-only')

    // swicth to two columns
    cy.get('[tabindex="-1"]').click()
    cy.get('.oneOrTwoLists').children().should('have.length', 2)

    cy.get('.oneOrTwoLists > :nth-child(1)').type('##Section1\nChallenge1.1##Response1.1\n##\n\nChallenge1.2\nChallenge1.3##\n##!Emergency\n##*Strong')
    cy.get('.oneOrTwoLists > :nth-child(2)').type('##Section2\nChallenge2.1##Response2.1\n##\n\nChallenge2.2\nChallenge2.3##')
    cy.get('.theme-green').click()
    cy.get('[aria-label="Apply"]').click()
    // Section
    cy.get('.leftList > :nth-child(1) > .section').contains('Section1')
    // Normal line with two short boxes
    cy.get('.leftList > .theme-green > .challenge').contains('Challenge1.1')
    cy.get('.leftList > .theme-green > .response').contains('Response1.1')
    // short empty boxes
    cy.get('.leftList > :nth-child(3) > .challenge').should('be.empty')
    cy.get('.leftList > :nth-child(3) > .response').should('be.empty')
    // long empty box
    cy.get('.leftList > :nth-child(4) > .spanned').should('be.empty')
    // long box with challenge
    cy.get('.leftList > :nth-child(5) > .spanned').contains('Challenge1.2')
    // short boxes with challenge and question
    cy.get('.leftList > :nth-child(6) > .challenge').contains('Challenge1.3')
    cy.get('.leftList > :nth-child(6) > .response').should('be.empty')
    // Emergent Section
    cy.get('.leftList > :nth-child(7) > .section').should('have.class', 'emergent')
    cy.get('.leftList > :nth-child(8) > .section').should('have.class', 'strong')

    cy.get('.rightList > .theme-green > .challenge').contains('Challenge2.1')
    cy.get('.rightList > .theme-green > .response').contains('Response2.1')
    // short empty boxes
    cy.get('.rightList > :nth-child(3) > .challenge').should('be.empty')
    cy.get('.rightList > :nth-child(3) > .response').should('be.empty')
    // long empty box
    cy.get('.rightList > :nth-child(4) > .spanned').should('be.empty')
    // long box with challenge
    cy.get('.rightList > :nth-child(5) > .spanned').contains('Challenge2.2')
    // short boxes with challenge and question
    cy.get('.rightList > :nth-child(6) > .challenge').contains('Challenge2.3')
    cy.get('.rightList > :nth-child(6) > .response').should('be.empty')


    // make sure we start with green
    cy.get('.leftList > .theme-green > .challenge').contains('Challenge1.1')
    // Change color to blue and title to Title1
    cy.get('.pageOne > .headerTitle').click()
    cy.get('.theme-blue > label').click()
    cy.get('.p-inputgroup > .p-inputtext').type('Title1')
    cy.get('[aria-label="Apply"]').click()
    // check it's blue
    cy.get('.leftList > .theme-blue > .challenge').contains('Challenge1.1')
    cy.get('.pageOne > .headerTitle').contains('Title1')

    // change color and title but don't save
    cy.get('.pageOne > .headerTitle').click()
    cy.get('.theme-green > label').click()
    cy.get('.p-inputgroup > .p-inputtext').type('Title2')
    cy.get('[aria-label="Cancel"]').click()
    cy.get('.leftList > .theme-blue > .challenge').contains('Challenge1.1')
    cy.get('.pageOne > .headerTitle').contains('Title1')

  })
})