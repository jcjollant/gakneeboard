import { viewport, mockUser } from './shared.js'

describe('Print', () => {

    beforeEach(() => {
        viewport()

        // Mock FTUX cleared
        cy.setLocalStorage('popup', '3')

        // Mock User (Logged In)
        const user = {
            sha256: "mock_sha256",
            name: "Test Pilot",
            accountType: "ld",
            printCredits: 100,
            eulaCurrent: true,
            templates: [] // No saved templates needed for this test
        }
        mockUser(user)
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

    it('applies scaling and flipping when printing options are selected', () => {
        // Mock a local template
        const template = {
            name: "Test Template",
            format: "kneeboard",
            data: [
                { type: "tiles", name: "Page 1", data: [] },
                { type: "tiles", name: "Page 2", data: [] }
            ],
            id: 0,
            ver: 1
        }
        cy.setLocalStorage('template', JSON.stringify(template))

        // Go directly to print page
        cy.visit('/print/0')

        // Dialog should be open
        cy.get('.p-dialog').should('be.visible')

        // Verify Page Name is visible by default
        cy.contains('.marginNotes', 'Test Template').should('exist')

        // Verify the back page has the styles
        // .printTwoPages > :last-child matches the back page component
        cy.get('.printTwoPages > :last-child').should(($el) => {
            const style = $el.attr('style')

            // style should not be present
            expect(style).to.not.be.null
            // style should not have transform
            // expect(style).to.not.contain('transform')
            // Check for margin
            // expect(style).to.not.contain('margin-top')
        })


        // Select "Flipped" (Back Page Orientation)
        cy.get('button[aria-label="Flipped"]').click()
        cy.get('button[aria-label="Flipped"]').should('have.class', 'choiceActive')

        // Select "Small" (Clip Margin)
        cy.get('button[aria-label="Small"]').click()
        cy.get('button[aria-label="Small"]').should('have.class', 'choiceActive')

        // Verify the back page has the styles
        // .printTwoPages > :last-child matches the back page component
        cy.get('.printTwoPages > :last-child').should(($el) => {
            const style = $el.attr('style')
            // Check for margin
            expect(style).to.contain('margin-top: 12px')
            // Check for negative scale transform (flip)
            // (800-24)/800 = 0.97
            expect(style).to.contain('scale(-0.97, -0.97)')
        })

        // Select "Large" (Clip Margin)
        cy.get('button[aria-label="Large"]').click()
        cy.get('button[aria-label="Large"]').should('have.class', 'choiceActive')

        // Verify the back page has the styles
        // .printTwoPages > :last-child matches the back page component
        cy.get('.printTwoPages > :last-child').should(($el) => {
            const style = $el.attr('style')
            // Check for margin
            expect(style).to.contain('margin-top: 24px')
            // Check for negative scale transform (flip)
            // (800-24)/800 = 0.97
            expect(style).to.contain('scale(-0.94, -0.94)')
        })

        // Verify VIB (Margin Notes) visibility toggle
        // Default is Show
        cy.get('button[aria-label="Show"]').should('have.class', 'choiceActive')
        // Checkboxes should not be disabled
        cy.get('.field-checkbox input[type="checkbox"]').should('not.be.disabled')

        // Select "Hide"
        cy.get('button[aria-label="Hide"]').click()
        cy.get('button[aria-label="Hide"]').should('have.class', 'choiceActive')
        // Checkboxes should be disabled
        cy.get('.field-checkbox input[type="checkbox"]').should('be.disabled')
    })

})
