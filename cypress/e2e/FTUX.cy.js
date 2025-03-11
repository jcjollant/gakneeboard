import { boeingTitle, demoChecklistOnPage, demoTilesOnPage, environment, expectedDemos, expectToast, loadDemo, rentonTitle, selectionTitle, visitAndCloseBanner, visitSkipBanner } from './shared.js'

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
        cy.get('.demoSection > .templateList').children().should('have.length', expectedDemos.length)
        expectedDemos.forEach((demo, index) => {
            cy.get('.demoSection > .templateList').children().eq(index).contains(demo.l)
        })
        
        // As a new user, I should see the version number
        cy.get('.versionDialog')
    })

    // As a new User I can open demos
    it('Open Demos', () => {
        visitSkipBanner()
        cy.viewport('macbook-16')

        // Check Demo 0
        loadDemo('Default')
        demoTilesOnPage(0)
        demoChecklistOnPage(1)

        // go back via image
        cy.get('.logo-img').click()
        // Open Checklist demo
        loadDemo('Checklist')
        cy.get('.page0 > .headerTitle').contains('Preflight')

        // go back via name
        cy.get('.logo-name').click()
        // Open Tiles demo
        loadDemo('Tiles')
        cy.get('.tile0 > .headerTitle').contains(rentonTitle)
        cy.get('.tile1 > .headerTitle').contains(boeingTitle)

        // Check demo pages description work
        cy.get('.logo-img').click()
        cy.get('.demoSection > .templateList').children().should('have.length', expectedDemos.length)
        for(const ed of expectedDemos) {
            visitSkipBanner()
            cy.get(`.demo${ed.i}`).contains(ed.l);
            cy.get(`.demo${ed.i}`).title(ed.t);
            loadDemo(ed.i)
            cy.get('.page0').should('have.class',ed.c[0])
            cy.get('.page1').should('have.class',ed.c[1])
        }
    })

    it('Create new template', () => {
        visitSkipBanner()

        // As a new User, I can create a new Template
        cy.get('.templateNew').click()
        cy.get('.page0 > .headerTitle').contains(selectionTitle)
        // Customize with Notes page on the left
        cy.get('.page0 > .list > [aria-label="Notes"]').click()

        // As a new User I can rename a template
        const newName = 'NewName'
        cy.get('#btnSettings').click()
        cy.get('.pageName > .p-inputtext').type( '{selectAll}'+newName,{delay:0})
        cy.get('.pageDescription > .p-inputtext').type('NewDescription',{delay:0})
        // Should have a version number at 0
        cy.get('.templateVersion').should('have.value', '0')

        // Save details
        cy.get('[aria-label="Save"]').click()
        cy.get('.templateName').contains(newName);
    })

    it('Features Require Signin', () => {
        visitSkipBanner()
        loadDemo('Default')

        // As a new User I cannot save a template without signing in
        cy.get('#btnSave').click()
        expectToast('Please sign in to use custom templates')
        cy.get('#btnPrint').click()
        expectToast('Please sign in before printing')
        cy.get('#btnEditor').click()
        expectToast('Please sign in to use the editor')
    })
})
