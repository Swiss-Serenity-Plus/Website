"use client";

// Editeur d'article base sur TipTap, restreint au jeu de noeuds autorise :
// paragraphe, titres H2/H3, listes a puces / numerotees, gras, italique, lien,
// image. Produit du JSON TipTap (pas du HTML), source de verite du contenu.
import { useRef } from "react";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, ImagePlus, LoaderCircle,
} from "lucide-react";
import { useState } from "react";
import { uploadImageToR2 } from "../../lib/uploadImageClient";
import styles from "./ArticleEditor.module.css";

interface Props {
  initialContent?: JSONContent | null;
  onChange: (doc: JSONContent) => void;
}

export default function ArticleEditor({ initialContent, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        code: false,
      }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: initialContent ?? "",
    editorProps: { attributes: { class: styles.content, "aria-label": "Contenu de l'article" } },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  if (!editor) {
    return <div className={styles.wrapper}><div className={styles.loading}>Chargement de l&apos;éditeur…</div></div>;
  }

  function setLink() {
    const prev = editor!.getAttributes("link").href as string | undefined;
    const url = window.prompt("Adresse du lien (laisser vide pour retirer) :", prev ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor!.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor!.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  async function uploadImage(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const url = await uploadImageToR2(file, "blog");
      const alt = window.prompt("Texte alternatif de l'image (pour le SEO et l'accessibilité) :", "") ?? "";
      editor!.chain().focus().setImage({ src: url, alt }).run();
    } catch {
      window.alert("L'image n'a pas pu être envoyée. Veuillez réessayer.");
    } finally {
      setUploading(false);
    }
  }

  const btn = (active: boolean) => `${styles.toolBtn} ${active ? styles.toolBtnActive : ""}`;

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar} role="toolbar" aria-label="Mise en forme">
        <button type="button" className={btn(editor.isActive("heading", { level: 2 }))} title="Titre H2"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}>
          <Heading2 size={16} />
        </button>
        <button type="button" className={btn(editor.isActive("heading", { level: 3 }))} title="Titre H3"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run(); }}>
          <Heading3 size={16} />
        </button>
        <span className={styles.divider} aria-hidden="true" />
        <button type="button" className={btn(editor.isActive("bold"))} title="Gras"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}>
          <Bold size={15} strokeWidth={2.6} />
        </button>
        <button type="button" className={btn(editor.isActive("italic"))} title="Italique"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}>
          <Italic size={15} />
        </button>
        <button type="button" className={btn(editor.isActive("link"))} title="Lien"
          onMouseDown={(e) => { e.preventDefault(); setLink(); }}>
          <Link2 size={16} />
        </button>
        <span className={styles.divider} aria-hidden="true" />
        <button type="button" className={btn(editor.isActive("bulletList"))} title="Liste à puces"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}>
          <List size={16} />
        </button>
        <button type="button" className={btn(editor.isActive("orderedList"))} title="Liste numérotée"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}>
          <ListOrdered size={16} />
        </button>
        <span className={styles.divider} aria-hidden="true" />
        <button type="button" className={styles.toolBtn} title="Image"
          onMouseDown={(e) => { e.preventDefault(); fileRef.current?.click(); }} disabled={uploading}>
          {uploading ? <LoaderCircle size={16} className={styles.spin} /> : <ImagePlus size={16} />}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className={styles.fileHidden}
          onChange={async (e) => { const f = e.target.files?.[0]; if (f) await uploadImage(f); e.target.value = ""; }}
        />
      </div>

      <EditorContent editor={editor} className={styles.editorHost} />
    </div>
  );
}
