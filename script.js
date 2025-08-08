document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DEL DOM ---
    const todosLosRamos = document.querySelectorAll('.ramo');
    const modal = document.getElementById('modal-requisitos');
    const cerrarModalBtn = document.querySelector('.cerrar-modal');
    const listaRequisitosModal = document.getElementById('lista-requisitos');

    // --- ESTADO DE LA APLICACIÓN ---
    // Usamos un Set para almacenar las siglas de los ramos aprobados.
    // Cargamos los datos guardados en localStorage o iniciamos un Set vacío.
    let ramosAprobados = new Set(JSON.parse(localStorage.getItem('ramosAprobados')) || []);

    // --- FUNCIONES ---

    /**
     * Guarda el conjunto de ramos aprobados en el localStorage del navegador.
     * Se llama cada vez que se aprueba o desaprueba un ramo.
     */
    function guardarProgreso() {
        localStorage.setItem('ramosAprobados', JSON.stringify([...ramosAprobados]));
    }

    /**
     * Actualiza el estado visual de TODOS los ramos en la malla.
     * Se ejecuta al inicio y cada vez que cambia el estado de un ramo.
     */
    function actualizarEstadoVisual() {
        todosLosRamos.forEach(ramo => {
            const sigla = ramo.dataset.sigla;
            const prerrequisitos = JSON.parse(ramo.dataset.prerrequisitos);

            // Limpiamos todas las clases de estado anteriores
            ramo.classList.remove('aprobado', 'disponible', 'bloqueado');

            // 1. Si el ramo está en el conjunto de aprobados
            if (ramosAprobados.has(sigla)) {
                ramo.classList.add('aprobado');
                return; // Terminamos aquí para este ramo
            }

            // 2. Verificamos si todos los prerrequisitos están cumplidos
            const requisitosCumplidos = prerrequisitos.every(req => ramosAprobados.has(req));

            if (requisitosCumplidos) {
                ramo.classList.add('disponible');
            } else {
                ramo.classList.add('bloqueado');
            }
        });
    }

    /**
     * Gestiona el evento de clic sobre un ramo.
     * @param {Event} e - El objeto del evento de clic.
     */
    function manejarClickEnRamo(e) {
        const ramo = e.currentTarget; // El ramo que recibió el clic
        const sigla = ramo.dataset.sigla;

        // Caso 1: El ramo está APROBADO -> Lo des-aprobamos (para corregir errores)
        if (ramo.classList.contains('aprobado')) {
            ramosAprobados.delete(sigla);
        
        // Caso 2: El ramo está DISPONIBLE -> Lo aprobamos
        } else if (ramo.classList.contains('disponible')) {
            ramosAprobados.add(sigla);
        
        // Caso 3: El ramo está BLOQUEADO -> Mostramos el modal con los requisitos
        } else if (ramo.classList.contains('bloqueado')) {
            mostrarModalRequisitos(ramo);
            return; // No actualizamos ni guardamos nada, solo mostramos el modal
        }

        // Después de un cambio, guardamos y actualizamos la vista
        guardarProgreso();
        actualizarEstadoVisual();
    }

    /**
     * Muestra el modal con la lista de prerrequisitos que faltan.
     * @param {HTMLElement} ramo - El elemento del ramo bloqueado.
     */
    function mostrarModalRequisitos(ramo) {
        const prerrequisitos = JSON.parse(ramo.dataset.prerrequisitos);
        const nombreRamo = ramo.dataset.nombre;

        // Limpiamos la lista anterior
        listaRequisitosModal.innerHTML = '';

        // Buscamos el nombre completo de cada prerrequisito faltante
        prerrequisitos.forEach(siglaReq => {
            if (!ramosAprobados.has(siglaReq)) {
                const reqRamo = document.querySelector(`.ramo[data-sigla='${siglaReq}']`);
                const nombreReq = reqRamo ? reqRamo.dataset.nombre : siglaReq;
                const li = document.createElement('li');
                li.textContent = nombreReq;
                listaRequisitosModal.appendChild(li);
            }
        });
        
        // Mostramos el modal
        modal.style.display = 'block';
    }

    /**
     * Cierra el modal de requisitos.
     */
    function cerrarModal() {
        modal.style.display = 'none';
    }

    // --- ASIGNACIÓN DE EVENTOS (EVENT LISTENERS) ---

    // 1. Añadimos un listener a cada ramo
    todosLosRamos.forEach(ramo => {
        ramo.addEventListener('click', manejarClickEnRamo);
    });

    // 2. Listeners para cerrar el modal
    cerrarModalBtn.addEventListener('click', cerrarModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            cerrarModal();
        }
    });

    // --- INICIALIZACIÓN ---
    // Al cargar la página, actualizamos la vista por primera vez para reflejar el progreso guardado.
    actualizarEstadoVisual();

});
