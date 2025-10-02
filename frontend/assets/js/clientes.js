// JS base para gestión de clientes, adaptado de productos.js

document.addEventListener('DOMContentLoaded', () => {
  // Proteger acceso: si no hay token, redirigir a login
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
    return;
  }

  // Mostrar mensaje de carga exitosa con animación
  mostrarToast('Módulo de Clientes cargado correctamente', 'success');
  
  // Inicializar búsqueda de clientes
  initBusquedaClientes();

  // Efectos de entrada para elementos de la página
  initAnimacionesEntrada();

  cargarClientes();

  // Limpiar formulario al abrir modal de agregar cliente con efectos
  const btnAgregar = document.querySelector('[data-bs-target="#modalCliente"]');
  if (btnAgregar) {
    btnAgregar.addEventListener('click', () => {
      const formCliente = document.getElementById('formCliente');
      if (formCliente) {
        formCliente.reset();
        formCliente.removeAttribute('data-id');
        limpiarErroresFormulario(formCliente);
        
        // Efecto de entrada del modal
        setTimeout(() => {
          const modal = document.getElementById('modalCliente');
          modal.classList.add('modal-enhanced');
          
          // Inicializar validación en tiempo real
          initValidacionTiempoReal();
          
          // Animación de entrada de campos
          const campos = modal.querySelectorAll('.form-control, .form-select');
          campos.forEach((campo, index) => {
            campo.style.opacity = '0';
            campo.style.transform = 'translateY(10px)';
            setTimeout(() => {
              campo.style.transition = 'all 0.3s ease';
              campo.style.opacity = '1';
              campo.style.transform = 'translateY(0)';
            }, index * 50);
          });
        }, 100);
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
        // Mostrar efectos de carga - buscar botón por ID primero
        const btnGuardar = document.getElementById('btnGuardarCliente') || 
                          e.target.querySelector('[type="submit"]') ||
                          document.querySelector('#formCliente [type="submit"]');
        
        console.log('Botón guardar encontrado:', !!btnGuardar); // Debug
        
        if (btnGuardar) {
          mostrarCargandoBtn(btnGuardar, id ? 'Actualizando...' : 'Guardando...');
        } else {
          console.error('No se encontró el botón guardar en clientes');
        }
        
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          },
          body: JSON.stringify(datos)
        });
        const data = await res.json();
        
        // Restaurar botón
        if (btnGuardar) {
          ocultarCargandoBtn(btnGuardar);
        }
        
        if (res.ok) {
          mostrarToast(id ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente', 'success');
          cargarClientes();
          formCliente.reset();
          formCliente.removeAttribute('data-id');
          limpiarErroresFormulario(formCliente);
          
          // Cerrar el modal con efecto
          const modal = bootstrap.Modal.getInstance(document.getElementById('modalCliente'));
          const modalElement = document.getElementById('modalCliente');
          modalElement.style.transition = 'all 0.3s ease';
          modal?.hide();
        } else {
          mostrarToast(data.error || 'Error al guardar cliente', 'danger');
        }
      } catch {
        // Restaurar botón en caso de error
        const btnGuardar = document.getElementById('btnGuardarCliente') || 
                          e.target.querySelector('[type="submit"]');
        if (btnGuardar) {
          ocultarCargandoBtn(btnGuardar);
        }
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

// Variables para búsqueda de clientes
let timeoutBusquedaClientes = null;

// Función para inicializar la búsqueda de clientes
function initBusquedaClientes() {
  const inputBuscar = document.getElementById('buscarCliente');
  if (!inputBuscar) {
    console.log('❌ No se encontró el input buscarCliente');
    return;
  }
  
  console.log('✅ Input de búsqueda de clientes encontrado');
  
  inputBuscar.addEventListener('input', function() {
    clearTimeout(timeoutBusquedaClientes);
    const query = this.value.trim().toLowerCase();
    console.log('🔍 Búsqueda clientes:', query);
    
    // Debounce para evitar búsquedas excesivas
    timeoutBusquedaClientes = setTimeout(() => {
      filtrarClientes(query);
    }, 300);
  });
  
  // Limpiar búsqueda con Escape
  inputBuscar.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      this.value = '';
      mostrarTodosClientes();
    }
  });
}

// Función para filtrar clientes en tiempo real
function filtrarClientes(query) {
  const clientCards = document.querySelectorAll('#cardsClientes .col-12');
  let clientesEncontrados = 0;
  
  console.log('🔍 Filtrando clientes. Query:', query, 'Cards encontradas:', clientCards.length);
  
  if (query === '') {
    mostrarTodosClientes();
    return;
  }
  
  clientCards.forEach(card => {
    const cardContent = card.textContent.toLowerCase();
    const esVisible = cardContent.includes(query);
    
    if (esVisible) {
      card.style.display = 'block';
      card.style.animation = 'fadeIn 0.3s ease';
      clientesEncontrados++;
    } else {
      card.style.display = 'none';
    }
  });
  
  console.log('📊 Clientes encontrados:', clientesEncontrados);
  
  // Mostrar mensaje si no hay resultados
  mostrarResultadosBusquedaClientes(clientesEncontrados, query);
}

// Función para mostrar todos los clientes
function mostrarTodosClientes() {
  const clientCards = document.querySelectorAll('#cardsClientes .col-12');
  clientCards.forEach(card => {
    card.style.display = 'block';
    card.style.animation = 'fadeIn 0.3s ease';
  });
  
  // Remover mensaje de búsqueda si existe
  const mensajeBusqueda = document.getElementById('mensajeBusquedaClientes');
  if (mensajeBusqueda) {
    mensajeBusqueda.remove();
  }
}

// Función para mostrar resultados de búsqueda de clientes
function mostrarResultadosBusquedaClientes(cantidad, query) {
  // Remover mensaje anterior si existe
  const mensajeAnterior = document.getElementById('mensajeBusquedaClientes');
  if (mensajeAnterior) {
    mensajeAnterior.remove();
  }
  
  // Crear nuevo mensaje
  const clientCards = document.getElementById('cardsClientes');
  const mensaje = document.createElement('div');
  mensaje.id = 'mensajeBusquedaClientes';
  mensaje.className = 'col-12 mb-3';
  
  if (cantidad === 0) {
    mensaje.innerHTML = `
      <div class="alert alert-warning text-center">
        <i class="fas fa-search me-2"></i>
        <strong>Sin resultados</strong><br>
        No se encontraron clientes que coincidan con "<strong>${query}</strong>"
        <br><small class="text-muted">Intenta con otro término de búsqueda</small>
      </div>
    `;
  } else {
    mensaje.innerHTML = `
      <div class="alert alert-info text-center">
        <i class="fas fa-check-circle me-2"></i>
        <strong>${cantidad} cliente(s) encontrado(s)</strong> para "<strong>${query}</strong>"
      </div>
    `;
  }
  
  clientCards.insertBefore(mensaje, clientCards.firstChild);
}

// Función de toast para clientes
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

// Función para debug del formulario de clientes - llamar desde consola: debugFormularioClientes()
function debugFormularioClientes() {
  console.log('=== DEBUG FORMULARIO CLIENTES ===');
  const formCliente = document.getElementById('formCliente');
  const btnGuardarId = document.getElementById('btnGuardarCliente');
  const btnGuardarType = document.querySelector('button[type="submit"]');
  const btnGuardarForm = formCliente ? formCliente.querySelector('button[type="submit"]') : null;
  const modal = document.getElementById('modalCliente');
  
  console.log('Formulario encontrado:', !!formCliente);
  console.log('Botón por ID encontrado:', !!btnGuardarId);
  console.log('Botón por type encontrado:', !!btnGuardarType);
  console.log('Botón dentro del form encontrado:', !!btnGuardarForm);
  console.log('Modal encontrado:', !!modal);
  
  if (formCliente) {
    console.log('ID del formulario:', formCliente.id);
    console.log('Formulario válido:', formCliente.checkValidity());
    console.log('Elementos del formulario:', formCliente.elements.length);
    
    // Verificar campos requeridos
    const camposRequeridos = formCliente.querySelectorAll('[required]');
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
    const botonesEnForm = formCliente.querySelectorAll('button');
    console.log('Botones dentro del formulario:', botonesEnForm.length);
    botonesEnForm.forEach((btn, index) => {
      console.log(`Botón ${index + 1}:`, {
        type: btn.type,
        id: btn.id,
        texto: btn.textContent.trim().substring(0, 20)
      });
    });
  }
  
  if (btnGuardarId) {
    console.log('Botón ID - deshabilitado:', btnGuardarId.disabled);
    console.log('Botón ID - texto:', btnGuardarId.textContent.trim());
    console.log('Botón ID - formulario padre:', btnGuardarId.closest('form')?.id);
  }
}

// ============== FUNCIONES DE ANIMACIÓN MEJORADAS ==============

// Inicializar animaciones de entrada para elementos de la página
function initAnimacionesEntrada() {
  // Animar welcome section
  const welcomeSection = document.querySelector('.welcome-section');
  if (welcomeSection) {
    welcomeSection.style.opacity = '0';
    welcomeSection.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      welcomeSection.style.transition = 'all 0.6s ease';
      welcomeSection.style.opacity = '1';
      welcomeSection.style.transform = 'translateY(0)';
    }, 100);
  }

  // Animar cards existentes con delay escalonado
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'all 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 200 + (index * 100));
  });
}

// Efecto de carga para el botón de guardar
function mostrarCargandoBtn(btn, texto = 'Guardando...') {
  btn.disabled = true;
  const contenidoOriginal = btn.innerHTML;
  btn.setAttribute('data-original-content', contenidoOriginal);
  btn.innerHTML = `
    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
    ${texto}
  `;
  btn.classList.add('btn-loading');
}

// Restaurar botón después de la carga
function ocultarCargandoBtn(btn) {
  btn.disabled = false;
  const contenidoOriginal = btn.getAttribute('data-original-content');
  if (contenidoOriginal) {
    btn.innerHTML = contenidoOriginal;
    btn.removeAttribute('data-original-content');
  }
  btn.classList.remove('btn-loading');
}

// Efecto de validación en tiempo real para inputs
function initValidacionTiempoReal() {
  const inputs = document.querySelectorAll('#formCliente .form-control');
  inputs.forEach(input => {
    input.addEventListener('input', function() {
      // Remover clases de error previas
      this.classList.remove('is-invalid');
      const errorDiv = this.nextElementSibling;
      if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
        errorDiv.remove();
      }
      
      // Agregar efecto visual de éxito si el campo está válido
      if (this.value.trim().length > 0) {
        this.classList.add('is-valid');
        setTimeout(() => {
          this.classList.remove('is-valid');
        }, 1000);
      }
    });
    
    // Efecto de enfoque
    input.addEventListener('focus', function() {
      this.style.transform = 'scale(1.02)';
      this.style.transition = 'transform 0.2s ease';
    });
    
    input.addEventListener('blur', function() {
      this.style.transform = 'scale(1)';
    });
  });
}
