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

    //  switch to edit mode
    cy.get('.page0 > .headerTitle').click()
    cy.get('.page0 > .headerTitle').contains("Checklist")

    // cy.get('.p-inputgroup > .p-inputtext').contains('Checklist')
    // Should default to one column
    cy.get('.page0 .columns').children().should('have.length', 1)

    // Should have three choices for colums
    cy.get('.page0 .columnsChoice > .oneChoice').children().should('have.length', 3);

    // Check is has 6 themes
    cy.get('.page0 .themeSelector > .sampleList').children().should('have.length', 6) 

    // check it has hint
    cy.get('.page0 .actionBarHelp')

    // Has textArea 1 only
    cy.get('.page0 .textArea1').should('have.class','text1')
    cy.get('.page0 .textArea2').should('not.exist')
    cy.get('.page0 .textArea2').should('not.exist')

    // switch to two columns
    cy.get('[aria-label="Two"]').click()
    // Should have both text area
    cy.get('.page0 .columns').children().should('have.length', 2)
    cy.get('.page0 .textArea1').should('have.class','text2')
    cy.get('.page0 .textArea2').should('have.class','text2')
    cy.get('.page0 .textArea3').should('not.exist')

    // switch to three columns
    cy.get('[aria-label="Three"]').click()
    // Should have both text area
    cy.get('.page0 .columns').children().should('have.length', 3)
    cy.get('.page0 .textArea1').should('have.class','text3')
    cy.get('.page0 .textArea2').should('have.class','text3')
    cy.get('.page0 .textArea3').should('have.class','text3')

    const list1= ['##Section1','Challenge1.1##Response1.1','##','','Challenge1.2','Challenge1.3##','##!Emergency','##*Strong']
    cy.get('.page0 .textArea1').type(list1.join('\n'))
    const list2 = ['##Section2','Challenge2.1##Response2.1','##','','Challenge2.2','Challenge2.3##']
    cy.get('.page0 .textArea2').type(list2.join('\n'))
    const list3 = ['##!Section3.0','Challenge3.1##Response3.1','##','','Challenge3.2','Challenge3.3##','##Section3.4']
    cy.get('.page0 .textArea3').type(list3.join('\n'))
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
        expect(template.data[0].data.items3.length).to.equal(list3.length)
      })

    // Test content and style
    // Section
    cy.get('.page0 .list0 > :nth-child(1) > .section').contains('Section1')
    // Normal line with two short boxes
    cy.get('.page0 .list0 > :nth-child(2) > .challenge').should('have.class', 'theme-green')
    cy.get('.page0 .list0 > :nth-child(2) > .challenge').contains('Challenge1.1')
    cy.get('.page0 .list0 > :nth-child(2) > .response').should('have.class', 'theme-green')
    cy.get('.page0 .list0 > :nth-child(2) > .response').contains('Response1.1')
    // short empty boxes
    cy.get('.page0 .list0 > :nth-child(3) > .challenge').should('be.empty')
    cy.get('.page0 .list0 > :nth-child(3) > .challenge').should('not.have.class', 'theme-green')
    cy.get('.page0 .list0 > :nth-child(3) > .response').should('be.empty')
    cy.get('.page0 .list0 > :nth-child(3) > .response').should('not.have.class', 'theme-green')
    // long empty box
    cy.get('.page0 .list0 > :nth-child(4) > .section').should('be.empty')
    cy.get('.page0 .list0 > :nth-child(4) > .section').should('not.have.class', 'theme-green')
    // long box with challenge
    cy.get('.page0 .list0 > :nth-child(5) > .spanned').contains('Challenge1.2')
    // short boxes with challenge and question
    cy.get('.page0 .list0 > :nth-child(6) > .challenge').contains('Challenge1.3')
    cy.get('.page0 .list0 > :nth-child(6) > .response').should('be.empty')
    // Emergent Section
    cy.get('.page0 .list0 > :nth-child(7) > .section').contains('Emergency')
    cy.get('.page0 .list0 > :nth-child(7) > .section').should('have.class', 'emergent')
    cy.get('.page0 .list0 > :nth-child(8) > .section').contains('Strong')
    cy.get('.page0 .list0 > :nth-child(8) > .section').should('have.class', 'theme-green-strong')

    // Middle list
    cy.get('.page0 .list1 > :nth-child(1) > .section').contains('Section2')
    cy.get('.page0 .list1 > :nth-child(2) > .challenge').contains('Challenge2.1')
    cy.get('.page0 .list1 > :nth-child(2) > .challenge').should('have.class','theme-green')
    cy.get('.page0 .list1 > :nth-child(2) > .response').contains('Response2.1')
    cy.get('.page0 .list1 > :nth-child(2) > .response').should('have.class','theme-green')
    // short empty boxes
    cy.get('.page0 .list1 > :nth-child(3) > .challenge').should('be.empty')
    cy.get('.page0 .list1 > :nth-child(3) > .challenge').should('not.have.class','theme-green')
    cy.get('.page0 .list1 > :nth-child(3) > .response').should('be.empty')
    cy.get('.page0 .list1 > :nth-child(3) > .response').should('not.have.class','theme-green')
    // long empty box
    cy.get('.page0 .list1 > :nth-child(4) > .section').should('be.empty')
    cy.get('.page0 .list1 > :nth-child(4) > .section').should('not.have.class','theme-green')
    // long box with challenge
    cy.get('.page0 .list1 > :nth-child(5) > .spanned').contains('Challenge2.2')
    // short boxes with challenge and question
    cy.get('.page0 .list1 > :nth-child(6) > .challenge').contains('Challenge2.3')
    cy.get('.page0 .list1 > :nth-child(6) > .response').should('be.empty')

    // Right List
    cy.get('.page0 .list2 > :nth-child(1) > .section').contains('Section3.0')
    cy.get('.page0 .list2 > :nth-child(1) > .section').should('have.class', 'emergent')
    cy.get('.page0 .list2 > :nth-child(2) > .challenge').contains('Challenge3.1')
    cy.get('.page0 .list2 > :nth-child(2) > .challenge').should('have.class','theme-green')
    cy.get('.page0 .list2 > :nth-child(2) > .response').contains('Response3.1')
    cy.get('.page0 .list2 > :nth-child(2) > .response').should('have.class','theme-green')
    // short empty boxes
    cy.get('.page0 .list2 > :nth-child(3) > .challenge').should('be.empty')
    cy.get('.page0 .list2 > :nth-child(3) > .challenge').should('not.have.class','theme-green')
    cy.get('.page0 .list2 > :nth-child(3) > .response').should('be.empty')
    cy.get('.page0 .list2 > :nth-child(3) > .response').should('not.have.class','theme-green')
    // long empty box
    cy.get('.page0 .list2 > :nth-child(4) > .section').should('be.empty')
    cy.get('.page0 .list2 > :nth-child(4) > .section').should('not.have.class','theme-green')
    // long box with challenge
    cy.get('.page0 .list2 > :nth-child(5) > .spanned').contains('Challenge3.2')
    // short boxes with challenge and question
    cy.get('.page0 .list2 > :nth-child(6) > .challenge').contains('Challenge3.3')
    cy.get('.page0 .list2 > :nth-child(6) > .response').should('be.empty')
    cy.get('.page0 .list2 > :nth-child(7) > .section').contains('Section3.4')


    // make sure we start with green
    cy.get('.page0 .list0 > :nth-child(2) > .challenge').should('have.class','theme-green')
    // Change color to blue and title to Title1
    cy.get('.page0 > .headerTitle').click()
    cy.get('.theme-blue > label').click()
    cy.get('.p-inputgroup > .p-inputtext').type('Title1')
    cy.get('[aria-label="Apply"]').click()
    // check it's blue
    cy.get('.page0 .list0 > :nth-child(2) > .challenge').should('have.class', 'theme-blue')
    // Next three lines should not be blue
    cy.get('.page0 .list0 > :nth-child(3) > .challenge').should('not.have.class', 'theme-blue')
    // this one because it's blank
    cy.get('.page0 .list0 > :nth-child(4) > .section').should('not.have.class', 'theme-blue')
    cy.get('.page0 .list0 > :nth-child(5) > .challenge').should('not.have.class', 'theme-blue')
    // odd lines should be blue
    cy.get('.page0 .list0 > :nth-child(6) > .challenge').should('have.class', 'theme-blue')
    // Emergent should not be affected
    cy.get('.page0 .list0 > :nth-child(7) > .section').should('have.class', 'emergent')
    cy.get('.page0 .list0 > :nth-child(7) > .section').should('not.have.class', 'theme-blue')
    // strong should be affected
    cy.get('.page0 .list0 > :nth-child(8) > .section').should('have.class', 'theme-blue-strong')
    cy.get('.page0 .list0 > :nth-child(8) > .section').should('not.have.class', 'theme-blue')

    cy.get('.page0 > .headerTitle').contains('Title1')

    // change color and title but don't save
    cy.get('.page0 > .headerTitle').click()
    cy.get('.theme-green > label').click()
    cy.get('.p-inputgroup > .p-inputtext').type('Title2')
    cy.get('[aria-label="Cancel"]').click()
    cy.get('.page0 .list0 > :nth-child(2) > .challenge').should('have.class','theme-blue')
    cy.get('.page0 > .headerTitle').contains('Title1')

  })
})