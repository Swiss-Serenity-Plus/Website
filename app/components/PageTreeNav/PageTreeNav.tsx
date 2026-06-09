"use client";

// Navigation « fil d'Ariane » en arbre, pour la console d'administration.
// Le menu est alimenté dynamiquement par /api/admin/pages (scan du filesystem)
// et se met en cache en mémoire pour éviter les rechargements inutiles.
//   - Dépliage vertical fluide des dossiers (technique grid-rows 0fr->1fr).
//   - Ouverture/fermeture du menu en fondu + glissement (keyframes).
import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { ChevronDown, Folder, FolderOpen, File as FileIcon, Network, Loader } from "lucide-react";
import styles from "./PageTreeNav.module.css";

type FileNode = { type: "file"; label: string; href: string };
type TreeNode = FileNode | { type: "folder"; label: string; children: FileNode[] };

// Arbre de secours si l'API est indisponible
const FALLBACK_TREE: TreeNode[] = [
  { type: "file", label: "Accueil", href: "/" },
  { type: "file", label: "Blog", href: "/blog" },
  { type: "file", label: "À propos", href: "/a-propos" },
  { type: "file", label: "Contact", href: "/contact" },
  { type: "file", label: "Mentions légales", href: "/mentions-legales" },
];

// Cache module-level : survit aux re-renders, pas aux rechargements de page.
let treeCache: TreeNode[] | null = null;

function foldersForPath(tree: TreeNode[], path: string): string[] {
  return tree
    .filter((n) => n.type === "folder" && n.children.some((c) => c.href === path))
    .map((n) => n.label);
}

function labelForPath(tree: TreeNode[], path: string): string {
  for (const n of tree) {
    if (n.type === "file" && n.href === path) return n.label;
    if (n.type === "folder") {
      const child = n.children.find((c) => c.href === path);
      if (child) return child.label;
    }
  }
  return "Naviguer";
}

interface Props {
  currentPath: string;
  onNavigate: (href: string) => void;
}

export default function PageTreeNav({ currentPath, onNavigate }: Props) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [tree, setTree] = useState<TreeNode[]>(treeCache ?? []);
  const [loading, setLoading] = useState(!treeCache);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Chargement initial de l'arbre depuis l'API
  useEffect(() => {
    if (treeCache) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/pages");
        if (!res.ok) throw new Error("api_error");
        const data = await res.json();
        if (!cancelled && Array.isArray(data.tree) && data.tree.length > 0) {
          treeCache = data.tree;
          setTree(data.tree);
        } else if (!cancelled) {
          setTree(FALLBACK_TREE);
        }
      } catch {
        if (!cancelled) setTree(FALLBACK_TREE);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const closeMenu = useCallback(() => {
    setClosing(true);
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 150);
  }, []);

  function openMenu() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setClosing(false);
    setExpanded(foldersForPath(tree, currentPath));
    setOpen(true);
  }

  function toggle() {
    if (open && !closing) closeMenu();
    else openMenu();
  }

  function select(href: string) {
    onNavigate(href);
    setOpen(false);
    setClosing(false);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) closeMenu();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, closeMenu]);

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  function toggleFolder(label: string) {
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  }

  const currentLabel = loading ? "Chargement…" : labelForPath(tree, currentPath);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={open}
        disabled={loading}
      >
        {loading
          ? <Loader size={15} className={styles.loaderSpin} aria-hidden />
          : <Network size={15} strokeWidth={1.7} aria-hidden />}
        <span className={styles.triggerLabel}>{currentLabel}</span>
        <ChevronDown
          size={14}
          className={open && !closing ? styles.chevronOpen : styles.chevron}
          aria-hidden
        />
      </button>

      {open && (
        <div
          className={styles.dropdown}
          data-closing={closing}
          role="menu"
          aria-label="Pages du site"
        >
          <p className={styles.heading}>Pages du site</p>
          <div className={styles.tree}>
            {tree.map((node) =>
              node.type === "file" ? (
                <FileButton
                  key={node.href}
                  label={node.label}
                  active={currentPath === node.href}
                  onSelect={() => select(node.href)}
                />
              ) : (
                <FolderItem
                  key={node.label}
                  label={node.label}
                  open={expanded.includes(node.label)}
                  onToggle={() => toggleFolder(node.label)}
                >
                  {node.children.map((c) => (
                    <FileButton
                      key={c.href}
                      label={c.label}
                      active={currentPath === c.href}
                      onSelect={() => select(c.href)}
                    />
                  ))}
                </FolderItem>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FolderItem({
  label, open, onToggle, children,
}: { label: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <div className={styles.folder}>
      <button
        type="button"
        className={styles.folderTrigger}
        onClick={onToggle}
        aria-expanded={open}
      >
        {open
          ? <FolderOpen size={15} className={styles.folderIconOpen} aria-hidden />
          : <Folder size={15} className={styles.folderIcon} aria-hidden />}
        <span className={styles.folderLabel}>{label}</span>
        <ChevronDown
          size={13}
          className={open ? styles.chevronOpen : styles.chevron}
          aria-hidden
        />
      </button>
      <div className={styles.folderContent} data-open={open}>
        <div className={styles.folderContentInner}>
          <div className={styles.folderChildren}>{children}</div>
        </div>
      </div>
    </div>
  );
}

function FileButton({
  label, active, onSelect,
}: { label: string; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      className={`${styles.file} ${active ? styles.fileActive : ""}`}
      aria-current={active ? "page" : undefined}
      onClick={onSelect}
      role="menuitem"
    >
      <FileIcon size={14} className={styles.fileIcon} aria-hidden />
      <span className={styles.fileLabel}>{label}</span>
    </button>
  );
}
