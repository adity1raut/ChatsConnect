/**
 * export-docx.mjs
 * Converts all project-report markdown files into a single well-formatted
 * Microsoft Word (.docx) file and writes it to docs/static/ so that
 * Docusaurus can serve it as a static download.
 *
 * Run:  node scripts/export-docx.mjs
 *  or:  npm run export:docx   (from docs/)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  BorderStyle,
  ShadingType,
} from "docx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR   = path.join(__dirname, "..", "docs");
const STATIC_DIR = path.join(__dirname, "..", "static");
const OUTPUT     = path.join(STATIC_DIR, "ChatsConnect-Report.docx");

// ── Ordered source files ────────────────────────────────────────────
const FILES = [
  "01-problem-definition.md",
  "02-literature-survey.md",
  "03-requirements.md",
  "04-system-design.md",
  "05-implementation.md",
];

// ── Strip YAML frontmatter ──────────────────────────────────────────
function stripFrontmatter(raw) {
  if (!raw.startsWith("---")) return raw;
  const end = raw.indexOf("---", 3);
  return end !== -1 ? raw.slice(end + 3).trim() : raw;
}

// ── Parse inline markdown → TextRun[] ──────────────────────────────
function parseInline(text, baseProps = {}) {
  const runs = [];
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[.*?\]\(.*?\))/g);

  for (const token of tokens) {
    if (!token) continue;
    if (token.startsWith("**") && token.endsWith("**")) {
      runs.push(new TextRun({ ...baseProps, text: token.slice(2, -2), bold: true }));
    } else if (token.startsWith("*") && token.endsWith("*")) {
      runs.push(new TextRun({ ...baseProps, text: token.slice(1, -1), italics: true }));
    } else if (token.startsWith("`") && token.endsWith("`")) {
      runs.push(new TextRun({ ...baseProps, text: token.slice(1, -1), font: "Courier New", size: 19, color: "7C3AED" }));
    } else if (token.match(/^\[(.+?)\]\((.+?)\)$/)) {
      const label = token.match(/^\[(.+?)\]/)[1];
      runs.push(new TextRun({ ...baseProps, text: label, color: "7C3AED", underline: { type: "single" } }));
    } else {
      runs.push(new TextRun({ ...baseProps, text: token }));
    }
  }
  return runs.length ? runs : [new TextRun({ ...baseProps, text: text })];
}

// ── Convert markdown text to docx element array ─────────────────────
function mdToDocx(content) {
  const elements = [];
  const lines = content.split("\n");
  let inCodeBlock = false;
  let codeLang    = "";
  let codeLines   = [];

  const flush = (extra = {}) => elements.push(new Paragraph({ text: "", spacing: { before: 40, after: 40 }, ...extra }));

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // ── Code block open / close ─────────────────────────────────
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        inCodeBlock = false;
        if (codeLang === "mermaid") {
          elements.push(
            new Paragraph({
              children: [new TextRun({ text: "[ Diagram — view in online documentation ]", italics: true, color: "999999", size: 19 })],
              indent: { left: 720 },
              spacing: { before: 80, after: 80 },
              border: { left: { color: "CCCCCC", space: 4, style: BorderStyle.SINGLE, size: 12 } },
            })
          );
        } else {
          // Render code lines
          for (const cl of codeLines) {
            elements.push(
              new Paragraph({
                children: [new TextRun({ text: cl || " ", font: "Courier New", size: 18, color: "374151" })],
                indent: { left: 720 },
                spacing: { before: 0, after: 0 },
                shading: { type: ShadingType.SOLID, color: "F3F4F6", fill: "F3F4F6" },
              })
            );
          }
          flush();
        }
        codeLines = [];
        codeLang  = "";
      } else {
        inCodeBlock = true;
        codeLang    = line.slice(3).trim().toLowerCase();
        codeLines   = [];
      }
      continue;
    }
    if (inCodeBlock) { codeLines.push(line); continue; }

    // ── Headings ────────────────────────────────────────────────
    if (line.startsWith("#### ")) {
      elements.push(new Paragraph({ text: line.slice(5).trim(), heading: HeadingLevel.HEADING_4, spacing: { before: 240, after: 60 } }));
      continue;
    }
    if (line.startsWith("### ")) {
      elements.push(new Paragraph({ text: line.slice(4).trim(), heading: HeadingLevel.HEADING_3, spacing: { before: 320, after: 80 } }));
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(new Paragraph({ text: line.slice(3).trim(), heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 100 } }));
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(new Paragraph({ text: line.slice(2).trim(), heading: HeadingLevel.HEADING_1, spacing: { before: 560, after: 140 } }));
      continue;
    }

    // ── Horizontal rule ─────────────────────────────────────────
    if (line.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
      elements.push(new Paragraph({
        border: { bottom: { color: "CCCCCC", space: 4, style: BorderStyle.SINGLE, size: 6 } },
        spacing: { before: 240, after: 240 },
      }));
      continue;
    }

    // ── Table row — render as plain text row ─────────────────────
    if (line.startsWith("|")) {
      if (line.match(/^\|[\s:|-]+\|/)) continue; // separator row
      const cells = line.split("|").map(c => c.trim()).filter(Boolean);
      elements.push(
        new Paragraph({
          children: cells.flatMap((cell, i) => [
            ...(i > 0 ? [new TextRun({ text: "   |   ", color: "AAAAAA" })] : []),
            ...parseInline(cell, { size: 20 }),
          ]),
          spacing: { before: 30, after: 30 },
        })
      );
      continue;
    }

    // ── Sub-bullet (2-space indent) ──────────────────────────────
    if (line.match(/^  {2}[-*+] /)) {
      elements.push(new Paragraph({ children: parseInline(line.replace(/^ {2,}[-*+] /, "").trim()), bullet: { level: 1 }, spacing: { before: 30, after: 30 } }));
      continue;
    }

    // ── Bullet list ─────────────────────────────────────────────
    if (line.match(/^[-*+] /)) {
      elements.push(new Paragraph({ children: parseInline(line.slice(2).trim()), bullet: { level: 0 }, spacing: { before: 40, after: 40 } }));
      continue;
    }

    // ── Ordered list ─────────────────────────────────────────────
    const numM = line.match(/^\d+\. (.+)/);
    if (numM) {
      elements.push(new Paragraph({ children: parseInline(numM[1]), numbering: { reference: "numList", level: 0 }, spacing: { before: 40, after: 40 } }));
      continue;
    }

    // ── Blockquote ───────────────────────────────────────────────
    if (line.startsWith("> ")) {
      elements.push(new Paragraph({
        children: parseInline(line.slice(2).trim(), { italics: true, color: "555555" }),
        indent: { left: 720 },
        border: { left: { color: "7C3AED", space: 4, style: BorderStyle.SINGLE, size: 14 } },
        spacing: { before: 80, after: 80 },
      }));
      continue;
    }

    // ── Empty line ───────────────────────────────────────────────
    if (line.trim() === "") {
      flush();
      continue;
    }

    // ── Normal paragraph ─────────────────────────────────────────
    elements.push(new Paragraph({ children: parseInline(line.trim()), spacing: { before: 80, after: 80 } }));
  }

  return elements;
}

// ── Build the Word document ─────────────────────────────────────────
async function build() {
  console.log("\n📄  Generating ChatsConnect Report .docx …\n");

  // Cover page
  const cover = [
    new Paragraph({ text: "", spacing: { before: 2880 } }),
    new Paragraph({
      children: [new TextRun({ text: "ChatsConnect", bold: true, size: 72, color: "7C3AED" })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: "Mini Project Report", size: 44, color: "4B5563" })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Real-Time Chat, Video & AI Platform", size: 30, italics: true, color: "9CA3AF" })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 480 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "B.E. Computer Engineering  ·  Savitribai Phule Pune University", size: 22, color: "9CA3AF" })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: `Exported on ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`, size: 20, color: "BBBBBB" })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 0 },
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];

  // Sections
  const body = [];
  for (let i = 0; i < FILES.length; i++) {
    const fp = path.join(DOCS_DIR, FILES[i]);
    if (!fs.existsSync(fp)) { console.warn(`  ⚠  Not found: ${FILES[i]}`); continue; }
    const raw  = fs.readFileSync(fp, "utf-8");
    const body_ = mdToDocx(stripFrontmatter(raw));
    body.push(...body_);
    if (i < FILES.length - 1) body.push(new Paragraph({ children: [new PageBreak()] }));
    console.log(`  ✓  ${FILES[i]}`);
  }

  const doc = new Document({
    numbering: {
      config: [{
        reference: "numList",
        levels: [{
          level: 0,
          format: "decimal",
          text: "%1.",
          alignment: AlignmentType.START,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      }],
    },
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 22 }, paragraph: { spacing: { line: 340 } } },
        heading1: { run: { bold: true, size: 40, color: "7C3AED", font: "Calibri" }, paragraph: { spacing: { before: 560, after: 140 } } },
        heading2: { run: { bold: true, size: 30, color: "4C1D95", font: "Calibri" }, paragraph: { spacing: { before: 400, after: 100 } } },
        heading3: { run: { bold: true, size: 24, color: "5B21B6", font: "Calibri" }, paragraph: { spacing: { before: 280, after: 80 } } },
        heading4: { run: { bold: true, size: 22, color: "374151", font: "Calibri" }, paragraph: { spacing: { before: 200, after: 60 } } },
      },
    },
    sections: [{
      properties: {
        page: { margin: { top: 1440, right: 1260, bottom: 1440, left: 1440 } },
      },
      children: [...cover, ...body],
    }],
  });

  fs.mkdirSync(STATIC_DIR, { recursive: true });
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT, buffer);

  const kb = Math.round(buffer.length / 1024);
  console.log(`\n✅  Saved → ${path.relative(process.cwd(), OUTPUT)}  (${kb} KB)\n`);
}

build().catch(err => { console.error("❌ Export failed:", err); process.exit(1); });
