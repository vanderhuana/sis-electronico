// JS base para gestión de clientes, adaptado de productos.js

document.addEventListener('DOMContentLoaded', () => {
  // Proteger acceso: si no hay token, redirigir a login
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
    return;
  }

  // Mostrar mensaje de carga exitosa
  mostrarToast('Módulo de Clientes cargado correctamente', 'success');

  cargarClientes();

  // Limpiar formulario al abrir modal de agregar cliente
  const btnAgregar = document.querySelector('[data-bs-target="#modalCliente"]');
  if (btnAgregar) {
    btnAgregar.addEventListener('click', () => {
      const formCliente = document.getElementById('formCliente');
      if (formCliente) {
        formCliente.reset();
        formCliente.removeAttribute('data-id');
          limpiarErroresFormulario(formCliente);
      }
    });
  }

  // Evento para crear/editar cliente
  const formCliente = document.getElementById('formCliente');
  if (formCliente) {
    formCliente.addEventListener('submit', async function(e) {
      e.preventDefault();
        limpiarErroresFormulario(formCliente);
        let valido = true;
        // Validación nombre
        const nombre = formCliente.nombre.value.trim();
        if (!nombre || nombre.length < 2) {
          mostrarErrorCampo(formCliente.nombre, 'El nombre es requerido (mínimo 2 caracteres)');
          valido = false;
        }
        // Validación email
        const email = formCliente.email.value.trim();
        if (email && !/^\S+@\S+\.\S+$/.test(email)) {
          mostrarErrorCampo(formCliente.email, 'Email no válido');
          valido = false;
        }
        // Validación teléfono
        const telefono = formCliente.telefono.value.trim();
        if (telefono && (!/^\d{7,}$/.test(telefono))) {
          mostrarErrorCampo(formCliente.telefono, 'Teléfono debe ser numérico y mínimo 7 dígitos');
          valido = false;
        }
        // Validación dirección (obligatorio)
        const direccion = formCliente.direccion.value.trim();
        if (!direccion || direccion.length < 5) {
          mostrarErrorCampo(formCliente.direccion, 'La dirección es obligatoria y debe tener mínimo 5 caracteres');
          valido = false;
        }
        if (!valido) return;
      const datos = {
  nombre: formCliente.nombre.value.trim(),
  correo: formCliente.email.value.trim(),
  telefono: formCliente.telefono.value.trim(),
  direccion: formCliente.direccion.value.trim()
      };
      const id = formCliente.getAttribute('data-id');
      let url = 'http://localhost:4000/api/clients';
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
          mostrarToast(id ? 'Cliente actualizado' : 'Cliente creado', 'success');
          cargarClientes();
          formCliente.reset();
          formCliente.removeAttribute('data-id');
            limpiarErroresFormulario(formCliente);
          // Cerrar el modal
          const modal = bootstrap.Modal.getInstance(document.getElementById('modalCliente'));
          modal?.hide();
        } else {
          mostrarToast(data.error || 'Error al guardar cliente', 'danger');
        }
      } catch {
        mostrarToast('Error de conexión', 'danger');
      }
    });
  }
});

async function cargarClientes() {
  const cards = document.getElementById('cardsClientes');
  if (!cards) return;
  cards.innerHTML = '<div class="text-center">Cargando...</div>';
  try {
    const res = await fetch('http://localhost:4000/api/clients', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    const clientes = await res.json();
    if (!Array.isArray(clientes)) {
      cards.innerHTML = '<div class="text-danger">Error al cargar clientes</div>';
      return;
    }
    cards.innerHTML = clientes.map(c => {
      return `
      <div class="col-12 col-md-4 mb-3 d-flex justify-content-center">
        <div class="card h-100 shadow-sm border-success producto-animada" style="border-width:2px;max-width:320px;width:100%;">
          <div class="card-body p-2">
            <h6 class="card-title mb-1" style="font-size:1rem;">${c.nombre} ${c.apellido || ''}</h6>
            <ul class="list-group list-group-flush mb-2" style="font-size:0.85rem;">
              <li class="list-group-item"><b>Email:</b> ${c.correo || ''}</li>
              <li class="list-group-item"><b>Teléfono:</b> ${c.telefono || ''}</li>
              <li class="list-group-item"><b>Dirección:</b> ${c.direccion || ''}</li>
            </ul>
            <button class='btn btn-sm btn-primary me-1 btn-animado' style="font-size:0.85rem;" onclick='editarCliente(${c.id})'>Editar</button>
            <button class='btn btn-sm btn-danger btn-animado' style="font-size:0.85rem;" onclick='eliminarCliente(${c.id})'>Eliminar</button>
          </div>
        </div>
      </div>
      `;
    }).join('');
  } catch {
    cards.innerHTML = '<div class="text-danger">Error al cargar clientes</div>';
  }
}

window.editarCliente = async function(id) {
  try {
    const res = await fetch(`http://localhost:4000/api/clients/${id}`, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    const c = await res.json();
    const formCliente = document.getElementById('formCliente');
    if (!formCliente) return;
    formCliente.nombre.value = c.nombre || '';
  formCliente.email.value = c.correo || '';
  formCliente.telefono.value = c.telefono || '';
  formCliente.direccion.value = c.direccion || '';
    formCliente.setAttribute('data-id', c.id);
    // Abrir el modal
    const modal = new bootstrap.Modal(document.getElementById('modalCliente'));
    modal.show();
  } catch (err) {
    mostrarToast('Error al cargar cliente', 'danger');
  }
}

window.eliminarCliente = async function(id) {
  if (!confirm('¿Eliminar cliente?')) return;
  try {
    const res = await fetch(`http://localhost:4000/api/clients/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    const data = await res.json();
    if (res.ok) {
      mostrarToast('Cliente eliminado', 'success');
      cargarClientes();
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
// ...existing code...
// Funciones de validación visual
function mostrarErrorCampo(input, mensaje) {
  let error = document.createElement('div');
  error.className = 'text-danger small mt-1';
  error.innerText = mensaje;
  error.setAttribute('data-error', 'true');
  input.classList.add('is-invalid');
  if (input.parentNode) {
    input.parentNode.appendChild(error);
  }
}

function limpiarErroresFormulario(form) {
  if (!form) return;
  Array.from(form.querySelectorAll('[data-error]')).forEach(e => e.remove());
  Array.from(form.querySelectorAll('.is-invalid')).forEach(e => e.classList.remove('is-invalid'));
}

// Puedes agregar funciones similares a las de productos.js para la gestión visual y funcional de clientes
