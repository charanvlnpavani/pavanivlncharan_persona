import type { ResumeData, ResumeSection } from "./resume-data";

/**
 * ATS-friendly resume HTML. Single column, standard section headings, real
 * text (selectable and searchable in the PDF), no images or icons.
 * Every value is HTML-escaped before it is inserted.
 */

const esc = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Only http(s)/mailto links make it into the PDF. */
const safeHref = (url: string) => (/^(https?:|mailto:)/i.test(url) ? esc(url) : "#");

const BASE_CSS = `
  @page { size: A4; margin: 14mm 15mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-size: 10pt; line-height: 1.38; color: #111; -webkit-print-color-adjust: exact; }
  a { color: inherit; text-decoration: none; }
  header { margin-bottom: 8pt; }
  h1 { margin: 0; font-weight: 700; letter-spacing: -0.01em; }
  .headline { margin: 2pt 0 0; font-size: 11pt; }
  .contact { margin: 5pt 0 0; font-size: 9pt; color: #333; }
  .contact span + span::before { content: "  |  "; color: #888; white-space: pre; }
  section { margin-top: 10pt; }
  h2 { margin: 0 0 5pt; font-size: 10.5pt; letter-spacing: 0.08em; text-transform: uppercase; break-after: avoid; page-break-after: avoid; }
  .entry { margin-bottom: 7pt; break-inside: avoid; page-break-inside: avoid; }
  .row { display: flex; justify-content: space-between; align-items: baseline; gap: 12pt; }
  .row .when { flex-shrink: 0; font-size: 9pt; color: #333; }
  .title { font-weight: 700; }
  .sub { color: #333; }
  p { margin: 2pt 0 0; }
  ul { margin: 3pt 0 0; padding-left: 13pt; }
  li { margin: 1.5pt 0; }
  .tech { margin-top: 2pt; font-size: 9pt; color: #444; }
  .skills { display: grid; grid-template-columns: max-content 1fr; column-gap: 10pt; row-gap: 2pt; }
  .skills dt { font-weight: 700; }
  .skills dd { margin: 0; }
`;

const TEMPLATE_CSS: Record<ResumeData["template"], string> = {
  classic: `
    body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; }
    header { text-align: center; }
    h1 { font-size: 21pt; }
    .contact span + span::before { content: "  •  "; }
    h2 { border-bottom: 0.8pt solid #222; padding-bottom: 2pt; }
  `,
  modern: `
    body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; }
    h1 { font-size: 22pt; color: #0b3b3a; }
    .headline { color: #0f766e; font-weight: 600; }
    h2 { color: #0f766e; border-bottom: 0.6pt solid #9ccfc9; padding-bottom: 2pt; }
  `,
};

function techLine(tech: string[]) {
  return tech.length ? `<p class="tech"><strong>Tech:</strong> ${esc(tech.join(", "))}</p>` : "";
}

function renderSection(section: ResumeSection): string {
  const head = `<h2>${esc(section.title)}</h2>`;
  switch (section.key) {
    case "summary":
      return `<section>${head}<p>${esc(section.text)}</p></section>`;

    case "skills":
      return `<section>${head}<dl class="skills">${section.groups
        .map((g) => `<dt>${esc(g.name)}:</dt><dd>${esc(g.items.join(", "))}</dd>`)
        .join("")}</dl></section>`;

    case "experience":
      return `<section>${head}${section.items
        .map(
          (e) => `<div class="entry">
            <div class="row"><span><span class="title">${esc(e.role)}</span>, <span class="sub">${esc(e.org)}</span>${
              e.location ? ` <span class="sub">(${esc(e.location)})</span>` : ""
            }</span><span class="when">${esc(e.dates)}</span></div>
            ${e.summary ? `<p>${esc(e.summary)}</p>` : ""}
            ${e.bullets.length ? `<ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
            ${techLine(e.tech)}
          </div>`,
        )
        .join("")}</section>`;

    case "projects":
      return `<section>${head}${section.items
        .map(
          (p) => `<div class="entry">
            <div class="row"><span class="title">${esc(p.name)}</span>${
              p.link ? `<a class="when" href="${safeHref(p.link.url)}">${esc(p.link.display)}</a>` : ""
            }</div>
            <p>${esc(p.summary)}</p>
            ${techLine(p.tech)}
          </div>`,
        )
        .join("")}</section>`;

    case "education":
      return `<section>${head}${section.items
        .map(
          (e) => `<div class="entry">
            <div class="row"><span><span class="title">${esc(e.degree)}</span>, <span class="sub">${esc(e.institution)}</span>${
              e.location ? ` <span class="sub">(${esc(e.location)})</span>` : ""
            }</span><span class="when">${esc(e.dates)}</span></div>
            ${e.summary ? `<p>${esc(e.summary)}</p>` : ""}
          </div>`,
        )
        .join("")}</section>`;

    case "certifications":
      return `<section>${head}<ul>${section.items
        .map(
          (c) =>
            `<li><span class="title">${esc(c.name)}</span>, ${esc(c.issuer)} (${esc(c.date)})${
              c.link ? ` <a href="${safeHref(c.link.url)}">${esc(c.link.display)}</a>` : ""
            }</li>`,
        )
        .join("")}</ul></section>`;

    case "achievements":
      return `<section>${head}<ul>${section.items
        .map(
          (a) =>
            `<li><span class="title">${esc(a.title)}</span>${a.date ? ` (${esc(a.date)})` : ""}${
              a.description ? `: ${esc(a.description)}` : ""
            }</li>`,
        )
        .join("")}</ul></section>`;
  }
}

export function renderResumeHtml(data: ResumeData): string {
  const contact = [
    ...data.contact.map((c) => `<span>${esc(c)}</span>`),
    ...data.links.map((l) => `<span><a href="${safeHref(l.url)}">${esc(l.display)}</a></span>`),
  ].join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(data.name)} – Resume</title>
<meta name="author" content="${esc(data.name)}">
<style>${BASE_CSS}${TEMPLATE_CSS[data.template]}</style>
</head>
<body>
<header>
  <h1>${esc(data.name)}</h1>
  <p class="headline">${esc(data.headline)}</p>
  <p class="contact">${contact}</p>
</header>
${data.sections.map(renderSection).join("\n")}
</body>
</html>`;
}
