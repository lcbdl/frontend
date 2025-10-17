# useUnsavedChanges Hook Documentation

## Overview

The `useUnsavedChanges` hook provides comprehensive protection against accidental data loss in Solid.js applications. It monitors form state changes and intercepts various navigation attempts to warn users about unsaved changes before they leave a page.

## Features

- **Router Navigation Protection**: Intercepts Solid Router navigation (back/forward buttons, programmatic navigation)
- **Browser Navigation Protection**: Handles browser refresh, tab close, and external navigation
- **Programmatic Navigation Control**: Provides safe navigation functions with confirmation
- **Function Execution Protection**: Prevents execution of potentially destructive functions when changes are unsaved
- **Customizable Warning Messages**: Allows custom confirmation messages (supports i18n)
- **Force Override**: Provides escape hatch for immediate navigation when needed
- **Custom Modal Support**: Uses async confirmation modal for navigation and function calls

## API Reference

### Function Signature

```typescript
function useUnsavedChanges(
  isDirty: Accessor<boolean>,
  msg?: string,
): {
  safeNavigate: (path: string, navigateOptions?: any) => Promise<void>;
  safeCall: (func: () => void) => Promise<void>;
  forceNavigate: (path: string, navigateOptions?: any) => void;
};
```

### Parameters

- **`isDirty`** (`Accessor<boolean>`, required): A reactive accessor that returns `true` when the form/component has unsaved changes
- **`msg`** (`string`, optional): Custom warning message shown in confirmation dialogs (defaults to i18n string)

### Return Value

Returns an object with three navigation/execution functions:

#### `safeNavigate(path, navigateOptions?)`

Navigates to a new route with unsaved changes protection.

- **`path`**: Target route path (string)
- **`navigateOptions`**: Optional navigation options passed to Solid Router
- **Behavior**: Shows async confirmation modal if `isDirty()` returns `true`, navigates immediately otherwise

#### `safeCall(func)`

Executes a function with unsaved changes protection.

- **`func`**: Function to execute after user confirmation
- **Behavior**: Shows async confirmation modal if `isDirty()` returns `true`, executes immediately otherwise

#### `forceNavigate(path, navigateOptions?)`

Navigates immediately without any confirmation checks.

- **`path`**: Target route path (string)
- **`navigateOptions`**: Optional navigation options passed to Solid Router
- **Behavior**: Always navigates regardless of unsaved changes state

## Usage Examples

### Basic Form Protection

```typescript
import { createForm } from '@modular-forms/solid';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

export function EditForm() {
  const [form, { Form, Field }] = createForm<UserData>();

  const { safeNavigate, forceNavigate, safeCall } = useUnsavedChanges(
    () => form.dirty,
    "You have unsaved changes. Are you sure you want to leave?"
  );

  const handleSave = async () => {
    try {
      await saveUserData(form.data);
      reset(form);

      // Navigate without confirmation after successful save
      forceNavigate('/users');
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  return (
    <div>
      <Form onSubmit={handleSave}>
        <Field name="name">
          {(field, props) => (
            <input {...props} placeholder="Name" value={field.value || ''} />
          )}
        </Field>

        <button type="submit">Save</button>
        <button type="button" onClick={() => safeNavigate('/users')}>
          Cancel
        </button>
      </Form>
    </div>
  );
}
```

### Custom State Management

```typescript
import { createSignal } from 'solid-js';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

export function CustomEditor() {
  const [originalData, setOriginalData] = createSignal('');
  const [currentData, setCurrentData] = createSignal('');

  // Custom dirty state logic
  const isDirty = () => originalData() !== currentData();

  const { safeNavigate, safeCall } = useUnsavedChanges(isDirty);

  const handleReset = () => {
    safeCall(() => {
      setCurrentData(originalData());
    });
  };

  return (
    <div>
      <textarea
        value={currentData()}
        onInput={(e) => setCurrentData(e.currentTarget.value)}
      />
      <button onClick={handleReset}>Reset</button>
      <button onClick={() => safeNavigate('/dashboard')}>Back</button>
    </div>
  );
}
```

### Navigation Component Integration

```typescript
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

export function NavigationBar(props: { isDirty: Accessor<boolean> }) {
  const { safeNavigate } = useUnsavedChanges(props.isDirty);

  return (
    <nav>
      <button onClick={() => safeNavigate('/home')}>Home</button>
      <button onClick={() => safeNavigate('/profile')}>Profile</button>
      <button onClick={() => safeNavigate('/settings')}>Settings</button>
    </nav>
  );
}
```

## Protection Mechanisms

### 1. Router Navigation Protection

Uses Solid Router's `useBeforeLeave` hook to intercept:

- Back/forward browser button clicks
- Programmatic router navigation
- URL bar changes
- Route changes via `<A>` components

**Implementation:**

```typescript
useBeforeLeave((e) => {
  if (skipBeforeLeave) {
    skipBeforeLeave = false;
    return;
  }
  if (isDirty()) {
    const shouldLeave = confirm(message);
    if (!shouldLeave) {
      e.preventDefault();
    }
  }
});
```

- The hook uses a `skipBeforeLeave` flag to prevent double confirmation when navigating via `safeNavigate` or `forceNavigate`.

### 2. Browser Navigation Protection

Handles browser-level navigation events:

- Page refresh (F5, Ctrl+R)
- Tab/window closing
- Navigating to external URLs
- Browser back/forward to different domains

**Implementation:**

```typescript
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (isDirty()) {
    e.preventDefault();
    e.returnValue = ""; // Required for modern browsers
    return "";
  }
};
```

### 3. Programmatic Protection

Provides controlled navigation and function execution:

- `safeNavigate`: Navigation with async confirmation modal
- `safeCall`: Function execution with async confirmation modal
- `forceNavigate`: Bypass all protections

**Implementation:**

```typescript
const safeNavigate = async (path, options) => {
  if (isDirty()) {
    const shouldLeave = await confirmDialog(message);
    if (!shouldLeave) return;
  }
  skipBeforeLeave = true;
  navigate(path, options);
};
```

## Browser Compatibility

### Confirmation Dialog Behavior

- **Router Navigation**: Uses JavaScript `confirm()` dialog for browser navigation, async modal for programmatic navigation
- **Browser Navigation**: Uses browser's native beforeunload dialog (message may be ignored by modern browsers)

### Modern Browser Limitations

Modern browsers may:

- Ignore custom messages in `beforeunload` events
- Only show generic "unsaved changes" warnings
- Require user interaction before showing dialogs

## Best Practices

_See previous section for details._

## Limitations

1. **Single Confirmation**: Uses browser's `confirm()` dialog for router navigation, custom modal for programmatic navigation
2. **Synchronous Only for Router**: Router navigation uses synchronous confirmation; programmatic uses async modal
3. **Browser Restrictions**: Modern browsers limit beforeunload message customization
4. **Global Events**: Uses global event listeners (minimal performance impact)

## Dependencies

- `@solidjs/router`: For `useBeforeLeave` and `useNavigate` hooks
- Solid.js: For `onMount`, `onCleanup`, and `Accessor` types
- Custom modal: `confirmDialog` for async confirmation
- i18n: For localized messages

## Related Hooks

This hook is designed to work with:

- Form libraries that provide dirty state (Modular Forms, etc.)
- Custom state management with computed dirty state
- The `UnsavedChangesContext` for application-wide
