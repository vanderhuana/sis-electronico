// JS para gestión dinámica de ventas

document.addEventListener('DOMContentLoaded', () => {
  // Proteger acceso
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
    return;
  }
  cargarClientes();
  cargarProductos().then(() => {
    inicializarFormularioVenta();
  });
  cargarHistorialVentas();
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
  agregarProductoVenta(); // Al menos un producto por defecto
  const formVenta = document.getElementById('formVenta');
  if (formVenta) {
    formVenta.addEventListener('submit', enviarVenta);
  }
}

function inicializarProductosVenta() {
  // Actualiza los selects de productos en los formularios dinámicos
  document.querySelectorAll('.selectProductoVenta').forEach(select => {
    select.innerHTML = productosDisponibles.map(p => `<option value="${p.id}" data-precio="${p.precio_venta}">${p.nombre}</option>`).join('');
    select.dispatchEvent(new Event('change'));
  });
}

function agregarProductoVenta() {
  const cont = document.getElementById('productosVenta');
  if (!cont) return;
  const idx = cont.children.length;
  const div = document.createElement('div');
  div.className = 'row g-2 align-items-end mb-2';
  div.innerHTML = `
    <div class="col-md-5">
      <select class="form-select selectProductoVenta" required></select>
    </div>
    <div class="col-md-3">
      <input type="number" class="form-control inputCantidadVenta" min="1" value="1" required>
    </div>
    <div class="col-md-3">
      <input type="text" class="form-control inputPrecioVenta" readonly>
    </div>
    <div class="col-md-1">
      <button type="button" class="btn btn-danger btn-sm btnQuitarProducto">&times;</button>
    </div>
  `;
  cont.appendChild(div);
  inicializarProductosVenta();
  div.querySelector('.selectProductoVenta').addEventListener('change', actualizarPrecioProducto);
  div.querySelector('.inputCantidadVenta').addEventListener('input', actualizarPrecioProducto);
  div.querySelector('.btnQuitarProducto').addEventListener('click', () => {
    div.remove();
    calcularTotalVenta();
  });
  actualizarPrecioProducto.call(div.querySelector('.selectProductoVenta'));
}

function actualizarPrecioProducto() {
  const select = this;
  const row = select.closest('.row');
  let cantidadInput = row.querySelector('.inputCantidadVenta');
  let cantidad = parseInt(cantidadInput.value);
  if (isNaN(cantidad) || cantidad < 1) {
    mostrarErrorCampoCantidad(cantidadInput, 'La cantidad debe ser mayor a cero');
    cantidad = 1;
    cantidadInput.value = 1;
  } else {
    limpiarErrorCampoCantidad(cantidadInput);
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
  let precio = 0;
  if (select.selectedOptions && select.selectedOptions.length > 0) {
    precio = parseFloat(select.selectedOptions[0].getAttribute('data-precio')) || 0;
  }
  row.querySelector('.inputPrecioVenta').value = (precio * cantidad).toFixed(2);
  calcularTotalVenta();
}

function calcularTotalVenta() {
  let subtotal = 0;
  document.querySelectorAll('#productosVenta .row').forEach(row => {
    const precio = parseFloat(row.querySelector('.inputPrecioVenta').value) || 0;
    subtotal += precio;
  });
  const descuento = parseFloat(document.querySelector('[name="descuento"]').value) || 0;
  const total = subtotal - descuento;
  document.getElementById('totalVenta').value = total.toFixed(2);
}

document.querySelectorAll('[name="descuento"]').forEach(input => {
  input.addEventListener('input', calcularTotalVenta);
});

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
      if (data.venta_id) {
        mostrarToast('Venta registrada', 'success');
        cargarHistorialVentas();
        form.reset();
        document.getElementById('productosVenta').innerHTML = '';
        agregarProductoVenta();
        document.getElementById('totalVenta').value = '';
        // El PDF solo se descarga desde el historial, no aquí
      } else {
        mostrarToast(data.error || 'Error al registrar venta', 'danger');
      }
    })
    .catch(() => mostrarToast('Error de conexión', 'danger'));
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
