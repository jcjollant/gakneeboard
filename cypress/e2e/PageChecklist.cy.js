import { loadTestPage, PageTypeLabel } from './shared'

describe('Checklist Page', () => {
  it('Checklist work', () => {
    // 1. Load Page (View Mode)
    loadTestPage(PageTypeLabel.checklist, { name: 'Checklist', items: [] })

    cy.get('.pageChecklist > .headerTitle').contains("Checklist")
    // Verify View Mode (default 1 column, no items)
    cy.get('.pageChecklist .viewMode .columns').children().should('have.length', 1)
    cy.get('.pageChecklist .list0').contains('No Items')

    // 2. Enter Edit Mode
    cy.get('.pageChecklist > .headerTitle').click()
    cy.get('.settings').should('be.visible')

    // 3. Settings Validation
    // Check Name input
    cy.get('.checklistNameAddon').next('input').should('have.value', 'Checklist')

    // Switch to Text Mode
    cy.contains('.columnsChoice', 'Editor').find('[aria-label="Text"]').click()
    cy.get('.editor-text textarea').should('be.visible')

    // Add items to first column
    const list1 = ['##Section1', 'Challenge1.1##Response1.1']
    cy.get('.editor-text textarea').type(list1.join('\n'), { delay: 0 })

    // Switch to Visual Mode to ensure text is saved
    cy.contains('.columnsChoice', 'Editor').find('[aria-label="Visual"]').click()

    // Switch to 2 columns
    cy.contains('.columnsChoice', 'Columns').find('[aria-label="2"]').click()

    // Select Right Column
    cy.contains('.columnsChoice', 'Editing').should('be.visible')
    cy.contains('.columnsChoice', 'Editing').find('[aria-label="Right"]').click()

    // Switch back to Text Mode
    cy.contains('.columnsChoice', 'Editor').find('[aria-label="Text"]').click()

    // Add items to second column
    const list2 = ['##Section2', 'Challenge2.1##Response2.1']
    cy.get('.editor-text textarea').clear().type(list2.join('\n'), { delay: 0 })

    // Switch back to Visual Mode to ensure text is saved
    cy.contains('.columnsChoice', 'Editor').find('[aria-label="Visual"]').click()

    // Apply changes
    cy.get('[aria-label="Apply"]').click()

    // 4. Verify View Mode content
    cy.get('.pageChecklist .viewMode .columns').children().should('have.length', 2)

    // Verify List 0
    cy.get('.pageChecklist .list0 .section').contains('Section1')
    cy.get('.pageChecklist .list0 .challenge').contains('Challenge1.1')
    cy.get('.pageChecklist .list0 .response').contains('Response1.1')

    // Verify List 1
    cy.get('.pageChecklist .list1 .section').contains('Section2')
    cy.get('.pageChecklist .list1 .challenge').contains('Challenge2.1')
    cy.get('.pageChecklist .list1 .response').contains('Response2.1')

    // 5. Verify Theme Change
    cy.get('.pageChecklist > .headerTitle').click()
    cy.get('.green').click()
    cy.get('[aria-label="Apply"]').click()

    // Check if theme applied (ChecklistViewer applies theme class to items or sections??)
    // ChecklistViewer: v-for item. getClassSection: if strong/emer/normal. theme is pushed.
    // getClassChallenge: if index%2 && item.type!='blank' -> push theme.

    // We have generic items. Challenge1.1 is index 1 (index 0 is Section).
    // Section is index 0. `getClassSection` -> `if(item.type!='blank') output.push('normaal')`. Reference code "normaal"??
    // Wait, ChecklistViewer code: line 37: `output.push('normaal')`. Typo? 
    // Re-read ChecklistViewer.vue step 233.

    // But Challenge1.1 (index 1) -> getClassChallenge -> index%2 (1) is true -> output.push(theme.value).
    // So .list0 .item eq(1) .challenge should have class 'theme-green'.

    cy.get('.pageChecklist .list0 .item').eq(1).find('.challenge').should('have.class', 'theme-green')

  })
})