// Aviso inicial
alert("⚠️ Los datos se guardan únicamente en este dispositivo. Si accede desde otro móvil, no estarán disponibles.");

// Reloj digital
function actualizarReloj() {
  const clock = document.getElementById("clock");
  const ahora = new Date();
  clock.textContent = ahora.toLocaleTimeString();
}
setInterval(actualizarReloj, 1000);

// Login
const loginForm = document.getElementById("login-form");
const loginSection = document.getElementById("login-section");
const mainSection = document.getElementById("main-section");

loginForm.addEventListener("submit", e => {
  e.preventDefault();
  const usuario = document.getElementById("usuario").value;
  const password = document.getElementById("password").value;

  if (password.length === 4 && /^\d{4}$/.test(password)) {
    localStorage.setItem("sesion", usuario);
    loginSection.classList.add("hidden");
    mainSection.classList.remove("hidden");
    cargarJornadas();
    cargarMeses();
  } else {
    alert("Contraseña inválida. Debe ser 4 dígitos numéricos.");
  }
});

// Registro de jornadas
const registroForm = document.getElementById("registro-form");
registroForm.addEventListener("submit", e => {
  e.preventDefault();
  const fecha = document.getElementById("fecha").value;
  const entrada = document.getElementById("entrada").value;
  const salida = document.getElementById("salida").value;

  const horas = calcularHoras(entrada, salida);

  const jornada = { fecha, entrada, salida, horas };
  let jornadas = JSON.parse(localStorage.getItem("jornadas")) || [];
  jornadas.unshift(jornada);
  localStorage.setItem("jornadas", JSON.stringify(jornadas));

  cargarJornadas();
  cargarMeses();
});

function calcularHoras(entrada, salida) {
  const [h1, m1] = entrada.split(":").map(Number);
  const [h2, m2] = salida.split(":").map(Number);
  const inicio = h1 * 60 + m1;
  const fin = h2 * 60 + m2;
  return ((fin - inicio) / 60).toFixed(2);
}

function cargarJornadas() {
  const lista = document.getElementById("lista-jornadas");
  lista.innerHTML = "";
  const jornadas = JSON.parse(localStorage.getItem("jornadas")) || [];
  jornadas.forEach(j => {
    const li = document.createElement("li");
    li.textContent = `${j.fecha} | Entrada: ${j.entrada} | Salida: ${j.salida} | Total: ${j.horas}h`;
    lista.appendChild(li);
  });
}

function cargarMeses() {
  const selector = document.getElementById("mes-selector");
  selector.innerHTML = "";
  const jornadas = JSON.parse(localStorage.getItem("jornadas")) || [];
  const meses = [...new Set(jornadas.map(j => j.fecha.slice(0,7)))];
  meses.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    selector.appendChild(opt);
  });
  mostrarResumen();
}

document.getElementById("mes-selector").addEventListener("change", mostrarResumen);

function mostrarResumen() {
  const mes = document.getElementById("mes-selector").value;
  const resumen = document.getElementById("resumen");
  resumen.innerHTML = "";
  const jornadas = JSON.parse(localStorage.getItem("jornadas")) || [];
  const filtradas = jornadas.filter(j => j.fecha.startsWith(mes));
  const dias = filtradas.length;
  const horas = filtradas.reduce((acc, j) => acc + parseFloat(j.horas), 0);

  resumen.innerHTML = `
    <div><strong>${mes}</strong></div>
    <div>Días trabajados: ${dias}</div>
    <div>Horas acumuladas: ${horas.toFixed(2)}</div>
  `;
}

// Compartir por WhatsApp
document.getElementById("compartir").addEventListener("click", () => {
  const mes = document.getElementById("mes-selector").value;
  const jornadas = JSON.parse(localStorage.getItem("jornadas")) || [];
  const filtradas = jornadas.filter(j => j.fecha.startsWith(mes));
  let mensaje = `Resumen ${mes}\nDías trabajados: ${filtradas.length}\n`;
  mensaje += `Horas acumuladas: ${filtradas.reduce((acc, j) => acc + parseFloat(j.horas), 0).toFixed(2)}\n\n`;
  filtradas.forEach(j
  filtradas.forEach(j => {
    mensaje += `${j.fecha}: ${j.entrada} - ${j.salida} (${j.horas}h)\n`;
  });

  const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
});

// Modo oscuro
document.getElementById("modo-oscuro").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// Validación extra: borrar jornadas con confirmación
function borrarJornada(index) {
  if (confirm("¿Seguro que deseas borrar esta jornada?")) {
    let jornadas = JSON.parse(localStorage.getItem("jornadas")) || [];
    jornadas.splice(index, 1);
    localStorage.setItem("jornadas", JSON.stringify(jornadas));
    cargarJornadas();
    cargarMeses();
  }
}

// Respaldo automático local (ejemplo simple)
window.addEventListener("beforeunload", () => {
  const jornadas = localStorage.getItem("jornadas");
  if (jornadas) {
    localStorage.setItem("backup_jornadas", jornadas);
  }
});

// Restaurar respaldo si no hay jornadas
window.addEventListener("load", () => {
  if (!localStorage.getItem("jornadas") && localStorage.getItem("backup_jornadas")) {
    localStorage.setItem("jornadas", localStorage.getItem("backup_jornadas"));
  }
});
