# Conversion Funnel Tracking

The conversion funnel from first session to account creation is tracked in Google Analytics 4 (GA4). The initial stages are captured via standard `page_view` events, while the final intent and registration steps use custom events.

## Event Sequence

```mermaid
sequenceDiagram
    participant User
    participant App as Vue Frontend
    participant GA4 as Google Analytics
    participant Backend as Node API

    %% Awareness & Interest (Page Views)
    User->>App: Visits Landing Page (/ftux)
    App->>GA4: page_view (page_location: /ftux)
    
    User->>App: Clicks Demo (/demo/:name)
    App->>GA4: page_view (page_location: /demo/:name)
    
    User->>App: Views Template (/template/:id)
    App->>GA4: page_view (page_location: /template/:id)

    %% Interaction Intent (Custom Events)
    User->>App: Clicks "Save", "Print", or opens "SignIn"
    
    alt User is not signed in and clicks Save/Print
        App->>GA4: save_intent / print_intent
    end
    
    App->>User: Shows SignIn dialog
    App->>GA4: view_sign_in

    %% Authentication Action
    User->>App: Selects Provider (Google/Apple/Email)
    User->>App: Chooses "Where did you hear about us?"
    App->>Backend: /authenticate (token, source, etc.)
    
    alt Successful Authentication (New User)
        Backend-->>App: Returns User (isNew: true)
        App->>GA4: sign_up (method: provider, source: channel)
        App->>User: Closes dialog, user is logged in
    else Successful Authentication (Existing User)
        Backend-->>App: Returns User (isNew: false)
        App->>GA4: login (method: provider)
        App->>User: Closes dialog, user is logged in
    else Authentication Error / Cancel
        Backend-->>App: Returns Error (400, API error)
        App->>GA4: auth_error (method: provider, error: message)
        App->>User: Displays error message
    end
```

## Events Breakdown

### 1. Awareness & Interest (Automatic Page Tracking)
These stages rely on GA4's default `page_view` event, filtering by `page_location`:
- **FTUX**: `/ftux`
- **Demo**: `/demo/:name` (e.g., `/demo/vfr_flight`)
- **Template View**: `/template/:id` (e.g., `/template/local`)

### 2. Consideration & Intent (Custom Events)
- **`save_intent`**: Triggered when an unauthenticated user tries to save.
- **`print_intent`**: Triggered when an unauthenticated user clicks print buttons.
- **`view_sign_in`**: Triggered when the `SignIn.vue` dialog opens.

### 3. Conversion (Custom Events)
- **`sign_up`**: Triggered when a *new* user account is successfully created. Includes `method` and `source` channel.
- **`login`**: Triggered when an *existing* user logs in. Includes `method`.
- **`auth_error`**: Triggered on authentication failure or cancellation.
