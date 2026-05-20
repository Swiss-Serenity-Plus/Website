"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { ALL_COUNTRIES, PRIORITY, OTHERS, findByCode, type Country } from "./countries";
import styles from "./PhoneInput.module.css";

interface PhoneInputProps {
  id?: string;
  name?: string;
  label?: string;
  required?: boolean;
  defaultCountry?: string;
  autoComplete?: string;
  placeholder?: string;
}

function detectDefaultCountry(fallback: Country): Country {
  if (typeof Intl === "undefined" || typeof navigator === "undefined") return fallback;
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const region = locale.split("-")[1]?.toUpperCase();
    if (region) {
      const match = findByCode(region);
      if (match) return match;
    }
    const lang = (navigator.language || "").toUpperCase();
    if (lang.includes("FR-FR")) return findByCode("FR") ?? fallback;
    if (lang.includes("FR-CH") || lang.includes("DE-CH") || lang.includes("IT-CH")) {
      return findByCode("CH") ?? fallback;
    }
  } catch {
    // ignore
  }
  return fallback;
}

export default function PhoneInput({
  id,
  name = "telephone",
  label = "Téléphone",
  required = false,
  defaultCountry = "CH",
  autoComplete = "tel-national",
  placeholder = "76 219 85 13",
}: PhoneInputProps) {
  const initial = useMemo(() => findByCode(defaultCountry) ?? PRIORITY[0], [defaultCountry]);
  const [country, setCountry] = useState<Country>(initial);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [national, setNational] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reactId = useId();
  const inputId = id ?? `phone-${reactId}`;
  const listboxId = `${inputId}-listbox`;

  useEffect(() => {
    setCountry(detectDefaultCountry(initial));
  }, [initial]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLLIElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function selectCountry(c: Country) {
    setCountry(c);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(ALL_COUNTRIES.findIndex((c) => c.code === country.code));
    }
  }

  function onListKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, ALL_COUNTRIES.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(ALL_COUNTRIES.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectCountry(ALL_COUNTRIES[activeIndex]);
    }
  }

  const fullNumber = `${country.dial} ${national}`.trim();

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label} {required ? <span aria-hidden="true">*</span> : null}
      </label>
      <div ref={rootRef} className={styles.wrapper}>
        <button
          ref={triggerRef}
          type="button"
          className={styles.trigger}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-label={`Indicatif pays — ${country.name} ${country.dial}`}
          onClick={() => {
            setOpen((o) => !o);
            setActiveIndex(ALL_COUNTRIES.findIndex((c) => c.code === country.code));
          }}
          onKeyDown={onTriggerKeyDown}
        >
          <span className={styles.flag} aria-hidden="true">{country.flag}</span>
          <span className={styles.dial}>{country.dial}</span>
          <ChevronDown size={14} aria-hidden="true" className={open ? styles.chevronOpen : styles.chevron} />
        </button>
        <input
          id={inputId}
          name={name}
          type="tel"
          required={required}
          autoComplete={autoComplete}
          inputMode="tel"
          className={styles.input}
          placeholder={placeholder}
          value={national}
          onChange={(e) => setNational(e.target.value)}
        />
        <input type="hidden" name={`${name}_country`} value={country.code} />
        <input type="hidden" name={`${name}_full`} value={fullNumber} />
        {open && (
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            className={styles.menu}
            onKeyDown={onListKeyDown}
            aria-activedescendant={`${inputId}-opt-${activeIndex}`}
          >
            {PRIORITY.map((c, i) => (
              <Option
                key={c.code}
                country={c}
                index={i}
                inputId={inputId}
                active={activeIndex === i}
                selected={country.code === c.code}
                onSelect={selectCountry}
                onHover={setActiveIndex}
              />
            ))}
            <li role="separator" aria-hidden="true" className={styles.separator} />
            {OTHERS.map((c, i) => {
              const idx = i + PRIORITY.length;
              return (
                <Option
                  key={c.code}
                  country={c}
                  index={idx}
                  inputId={inputId}
                  active={activeIndex === idx}
                  selected={country.code === c.code}
                  onSelect={selectCountry}
                  onHover={setActiveIndex}
                />
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

interface OptionProps {
  country: Country;
  index: number;
  inputId: string;
  active: boolean;
  selected: boolean;
  onSelect: (c: Country) => void;
  onHover: (i: number) => void;
}

function Option({ country, index, inputId, active, selected, onSelect, onHover }: OptionProps) {
  return (
    <li
      id={`${inputId}-opt-${index}`}
      data-index={index}
      role="option"
      aria-selected={selected}
      className={`${styles.option} ${active ? styles.optionActive : ""}`}
      onMouseEnter={() => onHover(index)}
      onMouseDown={(e) => {
        e.preventDefault();
        onSelect(country);
      }}
    >
      <span className={styles.flag} aria-hidden="true">{country.flag}</span>
      <span className={styles.optionName}>{country.name}</span>
      <span className={styles.optionDial}>{country.dial}</span>
      {selected && <Check size={14} className={styles.optionCheck} aria-hidden="true" />}
    </li>
  );
}
