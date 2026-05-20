"use client";

import { useState, useId } from "react";
import { Save, Eye, Info, Upload, X, FileImage, Globe } from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Container from "../../components/Container/Container";
import Button from "../../components/Button/Button";
import CustomSelect from "../../components/CustomSelect/CustomSelect";
import RichTextEditor from "../../components/RichTextEditor/RichTextEditor";
import styles from "./page.module.css";

const CATEGORY_OPTIONS = [
  { value: "conseils-dirigeants", label: "Conseils dirigeants" },
  { value: "temoignages", label: "Témoignages" },
  { value: "actualites", label: "Actualités" },
  { value: "ressources-particuliers", label: "Ressources particuliers" },
  { value: "autre", label: "Autre" },
];

const SITE_DOMAIN = "swiss-serenity-plus.ch";
const SEO_DESC_MIN = 120;
const SEO_DESC_MAX = 160;

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export default function BlogEditorPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [category, setCategory] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [body, setBody] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [saved, setSaved] = useState(false);
  const tooltipId = useId();

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slugManual) setSlug(slugify(val));
  }

  function handleSlugChange(val: string) {
    setSlugManual(true);
    setSlug(slugify(val));
  }

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setImageName(file.name);
    setImageUrl("");
    setImageError("");
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Erreur ${res.status}`);
      setImageUrl(data.url);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setImageUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const descLength = metaDesc.length;
  const descStatus =
    descLength === 0 ? "empty" :
    descLength < SEO_DESC_MIN ? "short" :
    descLength > SEO_DESC_MAX ? "long" : "ok";

  const fullUrl = `${SITE_DOMAIN}/blog/${slug || "votre-article"}`;

  return (
    <>
      <Header />
      <main>
        <div className={styles.topBar}>
          <Container>
            <div className={styles.topBarInner}>
              <div className={styles.topBarLeft}>
                <span className={styles.eyebrow}>Administration</span>
                <h1 className={styles.pageTitle}>Nouvel article</h1>
              </div>
              <div className={styles.topBarActions}>
                <Button variant="secondary" size="sm" icon={<Eye size={15} />}>
                  Prévisualiser
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Save size={15} />}
                  onClick={handleSave}
                >
                  {saved ? "Enregistré !" : "Enregistrer"}
                </Button>
              </div>
            </div>
          </Container>
        </div>

        <section className={styles.section}>
          <Container>
            <div className={styles.layout}>
              <div className={styles.main}>
                <div className={styles.card}>
                  <div className={styles.field}>
                    <label htmlFor="title" className={styles.label}>Titre de l&apos;article <span aria-hidden="true">*</span></label>
                    <input
                      id="title"
                      type="text"
                      className={styles.input}
                      placeholder="Ex : Pourquoi externaliser son bras droit change tout"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      required
                    />
                  </div>

                  {/* Slug — aperçu URL façon navigateur (#64) */}
                  <div className={styles.field}>
                    <label htmlFor="slug" className={styles.label}>URL de l&apos;article</label>
                    <div className={styles.slugPreview}>
                      <Globe size={13} className={styles.slugGlobe} aria-hidden="true" />
                      <span className={styles.slugDomain}>{SITE_DOMAIN}/blog/</span>
                      <span className={slug ? styles.slugPart : styles.slugPlaceholder}>{slug || "votre-article"}</span>
                    </div>
                    <input
                      id="slug"
                      type="text"
                      className={styles.inputMuted}
                      placeholder="votre-article"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                    />
                  </div>

                  {/* Corps — éditeur riche (#74) */}
                  <div className={styles.field}>
                    <label htmlFor="body" className={styles.label}>Corps de l&apos;article <span aria-hidden="true">*</span></label>
                    <RichTextEditor
                      name="body"
                      value={body}
                      onChange={setBody}
                      placeholder="Rédigez votre article — utilisez la barre d'outils pour mettre en forme le texte."
                    />
                  </div>
                </div>
              </div>

              <aside className={styles.sidebar}>
                {/* Catégorie — CustomSelect (#73) */}
                <div className={styles.card}>
                  <h2 className={styles.sideTitle}>Catégorie</h2>
                  <CustomSelect
                    name="category"
                    options={CATEGORY_OPTIONS}
                    placeholder="Sélectionner..."
                    value={category}
                    onChange={setCategory}
                  />
                </div>

                {/* Image — drag & drop + upload R2 */}
                <div className={styles.card}>
                  <h2 className={styles.sideTitle}>Image de couverture</h2>
                  <div
                    className={`${styles.dropZone} ${isDragOver ? styles.dropZoneOver : ""} ${imageName ? styles.dropZoneFilled : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    role="button"
                    tabIndex={0}
                    aria-label="Zone de dépôt d'image"
                  >
                    {imageUploading ? (
                      <div className={styles.dropZoneUploading}>
                        <span className={styles.uploadSpinner} aria-hidden="true" />
                        <span>Upload en cours…</span>
                      </div>
                    ) : imageName ? (
                      <div className={styles.dropZoneFile}>
                        <FileImage size={20} className={imageUrl ? styles.dropZoneFileIconOk : styles.dropZoneFileIcon} aria-hidden="true" />
                        <div className={styles.dropZoneFileInfo}>
                          <span className={styles.dropZoneFileName}>{imageName}</span>
                          {imageUrl && <span className={styles.dropZoneFileUrl}>{imageUrl.split("/").pop()}</span>}
                          {imageError && <span className={styles.dropZoneFileError}>{imageError}</span>}
                        </div>
                        <button
                          type="button"
                          className={styles.dropZoneRemove}
                          onClick={() => { setImageName(""); setImageUrl(""); setImageError(""); }}
                          aria-label="Supprimer l'image"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className={styles.dropZoneIcon} aria-hidden="true" />
                        <p className={styles.dropZoneText}>Glissez votre image ici</p>
                        <p className={styles.dropZoneHint}>JPG, PNG, WebP — max 5 Mo</p>
                        <label className={styles.dropZoneBtn}>
                          Choisir un fichier
                          <input
                            type="file"
                            accept="image/*"
                            className={styles.fileInput}
                            onChange={handleFileInput}
                          />
                        </label>
                      </>
                    )}
                  </div>
                  {imageUrl && (
                    <p className={styles.imageUrlConfirm}>
                      ✓ Uploadée sur R2 — URL copiée dans le champ couverture
                    </p>
                  )}
                </div>

                {/* SEO — tooltip + compteur + aperçu SERP (#72) */}
                <div className={styles.card}>
                  <h2 className={styles.sideTitle}>Référencement (SEO)</h2>

                  <div className={styles.field}>
                    <div className={styles.labelRow}>
                      <label htmlFor="metaDesc" className={styles.label}>Méta description</label>
                      <button
                        type="button"
                        className={styles.tooltipTrigger}
                        aria-describedby={tooltipId}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        onFocus={() => setShowTooltip(true)}
                        onBlur={() => setShowTooltip(false)}
                        aria-label="Aide sur la méta description"
                      >
                        <Info size={14} />
                      </button>
                      {showTooltip && (
                        <div id={tooltipId} role="tooltip" className={styles.tooltip}>
                          <strong>120–160 caractères recommandés</strong>
                          <br />
                          Ce texte apparaît sous le titre dans les résultats Google.
                        </div>
                      )}
                    </div>
                    <textarea
                      id="metaDesc"
                      rows={3}
                      className={`${styles.textarea} ${descStatus === "ok" ? styles.textareaOk : descStatus !== "empty" ? styles.textareaWarn : ""}`}
                      placeholder="Résumé pour Google (120–160 caractères recommandés)..."
                      value={metaDesc}
                      onChange={(e) => setMetaDesc(e.target.value)}
                      maxLength={200}
                    />
                    <div className={styles.metaCounter}>
                      <span className={`${styles.counterDot} ${styles[`dot_${descStatus}`]}`} aria-hidden="true" />
                      <span className={descStatus === "ok" ? styles.counterOk : descStatus !== "empty" ? styles.counterWarn : styles.counterMuted}>
                        {descLength} / {SEO_DESC_MAX} car.
                        {descStatus === "short" && ` — encore ${SEO_DESC_MIN - descLength} recommandés`}
                        {descStatus === "long" && " — un peu long"}
                        {descStatus === "ok" && " — longueur idéale"}
                      </span>
                    </div>

                    {(title || metaDesc) && (
                      <div className={styles.serp}>
                        <p className={styles.serpTitle}>{title || "Titre de l'article"}</p>
                        <p className={styles.serpUrl}>{fullUrl}</p>
                        <p className={styles.serpDesc}>{metaDesc || "La description apparaîtra ici."}</p>
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
