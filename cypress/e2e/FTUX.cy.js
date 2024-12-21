import { environment, visitAndCloseBanner, visitSkipBanner } from './shared.js'

describe('First Time User Experience', () => {

    // As a new user, I should get the HDIW popup with all its content
    // As a new user, The popup should show until I click "Got it"
    it('HDIW', () => {
        cy.visit(environment)
        cy.get('#pv_id_1_header').contains('Create Your Kneeboard')
        cy.get('.hdiw').contains('Airports')
        cy.get('.hdiw').contains('Checklist')
        cy.get('.hdiw').contains('Navlog')
        cy.get('.intro').contains('perfect Kneeboard')
        cy.get('.p-button').contains('Got it')
        // Close with top right button
        cy.get('.p-dialog-header-icon').click()

        // reload should show the popup again
        visitAndCloseBanner()

        // reload should not show HDIW
        cy.visit(environment)
        cy.get('#pv_id_1_header').should('not.exist')
    })

    // As a new user, I should see the about button
    it('Home Page Elements', () => {
        visitSkipBanner()
        // As a new user, I should see the Logo
        cy.get('.logo-img')
        cy.get('.logo-name').contains('GA Kneeboard')
        cy.get('.session').contains('Sign In')
        cy.get('.feedbackButton')
        cy.get('.aboutButton')

        // As a new user, I should see the default templates
        cy.get('.templateSection')
        cy.get('.templateSection > .templateList').children().should('have.length', 3)
        cy.get('.templateSection > .templateList > :nth-child(1)').contains('New')
        cy.get('.templateSection > .templateList > :nth-child(2)').contains('Local')
        cy.get('.templateSection > .templateList > :nth-child(3)').contains('No Templates (yet)')

        // As a new user, I should see the demos
        cy.get('.demoSection')
        const expectedDemos = ['Default','Checklist','Tiles','NavLog','C172 Reference','Charts']
        cy.get('.demoSection > .templateList').children().should('have.length', expectedDemos.length)
        expectedDemos.forEach((demo, index) => {
            cy.get('.demoSection > .templateList').children().eq(index).contains(demo)
        })

        // As a new user, I should see the version number
        cy.get('.versionDialog')
    })
})
