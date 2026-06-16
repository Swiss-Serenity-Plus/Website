"use client";

// Console d'administration : affiche le site dans une fenetre-navigateur (iframe
// same-origin) et porte les controles de retours autour. Reutilise la logique de
// resolution de libelle (app/lib/fbResolve) et les styles du widget legacy pour
// les modales (formulaire). Le widget flottant n'est plus injecte dans les pages
// publiques. Les retours sont envoyes directement dans Notion (sans brouillon).

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MousePointer, Globe, Send, X,
  ExternalLink, Upload, FileImage, Check, LogOut,
  Newspaper, MessagesSquare, Bookmark, ArrowRight,
} from "lucide-react";
import PageTreeNav from "../../components/PageTreeNav/PageTreeNav";
import BlogManager from "./BlogManager";
import TicketsManager from "./TicketsManager";
import FormationManager from "./FormationManager";
import {
  pageNameForPath, ACTION_OPTIONS, PLACEHOLDERS, type ActionOption,
  getElementLabel, getElementUrl,
} from "../../lib/fbResolve";
import BrowserFrame, { type Format } from "./BrowserFrame";
import { uploadImageToR2 } from "../../lib/uploadImageClient";
import fb from "../../components/FeedbackWidget/FeedbackWidget.module.css";
import styles from "./AdminConsole.module.css";

const DESKTOP_MIN = 1024;

type Mode = "navigate" | "annotate";
type View = "hub" | "form";
type StageView = "browser" | "blog" | "tickets" | "formation";
type ToastType = "success" | "error" | "partial";

interface AdminConsoleProps {
  // Lien profond : ouvrir directement le gestionnaire de formations (vue liste)
  // et, le cas échéant, une ressource précise (pré-ouverte) au chargement.
  initialFormation?: boolean;
  initialFormationId?: string | null;
}

export default function AdminConsole({ initialFormation, initialFormationId }: AdminConsoleProps = {}) {
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
  const [stageView, setStageView] = useState<StageView>(initialFormation ? "formation" : "browser");
  // Ressource de formation ouverte (null = vue liste). Synchronisée avec l'URL
  // /admin/formation/<id> via l'History API (pas de rechargement de page).
  const [formationOpenId, setFormationOpenId] = useState<string | null>(initialFormationId ?? null);

  // Formulaire de retour
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

  // Pastille tickets + auto-ouverture du dernier ticket créé
  const [ticketCount, setTicketCount] = useState(0);
  const [autoOpenTicketId, setAutoOpenTicketId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType; ticketId?: string } | null>(null);

  // Init session + garde desktop
  useEffect(() => {
    sessionId.current = crypto.randomUUID();
    const update = () => setViewportWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Synchronise la barre d'URL avec les navigations internes de l'iframe.
  useEffect(() => {
    const id = setInterval(() => {
      try {
        const p = iframeRef.current?.contentWindow?.location.pathname;
        if (p) setCurrentPath((prev) => (p !== prev ? p : prev));
      } catch { /* cross-origin inattendu */ }
    }, 350);
    return () => clearInterval(id);
  }, []);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const refreshTicketCount = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets");
      if (!res.ok) return;
      const data = await res.json();
      setTicketCount((data.tickets ?? []).length);
    } catch { /* hors-ligne */ }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refreshTicketCount(); }, [refreshTicketCount]);

  // Navigation : charge un chemin dans l'iframe (URLs relatives, same-origin).
  const navigateTo = useCallback((path: string) => {
    const frame = iframeRef.current;
    if (frame) frame.src = path;
    setStageView("browser");
    if (window.location.pathname.startsWith("/admin/formation")) {
      window.history.pushState(null, "", "/admin");
    }
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
  }

  // Mode annotation : ecouteurs poses dans le contentDocument de l'iframe.
  useEffect(() => {
    if (mode !== "annotate" || stageView !== "browser") return;
    const frame = iframeRef.current;
    const doc = frame?.contentDocument;
    const win = frame?.contentWindow;
    if (!doc || !win) return;

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

  function toggleBlockSelect() {
    setStageView("browser");
    leaveFormationUrl();
    setMode((m) => (m === "annotate" ? "navigate" : "annotate"));
  }

  function startGeneralFeedback() {
    setStageView("browser");
    leaveFormationUrl();
    setMode("navigate");
    resetForm();
    setPendingElement("Page entière");
    setPendingElementUrl("");
    setPendingFormat(format);
    setIsGeneralMode(true);
    setView("form");
  }

  // Ouverture manuelle des tickets : pas d'auto-open de carte.
  function openTickets() {
    setMode("navigate");
    setAutoOpenTicketId(null);
    setStageView("tickets");
    leaveFormationUrl();
  }

  function closeForm() {
    resetForm();
    setView("hub");
  }

  function startBlogCreator() {
    setMode("navigate");
    setStageView("blog");
    leaveFormationUrl();
  }

  // ── Formation : navigation pilotant l'URL (History API) ──────────────────
  function openFormation() {
    setMode("navigate");
    setStageView("formation");
    setFormationOpenId(null);
    window.history.pushState(null, "", "/admin/formation");
  }
  function openFormationItem(id: string) {
    setFormationOpenId(id);
    window.history.pushState(null, "", `/admin/formation/${id}`);
  }
  function backFormationList() {
    setFormationOpenId(null);
    window.history.pushState(null, "", "/admin/formation");
  }
  function closeFormation() {
    setStageView("browser");
    setFormationOpenId(null);
    window.history.pushState(null, "", "/admin");
  }
  // Remet l'URL à /admin quand on quitte la formation pour une autre vue.
  function leaveFormationUrl() {
    if (window.location.pathname.startsWith("/admin/formation")) {
      window.history.pushState(null, "", "/admin");
    }
  }

  // Boutons précédent/suivant du navigateur : resynchronise la vue sur l'URL.
  useEffect(() => {
    const onPop = () => {
      const m = window.location.pathname.match(/^\/admin\/formation(?:\/([^/]+))?\/?$/);
      if (m) {
        setStageView("formation");
        setFormationOpenId(m[1] ?? null);
      } else {
        setStageView("browser");
        setFormationOpenId(null);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Envoi direct vers Notion — aucun brouillon intermédiaire.
  // Après succès : toast cliquable qui ouvre les tickets avec auto-ouverture
  // de la carte du ticket qui vient d'être créé.
  async function submitFeedback() {
    if (!pendingElement || !pendingText.trim()) return;
    if (!isGeneralMode && !pendingAction) { setActionError(true); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId.current,
          feedbacks: [{
            element: pendingElement,
            elementUrl: pendingElementUrl,
            action: pendingAction,
            page: pageNameForPath(currentPath),
            text: pendingText.trim(),
            timestamp: new Date().toISOString(),
            format: pendingFormat,
            ...(pendingImageUrl ? { imageUrl: pendingImageUrl } : {}),
          }],
        }),
      });
      const data = await res.json();
      if (res.ok || res.status === 207) {
        const ticketId: string | undefined = data.createdIds?.[0];
        closeForm();
        setAutoOpenTicketId(ticketId ?? null);
        setToast({ message: "Retour envoyé — Voir mes modifications", type: "success", ticketId });
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 6000);
        await refreshTicketCount();
      } else {
        showToast("Erreur lors de l'envoi, réessayez ou contactez Théo", "error");
      }
    } catch {
      showToast("Erreur réseau, réessayez ou contactez Théo", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function uploadFeedbackImage(file: File) {
    if (!file.type.startsWith("image/")) return;
    setPendingImageName(file.name);
    setPendingImageUrl("");
    setPendingImageError("");
    setPendingImageUploading(true);
    try {
      const url = await uploadImageToR2(file, "feedback");
      setPendingImageUrl(url);
    } catch (err) {
      setPendingImageError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setPendingImageUploading(false);
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

  return (
    <div className={styles.shell}>
      {/* Panneau de contrôle */}
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
            <PageTreeNav currentPath={currentPath} onNavigate={navigateTo} />
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
        </div>

        {/* Formation — épinglé en bas du panneau, séparé du reste */}
        <div className={styles.panelFooter}>
          <button
            className={`${styles.actionBtn} ${stageView === "formation" ? styles.actionBtnOn : ""}`}
            onClick={openFormation}
            aria-pressed={stageView === "formation"}
          >
            <Bookmark size={16} strokeWidth={1.6} /> Formation
          </button>
        </div>
      </aside>

      {/* Fenêtre-navigateur (toujours montée pour préserver l'état de l'iframe) */}
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

      {/* Modale formulaire (bloc ou général) */}
      {view === "form" && pendingElement && (
        <div className={fb.backdrop} onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}>
          <div className={styles.modalSheet} role="dialog" aria-label="Nouveau retour">
            <div className={styles.modalSheetHeader}>
              <p className={styles.modalSheetTitle}>
                {isGeneralMode ? "Feedback général" : "Nouveau retour"}
              </p>
              <button className={fb.closeBtn} onClick={closeForm} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalSheetBody}>
              <div className={fb.pendingCover}>
                <span className={fb.pendingCoverEyebrow}>
                  {isGeneralMode ? "Feedback général sur la page" : "Bloc sélectionné"}
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
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitFeedback();
                    if (e.key === "Escape") closeForm();
                  }}
                  rows={6}
                  autoFocus
                />
                <span className={fb.fieldHint}>Cmd+Entrée pour envoyer</span>
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
              <button className={fb.cancelBtn} onClick={closeForm} disabled={isSubmitting}>Annuler</button>
              <button
                className={fb.addBtn}
                onClick={submitFeedback}
                disabled={!pendingText.trim() || isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? "Envoi en cours…" : <><Send size={13} /> Envoyer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blog manager */}
      {stageView === "blog" && (
        <div className={styles.stageOverlay}>
          <BlogManager onClose={() => setStageView("browser")} showToast={showToast} />
        </div>
      )}

      {/* Tickets manager — reçoit l'ID du dernier ticket créé pour auto-ouverture */}
      {stageView === "tickets" && (
        <div className={styles.stageOverlay}>
          <TicketsManager
            onClose={() => setStageView("browser")}
            showToast={showToast}
            onCount={setTicketCount}
            autoOpenTicketId={autoOpenTicketId}
          />
        </div>
      )}

      {/* Formation */}
      {stageView === "formation" && (
        <div className={styles.stageOverlay}>
          <FormationManager
            openId={formationOpenId}
            onOpenItem={openFormationItem}
            onBack={backFormationList}
            onClose={closeFormation}
          />
        </div>
      )}

      {/* Toast — cliquable quand un ticketId est présent (retour venant d'être envoyé) */}
      {toast && (
        <div
          className={`${fb.toast} ${fb[`toast_${toast.type}`]}${toast.ticketId ? ` ${styles.toastClickable}` : ""}`}
          role="alert"
          onClick={toast.ticketId ? () => {
            clearTimeout(toastTimer.current);
            setToast(null);
            setStageView("tickets");
          } : undefined}
        >
          {toast.message}
          {toast.ticketId && <ArrowRight size={14} strokeWidth={2.2} className={styles.toastArrow} />}
        </div>
      )}
    </div>
  );
}
