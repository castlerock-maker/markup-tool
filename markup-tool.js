(function () {
  'use strict';

  // Prevent double-injection
  if (window.__markupToolActive) {
    // Toggle sidebar visibility if already injected
    const existing = document.getElementById('markup-tool-sidebar');
    if (existing) existing.style.display = existing.style.display === 'none' ? 'flex' : 'none';
    return;
  }
  window.__markupToolActive = true;

  // ── State ──────────────────────────────────────────────────────────────────
  const STORAGE_KEY = 'markup-tool:' + location.origin + location.pathname;
  let annotations = loadAnnotations();
  let nextId = annotations.length ? Math.max(...annotations.map(a => a.id)) + 1 : 1;

  function loadAnnotations() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { return []; }
  }

  function saveAnnotations() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
  }

  // ── Styles ─────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.id = 'markup-tool-styles';
  style.textContent = `
    #markup-tool-sidebar {
      position: fixed;
      top: 0;
      right: 0;
      width: 360px;
      height: 100vh;
      background: #0d1b2a;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      box-shadow: -4px 0 24px rgba(0,0,0,0.4);
      transition: transform 0.2s ease;
    }

    #markup-tool-sidebar * {
      box-sizing: border-box;
    }

    #markup-tool-header {
      padding: 16px;
      background: #1b2838;
      border-bottom: 1px solid #253548;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }

    #markup-tool-header h2 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: #eab308;
      letter-spacing: 0.5px;
    }

    #markup-tool-header-actions {
      display: flex;
      gap: 8px;
    }

    .markup-tool-btn {
      background: #253548;
      color: #e2e8f0;
      border: 1px solid #334155;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.15s ease;
    }

    .markup-tool-btn:hover {
      background: #5b8fd9;
      color: #fff;
      border-color: #5b8fd9;
    }

    .markup-tool-btn--primary {
      background: #eab308;
      color: #0d1b2a;
      border-color: #eab308;
      font-weight: 600;
    }

    .markup-tool-btn--primary:hover {
      background: #ca9a06;
    }

    .markup-tool-btn--danger {
      background: transparent;
      color: #94a3b8;
      border-color: transparent;
      padding: 4px 8px;
    }

    .markup-tool-btn--danger:hover {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }

    .markup-tool-btn--close {
      background: transparent;
      color: #94a3b8;
      border: none;
      font-size: 18px;
      padding: 4px 8px;
      line-height: 1;
    }

    .markup-tool-btn--close:hover {
      color: #e2e8f0;
      background: transparent;
    }

    #markup-tool-list {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }

    #markup-tool-list::-webkit-scrollbar {
      width: 6px;
    }

    #markup-tool-list::-webkit-scrollbar-track {
      background: transparent;
    }

    #markup-tool-list::-webkit-scrollbar-thumb {
      background: #253548;
      border-radius: 3px;
    }

    .markup-tool-empty {
      text-align: center;
      color: #64748b;
      padding: 40px 20px;
      line-height: 1.6;
    }

    .markup-tool-empty strong {
      display: block;
      color: #94a3b8;
      margin-bottom: 8px;
    }

    .markup-tool-card {
      background: #1b2838;
      border: 1px solid #253548;
      border-left: 3px solid #eab308;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 10px;
      transition: border-color 0.15s ease;
    }

    .markup-tool-card:hover {
      border-color: #eab308;
    }

    .markup-tool-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .markup-tool-card-number {
      font-size: 11px;
      color: #eab308;
      font-weight: 600;
    }

    .markup-tool-highlight-text {
      background: rgba(91, 143, 217, 0.1);
      border-left: 2px solid #5b8fd9;
      padding: 8px 10px;
      margin-bottom: 8px;
      border-radius: 0 4px 4px 0;
      font-size: 12px;
      line-height: 1.5;
      color: #94a3b8;
      max-height: 80px;
      overflow: hidden;
      word-break: break-word;
    }

    .markup-tool-comment {
      font-size: 12px;
      line-height: 1.5;
      color: #e2e8f0;
      word-break: break-word;
    }

    /* Inline highlight on the page */
    .markup-tool-inline-highlight {
      background: rgba(234, 179, 8, 0.2);
      border-bottom: 2px solid #eab308;
      cursor: pointer;
      border-radius: 2px;
      transition: background 0.15s ease;
    }

    .markup-tool-inline-highlight:hover {
      background: rgba(234, 179, 8, 0.35);
    }

    /* Annotation popup */
    #markup-tool-popup {
      position: absolute;
      z-index: 2147483646;
      background: #0d1b2a;
      border: 1px solid #253548;
      border-radius: 10px;
      padding: 14px;
      width: 300px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    #markup-tool-popup textarea {
      width: 100%;
      height: 80px;
      background: #1b2838;
      color: #e2e8f0;
      border: 1px solid #253548;
      border-radius: 6px;
      padding: 10px;
      font-size: 13px;
      font-family: inherit;
      resize: vertical;
      outline: none;
      transition: border-color 0.15s ease;
    }

    #markup-tool-popup textarea:focus {
      border-color: #5b8fd9;
    }

    #markup-tool-popup-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 10px;
    }

    #markup-tool-footer {
      padding: 12px 16px;
      background: #1b2838;
      border-top: 1px solid #253548;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }

    #markup-tool-count {
      font-size: 12px;
      color: #64748b;
    }

    /* Push page content left to make room for sidebar */
    .markup-tool-page-shifted {
      margin-right: 360px !important;
      transition: margin-right 0.2s ease;
    }

    /* Toast notification */
    #markup-tool-toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(80px);
      background: #1b2838;
      color: #e2e8f0;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      z-index: 2147483647;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      border: 1px solid #253548;
      transition: transform 0.3s ease;
      pointer-events: none;
    }

    #markup-tool-toast.show {
      transform: translateX(-50%) translateY(0);
    }
  `;
  document.head.appendChild(style);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const toast = document.createElement('div');
  toast.id = 'markup-tool-toast';
  document.body.appendChild(toast);

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  // ── Sidebar ────────────────────────────────────────────────────────────────
  const sidebar = document.createElement('div');
  sidebar.id = 'markup-tool-sidebar';
  sidebar.innerHTML = `
    <div id="markup-tool-header">
      <h2>Markup Tool</h2>
      <div id="markup-tool-header-actions">
        <button class="markup-tool-btn" id="markup-tool-clear-btn" title="Clear all annotations">Clear All</button>
        <button class="markup-tool-btn--close markup-tool-btn" id="markup-tool-close-btn" title="Close sidebar">&times;</button>
      </div>
    </div>
    <div id="markup-tool-list"></div>
    <div id="markup-tool-footer">
      <span id="markup-tool-count"></span>
      <button class="markup-tool-btn markup-tool-btn--primary" id="markup-tool-export-btn">Export JSON</button>
    </div>
  `;
  document.body.appendChild(sidebar);

  // Shift page content
  document.documentElement.classList.add('markup-tool-page-shifted');

  // ── Sidebar controls ───────────────────────────────────────────────────────
  document.getElementById('markup-tool-close-btn').addEventListener('click', () => {
    sidebar.style.display = 'none';
    document.documentElement.classList.remove('markup-tool-page-shifted');
  });

  document.getElementById('markup-tool-clear-btn').addEventListener('click', () => {
    if (!annotations.length) return;
    if (!confirm('Remove all annotations from this page?')) return;
    annotations = [];
    nextId = 1;
    saveAnnotations();
    renderList();
    clearInlineHighlights();
    showToast('All annotations cleared');
  });

  document.getElementById('markup-tool-export-btn').addEventListener('click', exportAnnotations);

  // ── Render annotation list ─────────────────────────────────────────────────
  function renderList() {
    const list = document.getElementById('markup-tool-list');
    const count = document.getElementById('markup-tool-count');
    count.textContent = annotations.length + ' annotation' + (annotations.length !== 1 ? 's' : '');

    if (!annotations.length) {
      list.innerHTML = `<div class="markup-tool-empty">
        <strong>No annotations yet</strong>
        Select text on the page to add markup comments.
      </div>`;
      return;
    }

    list.innerHTML = annotations.map((a, i) => `
      <div class="markup-tool-card" data-id="${a.id}">
        <div class="markup-tool-card-header">
          <span class="markup-tool-card-number">#${i + 1}</span>
          <button class="markup-tool-btn markup-tool-btn--danger" data-delete="${a.id}" title="Delete">&times;</button>
        </div>
        <div class="markup-tool-highlight-text">${escapeHtml(a.selectedText)}</div>
        <div class="markup-tool-comment">${escapeHtml(a.comment)}</div>
      </div>
    `).join('');

    // Delete handlers
    list.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.delete);
        annotations = annotations.filter(a => a.id !== id);
        saveAnnotations();
        renderList();
        clearInlineHighlights();
        restoreInlineHighlights();
        showToast('Annotation deleted');
      });
    });

    // Click card to scroll to highlight
    list.querySelectorAll('.markup-tool-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.dataset.delete) return;
        const id = parseInt(card.dataset.id);
        const el = document.querySelector(`.markup-tool-inline-highlight[data-annotation-id="${id}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.background = 'rgba(234, 179, 8, 0.45)';
          setTimeout(() => el.style.background = '', 600);
        }
      });
    });
  }

  // ── Inline highlights ──────────────────────────────────────────────────────
  function clearInlineHighlights() {
    document.querySelectorAll('.markup-tool-inline-highlight').forEach(el => {
      const parent = el.parentNode;
      parent.replaceChild(document.createTextNode(el.textContent), el);
      parent.normalize();
    });
  }

  function restoreInlineHighlights() {
    annotations.forEach(a => {
      try {
        highlightTextInPage(a.selectedText, a.id);
      } catch (e) { /* text may have changed */ }
    });
  }

  function highlightTextInPage(text, annotationId) {
    if (!text || text.length < 2) return;

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip our own UI elements
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (parent.closest('#markup-tool-sidebar, #markup-tool-popup, #markup-tool-toast')) {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.classList.contains('markup-tool-inline-highlight')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    // Collect all text nodes
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    // Try to find the text across potentially multiple text nodes
    // First, try single-node match
    for (const node of textNodes) {
      const idx = node.textContent.indexOf(text);
      if (idx !== -1) {
        const range = document.createRange();
        range.setStart(node, idx);
        range.setEnd(node, idx + text.length);
        wrapRange(range, annotationId);
        return;
      }
    }

    // Fallback: try first 40 chars to find approximate location
    const snippet = text.substring(0, 40);
    for (const node of textNodes) {
      const idx = node.textContent.indexOf(snippet);
      if (idx !== -1) {
        const range = document.createRange();
        range.setStart(node, idx);
        range.setEnd(node, Math.min(idx + text.length, node.textContent.length));
        wrapRange(range, annotationId);
        return;
      }
    }
  }

  function wrapRange(range, annotationId) {
    const span = document.createElement('span');
    span.className = 'markup-tool-inline-highlight';
    span.dataset.annotationId = annotationId;
    try {
      range.surroundContents(span);
    } catch (e) {
      // Range crosses element boundaries — wrap what we can
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
    }
  }

  // ── Selection handling ─────────────────────────────────────────────────────
  let popup = null;

  document.addEventListener('mouseup', (e) => {
    // Ignore clicks inside our UI
    if (e.target.closest('#markup-tool-sidebar, #markup-tool-popup')) return;

    // Small delay to let selection finalize
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection.toString().trim();

      // Remove existing popup
      removePopup();

      if (!text || text.length < 2) return;

      // Get position for popup
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      showPopup(text, rect, selection);
    }, 10);
  });

  function showPopup(selectedText, rect, selection) {
    popup = document.createElement('div');
    popup.id = 'markup-tool-popup';

    popup.innerHTML = `
      <textarea placeholder="Add your annotation comment..." autofocus></textarea>
      <div id="markup-tool-popup-actions">
        <button class="markup-tool-btn" id="markup-tool-popup-cancel">Cancel</button>
        <button class="markup-tool-btn markup-tool-btn--primary" id="markup-tool-popup-save">Save</button>
      </div>
    `;

    // Position popup below selection
    popup.style.top = (window.scrollY + rect.bottom + 8) + 'px';
    popup.style.left = Math.max(8, Math.min(
      rect.left + (rect.width / 2) - 150,
      window.innerWidth - 380
    )) + 'px';

    document.body.appendChild(popup);

    const textarea = popup.querySelector('textarea');
    textarea.focus();

    // Save on Enter (without Shift)
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        save();
      }
      if (e.key === 'Escape') {
        removePopup();
      }
    });

    popup.querySelector('#markup-tool-popup-cancel').addEventListener('click', removePopup);
    popup.querySelector('#markup-tool-popup-save').addEventListener('click', save);

    function save() {
      const comment = textarea.value.trim();
      if (!comment) {
        textarea.style.borderColor = '#ef4444';
        textarea.placeholder = 'Please add a comment...';
        textarea.focus();
        return;
      }

      const annotation = {
        id: nextId++,
        selectedText: selectedText,
        comment: comment,
        timestamp: new Date().toISOString(),
        url: location.href,
        // Store a CSS selector path hint for potential future use
        context: getSelectionContext(selectedText)
      };

      annotations.push(annotation);
      saveAnnotations();

      // Clear browser selection
      window.getSelection().removeAllRanges();

      // Highlight in page
      highlightTextInPage(selectedText, annotation.id);

      renderList();
      removePopup();
      showToast('Annotation saved');

      // Scroll sidebar to new annotation
      const list = document.getElementById('markup-tool-list');
      list.scrollTop = list.scrollHeight;
    }
  }

  function removePopup() {
    if (popup) {
      popup.remove();
      popup = null;
    }
  }

  // ── Context helper ─────────────────────────────────────────────────────────
  function getSelectionContext(text) {
    // Try to find the nearest identifiable parent element
    const sel = window.getSelection();
    if (!sel.rangeCount) return {};

    const range = sel.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const el = container.nodeType === 3 ? container.parentElement : container;

    if (!el) return {};

    const context = {};

    // Get element tag path
    const path = [];
    let current = el;
    while (current && current !== document.body) {
      let tag = current.tagName?.toLowerCase();
      if (tag) {
        if (current.id) tag += '#' + current.id;
        else if (current.className && typeof current.className === 'string') {
          tag += '.' + current.className.trim().split(/\s+/).slice(0, 2).join('.');
        }
        path.unshift(tag);
      }
      current = current.parentElement;
    }
    context.elementPath = path.join(' > ');

    // Get nearest heading
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let nearestHeading = null;
    let nearestDist = Infinity;
    const elRect = el.getBoundingClientRect();
    headings.forEach(h => {
      const hRect = h.getBoundingClientRect();
      const dist = Math.abs(hRect.top - elRect.top);
      if (dist < nearestDist && hRect.top <= elRect.top) {
        nearestDist = dist;
        nearestHeading = h.textContent.trim();
      }
    });
    if (nearestHeading) context.nearestHeading = nearestHeading;

    return context;
  }

  // ── Export ──────────────────────────────────────────────────────────────────
  function exportAnnotations() {
    if (!annotations.length) {
      showToast('No annotations to export');
      return;
    }

    const exportData = {
      page: {
        url: location.href,
        title: document.title,
        exportedAt: new Date().toISOString()
      },
      annotations: annotations.map((a, i) => ({
        number: i + 1,
        selectedText: a.selectedText,
        comment: a.comment,
        context: a.context || {},
        timestamp: a.timestamp
      })),
      instructions: "Each annotation highlights content on the page that needs to be changed. The 'selectedText' is the current content, and the 'comment' describes what change is needed. The 'context' object provides the DOM element path and nearest heading to help locate the content."
    };

    const json = JSON.stringify(exportData, null, 2);

    // Copy to clipboard
    navigator.clipboard.writeText(json).then(() => {
      showToast('JSON copied to clipboard');
    }).catch(() => {
      // Fallback: download as file
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'markup-annotations-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('JSON downloaded');
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Initialize ─────────────────────────────────────────────────────────────
  renderList();
  restoreInlineHighlights();

  // Close popup on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') removePopup();
  });
})();
