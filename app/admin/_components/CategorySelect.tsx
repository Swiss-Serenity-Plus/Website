"use client";

// Selecteur de categories editable pour les articles de blog.
// - Selectionner une categorie ferme le menu.
// - « Ajouter une nouvelle catégorie » (premiere option, bordure pointillee
//   rouge signature) cree un item a renommer en place.
// - Chaque categorie a un menu ⋅⋅⋅ : Renommer / Supprimer.
// - Un item nouvellement ajoute mais non renomme est abandonne a la fermeture.
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check, MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react";
import styles from "./CategorySelect.module.css";

export interface CategoryItem {
  id: string;
  label: string;
  value: string;
}

interface Props {
  categories: CategoryItem[];
  onCategoriesChange: (next: CategoryItem[]) => void;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CategorySelect({
  categories, onCategoriesChange, value, onChange, placeholder = "Sélectionner...",
}: Props) {
  const [open, setOpen] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [newId, setNewId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = categories.find((c) => c.value === value) ?? null;

  // Valide ou abandonne l'edition en cours.
  const commitEdit = useCallback(() => {
    if (editingId === null) return;
    const name = draft.trim();
    if (!name) {
      // Item neuf jamais nomme : on l'abandonne.
      if (newId === editingId) onCategoriesChange(categories.filter((c) => c.id !== editingId));
    } else {
      const edited = categories.find((c) => c.id === editingId);
      onCategoriesChange(
        categories.map((c) => (c.id === editingId ? { ...c, label: name, value: name } : c))
      );
      // Si on renommait la categorie selectionnee, on suit la nouvelle valeur.
      if (edited && edited.value === value) onChange(name);
    }
    setEditingId(null);
    setNewId(null);
    setDraft("");
  }, [editingId, draft, newId, categories, onCategoriesChange, value, onChange]);

  const closeDropdown = useCallback(() => {
    commitEdit();
    setOpen(false);
    setMenuFor(null);
  }, [commitEdit]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) closeDropdown();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, closeDropdown]);

  useEffect(() => {
    if (editingId) inputRef.current?.focus();
  }, [editingId]);

  function startAdd() {
    commitEdit();
    const id = crypto.randomUUID();
    onCategoriesChange([...categories, { id, label: "", value: "" }]);
    setEditingId(id);
    setNewId(id);
    setDraft("");
  }

  function startRename(c: CategoryItem) {
    setMenuFor(null);
    setEditingId(c.id);
    setNewId(null);
    setDraft(c.label);
  }

  function remove(c: CategoryItem) {
    setMenuFor(null);
    onCategoriesChange(categories.filter((x) => x.id !== c.id));
    if (c.value === value) onChange("");
  }

  function select(c: CategoryItem) {
    if (editingId) return;
    onChange(c.value);
    closeDropdown();
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); commitEdit(); }
    else if (e.key === "Escape") {
      e.preventDefault();
      if (newId === editingId) onCategoriesChange(categories.filter((c) => c.id !== editingId));
      setEditingId(null);
      setNewId(null);
      setDraft("");
    }
  }

  return (
    <div ref={rootRef} className={styles.wrapper}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? closeDropdown() : setOpen(true))}
      >
        <span className={selected ? styles.triggerValue : styles.triggerPlaceholder}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={15} aria-hidden="true" className={open ? styles.chevronOpen : styles.chevron} />
      </button>

      {open && (
        <ul className={styles.menu} role="listbox">
          <li>
            <button type="button" className={styles.addOption} onClick={startAdd}>
              <Plus size={14} aria-hidden="true" />
              Ajouter une nouvelle catégorie
            </button>
          </li>

          {categories.map((c) => {
            const isEditing = editingId === c.id;
            return (
              <li
                key={c.id}
                role="option"
                aria-selected={c.value === value}
                className={`${styles.option} ${c.value === value ? styles.optionSelected : ""}`}
              >
                {isEditing ? (
                  <input
                    ref={inputRef}
                    className={styles.renameInput}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={onInputKey}
                    onBlur={commitEdit}
                    placeholder="Nom de la catégorie"
                  />
                ) : (
                  <>
                    <button type="button" className={styles.optionLabel} onClick={() => select(c)}>
                      {c.label}
                    </button>
                    {c.value === value && <Check size={14} className={styles.optionCheck} aria-hidden="true" />}
                    <div className={styles.optionMenuWrap}>
                      <button
                        type="button"
                        className={styles.optionMenuTrigger}
                        onClick={() => setMenuFor(menuFor === c.id ? null : c.id)}
                        aria-label="Options de la catégorie"
                      >
                        <MoreHorizontal size={15} />
                      </button>
                      {menuFor === c.id && (
                        <div className={styles.optionMenu}>
                          <button type="button" className={styles.optionMenuItem} onClick={() => startRename(c)}>
                            <Pencil size={13} /> Renommer
                          </button>
                          <button
                            type="button"
                            className={`${styles.optionMenuItem} ${styles.optionMenuItemDanger}`}
                            onClick={() => remove(c)}
                          >
                            <Trash2 size={13} /> Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
