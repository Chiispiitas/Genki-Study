/* ==============================================
   MAIN SCRIPT
============================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ==============================================
      THEME TOGGLE
  ============================================== */
  var toggle = document.getElementById('themeToggle');

  if (toggle) {
    toggle.addEventListener('click', function () {
      var isDark = document.body.classList.toggle('dark-theme');
      toggle.textContent = isDark ? '☀️' : '🌙';
    });
  }

  /* ==============================================
      UNIT TITLE, CHIP & SIDEBAR LINKS
  ============================================== */
  var sections      = Array.from(document.querySelectorAll('.unit-section'));
  var unitLinks     = Array.from(document.querySelectorAll('.unit-link'));
  var unitTitleEl   = document.getElementById('unitTitle');
  var unitChipEl    = document.getElementById('unitChip');
  var unitGrammEl   = document.getElementById('unitGrammar');
  var unitChipSpan  = unitChipEl ? unitChipEl.querySelector('span') : null;

  if (!sections.length || !unitTitleEl || !unitChipSpan) {
    return;
  }

  function setActiveUnit(unitId, titleText, chipText) {
    unitLinks.forEach(function (link) {
      link.classList.toggle('active', link.dataset.unit === unitId);
    });

    unitTitleEl.textContent  = titleText || '';
    unitChipSpan.textContent = chipText || '';
    unitGrammEl.addEventListener('click', function () {
      location.href = "appendix/grammar-index/index.html#lesson-grammar-" + unitId;
    });
  }

  /* ==============================================
      DETECT SCROLL CONTAINER
  ============================================== */
  var mainEl      = document.querySelector('.main');
  var scrollRoot  = window;
  var rootElement = null;

  if (mainEl) {
    var styles = getComputedStyle(mainEl);

    if (styles.overflowY !== 'visible' && styles.overflowY !== 'unset') {
      scrollRoot  = mainEl;
      rootElement = mainEl;
    }
  }

  /* ==============================================
      ACTIVE UNIT BASED ON SCROLL POSITION
      (trigger as soon as section touches top)
  ============================================== */
  function updateActiveUnit() {
    /* Viewport of the scroll container */
    var rootRect = rootElement
      ? rootElement.getBoundingClientRect()
      : { top: 0, height: window.innerHeight };

    /* Slight offset to avoid float issues */
    var topLine = rootRect.top + 80;

    var bestSection = null;
    var bestTop     = -Infinity;

    sections.forEach(function (section) {
      var rect = section.getBoundingClientRect();

      /* Section that crosses the top line */
      if (rect.top <= topLine && rect.bottom > topLine) {
        if (rect.top > bestTop) {
          bestTop     = rect.top;
          bestSection = section;
        }
      }
    });

    /* If nothing is crossing the top line (very top of page),
       fall back to the first visible section. */
    if (!bestSection) {
      var first      = sections[0];
      var firstRect  = first.getBoundingClientRect();

      if (firstRect.bottom > rootRect.top) {
        bestSection = first;
      } else {
        return;
      }
    }

    var unitId = bestSection.dataset.unit;
    var title  = bestSection.dataset.unitTitle;
    var chip   = bestSection.dataset.unitChip;

    setActiveUnit(unitId, title, chip);
  }

  /* Run once on load */
  updateActiveUnit();

  /* Attach scroll listener */
  if (scrollRoot === window) {
    window.addEventListener('scroll', updateActiveUnit);
  } else {
    scrollRoot.addEventListener('scroll', updateActiveUnit);
  }

  /* ==============================================
      SIDEBAR CLICK → SMOOTH SCROLL WITH OFFSET
  ============================================== */
  var SCROLL_OFFSET = 80;

  unitLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      var unitId = link.dataset.unit;
      var target = document.getElementById('unit-' + unitId);

      if (!target) {
        return;
      }

      var targetRect = target.getBoundingClientRect();

      if (scrollRoot === window) {
        /* Window is the scroll container */
        var currentY = window.pageYOffset || document.documentElement.scrollTop;
        var targetY  = currentY + targetRect.top - SCROLL_OFFSET;

        window.scrollTo({
          top: targetY,
          behavior: 'smooth'
        });
      } else {
        /* .main (or another element) is the scroll container */
        var rootRect = rootElement.getBoundingClientRect();
        var offsetInsideRoot = targetRect.top - rootRect.top;
        var targetYRoot      = scrollRoot.scrollTop + offsetInsideRoot - SCROLL_OFFSET;

        scrollRoot.scrollTo({
          top: targetYRoot,
          behavior: 'smooth'
        });
      }
    });
  });

});