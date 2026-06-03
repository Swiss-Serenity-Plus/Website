// FilloutForm — formulaire Fillout embarqué (embed standard, resize dynamique).
"use client";

import Script from "next/script";
import styles from "./FilloutForm.module.css";

export default function FilloutForm() {
  return (
    <>
      <div
        className={styles.embed}
        data-fillout-id="c9GoPSnHwvus"
        data-fillout-embed-type="standard"
        data-fillout-inherit-parameters=""
        data-fillout-dynamic-resize=""
      />
      <Script src="https://server.fillout.com/embed/v1/" strategy="afterInteractive" />
    </>
  );
}
