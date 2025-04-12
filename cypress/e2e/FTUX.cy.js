import { boeingTitle, demoChecklistOnPage, demoTilesOnPage, expectedDemos, expectToast, loadDemo, rentonTitle, selectionTitle, visitAndCloseBanner, visitSkipBanner } from './shared.js'
import { environment, landing } from './shared.js'

function checkFtuxTile() {
    cy.get('h1').contains('Pick a demo to get started')
}

describe('First Time User Experience', () => {

    it('Landing Page', () => {
        cy.visit(landing)
        cy.get('h1').contains('The Perfect Kneeboard')
        cy.get('header > .cta-button').contains('Create Your Kneeboard')
        cy.get(':nth-child(4) > .cta-button').contains('Start Building Now')
        cy.get('.footer-cta > .cta-button').contains('Create Your Free Kneeboard')
        // navigate to FTUX and back using 3 buttons
        cy.get('header > .cta-button').click()
        checkFtuxTile()
        cy.go('back')

        cy.get(':nth-child(4) > .cta-button').click()
        checkFtuxTile()
        cy.go('back')

        cy.get('.footer-cta > .cta-button').click()
        checkFtuxTile()

    })
    // As a new user, I should get the HDIW popup with all its content
    // As a new user, The popup should show until I click "Got it"
    it('FTUX', () => {
        cy.visit(environment)
        checkFtuxTile()
        const expectedDemos = ['VFR Flight','Checklists','Charts', 'IFR Flight']
        for(let index = 0; index < expectedDemos.length; index++) {
            const demo = expectedDemos[index]
            cy.get(`.demo${index} > .name`).contains(demo)
            cy.get(`.demo${index}`).click()
            cy.get('.templateName').contains(demo)
            localStorage.removeItem('popup')
            cy.go('back')
        }
        // Should see skip button
        cy.get('.container > .fabutton').contains('Home Page')

        cy.get('.demo0').click()


        // reload should not show FTUX
        cy.visit(environment)
        cy.get('h1').should('not.exist')
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
        cy.get('.templateSection > .templateList').children().should('have.length', 2)
        cy.get('.templateSection > .templateList > :nth-child(1)').contains('New')
        cy.get('.templateSection > .templateList > :nth-child(2)').contains('No Templates (yet)')

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
        loadDemo()
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
        // Should have a version number at 0
        cy.get('.templateId').should('have.value', '0')

        // Save details
        cy.get('[aria-label="Save"]').click()
        cy.get('.templateName').contains(newName);
    })

    it('Features Require Signin', () => {
        visitSkipBanner()
        loadDemo()

        // As a new User I cannot save a template without signing in
        cy.get('#btnSave').click()
        expectToast('Please sign in to use custom templates')
        cy.get('#btnPrint').click()
        expectToast('Please sign in before printing')
        cy.get('#btnEditor').click()
        expectToast('Please sign in to use the editor')
    })
})
