"use client";

/**
 * Client-side Form wrapper.
 *
 * Why:
 * - `next/form` expects `action` to be a Server Action.
 * - This app passes client callbacks to `action`, which can trigger runtime errors like:
 *   "The provided callback is no longer runnable."
 *
 * Usage:
 * <Form action={(formData) => { ... }} />
 */
export default function Form({ action, onSubmit, children, ...props }) {
  const isFnAction = typeof action === "function";

  const handleSubmit = async (e) => {
    onSubmit?.(e);
    if (e.defaultPrevented) return;

    if (!isFnAction) return;

    const formEl = e.currentTarget;
    // When using a client callback action, we prevent the browser's default submit.
    // Run native validation first so required fields show their built-in prompts.
    if (!formEl.checkValidity()) {
      e.preventDefault();
      formEl.reportValidity();
      return;
    }

    e.preventDefault();
    const formData = new FormData(formEl);
    await action(formData);
  };

  // If `action` is a function, don't pass it to the DOM `action` attribute.
  return (
    <form {...props} action={isFnAction ? undefined : action} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}


