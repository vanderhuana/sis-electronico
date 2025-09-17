// Búsqueda en tiempo real para consulta rápida (clientes y productos a la vez)
const inputBusqueda = document.getElementById('inputBusqueda');
const resultadoConsulta = document.getElementById('resultadoConsulta');

let timeout = null;

inputBusqueda.addEventListener('input', function() {
  clearTimeout(timeout);
  const query = this.value.trim();
  if (query.length === 0) {
    resultadoConsulta.innerHTML = '';
    return;
  }
  timeout = setTimeout(() => buscar(query), 300);
});

async function buscar(query) {
  resultadoConsulta.innerHTML = '<div class="text-center text-secondary py-3">Buscando...</div>';
  try {
    let apiUrl = `http://localhost:4000/api/consulta?q=${encodeURIComponent(query)}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error('Error en la búsqueda');
    const data = await res.json();
    if ((!data.clientes || !data.clientes.length) && (!data.productos || !data.productos.length)) {
      resultadoConsulta.innerHTML = '<div class="text-center text-danger py-3">No se encontraron resultados.</div>';
      return;
    }
    resultadoConsulta.innerHTML = renderResultados(data);
  } catch {
    resultadoConsulta.innerHTML = '<div class="text-center text-danger py-3">Error al buscar.</div>';
  }
}

function renderResultados(data) {
  return `
    <div class="mb-4">
      <h5 class="text-center mb-2">Clientes</h5>
      ${data.clientes && data.clientes.length ? renderClientes(data.clientes) : '<div class="text-center text-muted">Sin resultados</div>'}
    </div>
    <div class="mb-4">
      <h5 class="text-center mb-2">Productos</h5>
      ${data.productos && data.productos.length ? renderProductos(data.productos) : '<div class="text-center text-muted">Sin resultados</div>'}
    </div>
  `;
}

function renderClientes(clientes) {
  return `<table class="table table-bordered table-hover mt-2">
    <thead><tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Productos comprados</th></tr></thead>
    <tbody>
      ${clientes.map(c => `<tr><td>${c.nombre}</td><td>${c.correo || '-'}<\/td><td>${c.telefono || '-'}<\/td><td>${Array.isArray(c.productos_comprados) && c.productos_comprados.length ? c.productos_comprados.join(', ') : '-'}<\/td><\/tr>`).join('')}
    <\/tbody>
  <\/table>`;
}

function renderProductos(productos) {
  return `<table class="table table-bordered table-hover mt-2">
    <thead><tr><th>Nombre</th><th>SKU</th><th>Stock</th><th>Precio Venta</th></tr></thead>
    <tbody>
      ${productos.map(p => `<tr><td>${p.nombre}</td><td>${p.codigo_sku || '-'}<\/td><td>${p.stock || '-'}<\/td><td>${p.precio_venta || '-'}<\/td><\/tr>`).join('')}
    <\/tbody>
  <\/table>`;
}
