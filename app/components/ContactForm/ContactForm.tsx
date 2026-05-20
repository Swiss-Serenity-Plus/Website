// ContactForm — formulaire statique. TODO: brancher backend form (Framer natif ou Supabase).
"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import Button from "../Button/Button";
import PhoneInput from "../PhoneInput/PhoneInput";
import CustomSelect from "../CustomSelect/CustomSelect";
import styles from "./ContactForm.module.css";

const SUJET_OPTIONS = [
  { value: "professionnel", label: "Accompagnement Professionnel" },
  { value: "prive", label: "Accompagnement Privé" },
  { value: "specifique", label: "Demande spécifique" },
];

type FormState = "idle" | "success" | "error";

export default function ContactForm() {
  const [state, setState] = useState<FormState>("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: brancher backend form
    setState("success");
  }

  if (state === "success") {
    return (
      <div className={styles.success} role="alert">
        <p className={styles.successTitle}>Message envoyé.</p>
        <p className={styles.successText}>
          Je vous recontacte dans les plus brefs délais pour convenir d'un premier échange.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="nom" className={styles.label}>Nom complet <span aria-hidden="true">*</span></label>
          <input id="nom" name="nom" type="text" required className={styles.input} autoComplete="name" />
        </div>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>Adresse email <span aria-hidden="true">*</span></label>
          <input id="email" name="email" type="email" required className={styles.input} autoComplete="email" />
        </div>
      </div>
      <div id="telephone">
        <PhoneInput
          id="telephone-input"
          name="telephone"
          label="Téléphone"
          autoComplete="tel-national"
        />
      </div>
      <CustomSelect
        name="sujet"
        label="Sujet"
        required
        options={SUJET_OPTIONS}
        placeholder="Sélectionner..."
      />
      <div className={styles.field}>
        <label htmlFor="message" className={styles.label}>Message <span aria-hidden="true">*</span></label>
        <textarea id="message" name="message" required rows={5} className={styles.textarea} placeholder="Quelques mots sur votre projet et sur votre demande ..." />
      </div>
      <div className={styles.submitRow}>
        <Button type="submit" variant="primary" size="lg" className={styles.submitBtn} icon={<Send size={18} />}>
          Envoyer le message
        </Button>
        <p className={styles.confidentialite}><em>Votre demande reste strictement confidentielle.</em></p>
      </div>
    </form>
  );
}
