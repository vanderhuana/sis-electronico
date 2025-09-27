// Función para mostrar toast notifications
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
  toast.role = 'alert';
  toast.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Mostrar mensaje de bienvenida al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  showToast('¡Bienvenido a ElectroTech! Inicia sesión para continuar.', 'info');
});

document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const usuario = document.getElementById('usuario').value.trim();
  const contrasena = document.getElementById('contrasena').value;
  const errorDiv = document.getElementById('loginError');
  errorDiv.style.display = 'none';

  try {
    const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, contrasena })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', data.usuario);
      localStorage.setItem('rol', data.rol);
      showToast('¡Login exitoso! Redirigiendo al dashboard...', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 1500);
    } else {
      showToast(data.error || 'Credenciales incorrectas', 'danger');
      errorDiv.textContent = data.error || 'Credenciales incorrectas';
      errorDiv.style.display = 'block';
    }
  } catch (err) {
    showToast('Error de conexión con el servidor', 'danger');
    errorDiv.textContent = 'Error de conexión';
    errorDiv.style.display = 'block';
  }
});
