// Función para mostrar toast notifications
function mostrarToast(message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
  toast.role = 'alert';
  toast.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Búsqueda en tiempo real para consulta rápida (clientes y productos a la vez)
const inputBusqueda = document.getElementById('inputBusqueda');
const resultadoConsulta = document.getElementById('resultadoConsulta');

let timeout = null;
let ultimaBusqueda = '';

// Event listener principal para búsqueda
inputBusqueda.addEventListener('input', function() {
  clearTimeout(timeout);
  const query = this.value.trim();
  
  // Limpiar resultados si está vacío
  if (query.length === 0) {
    resultadoConsulta.innerHTML = `
      <div class="text-center text-muted py-4">
        <i class="fas fa-search fa-3x mb-3"></i>
        <p>Ingresa un término de búsqueda para encontrar clientes y productos</p>
        <small>Puedes buscar por nombre, ID, SKU o cualquier información relacionada</small>
      </div>
    `;
    ultimaBusqueda = '';
    return;
  }
  
  // Evitar búsquedas repetidas
  if (query === ultimaBusqueda) return;
  
  // Búsqueda con debounce
  timeout = setTimeout(() => {
    ultimaBusqueda = query;
    buscar(query);
  }, 300);
});

// Event listener para teclas especiales
inputBusqueda.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    this.value = '';
    resultadoConsulta.innerHTML = `
      <div class="text-center text-muted py-4">
        <i class="fas fa-search fa-3x mb-3"></i>
        <p>Búsqueda cancelada</p>
      </div>
    `;
    ultimaBusqueda = '';
  }
});

// Focus automático al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  // Mostrar mensaje de carga exitosa
  mostrarToast('Módulo de Consulta Rápida cargado correctamente', 'success');
  
  inputBusqueda.focus();
  
  // Mensaje inicial
  resultadoConsulta.innerHTML = `
    <div class="text-center text-muted py-4">
      <i class="fas fa-search fa-3x mb-3"></i>
      <p>Buscador Universal de ElectroTech</p>
      <small>Busca simultáneamente en clientes y productos por cualquier término</small>
    </div>
  `;
});

async function buscar(query) {
  // Mostrar indicador de carga
  resultadoConsulta.innerHTML = `
    <div class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Buscando...</span>
      </div>
      <div class="mt-2 text-muted">Buscando en clientes y productos...</div>
    </div>
  `;
  
  try {
    const apiUrl = `http://localhost:4000/api/consulta?q=${encodeURIComponent(query)}`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sesión expirada');
      } else if (response.status === 404) {
        throw new Error('No se encontraron resultados');
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    
    // Verificar si hay resultados
    const tieneClientes = data.clientes && data.clientes.length > 0;
    const tieneProductos = data.productos && data.productos.length > 0;
    
    if (!tieneClientes && !tieneProductos) {
      resultadoConsulta.innerHTML = `
        <div class="alert alert-warning text-center">
          <i class="fas fa-search me-2"></i>
          <strong>Sin resultados</strong><br>
          No se encontraron clientes ni productos que coincidan con "<strong>${query}</strong>"
        </div>
      `;
      return;
    }
    
    // Mostrar estadísticas de búsqueda
    const totalResultados = (data.clientes?.length || 0) + (data.productos?.length || 0);
    const estadisticas = `
      <div class="alert alert-success mb-3">
        <i class="fas fa-check-circle me-2"></i>
        <strong>Búsqueda completada:</strong> ${totalResultados} resultado(s) encontrado(s) para "<strong>${query}</strong>"
        <small class="d-block">
          ${data.clientes?.length || 0} cliente(s) y ${data.productos?.length || 0} producto(s)
        </small>
      </div>
    `;
    
    resultadoConsulta.innerHTML = estadisticas + renderResultados(data);
    
  } catch (error) {
    console.error('Error en búsqueda:', error);
    
    let mensajeError = 'Error desconocido al realizar la búsqueda';
    if (error.message === 'Sesión expirada') {
      mensajeError = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      setTimeout(() => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
      }, 2000);
    } else if (error.message.includes('fetch')) {
      mensajeError = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else {
      mensajeError = error.message;
    }
    
    resultadoConsulta.innerHTML = `
      <div class="alert alert-danger text-center">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Error:</strong> ${mensajeError}
      </div>
    `;
  }
}

function renderResultados(data) {
  let html = '';
  
  // Sección de Clientes
  html += `<div class="row mb-4">
    <div class="col-12">
      <h5><i class="fas fa-users me-2 text-primary"></i>Clientes Encontrados</h5>
      <hr>
  `;
  
  if (data.clientes && data.clientes.length > 0) {
    html += `<div class="table-responsive">
      <table class="table table-hover table-striped">
        <thead class="table-primary">
          <tr>
            <th><i class="fas fa-user me-1"></i>Nombre</th>
            <th><i class="fas fa-envelope me-1"></i>Correo</th>
            <th><i class="fas fa-phone me-1"></i>Teléfono</th>
            <th><i class="fas fa-shopping-cart me-1"></i>Productos Comprados</th>
          </tr>
        </thead>
        <tbody>
          ${data.clientes.map(c => `
            <tr>
              <td><strong>${c.nombre}</strong></td>
              <td>${c.correo || '<span class="text-muted">Sin correo</span>'}</td>
              <td>${c.telefono || '<span class="text-muted">Sin teléfono</span>'}</td>
              <td>
                ${Array.isArray(c.productos_comprados) && c.productos_comprados.length ? 
                  `<span class="badge bg-success">${c.productos_comprados.length} productos</span>
                   <small class="d-block text-muted">${c.productos_comprados.join(', ')}</small>` : 
                  '<span class="badge bg-secondary">Sin compras</span>'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
  } else {
    html += `<div class="alert alert-info">
      <i class="fas fa-info-circle me-2"></i>No se encontraron clientes con ese criterio de búsqueda.
    </div>`;
  }
  
  html += `</div></div>`;
  
  // Sección de Productos
  html += `<div class="row">
    <div class="col-12">
      <h5><i class="fas fa-boxes me-2 text-success"></i>Productos Encontrados</h5>
      <hr>
  `;
  
  if (data.productos && data.productos.length > 0) {
    html += `<div class="table-responsive">
      <table class="table table-hover table-striped">
        <thead class="table-success">
          <tr>
            <th><i class="fas fa-box me-1"></i>Producto</th>
            <th><i class="fas fa-barcode me-1"></i>SKU</th>
            <th><i class="fas fa-warehouse me-1"></i>Stock</th>
            <th><i class="fas fa-tag me-1"></i>Precio</th>
            <th><i class="fas fa-info me-1"></i>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${data.productos.map(p => `
            <tr>
              <td><strong>${p.nombre}</strong></td>
              <td><code>${p.codigo_sku || 'Sin SKU'}</code></td>
              <td>
                <span class="badge ${p.stock > 10 ? 'bg-success' : p.stock > 0 ? 'bg-warning' : 'bg-danger'}">
                  ${p.stock || 0} unidades
                </span>
              </td>
              <td><strong>$${parseFloat(p.precio_venta || 0).toFixed(2)}</strong></td>
              <td>
                ${p.stock > 0 ? 
                  '<span class="badge bg-success">Disponible</span>' : 
                  '<span class="badge bg-danger">Agotado</span>'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
  } else {
    html += `<div class="alert alert-info">
      <i class="fas fa-info-circle me-2"></i>No se encontraron productos con ese criterio de búsqueda.
    </div>`;
  }
  
  html += `</div></div>`;
  
  return html;
}


