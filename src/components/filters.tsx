"use client";

import { ChevronDown, Heart, Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
      >
        <span
          className={
            selectedOption
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-gray-400"
          }
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full z-20 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700",
                  option.value === value &&
                    "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function Toggle({
  value,
  onChange,
  label,
  icon: Icon,
  className,
}: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "flex items-center space-x-2 rounded-lg border px-3 py-2 text-sm transition-colors",
        value
          ? "border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-900 dark:text-blue-400"
          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
        className
      )}
    >
      {Icon && <Icon className="h-4 w-4 fill-red-500 text-red-500" />}
      <span>{label}</span>
    </button>
  );
}

export function FavoritesToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Toggle value={value} onChange={onChange} label="Favorites" icon={Heart} />
  );
}

export function SortToggle({
  value,
  onChange,
}: {
  value: "name" | "id";
  onChange: (value: "name" | "id") => void;
}) {
  return (
    <div className="flex items-center space-x-1 rounded-lg border border-gray-300 bg-white p-1 dark:border-gray-600 dark:bg-gray-800">
      {(["id", "name"] as const).map((sort) => (
        <button
          key={sort}
          type="button"
          onClick={() => onChange(sort)}
          className={cn(
            "flex items-center space-x-1 rounded px-2 py-1 text-xs transition-colors",
            value === sort
              ? "bg-blue-500 text-white"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          )}
        >
          <Star className="h-3 w-3" />
          <span className="capitalize">{sort}</span>
        </button>
      ))}
    </div>
  );
}
