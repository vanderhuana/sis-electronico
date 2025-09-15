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
      window.location.href = 'dashboard.html';
    } else {
      errorDiv.textContent = data.error || 'Credenciales incorrectas';
      errorDiv.style.display = 'block';
    }
  } catch (err) {
    errorDiv.textContent = 'Error de conexión';
    errorDiv.style.display = 'block';
  }
});
