"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-bold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
        >
          Resource Explorer
        </Link>

        <div className="flex items-center space-x-4">
          <nav className="hidden space-x-6 md:flex">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Explorer
            </Link>
          </nav>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
