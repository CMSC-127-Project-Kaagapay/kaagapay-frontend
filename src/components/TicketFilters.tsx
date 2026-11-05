import React, { useId } from 'react';

export interface TicketFilterValues {
  volunteer: string;
  from: string;
  to: string;
}

interface TicketFiltersProps {
  values: TicketFilterValues;
  volunteers: { id: string; name: string }[];
  dateError: string | null;
  hasActiveFilters: boolean;
  onChange: (next: Partial<TicketFilterValues>) => void;
  onClear: () => void;
}

const fieldClasses =
  'mt-1 block min-h-11 rounded-lg border border-outline bg-surface-container-lowest px-3 text-sm text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export default function TicketFilters({ values, volunteers, dateError, hasActiveFilters, onChange, onClear }: TicketFiltersProps) {
  const volunteerId = useId();
  const fromId = useId();
  const toId = useId();
  const errorId = useId();

  return (
    <form
      role="search"
      aria-label="Filter tickets"
      onSubmit={(event) => event.preventDefault()}
      className="mb-6 flex flex-wrap items-start gap-x-4 gap-y-3"
    >
      <div>
        <label htmlFor={volunteerId} className="text-sm font-semibold text-on-surface">Volunteer</label>
        <select
          id={volunteerId}
          value={values.volunteer}
          onChange={(event) => onChange({ volunteer: event.target.value })}
          className={`${fieldClasses} min-w-52`}
        >
          <option value="">Any volunteer</option>
          {volunteers.map((volunteer) => (
            <option key={volunteer.id} value={volunteer.id}>{volunteer.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={fromId} className="text-sm font-semibold text-on-surface">Created from</label>
        <input
          id={fromId}
          type="date"
          value={values.from}
          max={values.to || undefined}
          onChange={(event) => onChange({ from: event.target.value })}
          aria-invalid={dateError ? true : undefined}
          aria-describedby={dateError ? errorId : undefined}
          className={fieldClasses}
        />
      </div>

      <div>
        <label htmlFor={toId} className="text-sm font-semibold text-on-surface">Created to</label>
        <input
          id={toId}
          type="date"
          value={values.to}
          min={values.from || undefined}
          onChange={(event) => onChange({ to: event.target.value })}
          aria-invalid={dateError ? true : undefined}
          aria-describedby={dateError ? errorId : undefined}
          className={fieldClasses}
        />
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-6 min-h-11 px-3 text-sm font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Clear filters
        </button>
      )}

      {dateError && (
        <p id={errorId} role="alert" className="basis-full text-sm font-medium text-on-surface">
          {dateError}
        </p>
      )}
    </form>
  );
}
