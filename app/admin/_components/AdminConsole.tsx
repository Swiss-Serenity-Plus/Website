"use client";

// Console d'administration : affiche le site dans une fenetre-navigateur (iframe
// same-origin) et porte les controles de retours autour. Reutilise la logique de
// resolution de libelle (app/lib/fbResolve) et les styles du widget legacy pour
// les modales (formulaire, grille de tickets). Le widget flottant n'est plus
// injecte dans les pages publiques.

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MousePointer, Globe, Send, X, Trash2, Pencil,
  ExternalLink, Upload, FileImage, Check, LogOut,
  Newspaper, MessagesSquare,
} from "lucide-react";
import CustomSelect from "../../components/CustomSelect/CustomSelect";
import BlogManager from "./BlogManager";
import TicketsManager from "./TicketsManager";
import {
  PAGE_OPTIONS, pageNameForPath, ACTION_OPTIONS, PLACEHOLDERS, type ActionOption,
  getElementLabel, getElementUrl,
} from "../../lib/fbResolve";
import BrowserFrame, { type Format } from "./BrowserFrame";
import fb from "../../components/FeedbackWidget/FeedbackWidget.module.css";
import styles from "./AdminConsole.module.css";

const DESKTOP_MIN = 1024;

type Mode = "navigate" | "annotate";
type View = "hub" | "form";
// Ce qui occupe la zone d'apercu a droite : la fenetre-navigateur, la gestion
// des articles de blog, ou la gestion des retours envoyes.
type StageView = "browser" | "blog" | "tickets";
type ToastType = "success" | "error" | "partial";

interface Draft {
  id: string;
  element: string;
  elementUrl: string;
  action: string;
  page: string;
  text: string;
  timestamp: string;
  format: Format;
  isGeneral?: boolean;
  imageUrl?: string;
}

export default function AdminConsole() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const sessionId = useRef("");
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pendingFileInputRef = useRef<HTMLInputElement>(null);

  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const [format, setFormat] = useState<Format>("desktop");
  const [currentPath, setCurrentPath] = useState("/");
  const [mode, setMode] = useState<Mode>("navigate");
  const [frameLoadKey, setFrameLoadKey] = useState(0);

  const [view, setView] = useState<View>("hub");
  const [stageView, setStageView] = useState<StageView>("browser");

  // Brouillons + formulaire de retour
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingElement, setPendingElement] = useState<string | null>(null);
  const [pendingElementUrl, setPendingElementUrl] = useState("");
  const [pendingAction, setPendingAction] = useState("");
  const [pendingText, setPendingText] = useState("");
  const [pendingFormat, setPendingFormat] = useState<Format>("desktop");
  const [actionError, setActionError] = useState(false);
  const [isGeneralMode, setIsGeneralMode] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState("");
  const [pendingImageName, setPendingImageName] = useState("");
  const [pendingImageUploading, setPendingImageUploading] = useState(false);
  const [pendingImageError, setPendingImageError] = useState("");
  const [pendingImageDragOver, setPendingImageDragOver] = useState(false);

  // Nombre de tickets (pour la pastille « Gérer mes modifications »).
  const [ticketCount, setTicketCount] = useState(0);

  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Init session + garde desktop
  useEffect(() => {
    sessionId.current = crypto.randomUUID();
    const update = () => setViewportWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Synchronise la barre d'URL avec les navigations internes de l'iframe.
  // L'evenement load ne couvre pas les navigations client (Next App Router) :
  // on lit donc periodiquement le pathname same-origin.
  useEffect(() => {
    const id = setInterval(() => {
      try {
        const p = iframeRef.current?.contentWindow?.location.pathname;
        if (p) setCurrentPath((prev) => (p !== prev ? p : prev));
      } catch {
        // cross-origin inattendu : on ignore
      }
    }, 350);
    return () => clearInterval(id);
  }, []);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  // Rafraichit la pastille de comptage des tickets (badge du panneau).
  const refreshTicketCount = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets");
      if (!res.ok) return;
      const data = await res.json();
      setTicketCount((data.tickets ?? []).length);
    } catch { /* hors-ligne : on garde la valeur courante */ }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refreshTicketCount(); }, [refreshTicketCount]);

  // Navigation : charge un chemin dans l'iframe (URLs relatives, same-origin).
  const navigateTo = useCallback((path: string) => {
    const frame = iframeRef.current;
    if (frame) frame.src = path;
  }, []);

  function handleFrameLoad(pathname: string) {
    setCurrentPath(pathname);
    setFrameLoadKey((k) => k + 1);
  }

  function resetForm() {
    setPendingElement(null);
    setPendingElementUrl("");
    setPendingAction("");
    setPendingText("");
    setActionError(false);
    setIsGeneralMode(false);
    setPendingImageUrl("");
    setPendingImageName("");
    setPendingImageError("");
    setEditingId(null);
  }

  // Mode annotation : ecouteurs poses dans le contentDocument de l'iframe.
  // Le highlight est un outline injecte (suit nativement scroll, resize et
  // changement de largeur du switcher responsive). Re-attache a chaque navigation.
  useEffect(() => {
    if (mode !== "annotate" || stageView !== "browser") return;
    const frame = iframeRef.current;
    const doc = frame?.contentDocument;
    const win = frame?.contentWindow;
    if (!doc || !win) return;

    // Curseur personnalise (fleche noire cernee de blanc), inspire d'un pointeur
    // classique, plutot que la croix fine. Encode en data-URI base64.
    const cursorSvg =
      "<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 24 24'>" +
      "<path d='M18.6 3 L18.6 19.6 L14.1 15.2 L11.3 21 L8.8 19.8 L11.6 14.1 L5.9 14.1 Z' " +
      "fill='#0c0c0c' stroke='#ffffff' stroke-width='1.6' stroke-linejoin='round'/></svg>";
    const cursorUrl = `data:image/svg+xml;base64,${win.btoa(cursorSvg)}`;

    const STYLE_ID = "fb-admin-hover-style";
    let style = doc.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!style) {
      style = doc.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        .fb-admin-hover {
          outline: 2px solid #b42c2a !important;
          outline-offset: 2px !important;
          background-color: rgba(180,44,42,0.08) !important;
        }
        html.fb-admin-annotating, html.fb-admin-annotating * {
          cursor: url("${cursorUrl}") 22 4, auto !important;
        }
      `;
      doc.head.appendChild(style);
    }
    doc.documentElement.classList.add("fb-admin-annotating");

    let hovered: HTMLElement | null = null;
    const clearHover = () => {
      if (hovered) { hovered.classList.remove("fb-admin-hover"); hovered = null; }
    };

    const onOver = (e: Event) => {
      const t = e.target as HTMLElement;
      if (!t || t === doc.body || t === doc.documentElement) return;
      if (hovered === t) return;
      clearHover();
      hovered = t;
      t.classList.add("fb-admin-hover");
    };
    const onOut = () => clearHover();
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t) return;
      e.preventDefault();
      e.stopPropagation();
      clearHover();
      resetForm();
      setPendingElement(getElementLabel(t, doc));
      setPendingElementUrl(getElementUrl(t, win.location));
      setPendingFormat(format);
      setIsGeneralMode(false);
      setView("form");
      setMode("navigate");
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMode("navigate");
    };

    doc.addEventListener("mouseover", onOver, true);
    doc.addEventListener("mouseout", onOut, true);
    doc.addEventListener("click", onClick, true);
    doc.addEventListener("keydown", onKey, true);
    window.addEventListener("keydown", onKey);

    return () => {
      doc.removeEventListener("mouseover", onOver, true);
      doc.removeEventListener("mouseout", onOut, true);
      doc.removeEventListener("click", onClick, true);
      doc.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keydown", onKey);
      clearHover();
      doc.documentElement.classList.remove("fb-admin-annotating");
      style?.remove();
    };
  }, [mode, frameLoadKey, format, stageView]);

  // « Modifier un élément » : active/desactive la selection de bloc sur l'apercu.
  function toggleBlockSelect() {
    setStageView("browser");
    setMode((m) => (m === "annotate" ? "navigate" : "annotate"));
  }

  // « Modifier l'ensemble du site » : feedback general sur la page courante.
  function startGeneralFeedback() {
    setStageView("browser");
    setMode("navigate");
    resetForm();
    setPendingElement("Page entière");
    setPendingElementUrl("");
    setPendingFormat(format);
    setIsGeneralMode(true);
    setView("form");
  }

  // « Gérer mes modifications » : ouvre la gestion des retours dans l'apercu.
  function openTickets() {
    setMode("navigate");
    setStageView("tickets");
  }

  function closeForm() {
    resetForm();
    setView("hub");
  }

  // « Gérer mes articles de blog » : ouvre l'espace blog dans l'apercu.
  function startBlogCreator() {
    setMode("navigate");
    setStageView("blog");
  }

  function addFeedback() {
    if (!pendingElement || !pendingText.trim()) return;
    if (!isGeneralMode && !pendingAction) { setActionError(true); return; }

    const draft: Draft = {
      id: editingId ?? crypto.randomUUID(),
      element: pendingElement,
      elementUrl: pendingElementUrl,
      action: pendingAction,
      page: pageNameForPath(currentPath),
      text: pendingText.trim(),
      timestamp: new Date().toISOString(),
      format: pendingFormat,
      isGeneral: isGeneralMode,
      ...(pendingImageUrl ? { imageUrl: pendingImageUrl } : {}),
    };

    if (editingId) {
      setDrafts((prev) => prev.map((d) => (d.id === editingId ? draft : d)));
    } else {
      setDrafts((prev) => [...prev, draft]);
    }
    closeForm();
  }

  function startEdit(draft: Draft) {
    setEditingId(draft.id);
    setPendingElement(draft.element);
    setPendingElementUrl(draft.elementUrl);
    setPendingAction(draft.action);
    setPendingText(draft.text);
    setPendingFormat(draft.format);
    setIsGeneralMode(!!draft.isGeneral);
    setPendingImageUrl(draft.imageUrl ?? "");
    setPendingImageName(draft.imageUrl ? (draft.imageUrl.split("/").pop() ?? "image") : "");
    setPendingImageError("");
    setView("form");
  }

  function deleteDraft(id: string) {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }

  async function uploadFeedbackImage(file: File) {
    if (!file.type.startsWith("image/")) return;
    setPendingImageName(file.name);
    setPendingImageUrl("");
    setPendingImageError("");
    setPendingImageUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Erreur ${res.status}`);
      setPendingImageUrl(data.url);
    } catch (err) {
      setPendingImageError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setPendingImageUploading(false);
    }
  }

  async function sendAll() {
    if (drafts.length === 0 || isSending) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId.current,
          feedbacks: drafts.map((d) => ({
            element: d.element, elementUrl: d.elementUrl, action: d.action,
            page: d.page, text: d.text, timestamp: d.timestamp, format: d.format,
            ...(d.imageUrl ? { imageUrl: d.imageUrl } : {}),
          })),
        }),
      });
      const data = await res.json();
      if (res.status === 200 || res.status === 207) {
        setDrafts([]);
        sessionId.current = crypto.randomUUID();
        showToast(
          res.status === 207
            ? `${data.created} retour(s) envoyé(s), ${data.failed} non transmis`
            : "Retours envoyés avec succès",
          res.status === 207 ? "partial" : "success"
        );
        await refreshTicketCount();
      } else {
        showToast("Erreur lors de l'envoi, réessayez ou contactez Théo", "error");
      }
    } catch {
      showToast("Erreur réseau, réessayez ou contactez Théo", "error");
    } finally {
      setIsSending(false);
    }
  }

  async function logout() {
    try {
      await fetch("/api/admin-login", { method: "DELETE" });
    } finally {
      window.location.reload();
    }
  }

  // Garde desktop-only
  if (viewportWidth !== null && viewportWidth < DESKTOP_MIN) {
    return (
      <div className={styles.desktopGuard}>
        <div className={styles.guardCard}>
          <Globe size={30} strokeWidth={1.4} />
          <h1 className={styles.guardTitle}>Console réservée à l&apos;ordinateur</h1>
          <p className={styles.guardText}>
            Cette console de retours nécessite un écran large. Veuillez vous connecter
            depuis un navigateur sur ordinateur (largeur d&apos;au moins {DESKTOP_MIN} px).
          </p>
        </div>
      </div>
    );
  }

  const currentPlaceholder = PLACEHOLDERS[pendingAction as ActionOption] ?? PLACEHOLDERS.default;
  const pageSelectValue = PAGE_OPTIONS.some((o) => o.value === currentPath) ? currentPath : "";

  return (
    <div className={styles.shell}>
      {/* Panneau de controle */}
      <aside className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.brandEyebrow}>Swiss Serenity Plus</p>
            <h1 className={styles.brandTitle}>Comment souhaitez-vous améliorer le site&nbsp;?</h1>
          </div>
          <button className={styles.logoutBtn} onClick={logout} title="Se déconnecter" aria-label="Se déconnecter">
            <LogOut size={15} />
          </button>
        </div>

        <div className={styles.panelBody}>
          <div className={styles.controlBlock}>
            <label className={styles.controlLabelSm}>Page affichée</label>
            <CustomSelect
              name="adminPage"
              options={PAGE_OPTIONS}
              placeholder="Choisir une page..."
              value={pageSelectValue}
              onChange={(v) => navigateTo(v)}
              size="sm"
            />
          </div>

          <div className={styles.actionsBlock}>
            <button
              className={`${styles.actionBtn} ${mode === "annotate" ? styles.actionBtnActive : styles.actionBtnPrimary}`}
              onClick={toggleBlockSelect}
              aria-pressed={mode === "annotate"}
            >
              <MousePointer size={16} strokeWidth={1.6} />
              {mode === "annotate" ? "Sélection active — cliquez un élément" : "Modifier un élément"}
            </button>
            {mode === "annotate" && (
              <p className={styles.controlHint}>
                Cliquez un élément dans l&apos;aperçu pour l&apos;annoter. Échap ou recliquez pour quitter.
              </p>
            )}
            <button className={styles.actionBtn} onClick={startGeneralFeedback}>
              <Globe size={16} strokeWidth={1.6} /> Modifier l&apos;ensemble du site
            </button>
            <button
              className={`${styles.actionBtn} ${stageView === "blog" ? styles.actionBtnOn : ""}`}
              onClick={startBlogCreator}
              aria-pressed={stageView === "blog"}
            >
              <Newspaper size={16} strokeWidth={1.6} /> Gérer mes articles de blog
            </button>
            <button
              className={`${styles.actionBtn} ${stageView === "tickets" ? styles.actionBtnOn : ""}`}
              onClick={openTickets}
              aria-pressed={stageView === "tickets"}
            >
              <MessagesSquare size={16} strokeWidth={1.6} /> Gérer mes modifications
              {ticketCount > 0 && (
                <span className={styles.actionBtnCount}>{ticketCount}</span>
              )}
            </button>
          </div>

          {/* Brouillons — masques tant qu'il n'y en a aucun */}
          {drafts.length > 0 && (
            <div className={styles.draftsBlock}>
              <p className={styles.draftsHeading}>
                Modifications en attente
                <span className={styles.draftsCount}>{drafts.length}</span>
              </p>
              <ul className={styles.draftsList}>
                {drafts.map((draft) => (
                  <li key={draft.id} className={styles.draftItem}>
                    <div className={styles.draftItemTop}>
                      <span className={fb.actionTag}>{draft.isGeneral ? "Général" : draft.action}</span>
                      <div className={styles.draftItemActions}>
                        <button className={styles.draftEdit} onClick={() => startEdit(draft)} aria-label="Modifier">
                          <Pencil size={13} />
                        </button>
                        <button className={styles.draftDelete} onClick={() => deleteDraft(draft.id)} aria-label="Supprimer">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <p className={styles.draftElement}>{draft.element}</p>
                    <p className={styles.draftText}>{draft.text}</p>
                  </li>
                ))}
              </ul>
              <button className={styles.sendBtn} onClick={sendAll} disabled={isSending} aria-busy={isSending}>
                {isSending ? "Envoi en cours..." : <><Send size={15} /> Envoyer {drafts.length} retour{drafts.length > 1 ? "s" : ""}</>}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Fenetre-navigateur (toujours montee pour preserver l'etat de l'iframe) */}
      <main className={styles.stage}>
        <BrowserFrame
          iframeRef={iframeRef}
          format={format}
          onFormatChange={setFormat}
          currentPath={currentPath}
          annotating={mode === "annotate" && stageView === "browser"}
          onLoad={handleFrameLoad}
        />
      </main>

      {/* Modale formulaire (bloc ou general) */}
      {view === "form" && pendingElement && (
        <div className={fb.backdrop} onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}>
          <div className={styles.modalSheet} role="dialog" aria-label="Nouveau retour">
            <div className={styles.modalSheetHeader}>
              <p className={styles.modalSheetTitle}>
                {isGeneralMode ? "Feedback général" : editingId ? "Modifier le retour" : "Nouveau retour"}
              </p>
              <button className={fb.closeBtn} onClick={closeForm} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalSheetBody}>
              <div className={fb.pendingCover}>
                <span className={fb.pendingCoverEyebrow}>
                  {isGeneralMode ? "Feedback général sur la page" : editingId ? "Modification" : "Bloc sélectionné"}
                  {" · "}{pendingFormat === "mobile" ? "Vue mobile" : "Vue ordinateur"}
                </span>
                <p className={fb.pendingCoverName}>{pendingElement}</p>
                {pendingElementUrl && !isGeneralMode && (
                  <a href={pendingElementUrl} target="_blank" rel="noopener noreferrer" className={fb.elementLink}>
                    <ExternalLink size={11} />
                    {pendingElementUrl.replace(window.location.origin, "")}
                  </a>
                )}
              </div>

              <div className={fb.field}>
                <label className={fb.fieldLabel}>
                  Type de modification {!isGeneralMode && <span aria-hidden="true">*</span>}
                  {isGeneralMode && <span className={fb.fieldOptional}>(optionnel)</span>}
                </label>
                <div className={`${fb.actionPills} ${actionError ? fb.actionPillsError : ""}`}>
                  {ACTION_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`${fb.actionPill} ${pendingAction === opt ? fb.actionPillActive : ""}`}
                      onClick={() => { setPendingAction(opt); setActionError(false); }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {actionError && !isGeneralMode && (
                  <p className={fb.fieldError}>Sélectionnez un type de modification avant de continuer.</p>
                )}
              </div>

              <div className={fb.field}>
                <label className={fb.fieldLabel}>Détail du retour <span aria-hidden="true">*</span></label>
                <textarea
                  className={fb.textarea}
                  placeholder={currentPlaceholder}
                  value={pendingText}
                  onChange={(e) => setPendingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addFeedback();
                    if (e.key === "Escape") closeForm();
                  }}
                  rows={6}
                  autoFocus
                />
                <span className={fb.fieldHint}>Cmd+Entrée pour ajouter au brouillon</span>
              </div>

              <div className={fb.field}>
                <label className={fb.fieldLabel}>Image <span className={fb.fieldOptional}>(optionnel)</span></label>
                <div
                  className={`${fb.feedbackImageZone} ${pendingImageDragOver ? fb.feedbackImageZoneOver : ""} ${pendingImageName ? fb.feedbackImageZoneFilled : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setPendingImageDragOver(true); }}
                  onDragLeave={() => setPendingImageDragOver(false)}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setPendingImageDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file?.type.startsWith("image/")) await uploadFeedbackImage(file);
                  }}
                >
                  {pendingImageUploading ? (
                    <div className={fb.dropZoneUploading}>
                      <span className={fb.uploadSpinner} aria-hidden="true" />
                      <span>Upload en cours…</span>
                    </div>
                  ) : pendingImageName ? (
                    <div className={fb.dropZoneFile}>
                      <FileImage size={14} className={pendingImageUrl ? fb.dropZoneFileIconOk : fb.dropZoneFileIcon} aria-hidden="true" />
                      <span className={fb.dropZoneFileName}>{pendingImageName}</span>
                      <button
                        type="button"
                        className={fb.dropZoneRemove}
                        onClick={() => { setPendingImageName(""); setPendingImageUrl(""); setPendingImageError(""); }}
                        aria-label="Supprimer l'image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={fb.feedbackImageZoneEmpty}
                      role="button"
                      tabIndex={0}
                      onClick={() => pendingFileInputRef.current?.click()}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") pendingFileInputRef.current?.click(); }}
                    >
                      <Upload size={13} aria-hidden="true" />
                      <span className={fb.feedbackImageZoneLabel}>Glisser ou choisir une image</span>
                      <span className={fb.feedbackImageZoneBtn}>Parcourir</span>
                    </div>
                  )}
                </div>
                <input
                  ref={pendingFileInputRef}
                  type="file"
                  accept="image/*"
                  className={fb.fileInputHidden}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await uploadFeedbackImage(file);
                    e.target.value = "";
                  }}
                />
                {pendingImageError && <span className={fb.hintWarn}>{pendingImageError}</span>}
                {pendingImageUrl && (
                  <div className={fb.uploadedPreview}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={pendingImageUrl} alt="Photo jointe" className={fb.uploadedPreviewImg} />
                    <div className={fb.uploadedPreviewMsg}>
                      <Check size={14} strokeWidth={2.5} />
                      <span>Nous avons bien reçu votre photo.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalSheetFooter}>
              <button className={fb.cancelBtn} onClick={closeForm}>Annuler</button>
              <button className={fb.addBtn} onClick={addFeedback} disabled={!pendingText.trim()}>
                {editingId ? "Mettre à jour" : "Ajouter au brouillon"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Espace de gestion des articles de blog (occupe la zone d'apercu) */}
      {stageView === "blog" && (
        <div className={styles.stageOverlay}>
          <BlogManager onClose={() => setStageView("browser")} showToast={showToast} />
        </div>
      )}

      {/* Espace de gestion des modifications (occupe la zone d'apercu) */}
      {stageView === "tickets" && (
        <div className={styles.stageOverlay}>
          <TicketsManager
            onClose={() => setStageView("browser")}
            showToast={showToast}
            onCount={setTicketCount}
          />
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`${fb.toast} ${fb[`toast_${toast.type}`]}`} role="alert">
          {toast.message}
        </div>
      )}
    </div>
  );
}
