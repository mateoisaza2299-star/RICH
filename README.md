# Rich Barbery

Landing de Rich Barbery, en Calle 13 #13-72, Funza, Cundinamarca.

Los datos del local viven en `js/config.js`: nombre, dirección, ciudad, departamento y país. La cinta superior, el título, la ficha de ubicación y el mapa salen de ahí. Si un dato está vacío, esa parte no se muestra.

## Enlaces exactos de Google Maps

`mapsUrl` y `mapaEmbed` están vacíos a propósito. Mientras sigan así, el sitio arma la búsqueda `Rich Barbery, Calle 13 #13-72, Funza, Cundinamarca` con `encodeURIComponent`:

- `mapsUrl` abre Google Maps en esa búsqueda.
- `mapaEmbed` carga el mismo lugar dentro del mapa de la página.

Cuando tengas la ficha exacta del local, reemplaza esos dos campos:

1. Abre el local en Google Maps.
2. Pulsa **Compartir** y copia el enlace. Pégalo en `mapsUrl`.
3. En **Insertar un mapa**, copia solo la dirección `src` del iframe y pégala en `mapaEmbed`.

Ejemplo:

```js
mapsUrl: "https://maps.app.goo.gl/el-enlace-del-local",
mapaEmbed: "https://www.google.com/maps/embed?pb=el-codigo-del-iframe",
```

Si dejas uno de los dos vacío, ese enlace se sigue construyendo con la búsqueda. Si pegas una URL, el sitio usa esa URL tal cual.

## Instagram

`redes.instagram` también está vacío. Cuando pegues la URL del perfil, por ejemplo `https://www.instagram.com/usuario/`, la cinta agrega `SÍGUENOS @USUARIO` y aparecen los enlaces de Instagram.
