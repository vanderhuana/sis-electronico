document.addEventListener('DOMContentLoaded', async () => {
  // Proteger acceso: si no hay token, redirigir a login
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
    return;
  }

  // Obtener datos del dashboard
  try {
    const res = await fetch('http://localhost:4000/api/dashboard/summary', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al cargar dashboard');

    // KPIs
    document.getElementById('ventasMes').textContent = data.total_ventas_mes;
    document.getElementById('ingresosDia').textContent = data.ingresos_dia;
    document.getElementById('stockBajo').textContent = data.productos_bajo_stock;
    document.getElementById('clientesRegistrados').textContent = data.total_clientes;

    // Gráfico ingresos últimos 12 meses
    const ctxIngresos = document.getElementById('chartIngresos').getContext('2d');
    new Chart(ctxIngresos, {
      type: 'line',
      data: {
        labels: data.ingresos_meses.map(m => m.mes),
        datasets: [{
          label: 'Ingresos',
          data: data.ingresos_meses.map(m => m.ingresos),
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13,110,253,0.1)',
          fill: true
        }]
      }
    });

    // Gráfico top productos
    const ctxTop = document.getElementById('chartTopProductos').getContext('2d');
    new Chart(ctxTop, {
      type: 'bar',
      data: {
        labels: data.top_productos.map(p => p.nombre),
        datasets: [{
          label: 'Vendidos',
          data: data.top_productos.map(p => p.cantidad_vendida),
          backgroundColor: '#198754'
        }]
      }
    });

    // Notificación ejemplo
    showToast('Panel de control cargado correctamente', 'success');
  } catch (err) {
    showToast(err.message, 'danger');
  }
});

function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
  toast.role = 'alert';
  toast.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
