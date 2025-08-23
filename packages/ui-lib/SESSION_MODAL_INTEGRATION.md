# Global Session Modal Integration Guide

This guide shows how to integrate the global session expired modal system to replace toast messages
with proper user-friendly modals.

## Quick Setup (Recommended)

### 1. Add GlobalSessionProvider to your app root

**For Admin Package:**

```tsx
// In your admin route or root component
import { AdminSessionWrapper } from "../components/AdminSessionWrapper.tsx";

export default function AdminLayout({ children }) {
  return (
    <AdminSessionWrapper>
      {children}
    </AdminSessionWrapper>
  );
}
```

**For Payments Package:**

```tsx
// In your payments route or root component
import { PaymentsSessionWrapper } from "../components/PaymentsSessionWrapper.tsx";

export default function PaymentsLayout({ children }) {
  return (
    <PaymentsSessionWrapper>
      {children}
    </PaymentsSessionWrapper>
  );
}
```

**For Custom Apps:**

```tsx
import { GlobalSessionProvider } from "@suppers/ui-lib";

export default function AppRoot({ children }) {
  return (
    <GlobalSessionProvider
      onLogin={() => window.location.href = "/auth/login"}
      onSignOut={() => window.location.href = "/"}
    >
      {children}
    </GlobalSessionProvider>
  );
}
```

### 2. Update error handling in components

Replace toast-based error handling:

```tsx
// ❌ OLD WAY - Shows confusing toast
try {
  const response = await api.getData();
  if (response.error) {
    showError(response.error); // Shows "Invalid token" toast
  }
} catch (err) {
  showError(err.message); // Shows confusing error
}
```

```tsx
// ✅ NEW WAY - Shows session modal
import { handleSessionExpiredError } from "@suppers/ui-lib";

try {
  const response = await api.getData();
  if (response.error) {
    if (!handleSessionExpiredError({ message: response.error })) {
      showError(response.error); // Only for non-session errors
    }
  }
} catch (err) {
  if (!handleSessionExpiredError(err)) {
    showError(err.message); // Only for non-session errors
  }
}
```

## What This Provides

✅ **No more confusing toast messages** for session expired errors ✅ **Clear modal** with "Session
Expired" title and explanation\
✅ **User choice**: "Sign In" or "Sign Out" buttons ✅ **Auto sign out** if user closes modal
without choosing ✅ **Global handling** - no need to add modal to every component ✅ **Consistent
UX** across all packages

## Session Error Detection

The system automatically detects these as session expired errors:

- `"Invalid or expired token"` messages
- Messages containing both `"token"` and `"invalid"`
- Messages containing both `"session"` and `"expired"`
- HTTP 401 status codes
- Error codes: `"token_expired"` or `"invalid_credentials"`

## Example Before/After

### Before: Confusing Toast Messages

```
[Toast] Invalid or expired token ❌
[Toast] Error 401 ❌  
[Toast] Authentication failed ❌
```

### After: Clear Session Modal

```
┌─────────────────────────────────────┐
│            Session Expired          │
│  ⚠️                                 │
│  Your session has expired.          │
│  Please sign in again to continue.  │
│                                     │
│  [ Sign In ]  [ Sign Out ]         │
└─────────────────────────────────────┘
```

## Migration Checklist

### For Package Maintainers:

- [ ] Add `SessionWrapper` to package root
- [ ] Import `handleSessionExpiredError` in components with API calls
- [ ] Update all `showError()` calls to check for session errors first
- [ ] Update `catch` blocks to handle session errors
- [ ] Update API response error handling
- [ ] Test session expiry flow

### For API Responses:

- [ ] Ensure APIs return structured error data with `code: "token_expired"`
- [ ] Update error messages to be session-error detectable
- [ ] Return 401 status codes for token issues

## Advanced Configuration

### Custom Modal Text

```tsx
<GlobalSessionProvider
  modalTitle="Access Expired"
  modalMessage="Your access has expired. Please authenticate again."
  loginButtonText="Authenticate"
  signOutButtonText="Exit"
>
  {children}
</GlobalSessionProvider>;
```

### Custom Actions

```tsx
<GlobalSessionProvider
  onLogin={() => {
    // Custom login flow
    showLoginModal();
  }}
  onSignOut={() => {
    // Custom logout flow
    clearUserData();
    redirect("/");
  }}
>
  {children}
</GlobalSessionProvider>;
```

## Testing

Test the session expired flow:

1. **Simulate expired token** by making API calls with invalid tokens
2. **Verify modal appears** instead of toast messages
3. **Test user actions**:
   - Click "Sign In" → Should redirect to login
   - Click "Sign Out" → Should sign out and redirect
   - Close modal → Should automatically sign out
4. **Verify no toast errors** appear for session issues
5. **Verify normal errors** still show toast messages

## Implementation Status

- ✅ `packages/ui-lib` - Global session system created
- ✅ `packages/admin` - AdminSessionWrapper created
- ✅ `packages/payments` - PaymentsSessionWrapper created
- 🔄 Component error handling updates in progress
- ⏳ Full integration testing needed

The new system provides a much better user experience where session expiry is handled gracefully
with clear messaging and appropriate action options.
