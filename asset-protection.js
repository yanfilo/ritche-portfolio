/* ── Asset protection ──────────────────────────────────────────
       Blocks casual downloading of images and HTML assets.
       PDF link (Google Drive) is explicitly excluded.
    ────────────────────────────────────────────────────────────── */
    (function () {
      const isPDF = el => {
        const a = el.closest('a');
        return a && (a.href.includes('.pdf') || a.href.includes('drive.google.com'));
      };

      // 1. Block right-click context menu on images and non-PDF links
      document.addEventListener('contextmenu', function (e) {
        if (e.target.tagName === 'IMG' || e.target.tagName === 'image') {
          e.preventDefault();
          return;
        }
        const a = e.target.closest('a');
        if (a && !isPDF(e.target)) {
          e.preventDefault();
        }
      });

      // 2. Block drag-to-save on all images
      document.addEventListener('dragstart', function (e) {
        if (e.target.tagName === 'IMG') {
          e.preventDefault();
        }
      });

      // 3. Block Ctrl+S / Cmd+S (Save Page)
      document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
        }
      });

      // 4. Apply CSS protection to all images via JS
      document.querySelectorAll('img').forEach(img => {
        img.setAttribute('draggable', 'false');
        img.style.webkitUserDrag = 'none';
        img.style.userSelect = 'none';
        img.style.pointerEvents = 'none';
        // Re-enable pointer events only on images inside clickable links
        const parent = img.closest('a');
        if (parent) {
          img.style.pointerEvents = 'auto';
        }
      });
    })();
