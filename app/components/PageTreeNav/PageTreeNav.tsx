"use client";

// Navigation « fil d'Ariane » en arbre, dans un menu déroulant.
//   - Dépliage vertical fluide des dossiers (technique grid-rows 0fr->1fr, qui
//     anime height:auto sans dépendance ni mesure JS — équivalent du
//     --radix-accordion-content-height).
//   - Ouverture/fermeture du menu en fondu + glissement (keyframes), avec un
//     drapeau `data-closing` joué avant le démontage (timer >= durée de sortie).
import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Folder, FolderOpen, File as FileIcon, Network } from "lucide-react";
import { PRO_SERVICES, PERSO_SERVICES } from "../../data/services";
import styles from "./PageTreeNav.module.css";

type FileNode = { type: "file"; label: string; href: string };
type TreeNode = FileNode | { type: "folder"; label: string; children: FileNode[] };

const PAGE_TREE: TreeNode[] = [
  { type: "file", label: "Accueil", href: "/" },
  {
    type: "folder",
    label: "Entreprises",
    children: PRO_SERVICES.map((s) => ({ type: "file", label: s.title, href: s.href })),
  },
  {
    type: "folder",
    label: "Particuliers",
    children: PERSO_SERVICES.map((s) => ({ type: "file", label: s.title, href: s.href })),
  },
  { type: "file", label: "Blog", href: "/blog" },
  { type: "file", label: "À propos", href: "/a-propos" },
  { type: "file", label: "Contact", href: "/contact" },
  { type: "file", label: "Mentions légales", href: "/mentions-legales" },
];

// Dossiers contenant la route courante (ouverts par défaut à l'ouverture du menu).
function foldersForPath(path: string): string[] {
  return PAGE_TREE
    .filter((n) => n.type === "folder" && n.children.some((c) => c.href === path))
    .map((n) => n.label);
}

export default function PageTreeNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setClosing(true); // déclenche l'animation de sortie
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 150); // >= durée de ncDropdownOut (140ms)
  }, []);

  function openMenu() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setClosing(false);
    setExpanded(foldersForPath(pathname));
    setOpen(true);
  }

  function toggle() {
    if (open && !closing) closeMenu();
    else openMenu();
  }

  // Fermeture au clic extérieur + touche Échap.
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
    setExpanded((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));
  }

  return (
    <div className={styles.root} ref={rootRef} data-fb-container="Menu de navigation des pages">
      <button
        type="button"
        className={styles.trigger}
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={open}
        id="b-nav-tree-trigger"
        data-fb-label="Bouton « Naviguer »"
      >
        <Network size={15} strokeWidth={1.7} aria-hidden />
        Naviguer
        <ChevronDown size={14} className={open && !closing ? styles.chevronOpen : styles.chevron} aria-hidden />
      </button>

      {open && (
        <div className={styles.dropdown} data-closing={closing} role="menu" aria-label="Pages du site">
          <p className={styles.heading}>Pages du site</p>
          <div className={styles.tree}>
            {PAGE_TREE.map((node) =>
              node.type === "file" ? (
                <FileLink
                  key={node.href}
                  label={node.label}
                  href={node.href}
                  active={pathname === node.href}
                  onNavigate={() => setOpen(false)}
                />
              ) : (
                <FolderItem
                  key={node.label}
                  label={node.label}
                  open={expanded.includes(node.label)}
                  onToggle={() => toggleFolder(node.label)}
                >
                  {node.children.map((c) => (
                    <FileLink
                      key={c.href}
                      label={c.label}
                      href={c.href}
                      active={pathname === c.href}
                      onNavigate={() => setOpen(false)}
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

function FolderItem({ label, open, onToggle, children }: {
  label: string; open: boolean; onToggle: () => void; children: ReactNode;
}) {
  return (
    <div className={styles.folder}>
      <button type="button" className={styles.folderTrigger} onClick={onToggle} aria-expanded={open}>
        {open
          ? <FolderOpen size={15} className={styles.folderIconOpen} aria-hidden />
          : <Folder size={15} className={styles.folderIcon} aria-hidden />}
        <span className={styles.folderLabel}>{label}</span>
        <ChevronDown size={13} className={open ? styles.chevronOpen : styles.chevron} aria-hidden />
      </button>
      <div className={styles.folderContent} data-open={open}>
        <div className={styles.folderContentInner}>
          <div className={styles.folderChildren}>{children}</div>
        </div>
      </div>
    </div>
  );
}

function FileLink({ label, href, active, onNavigate }: {
  label: string; href: string; active: boolean; onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      className={`${styles.file} ${active ? styles.fileActive : ""}`}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      role="menuitem"
    >
      <FileIcon size={14} className={styles.fileIcon} aria-hidden />
      <span className={styles.fileLabel}>{label}</span>
    </Link>
  );
}
