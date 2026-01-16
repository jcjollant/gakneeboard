import { loadTestPage, PageTypeLabel } from './shared'

describe('Checklist Fixture Tests', () => {

    beforeEach(() => {
        cy.fixture('checklist-demo').as('demoData')
    })

    it('Page 0: Preflight (Single Column)', function () {
        const pageData = this.demoData[0]
        loadTestPage(PageTypeLabel.checklist, pageData)

        cy.get('.pageChecklist > .headerTitle').contains(pageData.name)

        // Verify Single Column
        cy.get('.pageChecklist .viewMode .columns').children().should('have.length', 1)

        // Verify Theme (Yellow)
        // Challenge items usually alternate but strong/emergent sections/items have specific classes
        // Let's check a strong section
        cy.contains('.section', 'Cabin').should('have.class', 'theme-yellow-strong')

        // Verify content
        cy.contains('.challenge', 'Docs AR(R)OW')
        cy.contains('.response', 'CHECKED')
    })

    it('Page 1: Flight (Two Columns)', function () {
        const pageData = this.demoData[1]
        loadTestPage(PageTypeLabel.checklist, pageData)

        cy.get('.pageChecklist > .headerTitle').contains(pageData.name)

        // Verify Two Columns
        cy.get('.pageChecklist .viewMode .columns').children().should('have.length', 2)

        // Verify Theme (Blue)
        cy.contains('.section', 'Climb').should('have.class', 'theme-blue-strong')

        // Verify Emergency Item (should be red class usually, or specific emergent class)
        // 'Engine FAILURE' is emergent section
        cy.contains('.section', 'Engine FAILURE').should('have.class', 'emergent')

        // Items in second column
        cy.get('.pageChecklist .list1').contains('Cruise')
    })

    it('Page 2: Checklist (Three Columns)', function () {
        const pageData = this.demoData[2]
        loadTestPage(PageTypeLabel.checklist, pageData)

        cy.get('.pageChecklist > .headerTitle').contains(pageData.name)

        // Verify Three Columns
        cy.get('.pageChecklist .viewMode .columns').children().should('have.length', 3)

        // Verify Theme (Purple)
        cy.contains('.section', 'Col 1').should('have.class', 'theme-purple-strong')

        // Verify content in all columns
        cy.get('.pageChecklist .list0').contains('Challenge1.1')
        cy.get('.pageChecklist .list1').contains('Challenge2.1')
        cy.get('.pageChecklist .list2').contains('Challenge3.1')
    })

})
