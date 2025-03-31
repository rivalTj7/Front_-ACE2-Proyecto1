# Sistema de Monitoreo Hospitalario - Frontend

Este documento explica cómo ejecutar el frontend del Sistema de Monitoreo Hospitalario utilizando Docker.

## Requisitos previos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (opcional, para despliegue completo)

## Opciones de despliegue

### 1. Solo Frontend (Desarrollo)

Si solo quieres ejecutar el frontend en modo desarrollo:

```bash
# Instalación de dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

### 2. Solo Frontend (Docker)

Para construir y ejecutar el frontend en un contenedor Docker:

```bash
# Construir la imagen Docker
npm run docker:build
# o directamente
docker build -t hospital-frontend .

# Ejecutar el contenedor
npm run docker:run
# o directamente
docker run -p 80:80 hospital-frontend
```

Una vez ejecutado, el frontend estará disponible en [http://localhost](http://localhost).

### 3. Sistema Completo (Docker Compose)

Para ejecutar el sistema completo (frontend, backend, base de datos y broker MQTT):

```bash
# Iniciar todos los servicios
npm run docker:compose
# o directamente
docker-compose up -d

# Para reconstruir los servicios en caso de cambios
npm run docker:compose:build
# o directamente
docker-compose up -d --build

# Para detener todos los servicios
npm run docker:compose:down
# o directamente
docker-compose down
```

## Configuración de entornos

### Desarrollo local con API externa

Si necesitas conectarte a una API externa durante el desarrollo, puedes modificar el archivo `vite.config.js`:

```javascript
// vite.config.js
export default defineConfig({
  // ...
  server: {
    proxy: {
      '/api': {
        target: 'http://tu-api-externa.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### Conexión a servicios en Docker Compose

En el archivo `docker-compose.yml`, puedes modificar las siguientes variables:

- **Backend URL**: Modifica la configuración de `nginx.conf` para ajustar la URL del backend.
- **Base de Datos**: Ajusta las variables de entorno en el servicio `database`.
- **MQTT Broker**: Ajusta los puertos y configuración del servicio `mqtt-broker`.

## Solución de problemas

### El frontend no puede conectarse al backend

- Verifica que el servicio de backend esté en ejecución.
- Revisa la configuración del proxy en `nginx.conf`.
- Asegúrate de que ambos contenedores estén en la misma red.

### Errores de CORS

Si encuentras errores de CORS, asegúrate de que tu backend tenga configurados los encabezados CORS correctamente, o modifica la configuración de Nginx en `nginx.conf`.

### Problemas de conexión MQTT

- Verifica que el broker MQTT esté en ejecución.
- Asegúrate de que el puerto WebSocket (8083) esté expuesto y accesible.
- Revisa la URL de conexión MQTT en el código del frontend.

## Acceso a logs

Para ver los logs de los contenedores:

```bash
# Ver logs del frontend
docker logs -f hospital-sistema_frontend_1

# Ver logs del backend
docker logs -f hospital-sistema_backend_1

# Ver logs del broker MQTT
docker logs -f hospital-sistema_mqtt-broker_1
```