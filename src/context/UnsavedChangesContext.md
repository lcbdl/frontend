# UnsavedChangesContext Documentation

## Overview

The `UnsavedChangesContext` provides a Solid.js context for managing unsaved form changes across your application. It prevents users from accidentally losing unsaved changes when navigating away from forms by showing confirmation dialogs.

## Features

- **Safe Navigation**: Prevents navigation when forms have unsaved changes
- **Safe Function Calls**: Prevents execution of functions when forms are dirty
- **Form Registration**: Allows forms to register their dirty state with the context
- **Global State Management**: Manages unsaved changes state across the entire application
- **Custom Dialog Integration**: Works with custom confirmation dialogs

## API Reference

### Types

```typescript
type UnsavedChangesContextType = {
  safeNavigate: (path: string, options?: any) => void;
  safeCall: (func: () => void) => void;
  forceNavigate: (path: string, options?: any) => void;
  registerForm?: (isDirty: Accessor<boolean>) => void;
};
```

### Components

#### `UnsavedChangesProvider`

A provider component that wraps your application and provides unsaved changes functionality.

**Props:**

- `children`: Solid children components

**Usage:**

```tsx
<UnsavedChangesProvider>
  <YourAppComponents />
</UnsavedChangesProvider>
```

### Hooks

#### `useUnsavedChangesContext(isDirty?)`

Hook to access unsaved changes functionality from anywhere in the component tree.

**Parameters:**

- `isDirty` (optional): `Accessor<boolean>` - A reactive function that returns whether the current form has unsaved changes

**Returns:**

```typescript
{
  safeNavigate: (path: string, options?: any) => void;
  safeCall: (func: () => void) => void;
  forceNavigate: (path: string, options?: any) => void;
}
```

**Methods:**

- **`safeNavigate(path, options?)`**: Navigates to a new route, but shows confirmation dialog if there are unsaved changes

  - `path`: Target route path
  - `options`: Optional navigation options

- **`safeCall(func)`**: Executes a function, but shows confirmation dialog if there are unsaved changes

  - `func`: Function to execute after confirmation

- **`forceNavigate(path, options?)`**: Navigates immediately without any confirmation, regardless of unsaved changes
  - `path`: Target route path
  - `options`: Optional navigation options

## Usage Examples

### Basic Setup

```tsx
// App.tsx
import { UnsavedChangesProvider } from "./context/UnsavedChangesContext";

export default function App() {
  return (
    <UnsavedChangesProvider>
      <Router>
        <Routes>
          <Route path="/edit" component={EditPage} />
          <Route path="/list" component={ListPage} />
        </Routes>
      </Router>
    </UnsavedChangesProvider>
  );
}
```

### Form Component Usage

Register a form's dirty state with the context:

```tsx
// EditForm.tsx
import { createForm } from "@modular-forms/solid";
import { useUnsavedChangesContext } from "./context/UnsavedChangesContext";

export function EditForm() {
  const [form, { Form, Field }] = createForm<FormData>();

  // Register this form's dirty state
  const { safeNavigate, forceNavigate } = useUnsavedChangesContext(() => form.dirty);

  const handleSave = async () => {
    try {
      const formData = getValue(form);
      await saveData(formData);
      reset(form, formData);

      // Navigate without confirmation after successful save
      forceNavigate("/list");
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  return (
    <Form onSubmit={handleSave}>
      <Field name="name">{(field, props) => <input {...props} placeholder="Name" value={field.value || ""} />}</Field>

      <button type="submit">Save {form.dirty && "*"}</button>
    </Form>
  );
}
```

### Navigation Component Usage

Use safe navigation in components without forms:

```tsx
// TopNavBar.tsx
import { useUnsavedChangesContext } from "./context/UnsavedChangesContext";

export function TopNavBar() {
  // No isDirty parameter needed for navigation-only components
  const { safeNavigate } = useUnsavedChangesContext();

  return (
    <nav>
      <button onClick={() => safeNavigate("/")}>Home</button>
      <button onClick={() => safeNavigate("/dashboard")}>Dashboard</button>
    </nav>
  );
}
```

### Safe Function Execution

Prevent function execution when there are unsaved changes:

```tsx
// ToolbarComponent.tsx
import { useUnsavedChangesContext } from "./context/UnsavedChangesContext";

export function Toolbar() {
  const { safeCall } = useUnsavedChangesContext();

  const handleReset = () => {
    // This will show confirmation if form is dirty
    safeCall(() => {
      resetAllForms();
      showSuccessMessage("Forms reset successfully");
    });
  };

  const handleExport = () => {
    safeCall(() => {
      exportData();
    });
  };

  return (
    <div>
      <button onClick={handleReset}>Reset All</button>
      <button onClick={handleExport}>Export Data</button>
    </div>
  );
}
```

## Implementation Details

### Form Registration

- Only one form can be registered at a time (the most recently registered form takes precedence)
- When a form component unmounts, it should ideally unregister itself (though not implemented in current version)
- The context tracks the dirty state of the currently registered form

### Navigation Behavior

- **Safe Navigation**: Checks if any registered form is dirty before navigating
- **Force Navigation**: Bypasses all checks and navigates immediately
- **Custom Dialog**: Uses the confirmation dialog from `useUnsavedChanges` hook

### State Management

- Uses Solid.js signals for reactive state management
- `currentForm` signal holds reference to the currently registered form's dirty state
- Context provides a centralized way to access navigation functions

## Integration Requirements

This context requires:

1. `useUnsavedChanges` hook that provides the core functionality
2. A custom confirmation dialog component
3. Solid.js Router for navigation
4. Modular Forms or similar form library that provides dirty state

## Best Practices

1. **Provider Placement**: Place `UnsavedChangesProvider` at the root of your application
2. **Form Registration**: Always register forms that need protection using the `isDirty` parameter
3. **Navigation**: Use `safeNavigate` for all user-initiated navigation in components
4. **Post-Save Navigation**: Use `forceNavigate` after successful save operations
5. **Function Protection**: Use `safeCall` for destructive operations that should be prevented when forms are dirty

## Error Handling

The hook throws an error if used outside of `UnsavedChangesProvider`:

```
"useUnsavedChangesContext must be used within UnsavedChangesProvider"
```

Make sure all components using this hook are wrapped
