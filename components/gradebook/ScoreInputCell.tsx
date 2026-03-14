"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

type ScoreInputCellProps = {
  score: number | null;
  maxPoints: number;
  label: string;
  disabled?: boolean;
  onChange: (nextScore: number | null) => void;
};

export function ScoreInputCell({ score, maxPoints, label, disabled = false, onChange }: ScoreInputCellProps) {
  const [value, setValue] = useState<string>(score === null ? "" : String(score));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(score === null ? "" : String(score));
  }, [score]);

  function handleChange(nextValue: string) {
    if (disabled) {
      return;
    }

    setValue(nextValue);

    if (!nextValue.trim()) {
      setError(null);
      onChange(null);
      return;
    }

    const parsed = Number(nextValue);
    if (!Number.isFinite(parsed)) {
      setError("Enter a valid score.");
      return;
    }

    if (parsed < 0) {
      setError("Score must be 0 or higher.");
      return;
    }

    if (parsed > maxPoints) {
      setError(`Max score is ${maxPoints}.`);
      return;
    }

    setError(null);
    onChange(parsed);
  }

  return (
    <div className="space-y-1">
      <label className="sr-only" htmlFor={label}>
        {label}
      </label>
      <Input
        id={label}
        type="number"
        min={0}
        max={maxPoints}
        step="0.01"
        value={value}
        disabled={disabled}
        onChange={(event) => handleChange(event.target.value)}
        className="h-8 w-24"
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
