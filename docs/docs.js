/**
 * Investiture Documentation Page
 *
 * Loads CLAUDE.md and renders it as an FAQ-style documentation page.
 */

// =============================================================================
// Configuration
// =============================================================================

// Path relative to docs/ directory in built output
const CLAUDE_MD_PATH = '../CLAUDE.md';

// Sections to display as FAQ items (maps heading to FAQ question)
const FAQ_MAPPING = {
  'Philosophy': 'What is the philosophy behind Investiture?',
  'Architecture': 'How is the architecture structured?',
  'Directory Structure': 'What is the directory structure?',
  'Design System Work (`/design-system`)': 'How do I work with the design system?',
  'Content Work (`/content`)': 'How do I work with content?',
  'Core Work (`/core`)': 'How do I work with core logic?',
  'View Work (`/views`)': 'How do I create views?',
  'Services Work (`/core/services`)': 'How do I work with services?',
  'Design Token Flow': 'How do design tokens flow through the system?',
  'Content Flow': 'How does content flow through the system?',
  'Adding a New View Framework': 'How do I add a new view framework?',
  'Plugging in a Client Design System': 'How do I integrate a client design system?',
  'Plugging in a CMS for Content': 'How do I connect a CMS?',
  'Git Workflow': 'What is the recommended git workflow?',
  'Common Commands': 'What are the common commands?',
  'What NOT to Do': 'What should I avoid doing?',
  'Starting a New App from Investiture': 'How do I start a new app from this scaffold?',
};

// Group sections into categories
const CATEGORIES = {
  'Overview': ['Philosophy', 'Architecture', 'Directory Structure'],
  'Working with Layers': [
    'Design System Work (`/design-system`)',
    'Content Work (`/content`)',
    'Core Work (`/core`)',
    'View Work (`/views`)',
    'Services Work (`/core/services`)',
  ],
  'Data Flow': ['Design Token Flow', 'Content Flow'],
  'Integration': [
    'Adding a New View Framework',
    'Plugging in a Client Design System',
    'Plugging in a CMS for Content',
  ],
  'Development': ['Git Workflow', 'Common Commands', 'What NOT to Do', 'Starting a New App from Investiture'],
};

// =============================================================================
// DOM References
// =============================================================================

const docsNav = document.getElementById('docs-nav');
const docsContent = document.getElementById('docs-content');

// =============================================================================
// Markdown Parsing
// =============================================================================

/**
 * Parse CLAUDE.md into sections
 */
function parseMarkdown(markdown) {
  const sections = {};
  const lines = markdown.split('\n');

  let currentSection = null;
  let currentContent = [];

  for (const line of lines) {
    // Check for ## headings (main sections)
    const h2Match = line.match(/^## (.+)$/);
    // Check for ### headings (subsections)
    const h3Match = line.match(/^### (.+)$/);

    if (h2Match || h3Match) {
      // Save previous section
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }

      currentSection = h2Match ? h2Match[1] : h3Match[1];
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentSection) {
    sections[currentSection] = currentContent.join('\n').trim();
  }

  return sections;
}

/**
 * Convert markdown content to HTML
 */
function markdownToHtml(content) {
  let html = content;

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Paragraphs (lines with content that aren't already wrapped)
  html = html.replace(/^(?!<[uol]|<li|<pre|<code)(.+)$/gm, '<p>$1</p>');

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
}

/**
 * Escape HTML entities
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// =============================================================================
// Rendering
// =============================================================================

/**
 * Render the navigation
 */
function renderNav(categories) {
  const navHtml = Object.keys(categories).map((category, index) => {
    const activeClass = index === 0 ? 'docs-nav__link--active' : '';
    return `<a href="#${slugify(category)}" class="docs-nav__link ${activeClass}">${category}</a>`;
  }).join('');

  docsNav.innerHTML = navHtml;

  // Add click handlers
  docsNav.querySelectorAll('.docs-nav__link').forEach(link => {
    link.addEventListener('click', (e) => {
      docsNav.querySelectorAll('.docs-nav__link').forEach(l => l.classList.remove('docs-nav__link--active'));
      link.classList.add('docs-nav__link--active');
    });
  });
}

/**
 * Render documentation sections
 */
function renderDocs(sections, categories) {
  let html = '';

  for (const [categoryName, sectionNames] of Object.entries(categories)) {
    html += `
      <section class="faq-section" id="${slugify(categoryName)}">
        <h2 class="faq-section__title">
          ${categoryName}
          <a href="#" class="back-to-top">Back to top</a>
        </h2>
    `;

    for (const sectionName of sectionNames) {
      const content = sections[sectionName];
      if (!content) continue;

      const title = FAQ_MAPPING[sectionName] || sectionName;
      const body = markdownToHtml(content);

      html += `
        <div class="docs-section">
          <h3 class="docs-section__title">${title}</h3>
          <div class="docs-section__content">
            ${body}
          </div>
        </div>
      `;
    }

    html += '</section>';
  }

  docsContent.innerHTML = html;
}

/**
 * Create URL-friendly slug
 */
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// =============================================================================
// Initialize
// =============================================================================

async function init() {
  try {
    // Load CLAUDE.md
    const response = await fetch(CLAUDE_MD_PATH);
    if (!response.ok) {
      throw new Error(`Failed to load documentation: ${response.status}`);
    }

    const markdown = await response.text();
    const sections = parseMarkdown(markdown);

    // Render
    renderNav(CATEGORIES);
    renderDocs(sections, CATEGORIES);

    // Handle hash navigation after content is rendered
    if (window.location.hash) {
      const targetId = window.location.hash.slice(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        // Small delay to ensure layout is complete
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          // Update nav active state
          docsNav.querySelectorAll('.docs-nav__link').forEach(link => {
            link.classList.toggle('docs-nav__link--active', link.getAttribute('href') === window.location.hash);
          });
        }, 100);
      }
    }

    console.log('[Docs] Loaded and rendered');
  } catch (error) {
    console.error('[Docs] Error:', error);
    docsContent.innerHTML = `
      <div class="faq-item">
        <div class="faq-item__question">
          <span>Error loading documentation</span>
        </div>
        <div class="faq-item__answer" style="display: block;">
          <p>${error.message}</p>
          <p>Make sure the server is running from the project root.</p>
        </div>
      </div>
    `;
  }
}

init();
