/**
 * Easy selector helper function
 */
const select = (el, all = false) => {
  el = el.trim();
  if (all) {
    return [...document.querySelectorAll(el)];
  }
  return document.querySelector(el);
};

/**
 * Easy event listener function
 */
const on = (type, el, listener, all = false) => {
  const selectEl = select(el, all);
  if (selectEl) {
    if (all && Array.isArray(selectEl)) {
      selectEl.forEach((e) => e.addEventListener(type, listener));
    } else if (selectEl instanceof Element) {
      selectEl.addEventListener(type, listener);
    }
  }
};

/**
 * Easy on scroll event listener
 */
const onscroll = (el, listener) => {
  el.addEventListener("scroll", listener);
};

/**
 * Navbar links active state on scroll
 */
const navbarlinks = select("#navbar .scrollto", true);
const navbarlinksActive = () => {
  const position = window.scrollY + 200;
  navbarlinks?.forEach((navbarlink) => {
    if (!navbarlink.hash) { return; }
    const section = select(navbarlink.hash);
    if (!section) { return; }
    if (position >= section.offsetTop && position <= section.offsetTop + section.offsetHeight) {
      navbarlink.classList.add("active");
    } else {
      navbarlink.classList.remove("active");
    }
  });
};

/**
 * Scrolls to an element with header offset
 */
const scrollto = (el) => {
  const header = select("#header");
  if (!header) return;

  let offset = header.offsetHeight;
  if (!header.classList.contains("header-scrolled")) {
    offset -= 16;
  }

  const targetEl = select(el);
  if (!targetEl) return;

  const elementPos = targetEl.offsetTop;
  window.scrollTo({
    top: elementPos - offset,
    behavior: "smooth"
  });
};

/**
 * Toggle .header-scrolled class to #header when page is scrolled
 */
const selectHeader = select("#header");
const headerScrolled = () => {
  if (!selectHeader) return;
  if (window.scrollY > 100) {
    selectHeader.classList.add("header-scrolled");
  } else {
    selectHeader.classList.remove("header-scrolled");
  }
};

/**
 * Back to top button
 */
const backtotop = select(".back-to-top");
const toggleBacktotop = () => {
  if (!backtotop) return;
  if (window.scrollY > 100) {
    backtotop.classList.add("active");
  } else {
    backtotop.classList.remove("active");
  }
};

/**
 * Initialize on DOM ready
 */
document.addEventListener("DOMContentLoaded", () => {
  // Header scroll
  if (selectHeader) {
    headerScrolled();
    onscroll(document, headerScrolled);
  }

  // Back to top
  if (backtotop) {
    toggleBacktotop();
    onscroll(document, toggleBacktotop);
  }

  // Navbar active state
  if (navbarlinks?.length) {
    navbarlinksActive();
    onscroll(document, navbarlinksActive);
  }

  // Mobile nav toggle
  on("click", ".mobile-nav-toggle", function() {
    const navbar = select("#navbar");
    navbar?.classList.toggle("navbar-mobile");
    this.classList.toggle("bi-list");
    this.classList.toggle("bi-x");
  });

  on("click", ".mobile-sub-nav-toggle", function() {
    const subNavbar = select("#sub-navbar");
    subNavbar?.classList.toggle("sub-navbar-mobile");
    this.classList.toggle("bi-list");
    this.classList.toggle("bi-x");
  });

  // Mobile nav dropdowns activate
  on("click", ".navbar .dropdown > a", function(e) {
    const navbar = select("#navbar");
    if (navbar?.classList.contains("navbar-mobile")) {
      e.preventDefault();
      this.nextElementSibling?.classList.toggle("dropdown-active");
    }
  }, true);

  // Scroll with offset on links with a class name .scrollto
  on("click", ".scrollto", function(e) {
    if (select(this.hash)) {
      e.preventDefault();

      const navbar = select("#navbar");
      if (navbar?.classList.contains("navbar-mobile")) {
        navbar.classList.remove("navbar-mobile");
        const navbarToggle = select(".mobile-nav-toggle");
        navbarToggle?.classList.toggle("bi-list");
        navbarToggle?.classList.toggle("bi-x");
      }
      scrollto(this.hash);
    }
  }, true);

  // Scroll with offset on page load with hash links in the url
  if (window.location.hash) {
    if (select(window.location.hash)) {
      scrollto(window.location.hash);
    }
  }

  // Animation on scroll
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      mirror: false
    });
  }
});
