"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-Debounce";

interface SearchResult {
  id: string;
  name: string;
  variantId: string;
}

interface SearchComponentProps {
  brand?: {
    primary: string;
    primaryDark: string;
  };
}

export default function SearchComponent({
  brand = { primary: "#8B1D3F", primaryDark: "#6F1632" },
}: SearchComponentProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedQuery = useDebounce<string>(query, 300);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search function
  const searchProducts = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (debouncedQuery) {
      searchProducts(debouncedQuery);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
    setSelectedIndex(-1);
  }, [debouncedQuery]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleProductClick(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle product click
  const handleProductClick = (product: SearchResult) => {
    router.push(`/product/${product.id}`);
    setIsOpen(false);
    setQuery("");
    setResults([]);
    inputRef.current?.blur();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative cursor-pointer">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-results-listbox"
          aria-autocomplete="list"
          placeholder="Search products..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          className="w-full px-4 py-2 pr-10 border focus:outline-none transition-colors duration-200 bg-[#F2ECE7] text-sm text-gray-700 placeholder-gray-400"
          style={{
            borderRadius: "50px",
            borderColor: brand.primary,
          }}
        />

        {/* Search Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full" />
          ) : (
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 max-h-80 overflow-y-auto"
          role="listbox"
          id="search-results-listbox"
        >
          {results.length > 0 ? (
            <ul className="py-2">
              {results.map((product, index) => (
                <li key={product.id}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleProductClick(product)}
                    className={`w-full px-5 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                      index === selectedIndex ? "bg-gray-100" : ""
                    }`}
                    role="option"
                    aria-selected={index === selectedIndex}
                  >
                    <div className="font-medium text-gray-900 text-sm">
                      {product.name}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : query && !isLoading ? (
            <div className="px-4 py-3 text-gray-500 text-center text-sm">
              No products found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
