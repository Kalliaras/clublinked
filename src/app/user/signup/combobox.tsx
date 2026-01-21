"use client";

import { Combobox } from "@/components/ui/combobox";

const years = [
  { value: "freshman", label: "Freshman" },
  { value: "sophomore", label: "Sophomore" },
  { value: "junior", label: "Junior" },
  { value: "senior", label: "Senior" },
];

type ComboboxDemoProps = {
  value: string;
  onValueChange: (value: string) => void;
};

export function ComboboxDemo({ value, onValueChange }: ComboboxDemoProps) {
  return (
    <Combobox
      options={years}
      placeholder="Select year..."
      searchPlaceholder="Search year..."
      value={value}
      onValueChange={onValueChange}
      width="w-full"
      buttonClassName="bg-white text-black"
    />
  );
}
