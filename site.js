const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
const navLinks = [...document.querySelectorAll(".nav a")];
const langButtons = [...document.querySelectorAll(".lang-btn")];
const i18nNodes = [...document.querySelectorAll("[data-zh][data-en]")];
const pageKey = document.body.dataset.page || "";

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    if (link.dataset.pageTarget === pageKey) {
      link.classList.add("active");
    }

    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function applyLanguage(lang) {
  document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
  document.title = lang === "en" ? document.body.dataset.titleEn : document.body.dataset.titleZh;
  document.body.dataset.lang = lang === "en" ? "en" : "zh";

  i18nNodes.forEach((node) => {
    const value = node.dataset[lang];
    if (!value) return;
    if (value.includes("<br>")) {
      node.innerHTML = value;
    } else {
      node.textContent = value;
    }
  });

  langButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });

  if (menuToggle) {
    menuToggle.setAttribute("aria-label", lang === "en" ? "Open navigation menu" : "打开导航菜单");
    menuToggle.textContent = lang === "en" ? "Menu" : "菜单";
  }

  window.localStorage.setItem("site-lang", lang);
}

langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyLanguage(button.dataset.lang);
  });
});

applyLanguage(window.localStorage.getItem("site-lang") || "zh");
