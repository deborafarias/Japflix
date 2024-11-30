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

    function mostrarDetallesPelicula(peli, contenedorDetalles) {
        if (contenedorDetalles.style.display === "none" || contenedorDetalles.style.display === "") {
            contenedorDetalles.innerHTML = `
                <div class="alert alert-light">
                    <h6>Sinopsis:</h6>
                    <p>${peli.overview || 'No hay descripción disponible'}</p>
                    <h6>Géneros:</h6>
                    <ul>${peli.genres.map(g => `<li>${g.name}</li>`).join('')}</ul>
                    <button class="btn btn-info" id="toggleDetalles">Más información</button>
                    <div id="detallesExtra" class="d-none">
                        <p><strong>Año de lanzamiento:</strong> ${new Date(peli.release_date).getFullYear()}</p>
                        <p><strong>Duración:</strong> ${peli.runtime} minutos</p>
                        <p><strong>Presupuesto:</strong> $${peli.budget.toLocaleString() || 'N/A'}</p>
                        <p><strong>Ganancias:</strong> $${peli.revenue.toLocaleString() || 'N/A'}</p>
                    </div>
                </div>
            `;
            contenedorDetalles.style.display = "block";

            contenedorDetalles.querySelector("#toggleDetalles").addEventListener("click", function() {
                const detallesExtra = contenedorDetalles.querySelector("#detallesExtra");
                detallesExtra.classList.toggle("d-none"); 
            });
        } else {
            contenedorDetalles.style.display = "none"; 
        }
    }
});