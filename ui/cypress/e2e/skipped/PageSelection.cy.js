import { visitSkipBanner, newTemplate, pageNameCover, pageNameNotes, pageNameInstrumentApproach, replacePage } from '../shared'

function ejectAndConfirm() {

}

describe('Selection Page', () => {

  it('Try All Page types', () => {

    // First text is button label, second is expected title if different from label 
    const expectedPageTypes = [
      ['Tiles', 'Tile Selection'],
      ['Strips'],
      ['Checklist'],
      ['NavLog'],
      ['Airport Diagram'],
      ['Instrument Approach'],
      ['Cover', 'Title'],
      ['Notes'],
      ['Blank', undefined]]

    // load the page to the right
    for (let index = 0; index < expectedPageTypes.length; index += 2) {
      visitSkipBanner()
      newTemplate()
      const pageType = expectedPageTypes[index]
      const contains = pageType.length > 1 ? pageType[1] : pageType[0]
      replacePage(0, pageType[0], false)
      if (contains) cy.get('.page0').contains(contains)
      if (index + 1 < expectedPageTypes.length) {
        const page2Type = expectedPageTypes[index + 1]
        const contains2 = page2Type.length > 1 ? page2Type[1] : page2Type[0]
        replacePage(1, page2Type[0], false)
        cy.get('.page1').contains(contains2)
      }
    }
  })
})
