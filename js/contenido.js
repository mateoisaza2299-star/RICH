import {
  negocio,
  direccionLinea,
  enlaceMapa,
  enlaceEmbed,
  textoCinta,
  codigoPais,
  textoHorario,
  estadoApertura,
  usuarioInstagram
} from "./config.js";

const file = (location.pathname || "").split("/").pop() || "index.html";
const pageKey = !file || file === "index.html" ? "index" : file.replace(/\.html$/, "");

const seo = {
  index: {
    title: negocio.nombre + " · Barbería en " + negocio.direccion.ciudad,
    description: negocio.nombre + ": barbería con identidad propia en " + negocio.direccion.ciudad + ", " + negocio.direccion.departamento + ". Mira el local, síguenos en Instagram y encuentra cómo llegar."
  },
  "404": {
    title: "Página no encontrada — " + negocio.nombre,
    description: "Esta página no existe. Vuelve al inicio de " + negocio.nombre + "."
  }
};

const setMeta = (selector, value) => {
  document.querySelectorAll(selector).forEach((node) => node.setAttribute("content", value));
};

const applySeo = () => {
  const entry = seo[pageKey];
  if (!entry) return;
  document.title = entry.title;
  setMeta('meta[name="description"]', entry.description);
  setMeta('meta[property="og:title"]', entry.title);
  setMeta('meta[property="og:description"]', entry.description);
  setMeta('meta[name="twitter:title"]', entry.title);
  setMeta('meta[name="twitter:description"]', entry.description);
  setMeta('meta[property="og:site_name"]', negocio.nombre);
};

const applyCinta = () => {
  const text = textoCinta();
  if (text) document.documentElement.style.removeProperty("--cinta");
  else document.documentElement.style.setProperty("--cinta", "0px");
  document.querySelectorAll("[data-cinta]").forEach((node) => {
    node.textContent = text;
    node.hidden = !text;
  });
};

const applyDireccion = () => {
  const linea = direccionLinea();
  document.querySelectorAll("[data-direccion]").forEach((node) => {
    node.textContent = linea;
  });
  document.querySelectorAll("[data-nombre]").forEach((node) => {
    node.textContent = negocio.nombre;
  });
};

const applyHorario = () => {
  document.querySelectorAll("[data-horario]").forEach((list) => {
    list.replaceChildren();
    negocio.horario.forEach((regla) => {
      const item = document.createElement("li");
      const name = document.createElement("span");
      name.textContent = regla.etiqueta;
      const time = document.createElement("span");
      time.textContent = textoHorario(regla);
      item.append(name, time);
      list.appendChild(item);
    });
  });
  const estado = estadoApertura();
  document.querySelectorAll("[data-open-status]").forEach((node) => {
    node.classList.toggle("is-open", !!estado.abierto);
    node.classList.toggle("is-closed", estado.abierto === false && !estado.pendiente);
    const label = node.querySelector("[data-open-label]");
    if (label) label.textContent = estado.texto;
  });
};

const applyLinks = () => {
  document.querySelectorAll("[data-maps]").forEach((link) => {
    link.href = enlaceMapa();
  });
  const href = String(negocio.redes.instagram || "").trim();
  const usuario = usuarioInstagram();
  document.querySelectorAll("[data-red='instagram']").forEach((link) => {
    const item = link.closest("li") || link;
    if (!/^https?:\/\//i.test(href) || !usuario) {
      item.hidden = true;
      return;
    }
    link.href = href;
    const handle = "@" + usuario;
    [...link.childNodes].forEach((node) => {
      if (node.nodeType === 3 && node.textContent.trim()) node.textContent = " " + handle;
    });
    if (link.hasAttribute("aria-label")) link.setAttribute("aria-label", "Instagram " + handle);
    item.hidden = false;
  });
};

const applyWhatsapp = () => {
  const numero = String(negocio.whatsapp || "").replace(/\D/g, "");
  document.querySelectorAll("[data-whatsapp-mount]").forEach((node) => {
    node.replaceChildren();
    if (!numero) return;
    const link = document.createElement("a");
    link.className = node.getAttribute("data-whatsapp-class") || "btn";
    link.href = "https://wa.me/" + numero;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "WhatsApp";
    node.appendChild(link);
  });
};

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const applySchema = () => {
  const node = document.getElementById("schema-negocio");
  if (!node) return;
  const hours = negocio.horario.filter((regla) => !regla.cerrado && regla.abre && regla.cierra).map((regla) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: regla.dias.map((dia) => dayNames[dia === 0 ? 6 : dia - 1]),
    opens: regla.abre,
    closes: regla.cierra
  }));
  const folder = location.origin + (location.pathname || "/").replace(/[^/]*$/, "");
  const data = {
    "@context": "https://schema.org",
    "@type": ["HairSalon", "BarberShop"],
    name: negocio.nombre,
    image: folder + "assets/fotos/fachada.jpg",
    url: location.origin + location.pathname,
    address: {
      "@type": "PostalAddress",
      streetAddress: negocio.direccion.calle,
      addressLocality: negocio.direccion.ciudad,
      addressRegion: negocio.direccion.departamento,
      addressCountry: codigoPais()
    },
    hasMap: enlaceMapa()
  };
  if (hours.length) data.openingHoursSpecification = hours;
  const instagram = String(negocio.redes.instagram || "");
  if (/^https?:\/\//i.test(instagram)) data.sameAs = [instagram];
  if (String(negocio.email || "").includes("@")) data.email = negocio.email;
  const numero = String(negocio.whatsapp || "").replace(/\D/g, "");
  if (numero) data.telephone = "+" + numero;
  node.textContent = JSON.stringify(data);
};

const applyMap = () => {
  const frame = document.querySelector("[data-map]");
  if (!frame || frame.querySelector("iframe")) return;
  const load = () => {
    if (frame.querySelector("iframe")) return;
    const iframe = document.createElement("iframe");
    iframe.title = "Mapa de " + negocio.nombre + " en " + negocio.direccion.ciudad;
    iframe.src = enlaceEmbed();
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.width = "600";
    iframe.height = "450";
    const note = frame.querySelector("[data-map-fallback]");
    if (note) note.hidden = true;
    frame.appendChild(iframe);
  };
  if (!("IntersectionObserver" in window)) {
    load();
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    load();
  }, { rootMargin: "160px 0px" });
  observer.observe(frame);
};

const applyNav = () => {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  if (!toggle || !nav || !header) return;
  const close = () => {
    nav.classList.remove("is-open");
    header.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-locked");
  };
  toggle.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    header.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("is-locked", open);
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
};

const applyReveal = () => {
  const nodes = [...document.querySelectorAll(".reveal")];
  if (!nodes.length) return;
  if (!("IntersectionObserver" in window)) {
    nodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  nodes.forEach((node) => observer.observe(node));
};

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

applySeo();
applyCinta();
applyDireccion();
applyHorario();
applyLinks();
applyWhatsapp();
applySchema();
applyMap();
applyNav();
applyReveal();
