import { viewport } from './shared.js'

describe('Print', () => {

    beforeEach(() => {
        viewport()

        // Mock FTUX cleared
        cy.setLocalStorage('popup', '3')

        // Mock User (Logged In)
        const user = {
            sha256: "mock_sha256",
            name: "Test Pilot",
            accountType: 1,
            templates: [] // No saved templates needed for this test
        }
        cy.setLocalStorage('user', JSON.stringify(user))
    })

    it('opens print mode when a template is loaded', () => {
        // Mock a local template
        const template = {
            name: "Test Template",
            format: "kneeboard",
            data: [
                { type: "tiles", name: "Page 1", data: [] },
                { type: "tiles", name: "Page 2", data: [] }
            ],
            id: 0, // Local template (unsaved)
            ver: 1
        }
        cy.setLocalStorage('template', JSON.stringify(template))

        // Open the local template directly
        cy.visit('/template/local')

        // Wait for template to load (ensure UI is ready)
        cy.get('.page0').should('be.visible')

        // Click print button from the app menu
        cy.get('#btnPrint').click()

        // Verify URL contains /print/0 (since template.id is 0)
        cy.url().should('include', '/print/0')
    })

})
