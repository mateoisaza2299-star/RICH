export const negocio = {
  nombre: "Rich Barbery",
  sitio: "",
  whatsapp: "",
  email: "",
  direccion: {
    calle: "Calle 13 #13-72",
    barrio: "",
    ciudad: "Funza",
    departamento: "Cundinamarca",
    pais: "Colombia"
  },
  mapsUrl: "",
  mapaEmbed: "",
  zona: "America/Bogota",
  horario: [
    { etiqueta: "Lun – Vie", dias: [1, 2, 3, 4, 5], abre: "09:00", cierra: "17:00" },
    { etiqueta: "Sáb", dias: [6], abre: "12:00", cierra: "21:00" },
    { etiqueta: "Dom", dias: [0], abre: "11:00", cierra: "19:00" }
  ],
  redes: {
    instagram: "https://www.instagram.com/USUARIO/"
  }
};

export function consultaMapa() {
  const d = negocio.direccion;
  return [negocio.nombre, d.calle, d.ciudad, d.departamento].filter(Boolean).join(", ");
}

export function enlaceMapa() {
  const guardado = String(negocio.mapsUrl || "").trim();
  if (guardado) return guardado;
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(consultaMapa());
}

export function enlaceEmbed() {
  const guardado = String(negocio.mapaEmbed || "").trim();
  if (guardado) return guardado;
  return "https://maps.google.com/maps?q=" + encodeURIComponent(consultaMapa()) + "&z=16&output=embed";
}

export function usuarioInstagram() {
  const href = String(negocio.redes.instagram || "").trim();
  if (!href) return "";
  const handle = href.replace(/[?#].*$/, "").replace(/\/+$/, "").split("/").pop() || "";
  const usuario = handle.replace(/^@/, "");
  if (!usuario || usuario.includes(".")) return "";
  return usuario;
}

export function textoCinta() {
  const d = negocio.direccion;
  const partes = [negocio.nombre, d.calle, d.ciudad]
    .map((parte) => String(parte || "").trim())
    .filter(Boolean)
    .map((parte) => parte.toLocaleUpperCase("es-CO"));
  const usuario = usuarioInstagram();
  if (usuario) partes.push("SÍGUENOS @" + usuario.toLocaleUpperCase("es-CO"));
  return partes.join(" · ");
}

export function codigoPais(pais) {
  const value = String(pais == null ? negocio.direccion.pais : pais).trim();
  if (/^colombia$/i.test(value)) return "CO";
  if (/^[a-z]{2}$/i.test(value)) return value.toUpperCase();
  return value;
}

export function direccionLinea() {
  const d = negocio.direccion;
  return [d.calle, d.barrio, d.ciudad, d.departamento].filter(Boolean).join(", ");
}

export function diaSemana(iso) {
  const [year, month, day] = String(iso || "").split("-").map(Number);
  if (!year || !month || !day) return -1;
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function partesBogota(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: negocio.zona,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date || new Date());
  const pick = (type) => parts.find((item) => item.type === type).value;
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  let hora = Number(pick("hour"));
  if (hora === 24) hora = 0;
  return {
    iso: pick("year") + "-" + pick("month") + "-" + pick("day"),
    dia: map[pick("weekday").slice(0, 3)] ?? 0,
    minutos: hora * 60 + Number(pick("minute"))
  };
}

function reglaDe(dia) {
  return negocio.horario.find((item) => item.dias.includes(dia)) || null;
}

function minutosReloj(hhmm) {
  const [hora, minuto] = String(hhmm || "0:0").split(":").map(Number);
  return hora * 60 + minuto;
}

export function horaCorta(hhmm) {
  const [hora, minuto] = String(hhmm || "00:00").split(":");
  return String(Number(hora)) + ":" + minuto;
}

export function hora12(hhmm) {
  const hour = Number(String(hhmm || "00:00").slice(0, 2));
  const suffix = hour < 12 ? "am" : "pm";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return hour12 + ":00 " + suffix;
}

export function horarioPublicado() {
  return negocio.horario.some((item) => !item.cerrado && item.abre && item.cierra);
}

export function textoHorario(regla) {
  if (regla && regla.cerrado) return "Cerrado";
  if (!regla || !regla.abre || !regla.cierra) return "";
  return hora12(regla.abre) + " – " + hora12(regla.cierra);
}

export function estadoApertura(date) {
  if (!horarioPublicado()) return { abierto: false, texto: "Horario por confirmar", pendiente: true };
  const ahora = partesBogota(date);
  const hoy = reglaDe(ahora.dia);
  if (hoy && !hoy.cerrado && hoy.abre && hoy.cierra) {
    const abre = minutosReloj(hoy.abre);
    const cierra = minutosReloj(hoy.cierra);
    if (ahora.minutos >= abre && ahora.minutos < cierra) return { abierto: true, texto: "Abierto ahora" };
  }
  const nombres = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  for (let salto = 0; salto < 8; salto += 1) {
    const dia = (ahora.dia + salto) % 7;
    const regla = reglaDe(dia);
    if (!regla || regla.cerrado || !regla.abre) continue;
    if (salto === 0 && ahora.minutos >= minutosReloj(regla.abre)) continue;
    const hora = horaCorta(regla.abre);
    if (salto === 0) return { abierto: false, texto: "Cerrado, abrimos hoy a las " + hora };
    if (salto === 1) return { abierto: false, texto: "Cerrado, abrimos mañana a las " + hora };
    return { abierto: false, texto: "Cerrado, abrimos el " + nombres[dia] + " a las " + hora };
  }
  return { abierto: false, texto: "Cerrado ahora" };
}
