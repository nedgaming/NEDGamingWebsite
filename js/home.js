// Senchou homepage interactions. No dependencies.
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hasIO = 'IntersectionObserver' in window;

    /* ---------- Nav: mobile menu ---------- */
    var nav = document.querySelector('[data-nav]');
    var toggle = document.querySelector('[data-nav-toggle]');

    function setMenu(open) {
        nav.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
    }
    toggle.addEventListener('click', function () {
        setMenu(!nav.classList.contains('is-open'));
    });
    nav.querySelectorAll('.nav__menu a').forEach(function (a) {
        a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setMenu(false);
    });

    /* ---------- Scroll-driven bits: dark nav, stage bar, hero parallax ---------- */
    var darkSections = document.querySelectorAll('[data-dark]');
    var stagebar = document.querySelector('[data-stagebar]');
    var footer = document.querySelector('.footer');
    var heroPhone = document.querySelector('[data-parallax]');
    var ticking = false;

    function update() {
        ticking = false;
        var navY = 40;
        var onDark = false;
        darkSections.forEach(function (s) {
            var r = s.getBoundingClientRect();
            if (r.top <= navY && r.bottom >= navY) onDark = true;
        });
        nav.classList.toggle('is-dark', onDark);
        nav.classList.toggle('is-pill', window.scrollY > 40);

        if (stagebar && footer) {
            var footerTop = footer.getBoundingClientRect().top;
            stagebar.classList.toggle('is-visible', window.scrollY > 240 && footerTop > window.innerHeight - 40);
        }

        if (heroPhone && !reduceMotion) {
            var y = Math.min(window.scrollY, 800);
            heroPhone.style.transform = 'translateY(' + (-y * 0.12) + 'px)';
        }
    }
    function onScroll() {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    /* ---------- Reveal on scroll ---------- */
    var revealEls = document.querySelectorAll('[data-reveal]');
    if (!hasIO || reduceMotion) {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
        var revealIO = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealIO.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
        revealEls.forEach(function (el) { revealIO.observe(el); });
    }

    /* ---------- Stage: swap screen, caption, card and glow per step ---------- */
    var stage = document.querySelector('[data-stage]');
    var tabs = document.querySelectorAll('[data-tab]');

    function setTab(chapter) {
        tabs.forEach(function (tab) {
            var on = tab.getAttribute('data-tab') === chapter;
            tab.classList.toggle('is-active', on);
            if (on) tab.setAttribute('aria-current', 'step');
            else tab.removeAttribute('aria-current');
        });
    }

    function setStep(i) {
        stage.querySelectorAll('[data-screen]').forEach(function (el) {
            el.classList.toggle('is-active', el.getAttribute('data-screen') === i);
        });
        stage.querySelectorAll('[data-caption]').forEach(function (el) {
            el.classList.toggle('is-active', el.getAttribute('data-caption') === i);
        });
        stage.querySelectorAll('[data-card]').forEach(function (el) {
            el.classList.toggle('is-active', el.getAttribute('data-card') === i);
        });
        stage.querySelectorAll('[data-glow]').forEach(function (el) {
            el.classList.toggle('is-active', el.getAttribute('data-glow') === i);
        });
    }
    if (stage) setStep('0');

    if (stage && hasIO) {
        // A step is active while its marker crosses the middle of the viewport.
        var stepIO = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                if (el.hasAttribute('data-step')) {
                    setStep(el.getAttribute('data-step'));
                    setTab(el.getAttribute('data-chapter'));
                } else if (el.id === 'download') {
                    setTab('download');
                } else {
                    setTab(null);
                }
            });
        }, { rootMargin: '-50% 0px -50% 0px' });
        stage.querySelectorAll('[data-step]').forEach(function (m) { stepIO.observe(m); });
        // Clear or switch the active tab outside the stage.
        var download = document.getElementById('download');
        if (download) stepIO.observe(download);
        document.querySelectorAll('.hero, .stage > .container, main > .section').forEach(function (s) {
            stepIO.observe(s);
        });
    }

    /* ---------- Split-flap board ---------- */
    var flaps = document.querySelectorAll('[data-flap]');
    var GLYPHS = '0123456789K+';

    function buildFlap(el) {
        var text = el.getAttribute('data-flap');
        el.textContent = '';
        return text.split('').map(function (ch) {
            var tile = document.createElement('span');
            tile.className = 'flap__tile';
            tile.setAttribute('aria-hidden', 'true');
            tile.textContent = reduceMotion ? ch : ' ';
            tile.dataset.target = ch;
            el.appendChild(tile);
            return tile;
        });
    }

    function runFlap(tiles) {
        tiles.forEach(function (tile, i) {
            var spins = 8 + i * 4; // later tiles settle later, like a departures board
            var n = 0;
            var timer = setInterval(function () {
                n++;
                tile.classList.remove('is-flipping');
                void tile.offsetWidth; // restart the flip animation
                tile.classList.add('is-flipping');
                if (n >= spins) {
                    tile.textContent = tile.dataset.target;
                    clearInterval(timer);
                } else {
                    tile.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                }
            }, 70);
        });
    }

    if (flaps.length) {
        var boards = Array.prototype.map.call(flaps, function (el) { return { el: el, tiles: buildFlap(el) }; });
        if (!reduceMotion && hasIO) {
            var board = document.querySelector('.board');
            var flapIO = new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting) {
                    boards.forEach(function (b, k) {
                        setTimeout(function () { runFlap(b.tiles); }, k * 180);
                    });
                    flapIO.disconnect();
                }
            }, { threshold: 0.5 });
            flapIO.observe(board);
        } else {
            boards.forEach(function (b) {
                b.tiles.forEach(function (t) { t.textContent = t.dataset.target; });
            });
        }
    }

    /* ---------- Live score bar: tick the score up when it comes into view ---------- */
    document.querySelectorAll('[data-tick]').forEach(function (el) {
        var steps = el.getAttribute('data-tick').split(',');
        if (reduceMotion || !hasIO) return;
        el.textContent = steps[0];
        var io = new IntersectionObserver(function (entries) {
            if (!entries[0].isIntersecting) return;
            io.disconnect();
            steps.slice(1).forEach(function (v, i) {
                setTimeout(function () {
                    el.textContent = v;
                    el.classList.remove('is-bump');
                    void el.offsetWidth;
                    el.classList.add('is-bump');
                }, 900 * (i + 1));
            });
        }, { threshold: 0.8 });
        io.observe(el);
    });

    /* ---------- Player card: tilt towards the pointer ---------- */
    var canHover = window.matchMedia('(hover: hover)').matches;
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
        if (reduceMotion || !canHover) return;
        var zone = card.closest('.card') || card;
        zone.addEventListener('pointermove', function (e) {
            var r = card.getBoundingClientRect();
            var x = (e.clientX - (r.left + r.width / 2)) / r.width;
            var y = (e.clientY - (r.top + r.height / 2)) / r.height;
            card.style.setProperty('--ry', (x * 22).toFixed(1) + 'deg');
            card.style.setProperty('--rx', (-y * 16).toFixed(1) + 'deg');
        });
        zone.addEventListener('pointerleave', function () {
            card.style.removeProperty('--ry');
            card.style.removeProperty('--rx');
        });
    });

    /* ---------- YouTube facade: load the player only on click ---------- */
    document.querySelectorAll('[data-video]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var wrap = document.createElement('div');
            wrap.className = 'video-embed';
            var iframe = document.createElement('iframe');
            iframe.src = 'https://www.youtube-nocookie.com/embed/' + btn.getAttribute('data-video') + '?autoplay=1&rel=0';
            iframe.title = 'Founders talk about Senchou';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            iframe.allowFullscreen = true;
            wrap.appendChild(iframe);
            btn.replaceWith(wrap);
        });
    });
})();
