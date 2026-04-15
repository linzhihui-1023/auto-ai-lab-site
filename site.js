const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
const navLinks = [...document.querySelectorAll(".nav a")];
const langButtons = [...document.querySelectorAll(".lang-btn")];
const videos = [...document.querySelectorAll("video")];
const pageKey = document.body.dataset.page || "";

videos.forEach((video) => {
  video.muted = true;
  video.volume = 0;
});

function initBannerSlider() {
  const banner = document.querySelector(".banner");
  if (!banner) return;

  const slides = [...banner.querySelectorAll(".banner-slide")];
  const dots = [...banner.querySelectorAll(".banner-dot")];
  const prevButton = banner.querySelector(".banner-control-prev");
  const nextButton = banner.querySelector(".banner-control-next");
  if (slides.length <= 1) return;

  let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
  let timer = null;

  const showSlide = (nextIndex) => {
    activeIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === activeIndex);
    });
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
      dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
    });
  };

  const startAutoPlay = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => showSlide(activeIndex + 1), 5200);
  };

  const moveTo = (nextIndex) => {
    showSlide(nextIndex);
    startAutoPlay();
  };

  prevButton?.addEventListener("click", () => moveTo(activeIndex - 1));
  nextButton?.addEventListener("click", () => moveTo(activeIndex + 1));
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => moveTo(index));
  });

  banner.addEventListener("mouseenter", () => window.clearInterval(timer));
  banner.addEventListener("mouseleave", startAutoPlay);
  showSlide(activeIndex);
  startAutoPlay();
}

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
  const i18nNodes = [...document.querySelectorAll("[data-zh][data-en]")];
  document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
  document.title = lang === "en" ? document.body.dataset.titleEn : document.body.dataset.titleZh;
  document.body.dataset.lang = lang === "en" ? "en" : "zh";

  i18nNodes.forEach((node) => {
    const value = node.dataset[lang];
    if (!value) return;
    if (value.includes("<")) {
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

  window.sessionStorage.setItem("site-lang", lang);
}

function normalizeText(value) {
  return (value || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function firstSentence(value, lang) {
  const text = normalizeText(value);
  if (!text) return "";
  const mark = lang === "en" ? "." : "。";
  const index = text.indexOf(mark);
  return index >= 0 ? text.slice(0, index + 1) : text;
}

function cleanSectionTitle(value) {
  return normalizeText(value).replace(/^\s*\d+[.．、]\s*/, "");
}

function numberedText(index, title, summary, lang) {
  const number = lang === "en" ? `(${index}) ` : `（${index}）`;
  const separator = lang === "en" ? ": " : "：";
  return `${number}${title}${separator}${summary}`;
}

async function fetchPageDocument(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`Cannot load ${path}`);
  const html = await response.text();
  return new DOMParser().parseFromString(html, "text/html");
}

function replaceList(target, items) {
  if (!target || items.length === 0) return;
  const list = target.querySelector(".research-list") || document.createElement("ul");
  list.className = "research-list";
  list.innerHTML = "";

  items.forEach((item) => {
    const li = document.createElement("li");
    li.dataset.zh = item.zh;
    li.dataset.en = item.en;
    li.textContent = item.zh;
    list.appendChild(li);
  });

  target.replaceChildren(list);
}

async function syncHomeResearch() {
  const target = document.querySelector('[data-home-sync="research"]');
  if (!target) return;
  const doc = await fetchPageDocument("research.html");
  const items = [...doc.querySelectorAll(".research-block")].map((block, index) => {
    const title = block.querySelector("h3");
    const summary = block.querySelector("p");
    const zhTitle = cleanSectionTitle(title?.dataset.zh || title?.textContent);
    const enTitle = cleanSectionTitle(title?.dataset.en || title?.textContent);
    const zhSummary = firstSentence(summary?.dataset.zh || summary?.innerHTML, "zh");
    const enSummary = firstSentence(summary?.dataset.en || summary?.innerHTML, "en");
    return {
      zh: numberedText(index + 1, zhTitle, zhSummary, "zh"),
      en: numberedText(index + 1, enTitle, enSummary, "en")
    };
  });
  replaceList(target, items);
}

async function syncHomeEquipment() {
  const target = document.querySelector('[data-home-sync="equipment"]');
  if (!target) return;
  const doc = await fetchPageDocument("equipment.html");
  const items = [...doc.querySelectorAll(".equipment-group")].map((group, index) => {
    const title = group.querySelector("h3");
    const meta = group.querySelector(".equipment-meta");
    const zhTitle = cleanSectionTitle(title?.dataset.zh || title?.textContent);
    const enTitle = cleanSectionTitle(title?.dataset.en || title?.textContent);
    const zhSummary = normalizeText(meta?.dataset.zh || meta?.textContent);
    const enSummary = normalizeText(meta?.dataset.en || meta?.textContent);
    return {
      zh: numberedText(index + 1, zhTitle, zhSummary, "zh"),
      en: numberedText(index + 1, enTitle, enSummary, "en")
    };
  });
  replaceList(target, items);
}

async function syncHomeActivities() {
  const target = document.querySelector('[data-home-sync="activities"]');
  if (!target) return;
  const doc = await fetchPageDocument("activities.html");
  const gallery = doc.querySelector(".activity-gallery");
  if (!gallery) return;
  target.replaceChildren(document.importNode(gallery, true));
}

async function syncHomeSections() {
  if (pageKey !== "home") return;
  try {
    await Promise.all([syncHomeResearch(), syncHomeEquipment(), syncHomeActivities()]);
    applyLanguage(document.body.dataset.lang || window.sessionStorage.getItem("site-lang") || "zh");
  } catch (error) {
    console.warn("Home section sync skipped:", error);
  }
}

langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyLanguage(button.dataset.lang);
  });
});

applyLanguage(window.sessionStorage.getItem("site-lang") || "zh");
initBannerSlider();
syncHomeSections();
