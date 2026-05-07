import React, { useCallback, useEffect, useRef, useState } from 'react';

// ── Ocupação Autocomplete ─────────────────────────────────────────────────────

export interface Ocupacao {
  id: number;
  codigo: string;
  descricao: string;
  tipo: string;
}

/**
 * Autocomplete that searches the `ocupacoes` table by `descricao`.
 * Allows free-text entry when no matching option is found.
 */
export function OcupacaoAutocomplete({
  value,
  onChange,
  onSelectOcupacao,
  className,
  placeholder = 'Digite para buscar...',
}: {
  value: string;
  onChange: (val: string) => void;
  /** Called when the user picks a suggestion from the dropdown */
  onSelectOcupacao?: (o: Ocupacao) => void;
  className?: string;
  placeholder?: string;
}) {
  const [query, setQuery] = useState(value);
  const [options, setOptions] = useState<Ocupacao[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const listRef = useRef<HTMLUListElement>(null);

  // Sync external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchOptions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setOptions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/ocupacoes?q=${encodeURIComponent(q)}&limit=20`);
      if (res.ok) {
        const data: Ocupacao[] = await res.json();
        setOptions(data);
        setOpen(data.length > 0);
        setHighlightIdx(-1);
      }
    } catch {
      /* silently ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchOptions(val), 300);
  };

  const handleSelect = (o: Ocupacao) => {
    const display = `${o.descricao} (${o.codigo})`;
    setQuery(display);
    onChange(display);
    onSelectOcupacao?.(o);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || options.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx(i => {
        const next = Math.min(i + 1, options.length - 1);
        listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' });
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx(i => {
        const next = Math.max(i - 1, 0);
        listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' });
        return next;
      });
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault();
      handleSelect(options[highlightIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        value={query}
        onChange={handleChange}
        onFocus={() => { if (options.length > 0) setOpen(true); }}
        onKeyDown={handleKeyDown}
        className={className}
        placeholder={placeholder}
        autoComplete="off"
      />
      {loading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {open && options.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-[60] left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg"
        >
          {options.map((o, idx) => (
            <li
              key={o.id}
              onMouseDown={() => handleSelect(o)}
              onMouseEnter={() => setHighlightIdx(idx)}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                idx === highlightIdx ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="font-medium">{o.descricao}</span>
              <span className="ml-2 text-xs text-slate-400">({o.codigo})</span>
              {o.tipo && <span className="ml-1 text-xs text-slate-300">· {o.tipo}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
