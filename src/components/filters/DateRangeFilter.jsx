import { Slider } from "@heroui/react";
import { useMemo } from 'react';

const DATE_RANGES = [
  { days: 0, label: 'Todo el tiempo' },
  { days: 365, label: 'Último año' },
  { days: 180, label: 'Últimos 6 meses' },
  { days: 90, label: 'Últimos 3 meses' },
  { days: 30, label: 'Último mes' },
  { days: 10, label: 'Últimos 10 días' },
  { days: 7, label: 'Últimos 7 días' },
];

export default function DateRangeFilter({ selectedDays, onDaysChange }) {
  const getCurrentValue = () => {
    const index = DATE_RANGES.findIndex(range => range.days === selectedDays);
    return index >= 0 ? index : 0; 
  };

  const handleChange = (value) => {
    const selectedRange = DATE_RANGES[value];
    onDaysChange(selectedRange.days);
  };

  return (
    <div className="w-64 px-4">
      <Slider
        label={`${DATE_RANGES[getCurrentValue()].label}`}
        step={1}
        maxValue={DATE_RANGES.length - 1}
        minValue={0}
        value={getCurrentValue()}
        hideValue={true}
        showMarks={false}
        onChange={handleChange}
      />
    </div>
  );
} 