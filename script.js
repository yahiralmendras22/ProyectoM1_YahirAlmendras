document.addEventListener('DOMContentLoaded', () => {
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
    
    // PARCHE: lectura protegida del localStorage para que un dato corrupto
    // no rompa la carga completa de la página.

   let paletasGuardadas = [];
    try {
        const datosGuardados = localStorage.getItem('paletasColorsLife');
        paletasGuardadas = datosGuardados ? JSON.parse(datosGuardados) : [];
    } catch (error) {
        console.error('No se pudieron leer las paletas guardadas:', error);
        paletasGuardadas = [];
    }
 
    function generarColorHex() {
        const letras = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letras[Math.floor(Math.random() * 16)];
        }
        return color;
    }
 
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
 
    // NUEVO: agrega/quita la clase "cantidad-N" al contenedor para que el CSS
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
 
        // Botón para copiar el código actual (hex o hsl) al portapapeles
        const copiar = document.createElement('button');
        copiar.className = 'btn-copiar';
        copiar.textContent = '📋';
        copiar.title = 'Copiar código';
 
        acciones.appendChild(lock);
        acciones.appendChild(copiar);
 
        tarjeta.appendChild(box);
        tarjeta.appendChild(code);
        tarjeta.appendChild(acciones);
 
        return tarjeta;
    }
 
    function generarPaleta() {
        const tarjetas = document.querySelectorAll('.color-card');
        tarjetas.forEach(tarjeta => {
            const lock = tarjeta.querySelector('.btn-lock');
            const bloqueado = lock.dataset.locked === 'true';
 
            if (!bloqueado) {
                const nuevoColor = generarColorHex();
                tarjeta.dataset.hex = nuevoColor;
                tarjeta.querySelector('.color-box').style.backgroundColor = nuevoColor;
                tarjeta.querySelector('.color-code').textContent = formatearColor(nuevoColor);
            }
        });
    }
 
   function ajustarCantidadTarjetas(cantidad) {
    // Limpia por completo el contenedor para reiniciar el flujo
    contenedor.innerHTML = '';
    // Crea e inyecta la cantidad exacta de tarjetas requeridas
    for (let i = 0; i < cantidad; i++) {
        contenedor.appendChild(crearTarjeta(generarColorHex()));
    }
}

 
    function crearPaletaInicial(cantidad) {
        contenedor.innerHTML = '';
        for (let i = 0; i < cantidad; i++) {
            contenedor.appendChild(crearTarjeta(generarColorHex()));
        }
    }
 
    function mostrarPaletasGuardadas() {
        listaGuardadas.innerHTML = '';
 
        if (paletasGuardadas.length === 0) {
            listaGuardadas.innerHTML = '<p class="sin-guardadas">No hay paletas guardadas todavía.</p>';
            return;
        }
 
        paletasGuardadas.forEach((paleta, index) => {
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
            miniAcciones.innerHTML = `<button class="btn-eliminar" data-index="${index}" title="Borrar paleta">🗑️</button>`;
 
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
        ajustarCantidadTarjetas(cantidadActual); 
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
                tarjeta.classList.remove('is-locked');
            } else {
                lock.dataset.locked = 'true';
                lock.textContent = '🔒';
                tarjeta.classList.add('is-locked');
            }
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
        }
    });
 
    // MODIFICADO: el botón "Guardar Paleta" queda marcado como activo mientras el formulario está abierto
    btnGuardar.addEventListener('click', () => {
        formGuardar.classList.toggle('oculto');
        btnGuardar.classList.toggle('activo', !formGuardar.classList.contains('oculto'));
        inputNombre.focus();
    });
 
    btnConfirmar.addEventListener('click', () => {
        const nombre = inputNombre.value.trim() || "Mi Paleta";
        const tarjetas = document.querySelectorAll('.color-card');
        const coloresActuales = Array.from(tarjetas).map(t => t.dataset.hex);
 
        paletasGuardadas.push({
            nombre: nombre,
            colores: coloresActuales
        });
 
        // PARCHE: si el localStorage falla al guardar (por ejemplo, se llenó
        // la cuota disponible), se avisa al usuario y se revierte el cambio
        // en memoria en vez de dejar la app en un estado inconsistente.
        try {
            localStorage.setItem('paletasColorsLife', JSON.stringify(paletasGuardadas));
        } catch (error) {
            console.error('No se pudo guardar la paleta:', error);
            alert('No se pudo guardar la paleta. Puede que se haya alcanzado el límite de almacenamiento.');
            paletasGuardadas.pop();
            return;
        }
 
        inputNombre.value = '';
        formGuardar.classList.add('oculto');
        btnGuardar.classList.remove('activo'); // Se apaga el estado activo al confirmar
        mostrarPaletasGuardadas();
    });
 
    listaGuardadas.addEventListener('click', (e) => {
        const botonEliminar = e.target.closest('.btn-eliminar');
        
        if (botonEliminar) {
            // PARCHE: se convierte el índice a número explícitamente, ya que
            // dataset siempre devuelve strings.
            const index = parseInt(botonEliminar.dataset.index, 10);
            paletasGuardadas.splice(index, 1);
 
            try {
                localStorage.setItem('paletasColorsLife', JSON.stringify(paletasGuardadas));
            } catch (error) {
                console.error('No se pudo actualizar el almacenamiento tras borrar:', error);
            }
 
            mostrarPaletasGuardadas();
        }
    });
 
    crearPaletaInicial(cantidadActual);
    actualizarBotonesFormato(); 
    actualizarBotonesCantidad(); //*Marca "6" como activo al cargar
    actualizarClaseCantidad(); // Aplica "cantidad-6" al cargar
    mostrarPaletasGuardadas(); 
});