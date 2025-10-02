// Función para aumentar/disminuir stock
window.actualizarStock = async function(id, cambio) {
  // Obtener el stock actual del producto desde la tarjeta
  const producto = Array.from(document.querySelectorAll('.card')).find(card => {
    return card.innerHTML.includes(`editarProducto(${id})`);
  });
  if (producto) {
    const stockElem = producto.querySelector('.list-group-item.d-flex .fw-bold');
    if (stockElem) {
      const stockActual = parseInt(stockElem.textContent);
      if (stockActual === 0 && cambio < 0) {
        mostrarToast('Producto agotado. No se puede reducir más.', 'danger');
        return;
      }
      if (stockActual + cambio < 0) {
        mostrarToast('No puede haber menos de un producto.', 'danger');
        return;
      }
    }
  }
  try {
    const res = await fetch(`http://localhost:4000/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ stockChange: cambio })
    });
    const data = await res.json();
    if (res.ok) {
      mostrarToast('Stock actualizado', 'success');
      cargarProductos();
    } else {
      mostrarToast(data.error || 'Error al actualizar stock', 'danger');
    }
  } catch {
    mostrarToast('Error de conexión', 'danger');
  }
}
window.editarProducto = async function(id) {
  try {
    console.log('Editar producto ID:', id);
    const res = await fetch(`http://localhost:4000/api/products/${id}`, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    const p = await res.json();
    console.log('Datos recibidos:', p);
    const formProducto = document.getElementById('formProducto');
    if (!formProducto) {
      console.log('No se encontró el formulario formProducto');
      return;
    }
    formProducto.nombre.value = p.nombre || '';
    formProducto.descripcion.value = p.descripcion || '';
    formProducto.categoria.value = p.categoria || '';
    formProducto.precio_compra.value = p.precio_compra || '';
    formProducto.precio_venta.value = p.precio_venta || '';
    formProducto.stock.value = p.stock || '';
    formProducto.proveedor.value = p.proveedor || '';
    formProducto.imagen_url.value = p.imagen_url || '';
    // Previsualizar imagen si existe
    const previewImagen = document.getElementById('previewImagen');
    if (p.imagen_url && previewImagen) {
      const imgSrc = p.imagen_url.startsWith('/uploads/') ? `http://localhost:4000${p.imagen_url}` : p.imagen_url;
      previewImagen.src = imgSrc;
      previewImagen.style.display = 'block';
    } else if (previewImagen) {
      previewImagen.style.display = 'none';
    }
    formProducto.setAttribute('data-id', p.id);
    // Abrir el modal
    console.log('Mostrando modal de edición');
    const modal = new bootstrap.Modal(document.getElementById('modalProducto'));
    modal.show();
  } catch (err) {
    console.error('Error en editarProducto:', err);
    mostrarToast('Error al cargar producto', 'danger');
  }
}
document.addEventListener('DOMContentLoaded', () => {
  // ...existing code...
  // Limpiar formulario al abrir modal de agregar producto
  const btnAgregar = document.querySelector('[data-bs-target="#modalProducto"]');
  // ...existing code...
  if (btnAgregar) {
    btnAgregar.addEventListener('click', () => {
      const formProducto = document.getElementById('formProducto');
      if (formProducto) {
        formProducto.reset();
        formProducto.removeAttribute('data-id');
        const previewImagen = document.getElementById('previewImagen');
        if (previewImagen) previewImagen.style.display = 'none';
        const inputImagenUrl = document.querySelector('input[name="imagen_url"]');
        if (inputImagenUrl) inputImagenUrl.value = '';
      }
    });
  }
  // Proteger acceso: si no hay token, redirigir a login
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
    return;
  }

  cargarProductos();

  // Evento para previsualizar y subir imagen
  const inputImagen = document.querySelector('input[name="imagen_file"]');
  const previewImagen = document.getElementById('previewImagen');
  const inputImagenUrl = document.querySelector('input[name="imagen_url"]');

  if (inputImagen) {
    inputImagen.addEventListener('change', async function() {
      const file = inputImagen.files[0];
      if (!file) return;
      // Previsualización
      const reader = new FileReader();
      reader.onload = function(e) {
        previewImagen.src = e.target.result;
        previewImagen.style.display = 'block';
      };
      reader.readAsDataURL(file);
      // Subir imagen al backend
      const formData = new FormData();
      formData.append('imagen', file);
      try {
        const res = await fetch('http://localhost:4000/api/products/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.url) {
          inputImagenUrl.value = data.url;
        } else {
          mostrarToast('Error al subir imagen', 'danger');
        }
      } catch {
        mostrarToast('Error de conexión al subir imagen', 'danger');
      }
    });
  }

  // Evento para crear producto
  const formProducto = document.getElementById('formProducto');
  if (formProducto) {
    formProducto.addEventListener('submit', async function(e) {
      e.preventDefault();
      const datos = {
        codigo_sku: formProducto.codigo_sku.value.trim(),
        nombre: formProducto.nombre.value.trim(),
        descripcion: formProducto.descripcion ? formProducto.descripcion.value.trim() : '',
        categoria: formProducto.categoria.value.trim(),
        precio_compra: parseFloat(formProducto.precio_compra.value),
        precio_venta: parseFloat(formProducto.precio_venta.value),
        stock: parseInt(formProducto.stock.value),
        proveedor: formProducto.proveedor.value.trim(),
        imagen_url: formProducto.imagen_url.value.trim()
      };
      const id = formProducto.getAttribute('data-id');
      let url = 'http://localhost:4000/api/products';
      let method = 'POST';
      if (id) {
        url += `/${id}`;
        method = 'PUT';
      }
      try {
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          },
          body: JSON.stringify(datos)
        });
        const data = await res.json();
        if (res.ok) {
          mostrarToast(id ? 'Producto actualizado' : 'Producto creado', 'success');
          cargarProductos();
          formProducto.reset();
          formProducto.removeAttribute('data-id');
          previewImagen.style.display = 'none';
          inputImagenUrl.value = '';
          // Cerrar el modal
          const modal = bootstrap.Modal.getInstance(document.getElementById('modalProducto'));
          modal?.hide();
        } else {
          mostrarToast(data.error || 'Error al guardar producto', 'danger');
        }
      } catch {
        mostrarToast('Error de conexión', 'danger');
      }
    });
  }
});

async function cargarProductos() {
  const cards = document.getElementById('cardsProductos');
  if (!cards) return;
  cards.innerHTML = '<div class="text-center">Cargando...</div>';
  try {
    const res = await fetch('http://localhost:4000/api/products', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    const productos = await res.json();
    if (!Array.isArray(productos)) {
      cards.innerHTML = '<div class="text-danger">Error al cargar productos</div>';
      return;
    }
    cards.innerHTML = productos.map(p => {
      let imgSrc = '';
      if (p.imagen_url) {
        imgSrc = p.imagen_url.startsWith('/uploads/') ? `http://localhost:4000${p.imagen_url}` : p.imagen_url;
      }
      const borde = p.stock <= 5 ? 'border-danger' : 'border-success';
      return `
      <div class="col-12 col-md-4 mb-3 d-flex justify-content-center">
        <div class="card h-100 shadow-sm ${borde} producto-animada" style="border-width:2px;max-width:320px;width:100%;">
          ${imgSrc ? 
            `<div class="product-image-container">
               <img src="${imgSrc}" class="card-img-top" alt="${p.nombre}" loading="lazy">
             </div>` : 
            `<div class="product-image-container">
               <div class="no-image-placeholder">
                 <i class="fas fa-box"></i>
               </div>
             </div>`
          }
          <div class="card-body p-2">
            <h6 class="card-title mb-1" style="font-size:1rem;">${p.nombre}</h6>
            <p class="card-text mb-1" style="font-size:0.9rem;">${p.descripcion || ''}</p>
            <ul class="list-group list-group-flush mb-2" style="font-size:0.85rem;">
              <li class="list-group-item"><b>Categoría:</b> ${p.categoria}</li>
              <li class="list-group-item"><b>Compra:</b> ${p.precio_compra}</li>
              <li class="list-group-item"><b>Venta:</b> ${p.precio_venta}</li>
              <li class="list-group-item d-flex align-items-center justify-content-between"><b>Stock:</b> 
                <span class="fw-bold mx-2">${p.stock}</span>
                <div class="d-flex gap-1">
                  <button class='btn btn-sm btn-success btn-animado d-flex align-items-center justify-content-center' title='Aumentar' style="font-size:1.2rem;width:32px;height:32px;" onclick='actualizarStock(${p.id}, 1)'>
                    <span class="fw-bold" style="font-size:1.4rem;">+</span>
                  </button>
                  <button class='btn btn-sm btn-danger btn-animado d-flex align-items-center justify-content-center' title='Disminuir' style="font-size:1.2rem;width:32px;height:32px;" onclick='actualizarStock(${p.id}, -1)'>
                    <span class="fw-bold" style="font-size:1.4rem;">-</span>
                  </button>
                </div>
              </li>
              <li class="list-group-item"><b>Proveedor:</b> ${p.proveedor}</li>
            </ul>
            <button class='btn btn-sm btn-primary me-1 btn-animado' style="font-size:0.85rem;" onclick='editarProducto(${p.id})'>Editar</button>
            <button class='btn btn-sm btn-danger btn-animado' style="font-size:0.85rem;" onclick='eliminarProducto(${p.id})'>Eliminar</button>
          </div>
        </div>
      </div>
      `;
// Función para aumentar/disminuir stock
window.actualizarStock = async function(id, cambio) {
  try {
    const res = await fetch(`http://localhost:4000/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ stockChange: cambio })
    });
    const data = await res.json();
    if (res.ok) {
      mostrarToast('Stock actualizado', 'success');
      cargarProductos();
    } else {
      mostrarToast(data.error || 'Error al actualizar stock', 'danger');
    }
  } catch {
    mostrarToast('Error de conexión', 'danger');
  }
}
    }).join('');
  } catch {
    cards.innerHTML = '<div class="text-danger">Error al cargar productos</div>';
  }
}

function mostrarProductosFiltrados(filtro) {
  const cards = document.getElementById('cardsProductos');
  if (!cards) return;
  let productos = productosCache;
  if (filtro) {
    productos = productos.filter(p =>
      p.nombre.toLowerCase().includes(filtro) ||
      (p.categoria && p.categoria.toLowerCase().includes(filtro))
    );
  }
  if (!Array.isArray(productos) || productos.length === 0) {
    cards.innerHTML = '<div class="text-center text-muted">No se encontraron productos</div>';
    return;
  }
  cards.innerHTML = productos.map(p => {
    let imgSrc = '';
    if (p.imagen_url) {
      imgSrc = p.imagen_url.startsWith('/uploads/') ? `http://localhost:4000${p.imagen_url}` : p.imagen_url;
    }
    const borde = p.stock <= 5 ? 'border-danger' : 'border-success';
    return `
    <div class="col-12 col-md-4 mb-3 d-flex justify-content-center">
      <div class="card h-100 shadow-sm ${borde} producto-animada" style="border-width:2px;max-width:320px;width:100%;">
        ${imgSrc ? 
          `<div class="product-image-container">
             <img src="${imgSrc}" class="card-img-top" alt="${p.nombre}" loading="lazy">
           </div>` : 
          `<div class="product-image-container">
             <div class="no-image-placeholder">
               <i class="fas fa-box"></i>
             </div>
           </div>`
        }
        <div class="card-body p-2">
          <h6 class="card-title mb-1" style="font-size:1rem;">${p.nombre}</h6>
          <p class="card-text mb-1" style="font-size:0.9rem;">${p.descripcion || ''}</p>
          <ul class="list-group list-group-flush mb-2" style="font-size:0.85rem;">
            <li class="list-group-item"><b>Categoría:</b> ${p.categoria}</li>
            <li class="list-group-item"><b>Compra:</b> ${p.precio_compra}</li>
            <li class="list-group-item"><b>Venta:</b> ${p.precio_venta}</li>
            <li class="list-group-item"><b>Stock:</b> ${p.stock}</li>
            <li class="list-group-item"><b>Proveedor:</b> ${p.proveedor}</li>
          </ul>
          <button class='btn btn-sm btn-primary me-1 btn-animado' style="font-size:0.85rem;" onclick='editarProducto(${p.id})'>Editar</button>
          <button class='btn btn-sm btn-danger btn-animado' style="font-size:0.85rem;" onclick='eliminarProducto(${p.id})'>Eliminar</button>
        </div>
      </div>
    </div>
    `;
  }).join('');
}


function mostrarProductosFiltrados(filtro) {
  const cards = document.getElementById('cardsProductos');
  if (!cards) return;
  let productos = productosCache;
  if (filtro) {
    productos = productos.filter(p =>
      p.nombre.toLowerCase().includes(filtro) ||
      (p.categoria && p.categoria.toLowerCase().includes(filtro))
    );
  }
  if (productos.length === 0) {
    cards.innerHTML = '<div class="text-center text-muted">No se encontraron productos</div>';
    return;
  }
  cards.innerHTML = productos.map(p => {
    let imgSrc = '';
    if (p.imagen_url) {
      imgSrc = p.imagen_url.startsWith('/uploads/') ? `http://localhost:4000${p.imagen_url}` : p.imagen_url;
    }
    const borde = p.stock <= 5 ? 'border-danger' : 'border-success';
    return `
    <div class="col-12 col-md-4 mb-3 d-flex justify-content-center">
      <div class="card h-100 shadow-sm ${borde} producto-animada" style="border-width:2px;max-width:320px;width:100%;">
        ${imgSrc ? 
          `<div class="product-image-container">
             <img src="${imgSrc}" class="card-img-top" alt="${p.nombre}" loading="lazy">
           </div>` : 
          `<div class="product-image-container">
             <div class="no-image-placeholder">
               <i class="fas fa-box"></i>
             </div>
           </div>`
        }
        <div class="card-body p-2">
          <h6 class="card-title mb-1" style="font-size:1rem;">${p.nombre}</h6>
          <p class="card-text mb-1" style="font-size:0.9rem;">${p.descripcion || ''}</p>
          <ul class="list-group list-group-flush mb-2" style="font-size:0.85rem;">
            <li class="list-group-item"><b>Categoría:</b> ${p.categoria}</li>
            <li class="list-group-item"><b>Compra:</b> ${p.precio_compra}</li>
            <li class="list-group-item"><b>Venta:</b> ${p.precio_venta}</li>
            <li class="list-group-item"><b>Stock:</b> ${p.stock}</li>
            <li class="list-group-item"><b>Proveedor:</b> ${p.proveedor}</li>
          </ul>
          <button class='btn btn-sm btn-primary me-1 btn-animado' style="font-size:0.85rem;" onclick='editarProducto(${p.id})'>Editar</button>
          <button class='btn btn-sm btn-danger btn-animado' style="font-size:0.85rem;" onclick='eliminarProducto(${p.id})'>Eliminar</button>
        </div>
      </div>
    </div>
    `;
  }).join('');
}

window.eliminarProducto = async function(id) {
  if (!confirm('¿Eliminar producto?')) return;
  try {
    const res = await fetch(`http://localhost:4000/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    const data = await res.json();
    if (res.ok) {
      mostrarToast('Producto eliminado', 'success');
      cargarProductos();
    } else {
      mostrarToast(data.error || 'Error al eliminar', 'danger');
    }
  } catch {
    mostrarToast('Error de conexión', 'danger');
  }
}

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

// Evento de carga de página
document.addEventListener('DOMContentLoaded', function() {
  mostrarToast('Módulo de Inventario cargado correctamente', 'success');
  
  // Inicializar búsqueda de productos
  initBusquedaProductos();
});

// Variables para almacenar productos y estado de búsqueda
let productosOriginales = [];
let timeoutBusqueda = null;

// Función para inicializar la búsqueda
function initBusquedaProductos() {
  const inputBuscar = document.getElementById('buscarProducto');
  if (!inputBuscar) {
    console.log('❌ No se encontró el input buscarProducto');
    return;
  }
  
  console.log('✅ Input de búsqueda de productos encontrado');
  
  inputBuscar.addEventListener('input', function() {
    clearTimeout(timeoutBusqueda);
    const query = this.value.trim().toLowerCase();
    console.log('🔍 Búsqueda productos:', query);
    
    // Debounce para evitar búsquedas excesivas
    timeoutBusqueda = setTimeout(() => {
      filtrarProductos(query);
    }, 300);
  });
  
  // Limpiar búsqueda con Escape
  inputBuscar.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      this.value = '';
      mostrarTodosProductos();
    }
  });
}

// Función para filtrar productos en tiempo real
function filtrarProductos(query) {
  const productCards = document.querySelectorAll('#cardsProductos .col-12');
  let productosEncontrados = 0;
  
  console.log('🔍 Filtrando productos. Query:', query, 'Cards encontradas:', productCards.length);
  
  if (query === '') {
    mostrarTodosProductos();
    return;
  }
  
  productCards.forEach(card => {
    const cardContent = card.textContent.toLowerCase();
    const esVisible = cardContent.includes(query);
    
    if (esVisible) {
      card.style.display = 'block';
      card.style.animation = 'fadeIn 0.3s ease';
      productosEncontrados++;
    } else {
      card.style.display = 'none';
    }
  });
  
  console.log('📊 Productos encontrados:', productosEncontrados);
  
  // Mostrar mensaje si no hay resultados
  mostrarResultadosBusqueda(productosEncontrados, query);
}

// Función para mostrar todos los productos
function mostrarTodosProductos() {
  const productCards = document.querySelectorAll('#cardsProductos .col-12');
  productCards.forEach(card => {
    card.style.display = 'block';
    card.style.animation = 'fadeIn 0.3s ease';
  });
  
  // Remover mensaje de búsqueda si existe
  const mensajeBusqueda = document.getElementById('mensajeBusqueda');
  if (mensajeBusqueda) {
    mensajeBusqueda.remove();
  }
}

// Función para mostrar resultados de búsqueda
function mostrarResultadosBusqueda(cantidad, query) {
  // Remover mensaje anterior si existe
  const mensajeAnterior = document.getElementById('mensajeBusqueda');
  if (mensajeAnterior) {
    mensajeAnterior.remove();
  }
  
  // Crear nuevo mensaje
  const productCards = document.getElementById('cardsProductos');
  const mensaje = document.createElement('div');
  mensaje.id = 'mensajeBusqueda';
  mensaje.className = 'col-12 mb-3';
  
  if (cantidad === 0) {
    mensaje.innerHTML = `
      <div class="alert alert-warning text-center">
        <i class="fas fa-search me-2"></i>
        <strong>Sin resultados</strong><br>
        No se encontraron productos que coincidan con "<strong>${query}</strong>"
        <br><small class="text-muted">Intenta con otro término de búsqueda</small>
      </div>
    `;
  } else {
    mensaje.innerHTML = `
      <div class="alert alert-info text-center">
        <i class="fas fa-check-circle me-2"></i>
        <strong>${cantidad} producto(s) encontrado(s)</strong> para "<strong>${query}</strong>"
      </div>
    `;
  }
  
  productCards.insertBefore(mensaje, productCards.firstChild);
}
