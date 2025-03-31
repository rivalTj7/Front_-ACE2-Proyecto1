# Sistema de Monitoreo Hospitalario

## Descripción General
Este frontend para el Sistema de Monitoreo Hospitalario ha sido desarrollado para la Liga Guatemalteca del Corazón, como parte del proyecto de la Universidad de San Carlos de Guatemala. El sistema permite el monitoreo en tiempo real de pacientes, gestión de diagnósticos médicos y generación de reportes.

## Características Principales

### Autenticación y Control de Acceso
- Autenticación mediante tarjetas RFID
- Sistema de roles (Especialista y Residente) con diferentes niveles de permisos
- Acceso seguro a funcionalidades según el rol del usuario

### Gestión de Pacientes
- Listado completo de pacientes con búsqueda por nombre y CUI
- Visualización detallada de información de pacientes
- Edición de datos personales (solo para Especialistas)
- Actualización de fotografías mediante cámara web o carga de archivos

### Diagnósticos Médicos
- Creación de nuevos diagnósticos para pacientes
- Registro de síntomas, condiciones, antecedentes y tratamientos
- Histórico completo de diagnósticos por paciente
- Gestión de alta médica con estadísticas de monitoreo

### Monitoreo en Tiempo Real
- Dashboard con visualización de ECG y oxigenación
- Monitoreo de ocupación de camillas
- Conexión mediante protocolo MQTT
- Alertas por valores críticos

### Reportes y Documentación
- Generación de historial médico en PDF
- Certificados de alta médica
- Firma digital con códigos QR para garantizar autenticidad
- Estadísticas de monitoreo incluidas en los reportes

## Tecnologías Utilizadas

### Frontend
- React (hooks, context API)
- React Router para navegación
- Chart.js para gráficos de monitoreo
- MQTT para comunicación en tiempo real
- jsPDF para generación de documentos PDF
- QRCode para firma digital

### Comunicación con Backend
- API REST para operaciones CRUD
- Protocolo MQTT para datos en tiempo real
- Manejo de formularios y validación de datos

## Estructura del Proyecto

```
src/
  ├── components/           # Componentes React
  │   ├── Auth/             # Componentes de autenticación
  │   ├── Dashboard/        # Dashboard y monitoreo
  │   ├── Pacientes/        # Gestión de pacientes
  │   ├── Diagnosticos/     # Gestión de diagnósticos
  │   ├── Reportes/         # Generación de reportes
  │   ├── UI/               # Componentes de interfaz
  │   └── FirmaDigital/     # Firma digital
  ├── contexts/             # Contextos de React
  ├── services/             # Servicios (API, MQTT, PDF)
  ├── utils/                # Utilidades
  ├── assets/               # Recursos estáticos
  ├── layouts/              # Layouts de la aplicación
  ├── App.jsx               # Componente principal
  ├── routes.jsx            # Configuración de rutas
  └── main.jsx              # Punto de entrada
```

## Endpoints de API Utilizados

### Autenticación
- GET `/rol` - Obtener información del usuario actual
- PUT `/rol` - Verificar rol por ID de usuario

### Pacientes
- GET `/pacientes` - Obtener lista de pacientes
- PUT `/editar_paciente` - Actualizar información de paciente

### Diagnósticos
- GET `/diagnostico?cui={cui}` - Obtener diagnósticos por CUI
- POST `/diagnostico` - Crear nuevo diagnóstico
- PUT `/diagnostico` - Actualizar diagnóstico existente
- PUT `/alta_paciente` - Registrar alta médica
- GET `/alta_paciente?cui_paciente={cui}` - Obtener estadísticas de alta

## Flujo de Usuario

1. **Autenticación**
   - El usuario presenta su tarjeta RFID
   - El sistema verifica su rol (Especialista o Residente)
   - Acceso al dashboard según permisos

2. **Dashboard**
   - Visualización de monitoreo en tiempo real
   - Indicadores de ocupación de camillas
   - Alertas por valores críticos

3. **Gestión de Pacientes**
   - Búsqueda y selección de pacientes
   - Visualización de detalles e historial
   - Edición de información (solo Especialistas)

4. **Diagnósticos**
   - Creación de diagnósticos (solo Especialistas)
   - Registro de datos médicos
   - Monitoreo de signos vitales

5. **Alta Médica**
   - Registro de alta (solo Especialistas)
   - Generación automática de certificado
   - Estadísticas de monitoreo durante tratamiento

6. **Reportes**
   - Generación de historial médico
   - Certificados de alta
   - Firma digital para autenticidad

## Seguridad

- Control de acceso basado en roles
- Validación de datos en formularios
- Firma digital en documentos mediante QR
- Protección de rutas según permisos del usuario

## Instalación y Configuración

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Configurar la URL del backend en `src/services/api.js`
4. Configurar la URL del broker MQTT en `src/services/mqttService.js`
5. Iniciar la aplicación: `npm run dev`

## Requisitos del Sistema

- Node.js v14+
- Acceso al backend del Sistema de Monitoreo Hospitalario
- Broker MQTT (HiveMQ)
- Navegador con soporte para WebSockets
- Para funcionalidades de foto: cámara web y permiso de acceso