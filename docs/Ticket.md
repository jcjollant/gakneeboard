
# Ticket System Documentation

This document explains the usage and management of the Ticket system within the application. Tickets are used primarily for tracking system alerts, errors, and important notifications that require administrative attention.

## Overview

The Ticket system provides a simple mechanism to log issues with a severity level and a message. These tickets are persisted in the database and can be managed via the Admin UI.

## Data Model

A Ticket consists of the following fields:

| Field      | Type   | Description                                                                 |
|------------|--------|-----------------------------------------------------------------------------|
| `id`       | Number | Unique identifier for the ticket.                                           |
| `createTime`| Date   | Timestamp when the ticket was created.                                      |
| `severity` | Number | Integer from 1 to 5 indicating the urgency (1=Highest, 5=Lowest).            |
| `message`  | String | Descriptive message. Truncated if exceeds storage limits (approx 64KB).     |
| `status`   | String | Current state of the ticket. Defaults to `'open'`. Can be `'closed'`.       |

## Usage in Code (Backend)

Developers can create tickets using the `TicketService`.

### Creating a Ticket

To create a new ticket, use the static `create` method of `TicketService`:

```typescript
import { TicketService } from '../services/TicketService';

// ... inside an async function ...

// Severity 1 (Critical) - Immediate attention required
await TicketService.create(1, "Database connection failed unexpectedly");

// Severity 3 (Warning) - Non-critical issue
await TicketService.create(3, "User uploaded a file with an invalid format");
```

### Automatic Truncation

The `TicketService` automatically handles long messages to prevent database errors. If a message exceeds the maximum length (approx 64KB), it will be truncated, keeping the beginning of the message and appending a suffix indicating how many characters were removed.

## Managing Tickets (UI)

Tickets are managed through the **Ticket Manager** component in the Admin interface.

### Features

1.  **View Open Tickets**:
    - The interface displays all tickets with a status of `'open'`.
    - Tickets are ordered by creation time (newest first).
    - Visual indicators (colors) differentiate severity levels.

2.  **Refresh Tickets**:
    - Click the "Fetch Open Tickets" button to reload the list from the server.

3.  **Close a Single Ticket**:
    - Click the "Close" button on an individual ticket card.
    - Confirm the action in the dialog to mark the ticket as `'closed'`.
    - The ticket will be removed from the view.

4.  **Bulk Close Tickets**:
    - **Select**: Use the checkbox on each ticket card or the "Select All" checkbox to select multiple tickets.
    - **Close Selected**: Click the "Close Selected (X)" button to close all selected tickets at once.
    - A confirmation dialog will summarize the action.
    - A toaster notification will report the success/failure count.

### Accessing the Ticket Manager

The Ticket Manager is typically located in the Admin dashboard. Ensure you are logged in with an account that has administrative privileges to view and interact with this component.
