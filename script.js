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
    
    let paletasGuardadas = JSON.parse(localStorage.getItem('paletasColorsLife')) || [];

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

        const lock = document.createElement('button');
        lock.className = 'btn-lock';
        lock.textContent = '🔓';
        lock.dataset.locked = 'false';

        tarjeta.appendChild(box);
        tarjeta.appendChild(code);
        tarjeta.appendChild(lock);

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
        const tarjetasActuales = contenedor.querySelectorAll('.color-card');
        const diferencia = cantidad - tarjetasActuales.length;

        if (diferencia > 0) {
            for (let i = 0; i < diferencia; i++) {
                contenedor.appendChild(crearTarjeta(generarColorHex()));
            }
        } else if (diferencia < 0) {
            for (let i = 0; i < Math.abs(diferencia); i++) {
                contenedor.lastElementChild.remove();
            }
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

            // Agrega el nombre recuperado de la paleta
            const miniInfo = document.createElement('div');
            miniInfo.className = 'mini-info';
            miniInfo.innerHTML = `<span class="mini-nombre">${paleta.nombre}</span>`;

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

    btnGenerar.addEventListener('click', generarPaleta);

    btnesElegir.forEach(btn => {
        btn.addEventListener('click', () => {
            cantidadActual = parseInt(btn.dataset.cantidad, 10);
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
    });

    btnGuardar.addEventListener('click', () => {
        formGuardar.classList.toggle('oculto');
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

        localStorage.setItem('paletasColorsLife', JSON.stringify(paletasGuardadas));

        inputNombre.value = '';
        formGuardar.classList.add('oculto');
        mostrarPaletasGuardadas();
    });

    listaGuardadas.addEventListener('click', (e) => {
        const botonEliminar = e.target.closest('.btn-eliminar');
        
        if (botonEliminar) {
            const index = botonEliminar.dataset.index;
            paletasGuardadas.splice(index, 1);
            localStorage.setItem('paletasColorsLife', JSON.stringify(paletasGuardadas));
            mostrarPaletasGuardadas();
        }
    });

    crearPaletaInicial(cantidadActual);
    actualizarBotonesFormato(); 
    mostrarPaletasGuardadas(); 
});

