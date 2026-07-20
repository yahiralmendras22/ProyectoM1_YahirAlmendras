document.addEventListener('DOMContentLoaded', () => {
    const btnGenerar = document.querySelector('.btn-palette');
    const btnesElegir = document.querySelectorAll('.btn-elegir button');
    const btnesFormato = document.querySelectorAll('.btn-formato'); // NUEVO
    const contenedor = document.querySelector('.palette-container');

    let cantidadActual = 6;
    let formatoActual = 'hex'; // 'hex' o 'hsl'

    // Genera un color hexadecimal aleatorio
    function generarColorHex() {
        const letras = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letras[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Convierte HEX a HSL. Devuelve un string tipo "hsl(210, 50%, 40%)"
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

    // Devuelve el texto a mostrar según el formato actual, a partir del hex guardado
    function formatearColor(hex) {
        return formatoActual === 'hex' ? hex : hexToHsl(hex);
    }

    // Actualiza el texto de TODAS las tarjetas según el formato actual (sin cambiar colores)
    function actualizarTextosFormato() {
        const tarjetas = document.querySelectorAll('.color-card');
        tarjetas.forEach(tarjeta => {
            const hex = tarjeta.dataset.hex;
            tarjeta.querySelector('.color-code').textContent = formatearColor(hex);
        });
    }

    // Marca visualmente cuál botón de formato está activo
    function actualizarBotonesFormato() {
        btnesFormato.forEach(btn => {
            btn.classList.toggle('activo', btn.dataset.formato === formatoActual);
        });
    }

    // Crea una tarjeta de color
    function crearTarjeta(color) {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'color-card';
        tarjeta.dataset.hex = color; // guardamos el hex real acá

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

    // Genera nuevos colores solo en las tarjetas NO bloqueadas
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

    // Ajusta la CANTIDAD de tarjetas sin tocar el color de las que ya existen
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

    // Crea la paleta inicial con colores random (solo al cargar la página)
    function crearPaletaInicial(cantidad) {
        contenedor.innerHTML = '';
        for (let i = 0; i < cantidad; i++) {
            contenedor.appendChild(crearTarjeta(generarColorHex()));
        }
    }

    // Botón "Generar Paleta"
    btnGenerar.addEventListener('click', generarPaleta);

    // Botones de cantidad (6, 8, 9)
    btnesElegir.forEach(btn => {
        btn.addEventListener('click', () => {
            cantidadActual = parseInt(btn.dataset.cantidad, 10);
            ajustarCantidadTarjetas(cantidadActual);
        });
    });

    // Botones de formato (HEX / HSL)
    btnesFormato.forEach(btn => {
        btn.addEventListener('click', () => {
            const nuevoFormato = btn.dataset.formato;
            if (nuevoFormato === formatoActual) return; // ya está en ese formato, no hago nada(hex)

            formatoActual = nuevoFormato;
            actualizarTextosFormato();
            actualizarBotonesFormato();
        });
    });

    // Delegación de eventos para el candado
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

    // Genera la paleta inicial (con colores) al cargar la página
    crearPaletaInicial(cantidadActual);
    actualizarBotonesFormato(); // marca HEX como activo desde el inicio
});