document.addEventListener("DOMContentLoaded", function() {
    let pelis = [];

    fetch("https://japceibal.github.io/japflix_api/movies-data.json")
        .then(respuesta => respuesta.json())
        .then(datos => {
            pelis = datos; 
            console.log("Películas cargadas:", pelis);
        })
        .catch(error => {
            console.error("Error al cargar los datos:", error);
        });

    document.getElementById("btnBuscar").addEventListener("click", function() {
        let consulta = document.getElementById("inputBuscar").value.toLowerCase().trim();

        if (consulta) {
            let resultados = new Set();

            for (let i = 0; i < pelis.length; i++) {
                let peli = pelis[i];
                let tituloCoincide = peli.title.toLowerCase().includes(consulta);
                let generoCoincide = false;

                if (peli.genres) {
                    for (let j = 0; j < peli.genres.length; j++) {
                        if (peli.genres[j].name.toLowerCase().includes(consulta)) {
                            generoCoincide = true;
                            break; 
                        }
                    }
                }

                let taglineCoincide = peli.tagline && peli.tagline.toLowerCase().includes(consulta);
                let overviewCoincide = peli.overview && peli.overview.toLowerCase().includes(consulta);

               
                if (tituloCoincide || generoCoincide || taglineCoincide || overviewCoincide) {
                    resultados.add(peli); 
                }
            }

            mostrarResultados(Array.from(resultados)); 
        } else {
            mostrarResultados([]);
        }
    });

    function mostrarResultados(resultados) {
        let listaDePelis = document.getElementById("lista");
        listaDePelis.innerHTML = "";

        if (resultados.length === 0) {
            listaDePelis.innerHTML = "<li class='list-group-item'>No se encontraron resultados.</li>";
        } else {
            for (let i = 0; i < resultados.length; i++) {
                let peli = resultados[i];
                let puntuacion = convertirCalificacionEstrellas(peli.vote_average);
                let elemento = document.createElement("li");
                elemento.className = "list-group-item";
                elemento.innerHTML = `
                    <h5>${peli.title}</h5>
                    <p>${peli.tagline || 'No hay descripción disponible'}</p>
                    <p>${puntuacion}</p>
                    <div class="detalles" style="display:none;"></div>
                `;

                elemento.addEventListener("click", function(event) {
                    if (event.target.tagName !== "BUTTON") {
                        mostrarDetallesPelicula(peli, elemento.querySelector(".detalles"));
                    }
                });

                listaDePelis.appendChild(elemento);
            }
        }
    }

    function convertirCalificacionEstrellas(calificacion) {
        let estrellas = Math.round(calificacion / 2);
        let estrellasHtml = "";

        for (let i = 0; i < 5; i++) {
            if (i < estrellas) {
                estrellasHtml += '<i class="fa fa-star text-warning"></i>';
            } else {
                estrellasHtml += '<i class="fa fa-star-o text-secondary"></i>';
            }
        }
        return estrellasHtml;
    }

    function mostrarDetallesPelicula(peli) {
        const offcanvasLabel = document.getElementById("offcanvasDetallesLabel");
        const offcanvasBody = document.getElementById("offcanvasBody");
    
        // Verificar si los elementos existen
        if (!offcanvasLabel || !offcanvasBody) {
            console.error("No se encontró el contenedor del offcanvas. Verifica el HTML.");
            return;
        }
    
        // Rellenar el contenido del offcanvas
        offcanvasLabel.textContent = peli.title;
        offcanvasBody.innerHTML = `
            <p><strong>Sinopsis:</strong> ${peli.overview || 'No hay descripción disponible'}</p>
            <h6>Géneros:</h6>
            <ul>${peli.genres.map(g => `<li>${g.name}</li>`).join('')}</ul>
            <button class="btn btn-info dropdown-toggle" type="button" id="dropdownDetalles" data-bs-toggle="dropdown" aria-expanded="false">
                Más
            </button>
            <ul class="dropdown-menu" aria-labelledby="dropdownDetalles">
                <li><strong>Año de lanzamiento:</strong> ${new Date(peli.release_date).getFullYear()}</li>
                <li><strong>Duración:</strong> ${peli.runtime || 'N/A'} minutos</li>
                <li><strong>Presupuesto:</strong> $${(peli.budget || 0).toLocaleString()}</li>
                <li><strong>Ganancias:</strong> $${(peli.revenue || 0).toLocaleString()}</li>
            </ul>
        `;
    
        // Mostrar el offcanvas usando Bootstrap
        const offcanvasElement = new bootstrap.Offcanvas(document.getElementById("offcanvasDetalles"));
        offcanvasElement.show();
    }    
});