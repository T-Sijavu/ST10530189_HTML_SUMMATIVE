/* ==========================================================
   DRAW WEB - script.js
   Each feature lives in its own function, so you can read
   or remove them one at a time. They all start at the bottom.

   FEATURES
   1. Mobile menu
   2. Footer year
   3. Search + category filter
   4. Image preview (lightbox)
   5. Back-to-top button
   6. Scroll-in animation
   7. Random reference picker (home page)
   8. Practice timer (home page)
   9. Contact form validation
   ========================================================== */


/* ---------- 1. MOBILE MENU ---------- */
function setupMobileMenu() {
    const button = document.querySelector(".nav-toggle");
    const nav = document.querySelector("#site-nav");
    if (!button || !nav) return;

    button.addEventListener("click", function () {
        const isOpen = nav.classList.toggle("open");
        button.setAttribute("aria-expanded", isOpen);
    });
}


/* ---------- 2. FOOTER YEAR ---------- */
function setupFooterYear() {
    const year = document.querySelector("#year");
    if (year) year.textContent = new Date().getFullYear();
}


/* ---------- 3. SEARCH + CATEGORY FILTER ----------
   Works on any page that has:
     - <input id="search">                  (optional)
     - buttons with class "chip"            (optional, gallery only)
     - cards with class "ref-card"
   Each card holds its searchable words in data-search="..." */
function setupFilters() {
    const searchInput = document.querySelector("#search");
    const cards = document.querySelectorAll(".ref-card");
    if (!searchInput || cards.length === 0) return;

    const chips = document.querySelectorAll(".chip");
    const sections = document.querySelectorAll(".ref-section");
    const counter = document.querySelector("#result-count");
    const noResults = document.querySelector("#no-results");
    let activeCategory = "all";

    function applyFilters() {
        const words = searchInput.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
        let shown = 0;

        cards.forEach(function (card) {
            const text = card.dataset.search.toLowerCase();
            const category = card.dataset.category;

            const matchesSearch = words.every(function (w) { return text.includes(w); });
            const matchesCategory = activeCategory === "all" || category === activeCategory;
            const visible = matchesSearch && matchesCategory;

            card.hidden = !visible;
            if (visible) shown++;
        });

        // Hide section headings that have no visible images
        sections.forEach(function (section) {
            const anyVisible = section.querySelector(".ref-card:not([hidden])");
            section.classList.toggle("is-empty", !anyVisible);
        });

        if (counter) counter.textContent = "Showing " + shown + " of " + cards.length + " references";
        if (noResults) noResults.classList.toggle("show", shown === 0);
    }

    searchInput.addEventListener("input", applyFilters);

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            activeCategory = chip.dataset.filter;
            chips.forEach(function (c) { c.setAttribute("aria-pressed", c === chip); });
            applyFilters();
        });
    });

    // The "clear" button in the no-results box
    const clear = document.querySelector("#clear-filters");
    if (clear) {
        clear.addEventListener("click", function () {
            searchInput.value = "";
            activeCategory = "all";
            chips.forEach(function (c) { c.setAttribute("aria-pressed", c.dataset.filter === "all"); });
            applyFilters();
            searchInput.focus();
        });
    }

    applyFilters();
}


/* ---------- 4. IMAGE PREVIEW (LIGHTBOX) ----------
   Click a picture to see it big. Use the arrow keys to move
   between pictures and Esc to close. */
function setupLightbox() {
    const links = Array.from(document.querySelectorAll("[data-lightbox]"));
    if (links.length === 0) return;

    // Build the viewer once and add it to the page
    const box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Image preview");
    box.innerHTML =
        '<button class="lightbox-close" type="button" aria-label="Close preview">Close</button>' +
        '<figure class="lightbox-figure"><img alt=""><figcaption></figcaption></figure>' +
        '<div class="lightbox-controls">' +
            '<button type="button" data-action="prev">&larr; Previous</button>' +
            '<button type="button" data-action="colour">Show colour</button>' +
            '<button type="button" data-action="next">Next &rarr;</button>' +
        '</div>';
    document.body.appendChild(box);

    const bigImage = box.querySelector("img");
    const caption = box.querySelector("figcaption");
    const colourButton = box.querySelector('[data-action="colour"]');
    let current = 0;
    let lastFocused = null;

    // Only the pictures that are currently visible (not filtered out)
    function visibleLinks() {
        return links.filter(function (link) {
            const card = link.closest(".ref-card");
            return !card || !card.hidden;
        });
    }

    function show(list, index) {
        current = (index + list.length) % list.length;
        const link = list[current];
        bigImage.src = link.getAttribute("href");
        bigImage.alt = link.dataset.title || "";
        caption.textContent = (link.dataset.title || "") + "  (" + (current + 1) + " / " + list.length + ")";
        bigImage.classList.remove("in-colour");
        colourButton.textContent = "Show colour";
    }

    function open(link) {
        const list = visibleLinks();
        lastFocused = document.activeElement;
        show(list, list.indexOf(link));
        box.classList.add("open");
        document.body.style.overflow = "hidden";
        box.querySelector(".lightbox-close").focus();
    }

    function close() {
        box.classList.remove("open");
        document.body.style.overflow = "";
        if (lastFocused) lastFocused.focus();
    }

    links.forEach(function (link) {
        link.addEventListener("click", function (event) {
            event.preventDefault();      // stops the browser opening the raw image
            open(link);
        });
    });

    box.addEventListener("click", function (event) {
        const action = event.target.dataset.action;
        if (event.target === box || event.target.classList.contains("lightbox-close")) close();
        if (action === "prev") show(visibleLinks(), current - 1);
        if (action === "next") show(visibleLinks(), current + 1);
        if (action === "colour") {
            const on = bigImage.classList.toggle("in-colour");
            colourButton.textContent = on ? "Show black & white" : "Show colour";
        }
    });

    document.addEventListener("keydown", function (event) {
        if (!box.classList.contains("open")) return;
        if (event.key === "Escape") close();
        if (event.key === "ArrowLeft") show(visibleLinks(), current - 1);
        if (event.key === "ArrowRight") show(visibleLinks(), current + 1);
    });
}


/* ---------- 5. BACK-TO-TOP BUTTON ---------- */
function setupBackToTop() {
    const button = document.createElement("button");
    button.className = "to-top";
    button.type = "button";
    button.setAttribute("aria-label", "Back to top");
    button.innerHTML = "&uarr;";
    document.body.appendChild(button);

    window.addEventListener("scroll", function () {
        button.classList.toggle("show", window.scrollY > 500);
    });
    button.addEventListener("click", function () {
        window.scrollTo({ top: 0 });
    });
}


/* ---------- 6. SCROLL-IN ANIMATION ----------
   Anything with class="reveal" fades in when scrolled into view. */
function setupReveal() {
    const items = document.querySelectorAll(".reveal");
    if (items.length === 0) return;

    // Older browsers: just show everything
    if (!("IntersectionObserver" in window)) {
        items.forEach(function (item) { item.classList.add("is-visible"); });
        return;
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    items.forEach(function (item) { observer.observe(item); });
}


/* ---------- 7. RANDOM REFERENCE PICKER (home page) ----------
   The list below is filled in with your real images. To add a
   new image, add a line: { src: "ART/name.jpg", alt: "Description", page: "poses.html" } */
const REFERENCE_LIST = [
    {
        "src": "ART/pexels-daria-liudnaya-8187682.jpg",
        "alt": "Legs reference",
        "page": "anatomy.html"
    },
    {
        "src": "ART/pexels-kari-alfonso-2151442665-31692217.jpg",
        "alt": "Flex reference",
        "page": "anatomy.html"
    },
    {
        "src": "ART/pexels-kiran-more-1081549420-29886678.jpg",
        "alt": "Upper body reference",
        "page": "anatomy.html"
    },
    {
        "src": "ART/pexels-cottonbro-3778718.jpg",
        "alt": "Body reference",
        "page": "anatomy.html"
    },
    {
        "src": "ART/krystofos-eye-1227705_1920.jpg",
        "alt": "Eye reference",
        "page": "anatomy.html"
    },
    {
        "src": "ART/pexels-andrea-musto-135941147-31031558.jpg",
        "alt": "Back reference",
        "page": "anatomy.html"
    },
    {
        "src": "ART/pexels-ericka-sanchez-1098642631-36187418.jpg",
        "alt": "Stringed reference",
        "page": "poses.html"
    },
    {
        "src": "ART/pexels-lngdik23-16131310.jpg",
        "alt": "Calisthenic reference",
        "page": "poses.html"
    },
    {
        "src": "ART/saydung-man-5835659_1920.jpg",
        "alt": "Unique reference",
        "page": "poses.html"
    },
    {
        "src": "ART/pexels-rdne-7187989.jpg",
        "alt": "Kneeling reference",
        "page": "poses.html"
    },
    {
        "src": "ART/flutie8211-woman-10348886_1920.jpg",
        "alt": "Dressed reference",
        "page": "poses.html"
    },
    {
        "src": "ART/pexels-vika-glitter-392079-11937143.jpg",
        "alt": "Dual-dagger wielder reference",
        "page": "poses.html"
    },
    {
        "src": "ART/pexels-mahesh-mohan-1196552405-38848922.jpg",
        "alt": "Winged warrior reference",
        "page": "poses.html"
    },
    {
        "src": "ART/pexels-tima-miroshnichenko-5750951.jpg",
        "alt": "Block and hook reference",
        "page": "poses.html"
    },
    {
        "src": "ART/pexels-acres-of-film-698445032-34948662.jpg",
        "alt": "City reference",
        "page": "environments.html"
    },
    {
        "src": "ART/pexels-aksinfo7-36672638.jpg",
        "alt": "House reference",
        "page": "environments.html"
    },
    {
        "src": "ART/pexels-studioideahd-22626931.jpg",
        "alt": "POV reference",
        "page": "environments.html"
    },
    {
        "src": "ART/pexels-molnartamasphotography-29202983.jpg",
        "alt": "Trees and sky reference",
        "page": "environments.html"
    },
    {
        "src": "ART/pexels-ogproductionz-15824723.jpg",
        "alt": "Poolside reference",
        "page": "environments.html"
    },
    {
        "src": "ART/pexels-jozsef-mihalyi-432255798-15575235.jpg",
        "alt": "Waterfall reference",
        "page": "environments.html"
    },
    {
        "src": "ART/pexels-artyusufpatel-11785594.jpg",
        "alt": "Blue forest reference",
        "page": "environments.html"
    },
    {
        "src": "ART/pexels-mikhail-nilov-8431132.jpg",
        "alt": "Top view reference",
        "page": "environments.html"
    },
    {
        "src": "ART/pexels-alessandro-kelvin-1248577-2376272.jpg",
        "alt": "Mountains reference",
        "page": "environments.html"
    },
    {
        "src": "ART/pexels-gantas-3999536.jpg",
        "alt": "Phone reference",
        "page": "objects.html"
    },
    {
        "src": "ART/pexels-karola-g-7193706.jpg",
        "alt": "Chair reference",
        "page": "objects.html"
    },
    {
        "src": "ART/pexels-vladyslav-dukhin-38395555.jpg",
        "alt": "Table reference",
        "page": "objects.html"
    },
    {
        "src": "ART/pexels-adventurestudio-5794270.jpg",
        "alt": "Motorcycle reference",
        "page": "objects.html"
    },
    {
        "src": "ART/pexels-atahan-aksu-486635156-16775823.jpg",
        "alt": "Car reference",
        "page": "objects.html"
    },
    {
        "src": "ART/pexels-rdne-7978129.jpg",
        "alt": "Fantasy book and wand reference",
        "page": "objects.html"
    },
    {
        "src": "ART/pexels-irrabagon-37259385.jpg",
        "alt": "Fantasy shield reference",
        "page": "objects.html"
    },
    {
        "src": "ART/pexels-adanvdo-42038771-8079829.jpg",
        "alt": "Shoes reference",
        "page": "objects.html"
    },
    {
        "src": "ART/pexels-introspectivedsgn-9104768.jpg",
        "alt": "Backpack reference",
        "page": "objects.html"
    }
];

function setupRandomReference() {
    const button = document.querySelector("#random-button");
    const output = document.querySelector("#random-output");
    if (!button || !output) return;

    let lastIndex = -1;

    button.addEventListener("click", function () {
        // Pick a random image, but never the same one twice in a row
        let index;
        do { index = Math.floor(Math.random() * REFERENCE_LIST.length); }
        while (index === lastIndex && REFERENCE_LIST.length > 1);
        lastIndex = index;

        const item = REFERENCE_LIST[index];
        output.innerHTML =
            '<a href="' + item.page + '"><img src="' + item.src + '" alt="' + item.alt + '"></a>' +
            "<p>" + item.alt + ' &mdash; <a href="' + item.page + '">see the full collection</a></p>';
        button.textContent = "Another one";
    });
}


/* ---------- 8. PRACTICE TIMER (home page) ---------- */
function setupTimer() {
    const display = document.querySelector("#timer-display");
    if (!display) return;

    const choices = document.querySelectorAll(".timer-choices .chip");
    const startButton = document.querySelector("#timer-start");
    const resetButton = document.querySelector("#timer-reset");

    let totalSeconds = 60;
    let remaining = totalSeconds;
    let intervalId = null;

    function draw() {
        const m = String(Math.floor(remaining / 60)).padStart(2, "0");
        const s = String(remaining % 60).padStart(2, "0");
        display.textContent = m + ":" + s;
    }

    function stop() {
        clearInterval(intervalId);
        intervalId = null;
        startButton.textContent = "Start";
    }

    function reset() {
        stop();
        remaining = totalSeconds;
        display.classList.remove("done");
        draw();
    }

    startButton.addEventListener("click", function () {
        if (intervalId) { stop(); startButton.textContent = "Resume"; return; }
        if (remaining === 0) reset();

        startButton.textContent = "Pause";
        intervalId = setInterval(function () {
            remaining--;
            draw();
            if (remaining <= 0) {
                stop();
                display.classList.add("done");
                display.setAttribute("aria-label", "Time is up");
            }
        }, 1000);
    });

    resetButton.addEventListener("click", reset);

    choices.forEach(function (choice) {
        choice.addEventListener("click", function () {
            totalSeconds = Number(choice.dataset.seconds);
            choices.forEach(function (c) { c.setAttribute("aria-pressed", c === choice); });
            reset();
        });
    });

    draw();
}


/* ---------- 9. CONTACT FORM VALIDATION ----------
   Checks each field and shows a friendly message under it.
   NOTE: this page has no server, so a valid form shows a
   success message but does not really send an email.
   See README.txt for how to connect it to a real service. */
function setupContactForm() {
    const form = document.querySelector("#contact-form");
    if (!form) return;

    const success = document.querySelector("#form-success");
    const messageBox = form.elements["message"];
    const counter = document.querySelector("#char-count");
    const MAX_MESSAGE = 1000;

    // One rule per field: returns an error message, or "" if the field is fine
    const rules = {
        name: function (value) {
            if (value.trim().length < 2) return "Please enter your name (at least 2 letters).";
            return "";
        },
        email: function (value) {
            const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            if (value.trim() === "") return "Please enter your email address.";
            if (!pattern.test(value.trim())) return "That email looks incomplete. Try something like name@example.com.";
            return "";
        },
        subject: function (value) {
            if (value === "") return "Please choose what your message is about.";
            return "";
        },
        message: function (value) {
            const length = value.trim().length;
            if (length < 10) return "Please write at least 10 characters so we can help.";
            if (length > MAX_MESSAGE) return "Please keep your message under " + MAX_MESSAGE + " characters.";
            return "";
        }
    };

    function validateField(field) {
        const rule = rules[field.name];
        if (!rule) return true;

        const error = rule(field.value);
        const wrapper = field.closest(".form-field");
        wrapper.classList.toggle("has-error", error !== "");
        wrapper.querySelector(".error-message").textContent = error;
        field.setAttribute("aria-invalid", error !== "");
        return error === "";
    }

    // Check a field when the person leaves it, and re-check while fixing it
    Array.from(form.elements).forEach(function (field) {
        if (!rules[field.name]) return;
        field.addEventListener("blur", function () { validateField(field); });
        field.addEventListener("input", function () {
            if (field.closest(".form-field").classList.contains("has-error")) validateField(field);
        });
    });

    // Live character counter
    messageBox.addEventListener("input", function () {
        counter.textContent = messageBox.value.length + " / " + MAX_MESSAGE;
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        // Spam trap: real people never fill in the hidden field
        if (form.elements["website"].value !== "") return;

        let firstBad = null;
        Object.keys(rules).forEach(function (name) {
            const field = form.elements[name];
            if (!validateField(field) && !firstBad) firstBad = field;
        });

        if (firstBad) { firstBad.focus(); return; }

        // All good. A real website would send the data to a server here.
        const name = form.elements["name"].value.trim();
        document.querySelector("#success-name").textContent = name;
        form.reset();
        counter.textContent = "0 / " + MAX_MESSAGE;
        form.hidden = true;
        success.classList.add("show");
        success.focus();
    });

    const again = document.querySelector("#send-another");
    if (again) {
        again.addEventListener("click", function () {
            success.classList.remove("show");
            form.hidden = false;
            form.elements["name"].focus();
        });
    }
}


/* ---------- START EVERYTHING ---------- */
document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupFooterYear();
    setupFilters();
    setupLightbox();
    setupBackToTop();
    setupReveal();
    setupRandomReference();
    setupTimer();
    setupContactForm();
});
