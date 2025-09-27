// Función para crear el sidebar universal dinámicamente
function cargarSidebar() {
  const sidebarHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark flex-column vh-100" style="width:220px;position:fixed;background:#203A43;">
      <a class="navbar-brand mx-2" href="#" style="font-weight: bold; font-size: 1.2rem;">
        <i class="fas fa-microchip me-2" style="color: #fff;"></i>ElectroTech
      </a>
      <div id="userInfo" class="mt-2"></div>
      <ul class="navbar-nav flex-column mt-2">
        <li class="nav-item"><a class="nav-link" href="dashboard.html">Panel de Control</a></li>
        <li class="nav-item"><a class="nav-link" href="productos.html">Inventario</a></li>
        <li class="nav-item"><a class="nav-link" href="clientes.html">Clientes</a></li>
        <li class="nav-item"><a class="nav-link" href="ventas.html">Ventas</a></li>
        <li class="nav-item"><a class="nav-link" href="reportes.html">Reportes</a></li>
        <li class="nav-item"><a class="nav-link" href="consulta.html">Consulta Rápida</a></li>
        <li class="nav-item"><a class="nav-link" href="login.html">Logout</a></li>
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
    });
    
    // Cargar info del usuario después de cargar el sidebar
    if (typeof mostrarInfoUsuarioEnSidebar === 'function') {
      mostrarInfoUsuarioEnSidebar();
    }
  }
}

// Cargar sidebar automáticamente
document.addEventListener('DOMContentLoaded', cargarSidebar);