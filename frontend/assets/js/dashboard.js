document.addEventListener('DOMContentLoaded', async () => {
  // Proteger acceso: si no hay token, redirigir a login
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
    return;
  }

  // Mostrar indicadores de carga
  showLoadingStates();

  // Obtener datos del dashboard
  try {
    const res = await fetch('http://localhost:4000/api/dashboard/summary', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al cargar dashboard');

    // Animar KPIs con contador progresivo
    animateCounter('ventasMes', data.total_ventas_mes);
    animateCounter('ingresosDia', formatCurrency(data.ingresos_dia));
    animateCounter('stockBajo', data.productos_bajo_stock);
    animateCounter('clientesRegistrados', data.total_clientes);

    // Gráfico ingresos últimos 12 meses con animación
    const ctxIngresos = document.getElementById('chartIngresos').getContext('2d');
    new Chart(ctxIngresos, {
      type: 'line',
      data: {
        labels: data.ingresos_meses.map(m => m.mes),
        datasets: [{
          label: 'Ingresos ($)',
          data: data.ingresos_meses.map(m => m.ingresos),
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13,110,253,0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#0d6efd',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              font: { weight: 'bold', size: 12 },
              color: '#495057'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.1)' },
            ticks: { 
              font: { weight: '500' },
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            }
          },
          x: {
            grid: { color: 'rgba(0,0,0,0.1)' },
            ticks: { font: { weight: '500' } }
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart'
        }
      }
    });

    // Gráfico top productos con colores mejorados
    const ctxTop = document.getElementById('chartTopProductos').getContext('2d');
    new Chart(ctxTop, {
      type: 'doughnut',
      data: {
        labels: data.top_productos.map(p => p.nombre),
        datasets: [{
          label: 'Vendidos',
          data: data.top_productos.map(p => p.cantidad_vendida),
          backgroundColor: [
            '#0d6efd', // azul
            '#198754', // verde
            '#ffc107', // amarillo
            '#dc3545', // rojo
            '#6f42c1'  // morado
          ],
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverBorderWidth: 5,
          cutout: '60%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { weight: 'bold', size: 11 },
              color: '#495057',
              padding: 15
            }
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart'
        }
      }
    });

    // Notificación de éxito
    showToast('Panel de control cargado correctamente', 'success');
  } catch (err) {
    showToast(err.message, 'danger');
    showErrorStates();
  }
});

// Función para mostrar estados de carga
function showLoadingStates() {
  const elements = ['ventasMes', 'ingresosDia', 'stockBajo', 'clientesRegistrados'];
  elements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.innerHTML = '<div class="loading-shimmer" style="height: 20px; border-radius: 4px;"></div>';
    }
  });
}

// Función para mostrar estados de error
function showErrorStates() {
  const elements = ['ventasMes', 'ingresosDia', 'stockBajo', 'clientesRegistrados'];
  elements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.innerHTML = '<span class="text-muted">Error</span>';
    }
  });
}

// Animación de contador progresivo
function animateCounter(elementId, targetValue) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const isNumeric = !isNaN(targetValue);
  const target = isNumeric ? parseInt(targetValue) : targetValue;
  
  if (isNumeric) {
    let current = 0;
    const increment = target / 60; // 60 frames para 1 segundo
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target.toLocaleString();
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current).toLocaleString();
      }
    }, 16); // ~60fps
  } else {
    // Para valores no numéricos (como currency)
    element.textContent = target;
  }
}

// Función para formatear moneda
function formatCurrency(value) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
}

// Toast mejorado con iconos
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer');
  const icons = {
    success: 'fas fa-check-circle',
    danger: 'fas fa-exclamation-triangle', 
    warning: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle'
  };
  
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
  toast.role = 'alert';
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <i class="${icons[type]} me-2"></i>
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  toastContainer.appendChild(toast);
  
  // Auto-remove después de 4 segundos
  setTimeout(() => {
    if (toast && toast.parentNode) {
      toast.remove();
    }
  }, 4000);
}
