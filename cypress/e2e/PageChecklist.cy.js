import { visitAndCloseBanner, newPage } from './shared'

describe('Checklist Page', () => {
  it('Checklist work', () => {
    visitAndCloseBanner()
    newPage()
    
    // set both pages to checlist
    cy.get('.page0 > .list > [aria-label="Checklist"]').click()
    cy.get('.page1 > .list > [aria-label="Checklist"]').click()
    cy.get('.page0 > .headerTitle').contains("Checklist")
    cy.get('.page1 > .headerTitle').contains("Checklist")

    //  swicth to edit mode
    cy.get('.page0 > .headerTitle').click()
    cy.get('.page0 > .headerTitle').contains("Checklist")

    // cy.get('.p-inputgroup > .p-inputtext').contains('Checklist')
    // one list for now
    cy.get('.oneOrTwoLists').children().should('have.length', 1)

    // Check is has theme
    cy.get('.themeSelector > :nth-child(1)')
    // check it has hint
    cy.get('.actionBarHelp')
    // Does not use small font
    cy.get('.oneOrTwoLists > :nth-child(1)').should('not.have.class', 'smallTextarea')

    // swicth to two columns
    cy.get('.choiceInactive').click()
    cy.get('.oneOrTwoLists').children().should('have.length', 2)

    cy.get('.oneOrTwoLists > :nth-child(1)').should('have.class', 'smallTextarea')
    const list1= ['##Section1','Challenge1.1##Response1.1','##','','Challenge1.2','Challenge1.3##','##!Emergency','##*Strong']
    cy.get('.oneOrTwoLists > :nth-child(1)').type(list1.join('\n'))
    cy.get('.oneOrTwoLists > :nth-child(2)').should('have.class', 'smallTextarea')
    const list2 = ['##Section2','Challenge2.1##Response2.1','##','','Challenge2.2','Challenge2.3##']
    cy.get('.oneOrTwoLists > :nth-child(2)').type(list2.join('\n'))
    cy.get('.theme-green').click()
    cy.get('[aria-label="Apply"]').click()

    // test locastorage is reflecting that list
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        // console.log('>>>>', template)
        expect(template.data.length).to.equal(2)
        // page 0 should be a checklist
        expect(template.data[0].type).to.equal('checklist')
        // checklist should have all items
        expect(template.data[0].data.items.length).to.equal(list1.length)
        expect(template.data[0].data.items2.length).to.equal(list2.length)
      })

    // Section
    cy.get('.leftList > :nth-child(1) > .section').contains('Section1')
    // Normal line with two short boxes
    cy.get('.leftList > :nth-child(2) > .challenge').should('have.class', 'theme-green')
    cy.get('.leftList > :nth-child(2) > .challenge').contains('Challenge1.1')
    cy.get('.leftList > :nth-child(2) > .response').should('have.class', 'theme-green')
    cy.get('.leftList > :nth-child(2) > .response').contains('Response1.1')
    // short empty boxes
    cy.get('.leftList > :nth-child(3) > .challenge').should('be.empty')
    cy.get('.leftList > :nth-child(3) > .challenge').should('not.have.class', 'theme-green')
    cy.get('.leftList > :nth-child(3) > .response').should('be.empty')
    cy.get('.leftList > :nth-child(3) > .response').should('not.have.class', 'theme-green')
    // long empty box
    cy.get('.leftList > :nth-child(4) > .section').should('be.empty')
    cy.get('.leftList > :nth-child(4) > .section').should('not.have.class', 'theme-green')
    // long box with challenge
    cy.get('.leftList > :nth-child(5) > .spanned').contains('Challenge1.2')
    // short boxes with challenge and question
    cy.get('.leftList > :nth-child(6) > .challenge').contains('Challenge1.3')
    cy.get('.leftList > :nth-child(6) > .response').should('be.empty')
    // Emergent Section
    cy.get('.leftList > :nth-child(7) > .section').should('have.class', 'emergent')
    cy.get('.leftList > :nth-child(8) > .section').should('have.class', 'theme-green-strong')

    cy.get('.rightList > :nth-child(2) > .challenge').contains('Challenge2.1')
    cy.get('.rightList > :nth-child(2) > .challenge').should('have.class','theme-green')
    cy.get('.rightList > :nth-child(2) > .response').contains('Response2.1')
    cy.get('.rightList > :nth-child(2) > .response').should('have.class','theme-green')
    // short empty boxes
    cy.get('.rightList > :nth-child(3) > .challenge').should('be.empty')
    cy.get('.rightList > :nth-child(3) > .challenge').should('not.have.class','theme-green')
    cy.get('.rightList > :nth-child(3) > .response').should('be.empty')
    cy.get('.rightList > :nth-child(3) > .response').should('not.have.class','theme-green')
    // long empty box
    cy.get('.rightList > :nth-child(4) > .section').should('be.empty')
    cy.get('.rightList > :nth-child(4) > .section').should('not.have.class','theme-green')
    // long box with challenge
    cy.get('.rightList > :nth-child(5) > .spanned').contains('Challenge2.2')
    // short boxes with challenge and question
    cy.get('.rightList > :nth-child(6) > .challenge').contains('Challenge2.3')
    cy.get('.rightList > :nth-child(6) > .response').should('be.empty')


    // make sure we start with green
    cy.get('.leftList > :nth-child(2) > .challenge').should('have.class','theme-green')
    // Change color to blue and title to Title1
    cy.get('.page0 > .headerTitle').click()
    cy.get('.theme-blue > label').click()
    cy.get('.p-inputgroup > .p-inputtext').type('Title1')
    cy.get('[aria-label="Apply"]').click()
    // check it's blue
    cy.get('.leftList > :nth-child(2) > .challenge').should('have.class', 'theme-blue')
    // Next three lines should not be blue
    cy.get('.leftList > :nth-child(3) > .challenge').should('not.have.class', 'theme-blue')
    // this one because it's blank
    cy.get('.leftList > :nth-child(4) > .section').should('not.have.class', 'theme-blue')
    cy.get('.leftList > :nth-child(5) > .challenge').should('not.have.class', 'theme-blue')
    // odd lines should be blue
    cy.get('.leftList > :nth-child(6) > .challenge').should('have.class', 'theme-blue')
    // Emergent should not be affected
    cy.get('.leftList > :nth-child(7) > .section').should('have.class', 'emergent')
    cy.get('.leftList > :nth-child(7) > .section').should('not.have.class', 'theme-blue')
    // strong should be affected
    cy.get('.leftList > :nth-child(8) > .section').should('have.class', 'theme-blue-strong')
    cy.get('.leftList > :nth-child(8) > .section').should('not.have.class', 'theme-blue')

    cy.get('.page0 > .headerTitle').contains('Title1')

    // change color and title but don't save
    cy.get('.page0 > .headerTitle').click()
    cy.get('.theme-green > label').click()
    cy.get('.p-inputgroup > .p-inputtext').type('Title2')
    cy.get('[aria-label="Cancel"]').click()
    cy.get('.leftList > :nth-child(2) > .challenge').should('have.class','theme-blue')
    cy.get('.page0 > .headerTitle').contains('Title1')

  })
})