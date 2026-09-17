"use client";

export function ConfirmSubmitButton({
  confirmMessage,
  className,
  children,
  formAction,
}: {
  confirmMessage: string;
  className?: string;
  children: React.ReactNode;
  /** Submit to a different action than the enclosing <form>'s own — e.g. a
   *  "Delete" button sharing a form with a "Save" button that has its own action. */
  formAction?: (formData: FormData) => void;
}) {
  return (
    <button
      type="submit"
      className={className}
      formAction={formAction}
      onClick={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
