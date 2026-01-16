# Technical Context: GA Kneeboard

## Technologies Used

### Frontend Framework
- **Vue.js 3**: Core framework for building the user interface
  - Composition API for component logic
  - Single File Components (.vue) for encapsulating HTML, CSS, and JavaScript
  - Vue Router for navigation between views

### UI Components
- **PrimeVue**: UI component library providing styled elements
  - Toast notifications
  - Confirmation dialogs
  - Form controls

### Styling
- **CSS**: Custom styling with scoped component styles
- **CSS Variables**: For theming and consistent styling
- **Responsive Design**: Flexbox and CSS Grid for layouts

### Icons and Graphics
- **Font Awesome**: Icon library for UI elements
- **SVG**: Custom graphics for specialized aviation elements

### State Management
- **Vue Reactivity**: Built-in reactivity system
- **Local Storage**: Browser storage for persistence
- **Custom Services**: For specialized state management

### Authentication
- **OAuth**: Integration with multiple providers
  - Google Sign-In
  - Apple ID
  - Facebook Login

### Data Handling
- **TypeScript**: Type safety for complex data structures
- **JSON**: Data format for template storage and API communication

### PDF Generation
- **PDF.js**: For rendering and working with PDF documents
- **Custom PDF generation**: For print functionality

### Testing
- **Cypress**: End-to-end testing framework
- **Unit Tests**: For core functionality

### Build Tools
- **Vite**: Modern build tool for fast development
- **Babel**: JavaScript compiler for compatibility
- **npm**: Package management

## Development Setup

### Local Development
```
npm run dev
```
- Starts the UI on port 5173
- Access via http://localhost:5173
- For network access (e.g., iPad testing): `npm run dev -- --host`

### Testing
- See tests/README.md for detailed testing instructions
- Cypress tests organized by feature area

### Release Process
1. Run tests
2. Update Release.md with changes
3. Update version number in data.js
4. Merge code to main branch

### Version Numbering
- Format: YWWN
  - Y = Year (single digit)
  - WW = Week number (two digits)
  - N = Version within that week
- Example: 5011 = First release of week 1 in 2025

## Technical Constraints

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- iPad compatibility for cockpit use
- No IE11 support

### Performance Targets
- Initial load < 3 seconds on average connections
- Responsive UI with no perceptible lag
- Print generation < 5 seconds

### Storage Limitations
- LocalStorage limit (typically 5MB per domain)
- Maximum template complexity based on subscription tier
- Print credit system for limiting print operations

### Authentication Requirements
- Sign-in required for template saving and printing
- Anonymous access for demo viewing only

## Dependencies

### Core Dependencies
- Vue.js 3.x
- Vue Router
- TypeScript
- PrimeVue
- Font Awesome
- PDF.js

### Development Dependencies
- Vite
- Babel
- ESLint
- Cypress
- TypeScript compiler

### External Services
- Google API (Client ID: 864395393673-li5elss3gtbhipp6pdjs1pbgbl0866si.apps.googleusercontent.com)
- Backend API for template storage and user management
- OAuth providers

## Tool Usage Patterns

### Local Storage Management
- Templates stored in structured JSON format
- Cleanup routine to prevent storage overflow
- Version tracking for compatibility

### API Communication
- RESTful API calls for backend communication
- JWT authentication for secure requests
- Error handling with user-friendly messages

### Component Development
- Reusable components with clear props/events interfaces
- Consistent naming conventions
- Component documentation in comments

### State Management
- Component-local state for UI-specific concerns
- Shared state for cross-component coordination
- Persistent state for user data

### Testing Strategy
- Unit tests for core business logic
- Component tests for UI behavior
- End-to-end tests for critical user flows
- Manual testing for print output quality

## Deployment

### Hosting
- Vercel for frontend hosting
- Custom backend hosting (details in backend documentation)

### CI/CD
- Automated testing on pull requests
- Deployment on merge to main branch
- Version tagging for releases

### Monitoring
- Error tracking for frontend issues
- Usage analytics for feature optimization
- Performance monitoring

## Security Considerations

### Data Protection
- No sensitive aviation data stored (user brings their own data)
- Template data encrypted in transit
- Authentication tokens secured in browser storage

### Input Validation
- Client-side validation for immediate feedback
- Server-side validation for security
- Sanitization of user-generated content

### API Security
- Rate limiting to prevent abuse
- CORS configuration for API access
- Proper authentication for all data operations

## Development Practices

### Code Style
- ESLint configuration for consistent formatting
- TypeScript for type safety
- Component-focused architecture

### Documentation
- Code comments for complex logic
- README files for key directories
- Release notes for version changes

### Git Workflow
- Feature branches for development
- Pull requests for code review
- Semantic commit messages
