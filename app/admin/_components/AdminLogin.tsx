"use client";

import { useState } from "react";
import { Lock, LoaderCircle } from "lucide-react";
import styles from "./AdminLogin.module.css";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        // Le cookie est pose : on recharge pour que le Server Component rende la console.
        window.location.reload();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Connexion impossible.");
    } catch {
      setError("Erreur réseau, réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.screen}>
      <form className={styles.card} onSubmit={submit}>
        <div className={styles.iconWrap}>
          <Lock size={22} strokeWidth={1.5} />
        </div>
        <h1 className={styles.title}>Console de retours</h1>
        <p className={styles.subtitle}>
          Cet espace est réservé. Veuillez saisir votre mot de passe pour continuer.
        </p>

        <label className={styles.label} htmlFor="admin-password">Mot de passe</label>
        <input
          id="admin-password"
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••"
          autoFocus
          autoComplete="current-password"
        />

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.button} disabled={loading || !password}>
          {loading ? (
            <><LoaderCircle size={16} className={styles.spin} /> Connexion…</>
          ) : (
            "Se connecter"
          )}
        </button>
      </form>
    </div>
  );
}
