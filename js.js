const themeToggle = document.getElementById("themeToggle");
const navbar = document.querySelector(".navbar");
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");
const navPill = document.querySelector(".nav-pill");
const themeIcon = themeToggle?.querySelector("i");

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const savedTheme = localStorage.getItem("portfolio-theme");

if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
  document.body.classList.add("dark");
  updateThemeIcon(true);
}

function updateThemeIcon(isDark) {
  if (!themeIcon) return;

  themeIcon.classList.toggle("fa-sun", !isDark);
  themeIcon.classList.toggle("fa-moon", isDark);
}

function movePill(activeLink) {
  if (!navPill || !activeLink) return;

  navPill.style.width = `${activeLink.offsetWidth}px`;
  navPill.style.left = `${activeLink.offsetLeft}px`;
}

function setActiveLink(sectionId) {
  navLinks.forEach(link => {
    const isActive = link.getAttribute("href") === `#${sectionId}`;
    link.classList.toggle("active", isActive);

    if (isActive) movePill(link);
  });
}

function updateNavbarState() {
  navbar?.classList.toggle("scrolled", window.scrollY > 10);
}

window.addEventListener("load", () => {
  const activeLink = document.querySelector(".nav-links a.active") || navLinks[0];
  movePill(activeLink);
  updateNavbarState();
});

window.addEventListener("resize", () => {
  const activeLink = document.querySelector(".nav-links a.active") || navLinks[0];
  movePill(activeLink);
});

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    const sectionId = link.getAttribute("href")?.replace("#", "");
    if (sectionId) setActiveLink(sectionId);
  });
});

themeToggle?.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");

  localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
  updateThemeIcon(isDark);
  requestAnimationFrame(() => {
    const activeLink = document.querySelector(".nav-links a.active") || navLinks[0];
    movePill(activeLink);
  });
});

/* Navbar blur */
window.addEventListener("scroll", updateNavbarState, { passive: true });

/* Scroll active section */
const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  },
  {
    root: null,
    rootMargin: "-45% 0px -45% 0px",
    threshold: 0
  }
);

sections.forEach(section => sectionObserver.observe(section));

/* Reveal animations */
const revealTargets = document.querySelectorAll(".reveal-up, .reveal-split");

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle("show", entry.isIntersecting);
    });
  },
  {
    threshold: 0.18
  }
);

revealTargets.forEach(target => revealObserver.observe(target));

/* Contact form demo behavior */
const contactForm = document.querySelector(".message-card form");

contactForm?.addEventListener("submit", event => {
  event.preventDefault();

  const button = contactForm.querySelector(".contact-btn");
  if (!button) return;

  const originalText = button.textContent;
  button.textContent = "Message Ready ✓";

  setTimeout(() => {
    button.textContent = originalText;
    contactForm.reset();
  }, 1600);
});
