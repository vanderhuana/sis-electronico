// JS para gestión dinámica de ventas

document.addEventListener('DOMContentLoaded', () => {
  // Proteger acceso
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
    return;
  }
  
  // Mostrar mensaje de carga exitosa
  mostrarToast('Módulo de Ventas cargado correctamente', 'success');
  
  cargarClientes();
  cargarProductos().then(() => {
    inicializarFormularioVenta();
  });
  cargarHistorialVentas();
  
  // Agregar listener para cuando se abra el modal
  const modalVenta = document.getElementById('modalVenta');
  if (modalVenta) {
    modalVenta.addEventListener('shown.bs.modal', function () {
      console.log('Modal de venta abierto, reinicializando formulario'); // Debug
      // Reincializar el formulario cuando se abra el modal
      setTimeout(() => {
        inicializarFormularioVenta();
      }, 100);
    });
  }
});

let productosDisponibles = [];

function cargarClientes() {
  fetch('http://localhost:4000/api/clients', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  })
    .then(res => res.json())
    .then(clientes => {
      const select = document.getElementById('selectCliente');
      if (!select) return;
      select.innerHTML = clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    });
}

function cargarProductos() {
  return fetch('http://localhost:4000/api/products', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  })
    .then(res => res.json())
    .then(productos => {
      productosDisponibles = productos;
      inicializarProductosVenta();
    });
}

function inicializarFormularioVenta() {
  const btnAgregar = document.getElementById('btnAgregarProducto');
  if (btnAgregar) {
    btnAgregar.addEventListener('click', () => agregarProductoVenta());
  }
  
  // Agregar listener para descuento
  const descuentoInput = document.querySelector('[name="descuento"]');
  if (descuentoInput) {
    descuentoInput.addEventListener('input', calcularTotalVenta);
    descuentoInput.addEventListener('change', calcularTotalVenta);
  }
  
  // Agregar listener para el formulario de venta - con verificación más robusta
  const formVenta = document.getElementById('formVenta');
  if (formVenta) {
    // Remover listener anterior si existe
    formVenta.removeEventListener('submit', enviarVenta);
    // Agregar nuevo listener
    formVenta.addEventListener('submit', enviarVenta);
    console.log('Event listener para enviarVenta agregado correctamente'); // Debug
  } else {
    console.error('No se encontró el formulario formVenta'); // Debug
  }
  
  // También agregar listener directo al botón submit como respaldo
  const btnSubmit = document.querySelector('button[type="submit"]');
  if (btnSubmit) {
    btnSubmit.addEventListener('click', (e) => {
      console.log('Botón submit clickeado'); // Debug
      // Si el form submit no funciona, manejar manualmente
      if (!formVenta || !formVenta.checkValidity()) {
        e.preventDefault();
        if (formVenta) {
          formVenta.reportValidity();
        }
        return;
      }
    });
  }
  
  // Inicializar cálculo si ya hay productos
  setTimeout(() => {
    calcularTotalVenta();
  }, 500);
  
  // Agregar al menos un producto por defecto
  agregarProductoVenta();
}

function inicializarProductosVenta() {
  // Actualiza los selects de productos en los formularios dinámicos
  document.querySelectorAll('.selectProductoVenta').forEach(select => {
    const currentValue = select.value; // Guardar valor actual si existe
    select.innerHTML = '<option value="">Seleccionar producto...</option>' + 
      productosDisponibles.map(p => `<option value="${p.id}" data-precio="${p.precio_venta}">${p.nombre} - $${p.precio_venta}</option>`).join('');
    
    // Restaurar valor si existía
    if (currentValue) {
      select.value = currentValue;
    }
    
    // Forzar actualización del precio
    const row = select.closest('.row');
    if (row) {
      actualizarPrecioProducto(select);
    }
  });
}

function agregarProductoVenta() {
  const cont = document.getElementById('productosVenta');
  if (!cont) return;
  const idx = cont.children.length;
  const div = document.createElement('div');
  div.className = 'mb-3 animate-fade-in-up';
  div.innerHTML = `
    <div class="p-3 producto-item" style="background: white; border-radius: 12px; border: 2px solid #e9ecef; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: all 0.3s ease;">
      <div class="row g-3 align-items-end">
        <div class="col-md-5">
          <label class="form-label small fw-bold text-primary">
            <i class="fas fa-box me-1"></i>Producto
          </label>
          <select class="form-select selectProductoVenta input-electrotech shadow-sm" required style="border: 2px solid #dee2e6; border-radius: 8px;">
            <option value="">Seleccionar producto...</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label small fw-bold text-primary">
            <i class="fas fa-hashtag me-1"></i>Cantidad
          </label>
          <input type="number" class="form-control inputCantidadVenta input-electrotech shadow-sm" 
                 min="1" value="1" placeholder="1" required 
                 style="border: 2px solid #dee2e6; border-radius: 8px; text-align: center; font-weight: 600;">
        </div>
        <div class="col-md-4">
          <label class="form-label small fw-bold text-primary">
            <i class="fas fa-dollar-sign me-1"></i>Subtotal
          </label>
          <div class="input-group shadow-sm">
            <span class="input-group-text fw-bold" style="background: linear-gradient(135deg, #198754 0%, #20c997 100%); border: none; color: white;">
              $
            </span>
            <input type="text" class="form-control inputPrecioVenta input-electrotech fw-bold fs-6" 
                   placeholder="0.00" readonly 
                   style="border-left: none; background: #f8f9fa; text-align: right; color: #198754;">
          </div>
        </div>
        <div class="col-md-1">
          <button type="button" class="btn btn-outline-danger btn-sm btnQuitarProducto w-100 shadow-sm" 
                  title="Eliminar producto"
                  style="border-radius: 8px; border: 2px solid #dc3545; height: 38px;">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  cont.appendChild(div);
  inicializarProductosVenta();
  
  // Event listeners para actualización automática del precio
  const selectProducto = div.querySelector('.selectProductoVenta');
  const inputCantidad = div.querySelector('.inputCantidadVenta');
  
  selectProducto.addEventListener('change', (e) => actualizarPrecioProducto(e.target));
  inputCantidad.addEventListener('input', (e) => actualizarPrecioProducto(e.target));
  inputCantidad.addEventListener('change', (e) => actualizarPrecioProducto(e.target)); // Para mejor compatibilidad
  
  div.querySelector('.btnQuitarProducto').addEventListener('click', () => {
    div.remove();
    calcularTotalVenta();
  });
  
  // Calcular precio inicial
  actualizarPrecioProducto(selectProducto);
}

function actualizarPrecioProducto(elemento) {
  const row = elemento.closest('.row');
  const selectProducto = row.querySelector('.selectProductoVenta');
  const cantidadInput = row.querySelector('.inputCantidadVenta');
  let cantidad = parseInt(cantidadInput.value) || 1;
  
  if (isNaN(cantidad) || cantidad < 1) {
    mostrarErrorCampoCantidad(cantidadInput, 'La cantidad debe ser mayor a cero');
    cantidad = 1;
    cantidadInput.value = 1;
  } else {
    limpiarErrorCampoCantidad(cantidadInput);
  }
  
  let precio = 0;
  if (selectProducto.selectedOptions && selectProducto.selectedOptions.length > 0) {
    precio = parseFloat(selectProducto.selectedOptions[0].getAttribute('data-precio')) || 0;
  }
  
  // Calcular subtotal: precio unitario * cantidad
  const subtotal = precio * cantidad;
  const inputPrecio = row.querySelector('.inputPrecioVenta');
  inputPrecio.value = subtotal.toFixed(2);
  
  // Efecto visual en el subtotal
  inputPrecio.style.backgroundColor = '#d1e7dd';
  setTimeout(() => {
    inputPrecio.style.backgroundColor = '#f8f9fa';
  }, 300);
  
  // Recalcular el total general
  calcularTotalVenta();
}

// Mensaje de error para cantidad
function mostrarErrorCampoCantidad(input, mensaje) {
  let error = input.parentNode.querySelector('.error-cantidad');
  if (!error) {
    error = document.createElement('div');
    error.className = 'text-danger small mt-1 error-cantidad';
    input.parentNode.appendChild(error);
  }
  error.innerText = mensaje;
  input.classList.add('is-invalid');
}

function limpiarErrorCampoCantidad(input) {
  let error = input.parentNode.querySelector('.error-cantidad');
  if (error) error.remove();
  input.classList.remove('is-invalid');
}

function calcularTotalVenta() {
  let subtotal = 0;
  let productosValidos = 0;
  
  // Calcular subtotal de todos los productos
  document.querySelectorAll('#productosVenta .row').forEach(row => {
    const precioInput = row.querySelector('.inputPrecioVenta');
    if (precioInput) {
      const precio = parseFloat(precioInput.value) || 0;
      subtotal += precio;
      if (precio > 0) productosValidos++;
    }
  });
  
  console.log('Subtotal calculado:', subtotal, 'Productos válidos:', productosValidos); // Debug
  
  const descuentoInput = document.querySelector('[name="descuento"]');
  const descuento = descuentoInput ? (parseFloat(descuentoInput.value) || 0) : 0;
  const total = Math.max(0, subtotal - descuento); // No permitir totales negativos
  
  // Actualizar el campo total con efecto visual
  const totalInput = document.getElementById('totalVenta');
  if (totalInput) {
    totalInput.classList.add('loading-total');
    
    setTimeout(() => {
      totalInput.value = '$' + total.toFixed(2);
      totalInput.classList.remove('loading-total');
      totalInput.classList.add('updated');
      
      // Remover clase después de la animación
      setTimeout(() => {
        totalInput.classList.remove('updated');
      }, 500);
    }, 300);
  }
  
  // Actualizar también el descuento si hay productos
  if (descuentoInput && productosValidos > 0) {
    descuentoInput.setAttribute('max', subtotal.toFixed(2));
    descuentoInput.setAttribute('placeholder', `Máx: $${subtotal.toFixed(2)}`);
  }
}

function enviarVenta(e) {
  e.preventDefault();
  const form = e.target;
  const cliente_id = form.cliente_id.value;
  const usuario_id = localStorage.getItem('usuario_id') || 1; // Ajusta según tu login
  const metodo_pago = form.metodo_pago.value;
  const descuento = parseFloat(form.descuento.value) || 0;
  const items = Array.from(document.querySelectorAll('#productosVenta .row')).map(row => {
    const producto_id = row.querySelector('.selectProductoVenta').value;
    const cantidad = parseInt(row.querySelector('.inputCantidadVenta').value);
    const precio_unitario = parseFloat(row.querySelector('.selectProductoVenta').selectedOptions[0].getAttribute('data-precio'));
    return { producto_id, cantidad, precio_unitario };
  });
  // Mostrar indicador de carga - buscar por ID primero, luego por selector
  const btnSubmit = document.getElementById('btnRegistrarVenta') || 
                   form.querySelector('button[type="submit"]') || 
                   document.querySelector('button[type="submit"]');
  let originalText = '<i class="fas fa-check-circle me-2"></i>Registrar Venta';
  
  console.log('Botón encontrado:', !!btnSubmit); // Debug
  
  if (btnSubmit) {
    originalText = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Registrando...';
  } else {
    console.error('No se encontró el botón submit - verificar estructura HTML');
    mostrarToast('Error: No se puede procesar la venta', 'danger');
    return;
  }

  fetch('http://localhost:4000/api/sales', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify({ usuario_id, cliente_id, items, descuento, metodo_pago })
  })
    .then(res => res.json())
    .then(data => {
      // Restaurar botón
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalText;
      }
      
      if (data.venta_id) {
        // Mostrar mensaje de éxito con más detalles
        const totalVenta = document.getElementById('totalVenta').value;
        mostrarToastExito(`¡Venta registrada exitosamente!<br><strong>ID: ${data.venta_id}</strong><br>Total: ${totalVenta}`);
        
        // Limpiar formulario con animación
        limpiarFormularioVenta(form);
        
        // Recargar historial
        cargarHistorialVentas();
        
        // Cerrar modal con delay para que se vea el mensaje
        setTimeout(() => {
          const modal = bootstrap.Modal.getInstance(document.getElementById('modalVenta'));
          if (modal) {
            modal.hide();
          }
          
          // Redireccionar después de cerrar el modal
          setTimeout(() => {
            mostrarToast('¡Venta completada! Actualizando página...', 'info');
            setTimeout(() => {
              // Verificar si estamos en la página de ventas, sino redireccionar
              if (window.location.pathname.includes('ventas')) {
                window.location.reload(); // Recargar la página actual
              } else {
                window.location.href = 'ventas.html'; // Ir a la página de ventas
              }
            }, 1000);
          }, 500);
        }, 2000);
        
      } else {
        mostrarToast(data.error || 'Error al registrar venta', 'danger');
      }
    })
    .catch(() => {
      // Restaurar botón en caso de error
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalText;
      }
      mostrarToast('Error de conexión', 'danger');
    });
}

function cargarHistorialVentas() {
  fetch('http://localhost:4000/api/sales', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  })
    .then(res => res.json())
    .then(ventas => {
      const tabla = document.getElementById('tablaVentas');
      if (!tabla) return;
      tabla.innerHTML = `<table class="table table-bordered table-sm">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Precio Total</th>
            <th>Fecha</th>
            <th>Recibo</th>
          </tr>
        </thead>
        <tbody>
          ${ventas.map(v => v.productos.map(p => `
            <tr>
              <td>${v.id}</td>
              <td>${v.cliente_nombre}</td>
              <td>${p.producto_nombre}</td>
              <td>${p.cantidad}</td>
              <td>${p.precio_unitario}</td>
              <td>${p.precio_total}</td>
              <td>${v.fecha}</td>
              <td><a href="http://localhost:4000/api/sales/${v.id}/receipt" target="_blank" class="btn btn-outline-secondary btn-sm">PDF</a></td>
            </tr>
          `).join('')).join('')}
        </tbody>
      </table>`;
    });
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

// Función especial para mensaje de éxito con más tiempo de duración
function mostrarToastExito(msg) {
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) return;
  
  const toast = document.createElement('div');
  toast.className = 'toast align-items-center text-bg-success border-0 show mb-2';
  toast.role = 'alert';
  toast.style.cssText = 'min-width: 400px; box-shadow: 0 8px 25px rgba(25, 135, 84, 0.3);';
  toast.innerHTML = `
    <div class='d-flex'>
      <div class='toast-body'>
        <div class="d-flex align-items-center">
          <i class="fas fa-check-circle fa-2x me-3 text-white"></i>
          <div>${msg}</div>
        </div>
      </div>
      <button type='button' class='btn-close btn-close-white me-2 m-auto' onclick='this.parentElement.parentElement.remove()'></button>
    </div>
  `;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 6000); // 6 segundos para mensaje de éxito
}

// Función para limpiar formulario con animación
function limpiarFormularioVenta(form) {
  // Limpiar con efectos visuales
  const productosContainer = document.getElementById('productosVenta');
  const totalInput = document.getElementById('totalVenta');
  
  // Animación de salida
  if (productosContainer.children.length > 0) {
    Array.from(productosContainer.children).forEach((producto, index) => {
      setTimeout(() => {
        producto.style.transform = 'translateX(-100%)';
        producto.style.opacity = '0';
        setTimeout(() => producto.remove(), 300);
      }, index * 100);
    });
  }
  
  // Limpiar total con animación
  totalInput.style.transform = 'scale(0.8)';
  totalInput.style.opacity = '0.5';
  
  setTimeout(() => {
    form.reset();
    totalInput.value = '';
    totalInput.style.transform = 'scale(1)';
    totalInput.style.opacity = '1';
    
    // Agregar un producto nuevo después del reset
    setTimeout(() => {
      agregarProductoVenta();
    }, 500);
  }, 1000);
}

// Función para debug de cálculos - llamar desde consola: debugCalculos()
function debugCalculos() {
  console.log('=== DEBUG CÁLCULOS ===');
  const filas = document.querySelectorAll('#productosVenta .row');
  console.log('Filas encontradas:', filas.length);
  
  filas.forEach((fila, index) => {
    const select = fila.querySelector('.selectProductoVenta');
    const cantidad = fila.querySelector('.inputCantidadVenta');
    const precio = fila.querySelector('.inputPrecioVenta');
    
    console.log(`Fila ${index + 1}:`, {
      producto: select ? select.value : 'N/A',
      productoTexto: select ? select.options[select.selectedIndex]?.text : 'N/A',
      cantidad: cantidad ? cantidad.value : 'N/A',
      subtotal: precio ? precio.value : 'N/A'
    });
  });
  
  const totalInput = document.getElementById('totalVenta');
  const descuentoInput = document.querySelector('[name="descuento"]');
  console.log('Total actual:', totalInput ? totalInput.value : 'N/A');
  console.log('Descuento actual:', descuentoInput ? descuentoInput.value : 'N/A');
  console.log('Productos disponibles:', productosDisponibles.length);
}

// Función para debug del formulario - llamar desde consola: debugFormulario()
function debugFormulario() {
  console.log('=== DEBUG FORMULARIO ===');
  const formVenta = document.getElementById('formVenta');
  const btnSubmitId = document.getElementById('btnRegistrarVenta');
  const btnSubmitType = document.querySelector('button[type="submit"]');
  const btnSubmitForm = formVenta ? formVenta.querySelector('button[type="submit"]') : null;
  const modal = document.getElementById('modalVenta');
  
  console.log('Formulario encontrado:', !!formVenta);
  console.log('Botón por ID encontrado:', !!btnSubmitId);
  console.log('Botón por type encontrado:', !!btnSubmitType);
  console.log('Botón dentro del form encontrado:', !!btnSubmitForm);
  console.log('Modal encontrado:', !!modal);
  
  if (formVenta) {
    console.log('ID del formulario:', formVenta.id);
    console.log('Formulario válido:', formVenta.checkValidity());
    console.log('Elementos del formulario:', formVenta.elements.length);
    console.log('HTML del formulario (primeros 200 chars):', formVenta.outerHTML.substring(0, 200));
    
    // Verificar campos requeridos
    const camposRequeridos = formVenta.querySelectorAll('[required]');
    console.log('Campos requeridos:', camposRequeridos.length);
    camposRequeridos.forEach((campo, index) => {
      console.log(`Campo ${index + 1}:`, {
        name: campo.name,
        type: campo.type,
        value: campo.value,
        valid: campo.checkValidity(),
        required: campo.required
      });
    });
    
    // Verificar si el botón está realmente dentro del formulario
    const botonesEnForm = formVenta.querySelectorAll('button');
    console.log('Botones dentro del formulario:', botonesEnForm.length);
    botonesEnForm.forEach((btn, index) => {
      console.log(`Botón ${index + 1}:`, {
        type: btn.type,
        id: btn.id,
        texto: btn.textContent.trim().substring(0, 20)
      });
    });
  }
  
  if (btnSubmitId) {
    console.log('Botón ID - deshabilitado:', btnSubmitId.disabled);
    console.log('Botón ID - texto:', btnSubmitId.textContent.trim());
    console.log('Botón ID - formulario padre:', btnSubmitId.closest('form')?.id);
  }
}
