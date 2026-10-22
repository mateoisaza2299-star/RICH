# Rich Barbery

Landing de Rich Barbery, en Calle 13 #13-72, Funza, Cundinamarca.

Los datos del local viven en `js/config.js`: nombre, dirección, ciudad, departamento, país, horario e Instagram. La cinta superior, el título, la ficha de ubicación, el horario y el mapa salen de ahí. Si un dato está vacío, esa parte no se muestra.

El horario publicado es lunes a viernes de 9:00 am a 5:00 pm, sábados de 12:00 pm a 9:00 pm y domingos de 11:00 am a 7:00 pm. Aparece en Nosotros, en la sección de ubicación y en el schema (`openingHoursSpecification`).

## Enlaces exactos de Google Maps

`mapsUrl` y `mapaEmbed` están vacíos a propósito. Mientras sigan así, el sitio arma la búsqueda `Rich Barbery, Calle 13 #13-72, Funza, Cundinamarca` con `encodeURIComponent`:

- `mapsUrl` abre Google Maps en esa búsqueda.
- `mapaEmbed` carga el mismo lugar dentro del mapa de la página.

Cuando tengas la ficha exacta del local, reemplaza esos dos campos:

1. Abre el local en Google Maps.
2. Pulsa **Compartir** y copia el enlace. Pégalo en `mapsUrl`.
3. En **Insertar un mapa**, copia solo la dirección `src` del iframe y pégala en `mapaEmbed`.

Si dejas uno de los dos vacío, ese enlace se sigue construyendo con la búsqueda. Si pegas una URL, el sitio usa esa URL tal cual.

## Instagram y WhatsApp

`redes.instagram` es `https://www.instagram.com/USUARIO/`. Con esa URL, la cinta agrega `SÍGUENOS @USUARIO`.

`whatsapp` está vacío. No hay botón hasta que ese campo tenga un número.
