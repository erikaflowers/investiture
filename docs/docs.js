/**
 * Investiture Documentation Page
 *
 * Loads CLAUDE.md and renders it as documentation.
 */

const CLAUDE_MD_PATH = '../CLAUDE.md';

const docsNav = document.getElementById('docs-nav');
const docsContent = document.getElementById('docs-content');

// Section mapping for cleaner display names
const SECTION_NAMES = {
  'What This Is': 'Overview',
  'Folder Structure': 'Project Structure',
  'Rules': 'Architecture Rules',
  'Do Not': 'Anti-Patterns',
  'When Adding Features': 'Adding Features',
  'Demo App': 'Demo Application'
};

// Subsections under Rules
const SUBSECTIONS = ['Views', 'Core', 'Services', 'Content', 'Design System'];

function parseMarkdown(markdown) {
  const sections = {};
  const lines = markdown.split('\n');

  let currentSection = null;
  let currentContent = [];

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/);
    const h3Match = line.match(/^### (.+)$/);

    if (h2Match) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = h2Match[1];
      currentContent = [];
    } else if (h3Match) {
      // Include subsection headings in content
      currentContent.push(line);
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  if (currentSection) {
    sections[currentSection] = currentContent.join('\n').trim();
  }

  return sections;
}

function markdownToHtml(content) {
  let html = content;

  // Subsection headings
  html = html.replace(/^### (.+)$/gm, '<h4 class="docs-subsection">$1</h4>');

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Paragraphs
  html = html.replace(/^(?!<[uolhp]|<li|<pre|<code)(.+)$/gm, '<p>$1</p>');
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function renderNav(sections) {
  const navHtml = Object.keys(sections).map((section, index) => {
    const displayName = SECTION_NAMES[section] || section;
    const activeClass = index === 0 ? 'docs-nav__link--active' : '';
    return `<a href="#${slugify(section)}" class="docs-nav__link ${activeClass}">${displayName}</a>`;
  }).join('');

  docsNav.innerHTML = navHtml;

  docsNav.querySelectorAll('.docs-nav__link').forEach(link => {
    link.addEventListener('click', () => {
      docsNav.querySelectorAll('.docs-nav__link').forEach(l => l.classList.remove('docs-nav__link--active'));
      link.classList.add('docs-nav__link--active');
    });
  });
}

function renderDocs(sections) {
  let html = '';

  for (const [sectionName, content] of Object.entries(sections)) {
    const displayName = SECTION_NAMES[sectionName] || sectionName;
    const body = markdownToHtml(content);

    html += `
      <section class="faq-section" id="${slugify(sectionName)}">
        <h2 class="faq-section__title">${displayName}</h2>
        <div class="docs-section__content">${body}</div>
      </section>
    `;
  }

  docsContent.innerHTML = html;
}

async function init() {
  try {
    const response = await fetch(CLAUDE_MD_PATH);
    if (!response.ok) {
      throw new Error(`${response.status}`);
    }

    const markdown = await response.text();
    const sections = parseMarkdown(markdown);

    renderNav(sections);
    renderDocs(sections);

    if (window.location.hash) {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) {
        setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  } catch (error) {
    docsContent.innerHTML = `
      <div class="docs-section">
        <h3 class="docs-section__title">Error loading documentation</h3>
        <div class="docs-section__content">
          <p>Failed to load CLAUDE.md: ${error.message}</p>
          <p><a href="https://github.com/erikaflowers/investiture/blob/main/CLAUDE.md" target="_blank">View on GitHub</a></p>
        </div>
      </div>
    `;
  }
}

init();
