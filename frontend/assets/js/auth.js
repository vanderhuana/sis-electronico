// Utilitarios de autenticación para mostrar info del usuario en sidebar
function obtenerInfoUsuario() {
  const token = localStorage.getItem('token');
  if (!token) {
    return { usuario: 'Invitado', rol: 'sin acceso' };
  }
  
  try {
    // Decodificar el payload del JWT (solo la parte del payload, sin verificar la firma)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      usuario: payload.usuario || 'Usuario',
      rol: payload.rol || 'Usuario'
    };
  } catch (error) {
    console.error('Error decodificando token:', error);
    return { usuario: 'Usuario', rol: 'Usuario' };
  }
}

function mostrarInfoUsuarioEnSidebar() {
  const { usuario, rol } = obtenerInfoUsuario();
  const userInfoElement = document.getElementById('userInfo');
  if (userInfoElement) {
    userInfoElement.innerHTML = `
      <div class="user-info-card text-center text-white small mb-2">
        <i class="fas fa-user-circle mb-1"></i>
        <div class="fw-bold">${usuario}</div>
        <span class="badge bg-light text-dark mt-1">${rol}</span>
      </div>
    `;
    
    // Agregar estilos CSS dinámicamente si no existen
    if (!document.getElementById('userInfoStyles')) {
      const style = document.createElement('style');
      style.id = 'userInfoStyles';
      style.innerHTML = `
        .navbar.bg-primary {
          overflow-x: hidden !important;
          width: 220px !important;
        }
        
        #userInfo {
          width: 100%;
          box-sizing: border-box;
          overflow: hidden;
        }
        
        .user-info-card {
          background: linear-gradient(135deg, #dc3545, #c82333);
          border-radius: 8px;
          padding: 6px 4px;
          margin: 0 10px;
          box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: userInfoPulse 2s ease-in-out infinite;
          transition: transform 0.3s ease;
          max-width: calc(100% - 20px);
          overflow: hidden;
          word-wrap: break-word;
          box-sizing: border-box;
        }
        
        .user-info-card:hover {
          transform: scale(1.02);
          box-shadow: 0 3px 12px rgba(220, 53, 69, 0.4);
        }
        
        @keyframes userInfoPulse {
          0% { box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3); }
          50% { box-shadow: 0 3px 12px rgba(220, 53, 69, 0.5); }
          100% { box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3); }
        }
        
        .user-info-card .fas {
          font-size: 1em;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .user-info-card .badge {
          font-size: 0.65em;
          padding: 2px 6px;
          border-radius: 6px;
          font-weight: 600;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .user-info-card .fw-bold {
          font-size: 0.85em;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `;
      document.head.appendChild(style);
    }
  }
}

// Ejecutar cuando cargue la página
document.addEventListener('DOMContentLoaded', mostrarInfoUsuarioEnSidebar);