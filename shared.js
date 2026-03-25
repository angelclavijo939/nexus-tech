/* ============================================================
   NEXUS TECH — SHARED LAYOUT (header + footer + whatsapp)
   Include this in all subpages: <script src="shared.js"></script>
   Call: NexusLayout.init() before closing </body>
============================================================ */

const NexusLayout = {
  header() {
    return `
    <div id="loader"><div class="loader-ring"></div><p class="loader-text">CARGANDO</p></div>
    <canvas id="particles-canvas"></canvas>
    <header id="header">
      <a href="index.html" class="logo">
        <div class="logo-icon">N</div>
        <span class="logo-text">NEXUS</span>
      </a>
      <button class="hamburger" id="hamburger" aria-label="Menú">
        <span></span><span></span><span></span>
      </button>
      <nav id="nav-menu">
        <a href="index.html">Inicio</a>
        <a href="index.html#services">Servicios</a>
        <a href="index.html#about">Quién soy</a>
        <a href="index.html#blog">Blog</a>
        <a href="index.html#contact">Contacto</a>
      </nav>
    </header>`;
  },

  footer() {
    return `
    <footer>
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="index.html" class="logo" style="margin-bottom:12px;display:inline-flex;">
            <div class="logo-icon">N</div>
            <span class="logo-text">NEXUS TECH</span>
          </a>
          <p>Empresa de tecnología dedicada a proyectos, marketing digital e IA.</p><br/>
          <div class="social-links">
            <a class="social-link" href="#" aria-label="LinkedIn">in</a>
            <a class="social-link" href="#" aria-label="Twitter">𝕏</a>
            <a class="social-link" href="#" aria-label="Instagram">ig</a>
            <a class="social-link" href="#" aria-label="YouTube">▶</a>
          </div>
        </div>
        <div class="footer-col">
          <h4>Servicios</h4>
          <a href="diseno-web.html">Diseño Web</a>
          <a href="desarrollo-software.html">Desarrollo de Software</a>
          <a href="escritura-traduccion.html">Escritura y Traducción</a>
          <a href="marketing-digital.html">Marketing Digital</a>
          <a href="servicios-ia.html">Servicios de IA</a>
          <a href="negocios.html">Negocios</a>
        </div>
        <div class="footer-col">
          <h4>Legal</h4>
          <a href="#">Políticas de privacidad</a>
          <a href="#">Términos de servicio</a>
          <a href="#">Soporte técnico</a>
          <a href="#">Cookies</a>
        </div>
        <div class="footer-col">
          <h4>Newsletter</h4>
          <p style="font-size:13px;color:var(--text-muted);margin-bottom:14px;line-height:1.6;">Recibe tendencias tech en tu correo.</p>
          <form class="newsletter-form" id="newsletter-form">
            <input type="email" placeholder="tu@correo.com" aria-label="Email" />
            <button type="submit">→</button>
          </form>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2025 Nexus Tech. Todos los derechos reservados. | hola@nexustech.co</p>
        <div class="footer-legal">
          <a href="#">Privacidad</a><a href="#">Términos</a><a href="#">Soporte</a>
        </div>
      </div>
    </footer>
    <a class="whatsapp-float" data-wa="3112241803" href="#" id="wa-btn" aria-label="WhatsApp" title="WhatsApp">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
    </a>`;
  },

  init() {
    // Inject header before first element
    document.body.insertAdjacentHTML('afterbegin', this.header());
    // Inject footer at end
    document.body.insertAdjacentHTML('beforeend', this.footer());
    // Load scripts
    const s = document.createElement('script');
    s.src = 'script.js'; document.body.appendChild(s);
    // WA link
    s.onload = () => {
      const wa = document.getElementById('wa-btn');
      if (wa) { wa.href = 'https://wa.me/' + wa.dataset.wa; wa.target = '_blank'; wa.rel = 'noopener noreferrer'; }
    };
  }
};
