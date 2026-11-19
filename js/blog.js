// Blog index: filter posts by topic.
(function () {
    'use strict';

    var buttons = document.querySelectorAll('[data-filters] [data-filter]');
    var posts = document.querySelectorAll('[data-posts] [data-cat]');
    var empty = document.querySelector('[data-posts-empty]');

    function apply(topic) {
        var shown = 0;
        posts.forEach(function (post) {
            var match = topic === 'all' || post.getAttribute('data-cat') === topic;
            post.hidden = !match;
            if (match) {
                shown++;
                // Posts revealed by scrolling should be visible straight away when filtered in.
                post.classList.add('is-visible');
            }
        });
        empty.hidden = shown > 0;
        buttons.forEach(function (b) {
            var on = b.getAttribute('data-filter') === topic;
            b.classList.toggle('is-active', on);
            b.setAttribute('aria-pressed', String(on));
        });
    }

    buttons.forEach(function (b) {
        b.addEventListener('click', function () { apply(b.getAttribute('data-filter')); });
    });
})();
