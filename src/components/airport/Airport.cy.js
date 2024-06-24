import Airport from './Airport.vue'

describe('<Airport />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-vue
    cy.mount(Airport)
  })
})