# Session Expired Handling

This document describes the session expired handling system that replaces generic "invalid token"
error messages with a user-friendly modal experience.

## Overview

When a user's authentication token expires, instead of showing confusing toast error messages, the
system now:

1. ✅ **Shows a clear modal** explaining the session expired
2. ✅ **Provides "Sign In" and "Sign Out" buttons** for user choice
3. ✅ **Automatically signs out** if the user closes the modal
4. ✅ **Suppresses toast notifications** for session errors
5. ✅ **Clears error state** to avoid confusing UI

## Components

### SessionExpiredModal

A modal component that shows when session expires:

```tsx
import { SessionExpiredModal } from "@suppers/ui-lib";

<SessionExpiredModal
  open={isOpen}
  onLogin={() => window.location.href = "/login"}
  onSignOut={() => authClient.signOut()}
  onClose={() => authClient.signOut()} // Auto sign out on close
/>;
```

### useSessionExpiredHandler Hook

A hook that manages session expired detection and modal state:

```tsx
import { useSessionExpiredHandler } from "@suppers/ui-lib";

const sessionHandler = useSessionExpiredHandler({
  onLogin: () => window.location.href = "/login",
  onSignOut: () => authClient.signOut(),
});

// Check if error is session expired
if (sessionHandler.handleSessionExpiredError(error)) {
  // Session expired - modal will show, don't show toast
} else {
  // Normal error - show toast notification
  showError(error.message);
}
```

## Usage Patterns

### Pattern 1: API Response Errors

For errors returned in API response objects:

```tsx
const response = await api.getData();

if (response.error) {
  // ✅ CORRECT: Check session first
  if (sessionHandler.handleApiResponseError(response.error)) {
    // Session expired - clear state, modal handles it
    setError(null);
    setData(null);
  } else {
    // Normal error - show to user
    setError(response.error);
    showError(response.error);
  }
}
```

### Pattern 2: Thrown Exceptions

For errors thrown by API calls:

```tsx
try {
  const data = await api.updateData(payload);
  setData(data);
} catch (err) {
  // ✅ CORRECT: Use handleWithSessionCheck
  sessionHandler.handleWithSessionCheck(
    err,
    () => {
      // Session expired callback
      setError(null);
    },
    (error) => {
      // Normal error callback
      const msg = error instanceof Error ? error.message : "Update failed";
      setError(msg);
      showError(msg);
    },
  );
}
```

### Pattern 3: Complete Component Integration

```tsx
import { SessionExpiredModal, useSessionExpiredHandler } from "@suppers/ui-lib";

export default function MyComponent() {
  const sessionHandler = useSessionExpiredHandler({
    onLogin: () => window.location.href = "/auth/login",
    onSignOut: () => authClient.signOut(),
  });

  // ... component logic with error handling ...

  return (
    <div>
      {/* Your component UI */}

      {/* ✅ IMPORTANT: Always include the modal */}
      <SessionExpiredModal
        open={sessionHandler.isSessionExpiredModalOpen}
        onLogin={sessionHandler.handleLogin}
        onSignOut={sessionHandler.handleSignOut}
        onClose={sessionHandler.hideSessionExpiredModal}
      />
    </div>
  );
}
```

## Error Detection

The system automatically detects session expired errors based on:

- ✅ Error messages containing "Invalid or expired token"
- ✅ Error messages with "token" and "invalid" keywords
- ✅ Error messages with "session" and "expired" keywords
- ✅ HTTP 401 status codes
- ✅ Error codes like "token_expired" or "invalid_credentials"

## Backend Integration

### API Response Format

APIs should return structured errors for session issues:

```json
{
  "error": "Invalid or expired token",
  "code": "token_expired",
  "message": "Your session has expired. Please log in again."
}
```

### Exception Format

When throwing session-related exceptions:

```typescript
const error = new Error("Invalid or expired token. Please log in again.");
(error as any).code = "token_expired";
(error as any).status = 401;
throw error;
```

## Migration Guide

### ❌ OLD WAY (Shows confusing toast)

```tsx
try {
  const response = await api.getData();
  if (response.error) {
    showError(response.error); // Shows "Invalid token" toast
  }
} catch (err) {
  showError(err.message); // Shows confusing error
}
```

### ✅ NEW WAY (Shows session modal)

```tsx
const sessionHandler = useSessionExpiredHandler({...});

try {
  const response = await api.getData();
  if (response.error) {
    if (!sessionHandler.handleApiResponseError(response.error)) {
      showError(response.error); // Only for non-session errors
    }
  }
} catch (err) {
  sessionHandler.handleWithSessionCheck(err, 
    () => {/* session expired */}, 
    (error) => showError(error.message) /* normal error */
  );
}

// Don't forget the modal in JSX!
<SessionExpiredModal ... />
```

## Testing

The system includes an example component at `components/examples/SessionHandlingExample.tsx` that
demonstrates:

- ✅ Proper error detection and handling
- ✅ Modal behavior for session errors
- ✅ Normal error handling for other errors
- ✅ State management during session expiry

Run the example to test the complete flow.
