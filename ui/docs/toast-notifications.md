# Toast Notifications

To show toast notifications in Vue components:

## Setup

```typescript
// Imports
import { useToaster } from '../assets/Toaster'
import { useToast } from 'primevue/usetoast'

// Setup
const toaster = useToaster(useToast())
```

## Usage

```typescript
toaster.success('Title', 'Message')  // Green toast
toaster.error('Title', 'Message')    // Red toast
toaster.info('Title', 'Message')     // Blue toast
toaster.warning('Title', 'Message')  // Orange toast
```

## Requirements

- App.vue must include `<Toast />` component for toasts to display
- Uses PrimeVue's toast system with custom Toaster wrapper

## Example Implementation

```typescript
function copyToClipboard() {
  navigator.clipboard.writeText(data)
  toaster.success('Copied', 'Data copied to clipboard')
}
```