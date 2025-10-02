document.addEventListener('DOMContentLoaded', async () => {
  // Proteger acceso: si no hay token, redirigir a login
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
    return;
  }

  // Cargar el sidebar
  cargarSidebar();

  // Variables globales
  let productosOriginales = [];
  let stockMinimo = 5;

  // Elementos del DOM
  const stockMinimoInput = document.getElementById('stockMinimo');
  const buscarProductoInput = document.getElementById('buscarProducto');
  const alertasContainer = document.getElementById('alertasContainer');
  const alertCount = document.getElementById('alertCount');
  const stockCritico = document.getElementById('stockCritico');
  const stockBajo = document.getElementById('stockBajo');
  const stockNormal = document.getElementById('stockNormal');

  // Event listeners
  stockMinimoInput.addEventListener('input', filtrarAlertas);
  buscarProductoInput.addEventListener('input', filtrarAlertas);

  // Función para obtener productos
  async function obtenerProductos() {
    try {
      const response = await fetch('http://localhost:4000/api/products', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }

      const productos = await response.json();
      productosOriginales = productos;
      filtrarAlertas();
      mostrarToast('Alertas cargadas correctamente', 'success');
    } catch (error) {
      console.error('Error:', error);
      mostrarToast('Error al cargar las alertas: ' + error.message, 'danger');
      mostrarEstadoVacio('Error al cargar productos');
    }
  }

  // Función para filtrar alertas
  function filtrarAlertas() {
    stockMinimo = parseInt(stockMinimoInput.value) || 5;
    const busqueda = buscarProductoInput.value.toLowerCase();

    let productosFiltrados = productosOriginales.filter(producto => {
      const cumpleBusqueda = producto.nombre.toLowerCase().includes(busqueda);
      return cumpleBusqueda;
    });

    // Categorizar productos por stock
    const categorias = {
      critico: productosFiltrados.filter(p => p.stock <= 2),
      bajo: productosFiltrados.filter(p => p.stock > 2 && p.stock <= stockMinimo),
      normal: productosFiltrados.filter(p => p.stock > stockMinimo)
    };

    // Actualizar contadores
    stockCritico.textContent = categorias.critico.length;
    stockBajo.textContent = categorias.bajo.length;
    stockNormal.textContent = categorias.normal.length;

    // Solo mostrar productos con stock bajo o crítico
    const productosAlerta = [...categorias.critico, ...categorias.bajo];
    alertCount.textContent = productosAlerta.length;

    mostrarAlertas(productosAlerta, categorias);
  }

  // Función para mostrar alertas
  function mostrarAlertas(productos, categorias) {
    if (productos.length === 0) {
      mostrarEstadoVacio('¡Excelente! No hay productos con stock bajo');
      return;
    }

    let html = '';

    // Primero productos críticos
    if (categorias.critico.length > 0) {
      html += `
        <div class="mb-3">
          <h6 class="text-danger fw-bold">
            <i class="fas fa-exclamation-circle me-2"></i>
            Stock Crítico (≤ 2 unidades)
          </h6>
        </div>
      `;
      categorias.critico.forEach(producto => {
        html += crearCardAlerta(producto, 'critico');
      });
    }

    // Luego productos con stock bajo
    if (categorias.bajo.length > 0) {
      html += `
        <div class="mb-3 mt-4">
          <h6 class="text-warning fw-bold">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Stock Bajo (3 - ${stockMinimo} unidades)
          </h6>
        </div>
      `;
      categorias.bajo.forEach(producto => {
        html += crearCardAlerta(producto, 'bajo');
      });
    }

    alertasContainer.innerHTML = html;
  }

  // Función para crear card de alerta
  function crearCardAlerta(producto, tipo) {
    const iconos = {
      critico: 'fas fa-exclamation-circle icon-critico pulse-critical',
      bajo: 'fas fa-exclamation-triangle icon-bajo'
    };

    const badges = {
      critico: 'stock-critico',
      bajo: 'stock-bajo'
    };

    return `
      <div class="alert-card alert-${tipo} card mb-3">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-auto">
              <i class="${iconos[tipo]} icon-status"></i>
            </div>
            <div class="col">
              <h6 class="card-title mb-1">${producto.nombre}</h6>
              <p class="card-text text-muted mb-1">
                <small>
                  <i class="fas fa-tag me-1"></i>Categoría: ${producto.categoria || 'Sin categoría'}
                  <span class="mx-2">|</span>
                  <i class="fas fa-dollar-sign me-1"></i>Precio: $${producto.precio}
                </small>
              </p>
              ${producto.descripcion ? `<p class="card-text"><small class="text-muted">${producto.descripcion}</small></p>` : ''}
            </div>
            <div class="col-auto">
              <span class="badge stock-badge ${badges[tipo]}">
                <i class="fas fa-boxes me-1"></i>
                ${producto.stock} unidades
              </span>
            </div>
            <div class="col-auto">
              <button class="btn btn-sm btn-outline-primary" onclick="verDetalleProducto(${producto.id})">
                <i class="fas fa-eye me-1"></i>Ver
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Función para mostrar estado vacío
  function mostrarEstadoVacio(mensaje) {
    alertasContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-check-circle text-success"></i>
        <h5 class="mt-3">${mensaje}</h5>
        <p class="text-muted">Todos los productos tienen stock suficiente.</p>
      </div>
    `;
  }

  // Función para ver detalle del producto
  window.verDetalleProducto = function(id) {
    window.location.href = `productos.html?id=${id}`;
  };

  // Función para mostrar toast
  function mostrarToast(mensaje, tipo = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toastId = 'toast-' + Date.now();
    
    const toastHTML = `
      <div id="${toastId}" class="toast align-items-center text-bg-${tipo} border-0" role="alert">
        <div class="d-flex">
          <div class="toast-body">
            ${mensaje}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
      </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 4000 });
    toast.show();
    
    toastElement.addEventListener('hidden.bs.toast', () => {
      toastElement.remove();
    });
  }

  // Inicializar
  await obtenerProductos();
});