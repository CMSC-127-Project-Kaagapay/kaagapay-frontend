import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmDeleteDialogProps {
  caseId: string;
  submitting: boolean;
  error: string | null;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

/**
 * Confirmation for deleting a ticket. Focus starts on Cancel, Tab stays inside,
 * Escape cancels. The caller returns focus once the dialog closes.
 */
export default function ConfirmDeleteDialog({ caseId, submitting, error, onConfirm, onCancel }: ConfirmDeleteDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const reasonId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    cancelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && !submitting) {
      event.stopPropagation();
      onCancel();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('input, button:not([disabled])');
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4" onKeyDown={handleKeyDown}>
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-xl"
      >
        <h2 id={titleId} className="text-xl font-bold font-headline text-on-surface">
          Delete ticket {caseId}?
        </h2>
        <p id={descriptionId} className="mt-2 text-sm text-on-surface-variant">
          This ticket moves to Deleted tickets, where you can restore it for a limited time. After that it is removed for good.
        </p>

        <label htmlFor={reasonId} className="mt-5 block text-sm font-semibold text-on-surface">
          Reason (optional)
        </label>
        <input
          id={reasonId}
          type="text"
          maxLength={255}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="mt-1 w-full rounded-lg border border-outline bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />

        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-on-surface">
            Could not delete the ticket: {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="min-h-11 rounded-lg border border-outline px-4 text-sm font-semibold text-on-surface hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={submitting}
            className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
          >
            {submitting ? 'Deleting…' : error ? 'Try again' : 'Delete ticket'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
