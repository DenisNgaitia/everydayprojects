/**
 * MarkdownRenderer.jsx
 * Lightweight markdown → HTML renderer.
 * Zero external dependencies — pure string transforms.
 *
 * Supported syntax:
 *   # H1  ## H2  ### H3  #### H4
 *   **bold**  *italic*  `inline code`
 *   ```code block```
 *   > blockquote
 *   - unordered list  1. ordered list
 *   ---  horizontal rule
 *   [link text](url)
 */

/**
 * parseMarkdown(md) → HTML string
 * Processes in two passes:
 *   1. Block-level elements (headings, code blocks, lists, blockquotes, hr)
 *   2. Inline elements within each block (bold, italic, code, links)
 */
function parseMarkdown(md) {
    if (!md) return '';

    const lines = md.split('\n');
    const blocks = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // ── Fenced code block ──────────────────────────────────────────────
        if (line.trimStart().startsWith('```')) {
            const lang = line.trim().slice(3).trim();
            const codeLines = [];
            i++;
            while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            const escaped = codeLines.join('\n')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            blocks.push(
                `<pre class="md-pre"><code class="md-code-block${lang ? ` language-${lang}` : ''}">${escaped}</code></pre>`
            );
            i++;
            continue;
        }

        // ── Heading ────────────────────────────────────────────────────────
        const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
        if (headingMatch) {
            const level = headingMatch[1].length;
            const text = inlineMarkdown(headingMatch[2]);
            blocks.push(`<h${level} class="md-h${level}">${text}</h${level}>`);
            i++;
            continue;
        }

        // ── Horizontal rule ────────────────────────────────────────────────
        if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())) {
            blocks.push('<hr class="md-hr" />');
            i++;
            continue;
        }

        // ── Blockquote ─────────────────────────────────────────────────────
        if (line.startsWith('> ')) {
            const quoteLines = [];
            while (i < lines.length && lines[i].startsWith('> ')) {
                quoteLines.push(lines[i].slice(2));
                i++;
            }
            const inner = inlineMarkdown(quoteLines.join('<br/>'));
            blocks.push(`<blockquote class="md-blockquote">${inner}</blockquote>`);
            continue;
        }

        // ── Unordered list ─────────────────────────────────────────────────
        if (/^[\-\*\+]\s/.test(line)) {
            const items = [];
            while (i < lines.length && /^[\-\*\+]\s/.test(lines[i])) {
                items.push(`<li class="md-li">${inlineMarkdown(lines[i].slice(2))}</li>`);
                i++;
            }
            blocks.push(`<ul class="md-ul">${items.join('')}</ul>`);
            continue;
        }

        // ── Ordered list ───────────────────────────────────────────────────
        if (/^\d+\.\s/.test(line)) {
            const items = [];
            while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
                items.push(`<li class="md-li">${inlineMarkdown(lines[i].replace(/^\d+\.\s/, ''))}</li>`);
                i++;
            }
            blocks.push(`<ol class="md-ol">${items.join('')}</ol>`);
            continue;
        }

        // ── Empty line (paragraph break) ───────────────────────────────────
        if (line.trim() === '') {
            i++;
            continue;
        }

        // ── Paragraph ──────────────────────────────────────────────────────
        const paraLines = [];
        while (
            i < lines.length &&
            lines[i].trim() !== '' &&
            !/^(#{1,4}\s|>\s|[\-\*\+]\s|\d+\.\s|```|-{3,}|\*{3,})/.test(lines[i])
        ) {
            paraLines.push(lines[i]);
            i++;
        }
        blocks.push(`<p class="md-p">${inlineMarkdown(paraLines.join(' '))}</p>`);
    }

    return blocks.join('\n');
}

/** Process inline markdown within a single text node */
function inlineMarkdown(text) {
    return text
        // Escape any existing HTML
        .replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;')
        // Bold+italic: ***text***
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        // Bold: **text**
        .replace(/\*\*(.+?)\*\*/g, '<strong class="md-strong">$1</strong>')
        // Italic: *text* or _text_
        .replace(/\*(.+?)\*/g, '<em class="md-em">$1</em>')
        .replace(/_(.+?)_/g, '<em class="md-em">$1</em>')
        // Inline code: `code`
        .replace(/`([^`]+)`/g, '<code class="md-code">$1</code>')
        // Link: [text](url)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="md-link" href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MarkdownRenderer({ content, className = '' }) {
    const html = parseMarkdown(content || '');

    return (
        <div
            className={`md-body ${className}`}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
