// # EXERCISE RESULTS + UNIT PROGRESS #
// Uses localStorage.Results to show per-exercise badges
// and compute average unit progress for each unit-section.

(function (window, document) {
  'use strict';

  // ---------- Safe localStorage check ----------
  var hasStorage = false;
  try {
    var _test = '__genki_test__';
    window.localStorage.setItem(_test, _test);
    window.localStorage.removeItem(_test);
    hasStorage = true;
  } catch (e) {
    hasStorage = false;
  }

  if (!hasStorage || !window.localStorage.Results) {
    return; // nothing to do
  }

  // ---------- Parse stored results ----------
  var allResults;
  try {
    allResults = JSON.parse(window.localStorage.Results);
  } catch (e) {
    return;
  }

  // Same edition logic as the original code
  var edition = /lessons-3rd/.test(window.location.pathname) ? '3rd' : '2nd';
  var exResults = allResults && allResults[edition];

  if (!exResults) {
    return;
  }

  // ---------- Helpers ----------
  function scoreClass(score) {
    if (score === 100) { return 'perfect'; }
    if (score >= 70)   { return 'good'; }
    if (score >= 50)   { return 'average'; }
    return 'low';
  }

  function scoreIcon(score) {
    // Font Awesome-like codepoints, same as the original script
    if (score === 100) { return '⭐'; } // star
    if (score >= 70)   { return '✅'; } // check
    if (score >= 50)   { return '🔷'; } // circle
    return '❌';                         // times
  }

  // ---------- Attach per-lesson badges and store score on nodes ----------
  Object.keys(exResults).forEach(function (key) {
    var score = exResults[key];

    // Match lesson nodes by their onclick href
    // e.g. onclick="location.href='lesson-1/grammar-1/index.html'"
    var nodes = document.querySelectorAll(
      '.lesson-node[onclick*="' + key + '"]'
    );

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];

      // Mark the node with its score for unit progress calculation later
      node.dataset.score = String(score);

      // Find the .lesson-group container
      var group = node.closest('.lesson-group');
      if (!group) { continue; }

      // Prefer adding badge next to the visible text label
      var label = group.querySelector('.lesson-label');
      var container = label || group;

      // Avoid duplicates if script is executed twice
      if (container.querySelector('.exercise-results[data-exercise="' + key + '"]')) {
        continue;
      }

      var span = document.createElement('span');
      span.className = 'exercise-results result--' + scoreClass(score);
      span.dataset.exercise = key;
      span.title = (window.GenkiLang === 'ja'
        ? 'テストの得点'
        : 'Exercise score');

      span.innerHTML =
        '<i class="fa">' + scoreIcon(score) + '</i> ' + score + '%';

      container.insertAdjacentText('beforeend', ' ');
      container.appendChild(span);
    }
  });

  // ---------- Compute unit progress ----------
  function updateUnitProgress() {
    var units = document.querySelectorAll('.unit-section');

    for (var u = 0; u < units.length; u++) {
      var unit = units[u];

      // All lesson-node items in this unit
      var lessonNodes = unit.querySelectorAll('.lesson-node');
      var lessonCount = lessonNodes.length;

      if (!lessonCount) {
        continue;
      }

      var totalScore = 0;

      for (var i = 0; i < lessonNodes.length; i++) {
        var node = lessonNodes[i];
        var val = parseFloat(node.dataset.score || '0'); // lessons without scores = 0%
        if (isNaN(val)) {
          val = 0;
        }
        totalScore += val;
      }

      // Average over ALL lessons in the unit (including 0% for missing scores)
      var avg = Math.round(totalScore / lessonCount);
      if (avg < 0)   { avg = 0; }
      if (avg > 100) { avg = 100; }

      // Update the pill text (the second span inside .progress-pill)
      var pillPercentSpan = unit.querySelector('.progress-pill span:last-child');
      if (pillPercentSpan) {
        pillPercentSpan.textContent = avg + '%';
      }

      // Update the progress bar fill width
      var barFill = unit.querySelector('.progress-bar .progress-bar-fill');
      if (barFill) {
        barFill.style.width = avg + '%';
      }
    }
  }

  updateUnitProgress();

})(window, document);