
document.addEventListener('DOMContentLoaded', () => {
    //evento del DOM//
    const btnGenerar = document.querySelector('.btn-palette');
    const btnesElegir = document.querySelectorAll('.btn-elegir button');
    const btnesFormato = document.querySelectorAll('.btn-formato');
    const contenedor = document.querySelector('.palette-container');
 
    const btnGuardar = document.querySelector('.btn-guardar');
    const formGuardar = document.querySelector('.form-guardar');
    const inputNombre = document.querySelector('.input-nombre-paleta');
    const btnConfirmar = document.querySelector('.btn-confirmar-guardar');
    const listaGuardadas = document.querySelector('.lista-guardadas');
 
    let cantidadActual = 6;
    let formatoActual = 'hex';
 
    const CLAVE_STORAGE = 'paletasColorsLife';
    const VERSION_STORAGE = 1;
 
    // ==========================================================
    // BLOQUE DE LOCALSTORAGE (mejorado)
    // ==========================================================
 
    function hayLocalStorage() {
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }
 
    function esPaletaValida(p) {
        return (
            p &&
            typeof p.id === 'string' &&
            typeof p.nombre === 'string' &&
            Array.isArray(p.colores) &&
            p.colores.every(c => typeof c === 'string')
        );
    }
 
    function leerPaletas() {
        if (!hayLocalStorage()) return [];
 
        try {
            const crudo = localStorage.getItem(CLAVE_STORAGE);
            if (!crudo) return [];
 
            const parsed = JSON.parse(crudo);
            const lista = Array.isArray(parsed?.paletas) ? parsed.paletas : [];
 
            // Filtra cualquier elemento mal formado en vez de asumir que todos son válidos
            return lista.filter(esPaletaValida);
        } catch (error) {
            console.error('No se pudieron leer las paletas guardadas:', error);
            return [];
        }
    }
 
    function guardarPaletas(paletas) {
        if (!hayLocalStorage()) return false;
 
        try {
            const payload = { version: VERSION_STORAGE, paletas };
            localStorage.setItem(CLAVE_STORAGE, JSON.stringify(payload));
            return true;
        } catch (error) {
            console.error('No se pudo guardar en localStorage:', error);
            return false;
        }
    }
 
    function generarId() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
 
    // Estado en memoria de las paletas guardadas (arranca leyendo del storage)
    let paletasGuardadas = leerPaletas();
 
    //funcion para que genere un color aleatorio//
 
    function generarColorHex() {

      const numero = Math.floor(Math.random() * 16777216);

      return "#" + numero.toString(16).padStart(6, "0").toUpperCase();

}
 
    //genera una funcion de codigo hsl//
 
    function hexToHsl(hex) {
        let r = parseInt(hex.slice(1, 3), 16) / 255;
        let g = parseInt(hex.slice(3, 5), 16) / 255;
        let b = parseInt(hex.slice(5, 7), 16) / 255;
 
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
 
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
 
        h = Math.round(h * 360);
        s = Math.round(s * 100);
        l = Math.round(l * 100);
 
        return `hsl(${h}, ${s}%, ${l}%)`;
    }
 
    function formatearColor(hex) {
        return formatoActual === 'hex' ? hex : hexToHsl(hex);
    }
 
    // Formatea la fecha ISO guardada en cada paleta a algo legible (dd/mm/aaaa)
    function formatearFecha(fechaIso) {
        try {
            const fecha = new Date(fechaIso);
            return fecha.toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        } catch {
            return '';
        }
    }
 
    function actualizarTextosFormato() {
        const tarjetas = document.querySelectorAll('.color-card');
        tarjetas.forEach(tarjeta => {
            const hex = tarjeta.dataset.hex;
            tarjeta.querySelector('.color-code').textContent = formatearColor(hex);
        });
    }
 
    function actualizarBotonesFormato() {
        btnesFormato.forEach(btn => {
            btn.classList.toggle('activo', btn.dataset.formato === formatoActual);
        });
    }
 
    // Marca visualmente cuál botón de cantidad está seleccionado
    function actualizarBotonesCantidad() {
        btnesElegir.forEach(btn => {
            btn.classList.toggle('activo', parseInt(btn.dataset.cantidad, 10) === cantidadActual);
        });
    }
 
    // Agrega/quita la clase "cantidad-N" al contenedor para que el CSS
    // pueda repartir las filas exactamente como corresponde (6->3+3, 8->4+4, 9->4+5).
    function actualizarClaseCantidad() {
        contenedor.classList.remove('cantidad-6', 'cantidad-8', 'cantidad-9');
        if ([6, 8, 9].includes(cantidadActual)) {
            contenedor.classList.add('cantidad-' + cantidadActual);
        }
    }
 
    function crearTarjeta(color) {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'color-card';
        tarjeta.dataset.hex = color;
 
        const box = document.createElement('div');
        box.className = 'color-box';
        box.style.backgroundColor = color;
 
        const code = document.createElement('div');
        code.className = 'color-code';
        code.textContent = formatearColor(color);
 
        // Contenedor para agrupar los botones de candado y copiar
        const acciones = document.createElement('div');
        acciones.className = 'card-acciones';
 
        const lock = document.createElement('button');
        lock.className = 'btn-lock';
        lock.textContent = '🔓';
        lock.dataset.locked = 'false';
        lock.setAttribute('aria-label', 'Bloquear color');
        lock.title = 'Bloquear color';
 
        // Botón para copiar el código actual (hex o hsl) al portapapeles
        const copiar = document.createElement('button');
        copiar.className = 'btn-copiar';
        copiar.textContent = '📋';
        copiar.title = 'Copiar código';
        copiar.setAttribute('aria-label', 'Copiar código de color');
 
        acciones.appendChild(lock);
        acciones.appendChild(copiar);
 
        tarjeta.appendChild(box);
        tarjeta.appendChild(code);
        tarjeta.appendChild(acciones);
 
        return tarjeta;
    }
 
    function generarPaleta() {

    document.querySelectorAll(".color-card").forEach(tarjeta => {

        const bloqueado =
            tarjeta.querySelector(".btn-lock").dataset.locked === "true";

        if (bloqueado) return;

        const color = generarColorHex();

        tarjeta.dataset.hex = color;

        tarjeta.querySelector(".color-box").style.backgroundColor = color;

        tarjeta.querySelector(".color-code").textContent =
            formatearColor(color);

    });

}
 
   function renderizarTarjetas(cantidad) {
    const tarjetas = Array.from(contenedor.querySelectorAll('.color-card'));

    // Agregar tarjetas si faltan
    while (tarjetas.length < cantidad) {
        const nuevaTarjeta = crearTarjeta(generarColorHex());
        contenedor.appendChild(nuevaTarjeta);
        tarjetas.push(nuevaTarjeta);
    }

    // Eliminar tarjetas si sobran
    while (tarjetas.length > cantidad) {
        const tarjeta = tarjetas.pop();
        tarjeta.remove();
    }
}

 
    function mostrarPaletasGuardadas() {
        listaGuardadas.innerHTML = '';
 
        if (paletasGuardadas.length === 0) {
            listaGuardadas.innerHTML = '<p class="sin-guardadas">No hay paletas guardadas todavía.</p>';
            return;
        }
 
        // botón de eliminar siempre borra la paleta correcta, sin importar
        // el orden en que se dibujen ni si hay clics rápidos seguidos.
        paletasGuardadas.forEach((paleta) => {
            const miniPaleta = document.createElement('div');
            miniPaleta.className = 'mini-paleta';
 
            // PARCHE: se arma el nombre con textContent (no innerHTML) para que
            // un nombre de paleta con caracteres tipo < > " no rompa el HTML
            // ni permita inyectar código (XSS).
            const miniInfo = document.createElement('div');
            miniInfo.className = 'mini-info';
 
            const spanNombre = document.createElement('span');
            spanNombre.className = 'mini-nombre';
            spanNombre.textContent = paleta.nombre;
 
            miniInfo.appendChild(spanNombre);
 
            // La fecha se guarda en cada paleta.
            // Ahora se pinta debajo del nombre.
            if (paleta.fecha) {
                const spanFecha = document.createElement('span');
                spanFecha.className = 'mini-fecha';
                spanFecha.textContent = formatearFecha(paleta.fecha);
                miniInfo.appendChild(spanFecha);
            }
 
            const miniColores = document.createElement('div');
            miniColores.className = 'mini-colores';
 
            paleta.colores.forEach(color => {
                const divColor = document.createElement('div');
                divColor.className = 'mini-color';
                divColor.style.backgroundColor = color;
                miniColores.appendChild(divColor);
            });
 
            const miniAcciones = document.createElement('div');
            miniAcciones.className = 'mini-acciones';
 
            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'btn-eliminar';
            btnEliminar.dataset.id = paleta.id; // id, no índice
            btnEliminar.title = 'Borrar paleta';
            btnEliminar.setAttribute('aria-label', `Borrar paleta ${paleta.nombre}`);
            btnEliminar.textContent = '🗑️';
            miniAcciones.appendChild(btnEliminar);
 
            miniPaleta.appendChild(miniInfo);
            miniPaleta.appendChild(miniColores);
            miniPaleta.appendChild(miniAcciones);
            listaGuardadas.appendChild(miniPaleta);
        });
    }
 
    // Agrega un destello visual (.activo) cada vez que se genera
    btnGenerar.addEventListener('click', () => {
        generarPaleta();
        btnGenerar.classList.add('activo');
        setTimeout(() => btnGenerar.classList.remove('activo'), 200);
    });
 
    // Cambio de cantidad de colores (6, 8, 9)
    btnesElegir.forEach(btn => {
        btn.addEventListener('click', () => {
            cantidadActual = parseInt(btn.dataset.cantidad, 10);
 
            // 1. Cambiamos la iluminación del botón seleccionado
            actualizarBotonesCantidad();
 
            // 2. Aplicamos inmediatamente la clase (cantidad-6, cantidad-8 o cantidad-9)
            actualizarClaseCantidad();
 
            // 3. Por último, borramos y creamos las tarjetas dentro del grid ya configurado
            renderizarTarjetas(cantidadActual);
        });
    });
 
 
    btnesFormato.forEach(btn => {
        btn.addEventListener('click', () => {
            const nuevoFormato = btn.dataset.formato;
            if (nuevoFormato === formatoActual) return;
 
            formatoActual = nuevoFormato;
            actualizarTextosFormato();
            actualizarBotonesFormato();
        });
    });
 
    contenedor.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-lock')) {
            const lock = e.target;
            const tarjeta = lock.closest('.color-card');
            const bloqueado = lock.dataset.locked === 'true';
 
            if (bloqueado) {
                lock.dataset.locked = 'false';
                lock.textContent = '🔓';
                lock.title = 'Bloquear color';
                lock.setAttribute('aria-label', 'Bloquear color');
                tarjeta.classList.remove('is-locked');
            } else {
                lock.dataset.locked = 'true';
                lock.textContent = '🔒';
                lock.title = 'Desbloquear color';
                lock.setAttribute('aria-label', 'Desbloquear color');
                tarjeta.classList.add('is-locked');
            }
            return;
        }
 
        // Copia el código (hex o hsl, según el formato activo) al portapapeles
        if (e.target.classList.contains('btn-copiar')) {
            const btnCopiar = e.target;
            const tarjeta = btnCopiar.closest('.color-card');
            const codigo = formatearColor(tarjeta.dataset.hex);
 
            navigator.clipboard.writeText(codigo).then(() => {
                const textoOriginal = btnCopiar.textContent;
                btnCopiar.textContent = '✅';
                btnCopiar.classList.add('copiado');
                setTimeout(() => {
                    btnCopiar.textContent = textoOriginal;
                    btnCopiar.classList.remove('copiado');
                }, 1000);
            }).catch(() => {
                alert('No se pudo copiar el código.');
            });
            return;
        }
 
    });
 
    // El botón "Guardar Paleta" queda marcado como activo mientras el formulario está abierto
    btnGuardar.addEventListener('click', () => {
        formGuardar.classList.toggle('oculto');
        btnGuardar.classList.toggle('activo', !formGuardar.classList.contains('oculto'));
        inputNombre.focus();
    });
 
    btnConfirmar.addEventListener('click', () => {
        const nombre = inputNombre.value.trim() || "Mi Paleta";
        const tarjetas = document.querySelectorAll('.color-card');
        const coloresActuales = Array.from(tarjetas).map(t => t.dataset.hex);
 
        const nuevaPaleta = {
            id: generarId(),
            nombre: nombre,
            colores: coloresActuales,
            fecha: new Date().toISOString(),
        };
 
        // MEJORA: array inmutable. En vez de mutar paletasGuardadas con push()
        // y tener que revertir con pop() si falla el guardado, armamos una
        // lista nueva primero y solo la "confirmamos" como estado real si
        // guardarPaletas() tuvo éxito. Así el estado en memoria nunca queda
        // desincronizado del storage, ni por un instante.
        const listaNueva = [...paletasGuardadas, nuevaPaleta];
        const ok = guardarPaletas(listaNueva);
 
        if (!ok) {
            alert('No se pudo guardar la paleta. Puede que se haya alcanzado el límite de almacenamiento.');
            return;
        }
 
        paletasGuardadas = listaNueva;
        inputNombre.value = '';
        formGuardar.classList.add('oculto');
        btnGuardar.classList.remove('activo'); // Se apaga el estado activo al confirmar
        mostrarPaletasGuardadas();
    });
 
    listaGuardadas.addEventListener('click', (e) => {
        const botonEliminar = e.target.closest('.btn-eliminar');
 
        if (botonEliminar) {
            const id = botonEliminar.dataset.id;
            const nombrePaleta = paletasGuardadas.find(p => p.id === id)?.nombre ?? 'esta paleta';
 
            // Confirmación antes de borrar para evitar pérdidas accidentales
            if (!confirm(`¿Borrar la paleta "${nombrePaleta}"? Esta acción no se puede deshacer.`)) {
                return;
            }
 
            // dispararon casi juntos: siempre se elimina la paleta correcta.
            const listaNueva = paletasGuardadas.filter(p => p.id !== id);
            const ok = guardarPaletas(listaNueva);
 
            if (!ok) {
                console.error('No se pudo actualizar el almacenamiento tras borrar.');
                alert('No se pudo actualizar el almacenamiento tras borrar.');
                return; // no toca el estado en memoria si no se pudo persistir
            }
 
            paletasGuardadas = listaNueva;
            mostrarPaletasGuardadas();
        }
    });
 
    renderizarTarjetas(cantidadActual);
    actualizarBotonesFormato();
    actualizarBotonesCantidad(); //*Marca "6" como activo al cargar
    actualizarClaseCantidad(); // Aplica "cantidad-6" al cargar
    mostrarPaletasGuardadas();
});
 