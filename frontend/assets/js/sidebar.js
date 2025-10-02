// Función para crear el sidebar universal dinámicamente
function cargarSidebar() {
  const sidebarHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark flex-column vh-100" style="width:240px;position:fixed;background:linear-gradient(135deg, #203A43 0%, #2C5364 50%, #0F2027 100%);box-shadow: 4px 0 15px rgba(0,0,0,0.1);">
      <div class="navbar-brand mx-2 d-flex align-items-center" style="font-weight: bold; font-size: 1.2rem;">
        <span style="font-size: 1.5rem; margin-right: 8px;">⚡</span>
        <span style="font-weight: bold;">ElectroTech</span>
      </div>
      <div id="userInfo" class="mt-2"></div>
      <ul class="navbar-nav flex-column mt-3 w-100">
        <li class="nav-item">
          <a class="nav-link d-flex align-items-center" href="dashboard.html">
            <i class="fas fa-tachometer-alt me-2"></i>
            Panel de Control
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link d-flex align-items-center" href="productos.html">
            <i class="fas fa-boxes me-2"></i>
            Inventario
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link d-flex align-items-center" href="clientes.html">
            <i class="fas fa-users me-2"></i>
            Clientes
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link d-flex align-items-center" href="ventas.html">
            <i class="fas fa-shopping-cart me-2"></i>
            Ventas
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link d-flex align-items-center" href="reportes.html">
            <i class="fas fa-chart-bar me-2"></i>
            Reportes
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link d-flex align-items-center" href="consulta.html">
            <i class="fas fa-search me-2"></i>
            Consulta Rápida
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link d-flex align-items-center" href="alertas.html">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Alertas
          </a>
        </li>
        <li class="nav-item mt-auto">
          <a class="nav-link d-flex align-items-center text-warning" href="login.html">
            <i class="fas fa-sign-out-alt me-2"></i>
            Cerrar Sesión
          </a>
        </li>
      </ul>
    </nav>
  `;
  
  const container = document.getElementById('sidebar-container');
  if (container) {
    container.innerHTML = sidebarHTML;
    
    // Activar la página actual en el sidebar
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('active');
      }
      
      // Event listener simple para cambio de estado
      link.addEventListener('click', function(e) {
        // Remover active de todos los enlaces
        navLinks.forEach(l => l.classList.remove('active'));
        // Agregar active al enlace clickeado
        this.classList.add('active');
      });
    });
    
    // Cargar info del usuario después de cargar el sidebar
    if (typeof mostrarInfoUsuarioEnSidebar === 'function') {
      mostrarInfoUsuarioEnSidebar();
    }
  }
}

// Cargar sidebar automáticamente
document.addEventListener('DOMContentLoaded', cargarSidebar);