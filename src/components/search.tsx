"use client";

import { Search as SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Search({
  value,
  onChange,
  placeholder = "Search Pokémon...",
  className,
}: SearchProps) {
  const [inputValue, setInputValue] = useState(value);

  // Update input value when URL state changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle input changes with immediate local update and debounced callback
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue); // Immediate local update for responsive UI
    onChange(newValue); // This will be debounced in the URL state hook
  };

  return (
    <div className={cn("relative", className)}>
      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 bg-white px-10 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
      />
    </div>
  );
}
