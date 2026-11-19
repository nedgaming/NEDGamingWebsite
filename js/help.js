// Help Center: live search over questions and answers, and deep links to a question.
(function () {
    'use strict';

    var input = document.querySelector('[data-help-search]');
    var cats = document.querySelectorAll('[data-cat]');
    var empty = document.querySelector('[data-help-empty]');

    function normalise(s) {
        return s.toLowerCase().replace(/[’']/g, '').replace(/\s+/g, ' ').trim();
    }

    // Pre-compute the searchable text of each question.
    var items = [];
    cats.forEach(function (cat) {
        cat.querySelectorAll('.qa').forEach(function (qa) {
            items.push({ el: qa, cat: cat, text: normalise(qa.textContent) });
        });
    });

    function filter() {
        var words = normalise(input.value).split(' ').filter(Boolean);
        var anyShown = false;
        items.forEach(function (it) {
            var match = words.every(function (w) { return it.text.indexOf(w) !== -1; });
            it.el.hidden = !match;
            if (match) anyShown = true;
        });
        cats.forEach(function (cat) {
            cat.hidden = !cat.querySelector('.qa:not([hidden])');
        });
        empty.hidden = anyShown;
    }

    if (input) {
        input.addEventListener('input', filter);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                input.value = '';
                filter();
            }
        });
    }

    // Open the question named in the URL (help.html#delete-account) and keep the
    // URL in sync as questions are opened, so any answer can be shared.
    function openFromHash() {
        var id = decodeURIComponent(location.hash.slice(1));
        if (!id) return;
        var qa = document.getElementById(id);
        if (qa && qa.tagName === 'DETAILS') {
            qa.open = true;
            qa.scrollIntoView({ block: 'center' });
        }
    }
    openFromHash();
    window.addEventListener('hashchange', openFromHash);

    document.querySelectorAll('.qa').forEach(function (qa) {
        qa.addEventListener('toggle', function () {
            if (qa.open && history.replaceState) {
                history.replaceState(null, '', '#' + qa.id);
            }
        });
    });
})();
