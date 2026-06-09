// API — base de formations (Notion_Training_Database_ID).
//   GET /api/training-posts          → liste des items
//   GET /api/training-posts?id=&title= → corps HTML d'un item
//
// Gestion complète des blocs Notion : paragraphes, titres, listes, citations,
// code (copiable), tableaux (avec fetch des lignes enfants), callouts, toggles,
// to-do, images, embed/video/bookmark Tella (iframes 16:9).
// Protégée par session admin.
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidSession, ADMIN_COOKIE } from "../../lib/adminAuth";

const NOTION = "https://api.notion.com/v1";

function notionHeaders() {
  return {
    Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };
}

// ── Types ────────────────────────────────────────────────────────────────────

type RT = {
  plain_text?: string;
  href?: string | null;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
  };
};

interface EnrichedBlock {
  id: string;
  type: string;
  has_children: boolean;
  _children?: EnrichedBlock[];
  [key: string]: unknown;
}

// ── Helpers texte ─────────────────────────────────────────────────────────────

function readRT(arr?: RT[]): string {
  return (arr ?? []).map((t) => t.plain_text ?? "").join("");
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Convertit un tableau de rich_text en HTML en appliquant les annotations
// (gras, italique, code inline, lien, etc.).
function rtToHtml(arr?: RT[]): string {
  if (!arr || !arr.length) return "";
  return arr.map((rt) => {
    const raw = rt.plain_text ?? "";
    if (!raw) return "";
    let html = escHtml(raw);
    const a = rt.annotations ?? {};
    if (a.code)          html = `<code class="fm-inline-code">${html}</code>`;
    if (a.bold)          html = `<strong>${html}</strong>`;
    if (a.italic)        html = `<em>${html}</em>`;
    if (a.strikethrough) html = `<s>${html}</s>`;
    if (a.underline)     html = `<u>${html}</u>`;
    if (rt.href)         html = `<a href="${escHtml(rt.href)}" target="_blank" rel="noopener noreferrer">${html}</a>`;
    return html;
  }).join("");
}

// ── Helpers Tella ─────────────────────────────────────────────────────────────

function isTella(url: string): boolean {
  return /tella\.(tv|io)/i.test(url);
}

function toTellaEmbed(url: string): string {
  if (!url) return "";
  if (url.includes("/embed")) return url;
  return url.replace(/\/$/, "") + "/embed";
}

function videoIframe(url: string, title: string): string {
  const embed = toTellaEmbed(url);
  return (
    `<div style="position:relative;width:100%;padding-top:56.25%;` +
    `border-radius:10px;overflow:hidden;margin:1.25em 0;` +
    `box-shadow:0 6px 24px rgba(6,36,69,.12)">` +
    `<iframe src="${escHtml(embed)}" title="${escHtml(title)}" ` +
    `style="position:absolute;inset:0;width:100%;height:100%;border:none" ` +
    `allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`
  );
}

// ── Conversion blocs → HTML ──────────────────────────────────────────────────

function blocksToHtml(blocks: EnrichedBlock[], pageTitle = ""): string {
  const parts: string[] = [];
  let listType: "ul" | "ol" | null = null;

  function flushList() {
    if (listType) { parts.push(`</${listType}>`); listType = null; }
  }

  for (const block of blocks) {
    const type = block.type;
    const content = (block[type] as Record<string, unknown>) ?? {};
    const rtArr = (content.rich_text as RT[] | undefined) ?? [];

    // ── Listes groupées ──────────────────────────────────────────────────────
    if (type === "bulleted_list_item") {
      if (listType !== "ul") { flushList(); parts.push("<ul>"); listType = "ul"; }
      parts.push(`<li>${rtToHtml(rtArr)}</li>`);
      continue;
    }
    if (type === "numbered_list_item") {
      if (listType !== "ol") { flushList(); parts.push("<ol>"); listType = "ol"; }
      parts.push(`<li>${rtToHtml(rtArr)}</li>`);
      continue;
    }
    flushList();

    switch (type) {

      // ── Texte ────────────────────────────────────────────────────────────
      case "heading_1": parts.push(`<h2>${rtToHtml(rtArr)}</h2>`); break;
      case "heading_2": parts.push(`<h3>${rtToHtml(rtArr)}</h3>`); break;
      case "heading_3": parts.push(`<h4>${rtToHtml(rtArr)}</h4>`); break;
      case "paragraph": {
        const html = rtToHtml(rtArr);
        parts.push(html ? `<p>${html}</p>` : "<br>");
        break;
      }
      case "quote": parts.push(`<blockquote>${rtToHtml(rtArr)}</blockquote>`); break;
      case "divider": parts.push("<hr>"); break;

      // ── Bloc de code copiable (shimmer + bouton presse-papier) ───────────
      case "code": {
        const raw = readRT(rtArr);
        parts.push(
          `<div class="fm-code-block">` +
          `<code class="fm-code-text">${escHtml(raw)}</code>` +
          `<button class="fm-copy-btn" data-copy="${escHtml(raw)}" aria-label="Copier">⧉</button>` +
          `</div>`
        );
        break;
      }

      // ── Callout ──────────────────────────────────────────────────────────
      case "callout": {
        const icon = (content.icon as { emoji?: string })?.emoji ?? "ℹ️";
        parts.push(
          `<div class="fm-callout">` +
          `<span class="fm-callout-icon">${icon}</span>` +
          `<div class="fm-callout-text">${rtToHtml(rtArr)}</div>` +
          `</div>`
        );
        break;
      }

      // ── To-do ────────────────────────────────────────────────────────────
      case "to_do": {
        const checked = (content.checked as boolean) ? " checked" : "";
        parts.push(
          `<p class="fm-todo">` +
          `<label><input type="checkbox"${checked} disabled> ${rtToHtml(rtArr)}</label>` +
          `</p>`
        );
        break;
      }

      // ── Toggle (summary/details natif) ───────────────────────────────────
      case "toggle": {
        const childHtml = blocksToHtml(block._children ?? [], pageTitle);
        parts.push(
          `<details class="fm-toggle">` +
          `<summary class="fm-toggle-title">${rtToHtml(rtArr)}</summary>` +
          `<div class="fm-toggle-body">${childHtml}</div>` +
          `</details>`
        );
        break;
      }

      // ── Tableau ──────────────────────────────────────────────────────────
      case "table": {
        const hasHeader = !!(content.has_column_header as boolean);
        const rows = block._children ?? [];
        if (!rows.length) break;

        function renderCell(cell: RT[], tag: "th" | "td"): string {
          const html = rtToHtml(cell);
          const plain = escHtml(readRT(cell));
          return `<${tag}><div class="fm-cell-inner">` +
            `<span class="fm-cell-text">${html}</span>` +
            (plain ? `<button class="fm-cell-copy" data-copy="${plain}" aria-label="Copier">⧉</button>` : "") +
            `</div></${tag}>`;
        }

        let html = `<div class="fm-table-wrap"><table class="fm-table">`;
        const bodyStart = hasHeader ? 1 : 0;

        if (hasHeader && rows[0]) {
          const cells = ((rows[0]["table_row"] as { cells?: RT[][] }) ?? {}).cells ?? [];
          html += "<thead><tr>";
          for (const cell of cells) html += renderCell(cell, "th");
          html += "</tr></thead>";
        }

        html += "<tbody>";
        for (let i = bodyStart; i < rows.length; i++) {
          const cells = ((rows[i]["table_row"] as { cells?: RT[][] }) ?? {}).cells ?? [];
          html += "<tr>";
          for (const cell of cells) html += renderCell(cell, "td");
          html += "</tr>";
        }
        html += "</tbody></table></div>";
        parts.push(html);
        break;
      }

      // ── Colonnes (rendues séquentiellement) ──────────────────────────────
      case "column_list": {
        for (const col of (block._children ?? [])) {
          const colHtml = blocksToHtml(col._children ?? [], pageTitle);
          if (colHtml) parts.push(`<div class="fm-column">${colHtml}</div>`);
        }
        break;
      }

      // ── Image ────────────────────────────────────────────────────────────
      case "image": {
        const ext = (content.external as { url?: string })?.url ?? "";
        const file = (content.file as { url?: string })?.url ?? "";
        const url = ext || file;
        const caption = readRT((content.caption as RT[]) ?? []);
        if (url) {
          parts.push(
            `<figure class="fm-image">` +
            `<img src="${escHtml(url)}" alt="${escHtml(caption)}" loading="lazy">` +
            (caption ? `<figcaption class="fm-image-caption">${escHtml(caption)}</figcaption>` : "") +
            `</figure>`
          );
        }
        break;
      }

      // ── Vidéos / embeds Tella ────────────────────────────────────────────
      case "embed":
      case "bookmark":
      case "link_preview": {
        const url = (content.url as string) ?? "";
        if (url && isTella(url)) parts.push(videoIframe(url, pageTitle));
        else if (url) parts.push(`<p><a href="${escHtml(url)}" target="_blank" rel="noopener">${escHtml(url)}</a></p>`);
        break;
      }
      case "video": {
        const url = (content.external as { url?: string })?.url ?? (content.file as { url?: string })?.url ?? "";
        if (url && isTella(url)) parts.push(videoIframe(url, pageTitle));
        else if (url) parts.push(`<p><a href="${escHtml(url)}" target="_blank" rel="noopener">${escHtml(url)}</a></p>`);
        break;
      }

      default: {
        const fallback = readRT(rtArr);
        if (fallback) parts.push(`<p>${escHtml(fallback)}</p>`);
      }
    }
  }

  flushList();
  return parts.join("\n");
}

// ── Fetch récursif des blocs avec enfants ────────────────────────────────────

// Blocs dont les enfants sont nécessaires pour le rendu (tables, toggles, etc.)
const NEEDS_CHILDREN = new Set(["table", "toggle", "callout", "column_list"]);

async function fetchChildren(blockId: string): Promise<EnrichedBlock[]> {
  const res = await fetch(`${NOTION}/blocks/${blockId}/children?page_size=100`, {
    headers: notionHeaders(),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? [];
}

async function enrichBlocks(blocks: EnrichedBlock[]): Promise<void> {
  await Promise.all(
    blocks
      .filter((b) => b.has_children && NEEDS_CHILDREN.has(b.type))
      .map(async (b) => {
        b._children = await fetchChildren(b.id);
        // column_list → chaque colonne a elle-même des blocs enfants
        if (b.type === "column_list") {
          await Promise.all(
            b._children
              .filter((col) => col.has_children)
              .map(async (col) => { col._children = await fetchChildren(col.id); })
          );
        }
      })
  );
}

// ── Propriétés Notion ────────────────────────────────────────────────────────

function findTellaUrl(
  properties: Record<string, { type?: string; url?: string | null; rich_text?: RT[] }>,
): string {
  for (const prop of Object.values(properties)) {
    if (prop.type === "url" && prop.url && isTella(prop.url)) return prop.url;
    if (prop.type === "rich_text") {
      const text = readRT(prop.rich_text).trim();
      if (isTella(text)) return text;
    }
  }
  return "";
}

// ── Handler GET ───────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const store = await cookies();
  const sessionToken = store.get(ADMIN_COOKIE)?.value;
  if (!isValidSession(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notionToken = process.env.NOTION_TOKEN;
  const dbId = process.env.Notion_Training_Database_ID;

  if (!notionToken || !dbId) {
    return NextResponse.json(
      { error: "NOTION_TOKEN ou Notion_Training_Database_ID manquant" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(req.url);
  const pageId = searchParams.get("id");
  const pageTitle = searchParams.get("title") ?? "";

  // ── Corps d'un item ──────────────────────────────────────────────────────
  if (pageId) {
    const res = await fetch(`${NOTION}/blocks/${pageId}/children?page_size=100`, {
      headers: notionHeaders(),
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }
    const data = await res.json();
    const blocks: EnrichedBlock[] = data.results ?? [];

    // Enrichit les blocs qui ont des enfants (tableaux, toggles, colonnes…)
    await enrichBlocks(blocks);

    const html = blocksToHtml(blocks, pageTitle);
    return NextResponse.json({ html });
  }

  // ── Liste des items de la base ───────────────────────────────────────────
  const res = await fetch(`${NOTION}/databases/${dbId}/query`, {
    method: "POST",
    headers: notionHeaders(),
    body: JSON.stringify({ sorts: [{ timestamp: "created_time", direction: "ascending" }] }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  const data = await res.json();
  const items = (data.results ?? []).map((page: Record<string, unknown>) => {
    const props = page.properties as Record<string, {
      type?: string; url?: string | null; rich_text?: RT[]; title?: RT[];
    }>;

    let title = "";
    for (const prop of Object.values(props)) {
      if (prop.type === "title" && prop.title) { title = readRT(prop.title); break; }
    }

    return {
      id: page.id as string,
      title,
      tellaUrl: findTellaUrl(props),
      createdTime: page.created_time as string,
    };
  });

  return NextResponse.json({ items });
}
