'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
}

interface LuxurySelectProps {
  options: (SelectOption | string)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  id?: string;
  dropdownClassName?: string;
}

export default function LuxurySelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  name,
  required = false,
  disabled = false,
  className = '',
  icon,
  id,
  dropdownClassName = '',
}: LuxurySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const uniqueId = useId();
  const selectId = id || uniqueId;

  // Normalize options to SelectOption objects
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update highlighted index when opening
  useEffect(() => {
    if (isOpen) {
      const idx = normalizedOptions.findIndex((opt) => opt.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, value, normalizedOptions]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listboxRef.current && highlightedIndex >= 0) {
      const item = listboxRef.current.children[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen) {
          if (highlightedIndex >= 0 && highlightedIndex < normalizedOptions.length) {
            handleSelect(normalizedOptions[highlightedIndex].value);
          }
        } else {
          setIsOpen(true);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < normalizedOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : normalizedOptions.length - 1
          );
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;

      case 'Tab':
        setIsOpen(false);
        break;

      default:
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full text-left">
      {/* Hidden native input for standard form submission & validation */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value}
          required={required}
        />
      )}

      {/* Select Trigger Button */}
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between text-left transition-all duration-200 ${
          isOpen
            ? 'border-magenta-500 shadow-[0_0_15px_rgba(217,22,128,0.25)] ring-1 ring-magenta-500'
            : 'border-white/15 hover:border-white/25'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${className}`}
      >
        <div className="flex items-center space-x-2.5 truncate pr-2">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {selectedOption ? (
            <span className="truncate text-white font-medium">
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-neutral-400 truncate">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-magenta-400' : ''
          }`}
        />
      </button>

      {/* Custom Luxury Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 z-50 mt-2 rounded-2xl bg-[#140817]/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${dropdownClassName}`}
          style={{
            maxHeight: '280px',
          }}
        >
          <ul
            ref={listboxRef}
            role="listbox"
            tabIndex={-1}
            className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar"
          >
            {normalizedOptions.map((opt, index) => {
              const isSelected = opt.value === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <li
                  key={opt.value || `opt-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-magenta-500/25 to-deep-purple/40 text-white border border-magenta-500/40 shadow-sm'
                      : isHighlighted
                      ? 'bg-white/10 text-white'
                      : 'text-neutral-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex flex-col truncate pr-2">
                    <span className="truncate">{opt.label}</span>
                    {opt.sublabel && (
                      <span className="text-[10px] text-neutral-400 mt-0.5 truncate">
                        {opt.sublabel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    {opt.badge && (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] bg-magenta-500/20 text-magenta-300 border border-magenta-500/30">
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-magenta-400" />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
