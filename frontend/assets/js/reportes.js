// JS base para reportes

document.addEventListener('DOMContentLoaded', () => {
  // Exportar PDF/Excel ventas por rango
  document.getElementById('btnExportarVentasPDF')?.addEventListener('click', () => {
    const desde = document.querySelector('[name="fecha_inicio"]').value;
    const hasta = document.querySelector('[name="fecha_fin"]').value;
    if (!desde || !hasta) return mostrarToast('Selecciona el rango de fechas', 'warning');
    window.open(`http://localhost:4000/api/reports/ventas/pdf?desde=${desde}&hasta=${hasta}`, '_blank');
  });
  document.getElementById('btnExportarVentasExcel')?.addEventListener('click', () => {
    const desde = document.querySelector('[name="fecha_inicio"]').value;
    const hasta = document.querySelector('[name="fecha_fin"]').value;
    if (!desde || !hasta) return mostrarToast('Selecciona el rango de fechas', 'warning');
    window.open(`http://localhost:4000/api/reports/ventas/excel?desde=${desde}&hasta=${hasta}`, '_blank');
  });

  // Exportar PDF/Excel productos más vendidos
  document.getElementById('btnExportarProductosPDF')?.addEventListener('click', () => {
    window.open('http://localhost:4000/api/reports/productos-mas-vendidos/pdf', '_blank');
  });
  document.getElementById('btnExportarProductosExcel')?.addEventListener('click', () => {
    window.open('http://localhost:4000/api/reports/productos-mas-vendidos/excel', '_blank');
  });

  // Exportar PDF/Excel clientes con más compras
  document.getElementById('btnExportarClientesPDF')?.addEventListener('click', () => {
    window.open('http://localhost:4000/api/reports/clientes-mas-compras/pdf', '_blank');
  });
  document.getElementById('btnExportarClientesExcel')?.addEventListener('click', () => {
    window.open('http://localhost:4000/api/reports/clientes-mas-compras/excel', '_blank');
  });
  // Aquí irán los listeners y llamadas a la API para cada reporte
  // Ejemplo para ventas por rango de fechas
  document.getElementById('formRangoFechas')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const desde = this.fecha_inicio.value;
    const hasta = this.fecha_fin.value;
    try {
      const res = await fetch(`http://localhost:4000/api/reports/ventas?desde=${desde}&hasta=${hasta}`);
      const ventas = await res.json();
      mostrarTablaReporteVentas(ventas);
    } catch {
      mostrarToast('Error al obtener reporte de ventas', 'danger');
    }
  });
  // Botones de exportar
  document.getElementById('btnExportarVentasPDF')?.addEventListener('click', () => mostrarToast('Exportar PDF pendiente', 'info'));
  document.getElementById('btnExportarVentasExcel')?.addEventListener('click', () => mostrarToast('Exportar Excel pendiente', 'info'));
  document.getElementById('btnGenerarProductosVendidos')?.addEventListener('click', async () => {
    try {
      const res = await fetch('http://localhost:4000/api/reports/productos-mas-vendidos');
      const productos = await res.json();
      mostrarTablaReporteProductos(productos);
    } catch {
      mostrarToast('Error al obtener reporte de productos', 'danger');
    }
  });
  document.getElementById('btnExportarProductosPDF')?.addEventListener('click', () => mostrarToast('Exportar PDF pendiente', 'info'));
  document.getElementById('btnExportarProductosExcel')?.addEventListener('click', () => mostrarToast('Exportar Excel pendiente', 'info'));
  document.getElementById('btnGenerarClientesCompras')?.addEventListener('click', async () => {
    try {
      const res = await fetch('http://localhost:4000/api/reports/clientes-mas-compras');
      const clientes = await res.json();
      mostrarTablaReporteClientes(clientes);
    } catch {
      mostrarToast('Error al obtener reporte de clientes', 'danger');
    }
  });
// Renderizar tabla de ventas por rango
function mostrarTablaReporteVentas(ventas) {
  const cont = document.getElementById('tablaReporteVentas');
  if (!cont) return;
  if (!ventas.length) {
    cont.innerHTML = '<div class="text-danger">No hay ventas en el rango seleccionado.</div>';
    return;
  }
  cont.innerHTML = `<table class="table table-bordered table-sm">
    <thead><tr><th>ID</th><th>Fecha</th><th>Cliente</th><th>Total</th></tr></thead>
    <tbody>
      ${ventas.map(v => `<tr>
        <td>${v.id}</td>
        <td>${v.fecha}</td>
        <td>${v.cliente}</td>
        <td>${v.total}</td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

// Renderizar tabla de productos más vendidos
function mostrarTablaReporteProductos(productos) {
  const cont = document.getElementById('tablaReporteProductos');
  if (!cont) return;
  if (!productos.length) {
    cont.innerHTML = '<div class="text-danger">No hay datos de productos vendidos.</div>';
    return;
  }
  cont.innerHTML = `<table class="table table-bordered table-sm">
    <thead><tr><th>Producto</th><th>Cantidad Vendida</th></tr></thead>
    <tbody>
      ${productos.map(p => `<tr>
        <td>${p.nombre}</td>
        <td>${p.cantidad_total}</td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

// Renderizar tabla de clientes con más compras
function mostrarTablaReporteClientes(clientes) {
  const cont = document.getElementById('tablaReporteClientes');
  if (!cont) return;
  if (!clientes.length) {
    cont.innerHTML = '<div class="text-danger">No hay datos de clientes.</div>';
    return;
  }
  cont.innerHTML = `<table class="table table-bordered table-sm">
    <thead><tr><th>Cliente</th><th>Compras</th></tr></thead>
    <tbody>
      ${clientes.map(c => `<tr>
        <td>${c.nombre}</td>
        <td>${c.compras}</td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}
  document.getElementById('btnExportarClientesPDF')?.addEventListener('click', () => mostrarToast('Exportar PDF pendiente', 'info'));
  document.getElementById('btnExportarClientesExcel')?.addEventListener('click', () => mostrarToast('Exportar Excel pendiente', 'info'));
});

function mostrarToast(msg, tipo = 'info') {
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${tipo} border-0 show mb-2`;
  toast.role = 'alert';
  toast.innerHTML = `<div class='d-flex'><div class='toast-body'>${msg}</div><button type='button' class='btn-close btn-close-white me-2 m-auto' data-bs-dismiss='toast'></button></div>`;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
