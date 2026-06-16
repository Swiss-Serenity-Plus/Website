// Upload d'image côté navigateur, directement vers Cloudflare R2.
//
// On demande d'abord une URL PUT pré-signée à /api/upload-image (la fonction ne
// fait que signer, elle ne reçoit jamais le fichier), puis on envoie le fichier
// directement à R2. Le poids du fichier ne transite donc plus par une fonction
// Vercel : on contourne la limite de 4,5 Mo (FUNCTION_PAYLOAD_TOO_LARGE).

export type UploadContext = "blog" | "feedback";

export async function uploadImageToR2(file: File, context: UploadContext = "blog"): Promise<string> {
  const params = new URLSearchParams({
    action: "presign",
    filename: file.name || "image",
    context,
  });

  const presignRes = await fetch(`/api/upload-image?${params.toString()}`);
  if (!presignRes.ok) {
    throw new Error(await readError(presignRes, "Préparation de l'upload impossible"));
  }
  const { uploadUrl, publicUrl } = (await presignRes.json()) as {
    uploadUrl: string;
    publicUrl: string;
  };

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!putRes.ok) {
    throw new Error(`Envoi vers le stockage échoué (${putRes.status})`);
  }

  return publicUrl;
}

// Lit un message d'erreur sans planter si la réponse n'est pas du JSON (ex. un
// 413 « Request Entity Too Large » renvoyé en texte brut par la plateforme).
async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const text = await res.text();
    if (!text) return `${fallback} (${res.status})`;
    try {
      const data = JSON.parse(text) as { error?: string };
      return data.error ?? `${fallback} (${res.status})`;
    } catch {
      return `${fallback} (${res.status})`;
    }
  } catch {
    return `${fallback} (${res.status})`;
  }
}
