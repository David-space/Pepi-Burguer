document.addEventListener('DOMContentLoaded', () => {

const filtros = document.querySelectorAll(".filter");
  const tarjetas = document.querySelectorAll(".card");
 
  filtros.forEach(btn => btn.addEventListener("click", () => {
    filtros.forEach(b => b.setAttribute("aria-pressed", b === btn));
    const f = btn.dataset.filter;
    tarjetas.forEach(c => {
      c.hidden = f !== "todo" && !c.dataset.cat.split(" ").includes(f);
    });
  }));
 
  document.querySelectorAll(".btn-add").forEach(btn => btn.addEventListener("click", () => {
    btn.classList.add("is-added");
    btn.lastChild.textContent = " Agregado";
    setTimeout(() => {
      btn.classList.remove("is-added");
      btn.lastChild.textContent = " Agregar al pedido";
    }, 1500);
  }));
  });