import React from "react";

export interface CalEntry {
  id: string;
  kcal: number;
  time: string;
}

export interface CalorieEntriesListProps {
  entries: CalEntry[];
  onRemoveEntry: (id: string) => void;
}

export function CalorieEntriesList({
  entries,
  onRemoveEntry,
}: CalorieEntriesListProps) {
  if (entries.length === 0) return null;

  return (
    <div className="cal-items-list" aria-label="Today's entries">
      {entries.map((item) => (
        <span key={item.id} className="cal-item-chip">
          +{item.kcal} kcal <small>({item.time})</small>
          <button
            type="button"
            className="cal-item-chip-remove"
            aria-label={`Remove ${item.kcal} kcal`}
            onClick={() => onRemoveEntry(item.id)}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
