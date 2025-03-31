# Sistema de Monitoreo Hospitalario

Un sistema de monitoreo en tiempo real para camillas hospitalarias que utiliza sensores ECG y control IIoT (Industrial Internet of Things), desarrollado para la Liga Guatemalteca del Corazón.

## 📋 Características

- **Autenticación mediante RFID**: Sistema de acceso seguro con diferentes roles (Especialista/Residente)
- **Monitoreo en tiempo real**: Visualización de ECG y oxigenación mediante MQTT
- **Gestión de pacientes**: CRUD completo, incluyendo datos personales y fotografías
- **Diagnósticos médicos**: Registro, seguimiento y alta médica
- **Reportes PDF**: Generación de historiales médicos y certificados de alta
- **Firma digital**: Autenticación mediante códigos QR
- **Dashboard de estadísticas**: Ocupación de camillas, signos vitales y métricas

## 🚀 Tecnologías

- **Frontend**: React, Chart.js, MQTT.js
- **Documentación**: jsPDF, QRCode.js
- **Estilos**: CSS personalizado
- **Backend**: API REST, MQTT
- **Herramientas de visualización**: Grafana para estadísticas avanzadas

## 📦 Estructura del proyecto

```
src/
  ├── components/           # Componentes React organizados por funcionalidad
  ├── contexts/             # Contextos de React para estado global
  ├── services/             # Servicios (API, MQTT, PDF)
  ├── utils/                # Funciones de utilidad
  ├── assets/               # Recursos estáticos
  ├── layouts/              # Estructuras de diseño principales
  ├── App.jsx               # Componente principal
  ├── routes.jsx            # Configuración de rutas
  └── main.jsx              # Punto de entrada
```

## 💻 Instalación

1. Clona este repositorio
```bash
git clone https://github.com/tu-usuario/sistema-monitoreo-hospitalario.git
cd sistema-monitoreo-hospitalario
```

2. Instala las dependencias
```bash
npm install
```

3. Configura las variables de entorno
```bash
cp .env.example .env
# Edita .env con la configuración de tu backend y broker MQTT
```

4. Inicia el servidor de desarrollo
```bash
npm run dev
```

## 🔧 Configuración

### Conexión al backend
Edita el archivo `src/services/api.js` para configurar la URL base de tu API:

```javascript
const API_URL = 'http://tu-backend.com/api';
```

### Conexión MQTT
Edita el archivo `src/services/mqttService.js` para configurar el broker MQTT:

```javascript
connect(brokerUrl = 'ws://tu-broker-mqtt.com:8083/mqtt')
```

## 📄 API Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/rol` | GET | Obtener información del usuario actual |
| `/rol` | PUT | Verificar rol por ID |
| `/pacientes` | GET | Listar pacientes |
| `/editar_paciente` | PUT | Actualizar info de paciente |
| `/diagnostico?cui={cui}` | GET | Obtener diagnósticos por CUI |
| `/diagnostico` | POST | Crear diagnóstico |
| `/diagnostico` | PUT | Actualizar diagnóstico |
| `/alta_paciente` | PUT | Registrar alta |

## 👥 Roles y permisos

### Especialista (ROL = 2)
- Acceso total al sistema
- Crear y editar diagnósticos
- Dar de alta pacientes
- Editar información de pacientes

### Residente (ROL = 1)
- Visualización del dashboard
- Consulta de pacientes
- Actualización de fotografías
- Ver diagnósticos sin poder modificarlos

## 📊 Monitoreo MQTT

### Topics utilizados
- `sensores/ecg` - Datos de ECG
- `sensores/oxigeno` - Datos de oxigenación
- `diagnostico/realizado` - Notificaciones de diagnósticos

### Formato de mensajes
```json
// ECG
{
  "timestamp": "2025-03-01T12:00:10Z",
  "paciente_id": 101,
  "ecg_valor": 1.23
}

// Oxígeno
{
  "timestamp": "2025-03-01T12:00:05Z",
  "paciente_id": 101,
  "oxigeno_nivel": 98
}

// Diagnóstico
{
  "timestamp": "2025-03-01T12:00:00Z",
  "diagnostico": "true"
}
```

## 🔒 Seguridad

- **Control de acceso**: Basado en roles con verificación RFID
- **Firma digital**: Certificación de documentos mediante QR con hash único
- **Validación de datos**: Verificación de entradas en todos los formularios
- **Historial de cambios**: Registro de modificaciones con usuario y timestamp

## 📱 Interfaz de usuario

### Dashboard
![Dashboard](https://placeholder-image.com/dashboard-example.png)
- Visualización en tiempo real de signos vitales
- Indicadores de ocupación de camillas
- Alertas por valores críticos

### Gestión de pacientes
- Vista de lista y detalle de pacientes
- Formularios de edición con validación
- Captura de fotografías mediante webcam

### Diagnósticos
- Formulario completo para registro médico
- Historial con línea de tiempo
- Generación de reportes PDF

## 📝 Generación de reportes

### Historial médico
- Datos completos del paciente
- Lista cronológica de diagnósticos
- Firma digital con código QR

### Certificado de alta
- Información del paciente y diagnóstico
- Resumen del tratamiento aplicado
- Estadísticas de signos vitales durante el tratamiento
- Firma digital del médico tratante

## ⚙️ Integración con Grafana

El sistema se integra con Grafana para visualizaciones avanzadas:

- **Conexión a base de datos**: Configuración para PostgreSQL/MySQL
- **Paneles personalizados**: Visualización de estadísticas por camilla
- **Alertas automáticas**: Configuración para notificaciones por valores anormales

## 🧪 Pruebas

```bash
# Ejecutar pruebas unitarias
npm run test

# Ejecutar pruebas de integración
npm run test:integration

# Verificar cobertura de pruebas
npm run test:coverage
```

## 🛠️ Requisitos de hardware

- Arduino/ESP32 con módulo RFID
- Sensores ECG y oxímetro
- Computadora con soporte para cámara web (opcional)
- Conexión a red local con acceso a servidor MQTT

## 📚 Documentación adicional

- [Manual de usuario](docs/manual_usuario.pdf)
- [Guía de instalación del hardware](docs/instalacion_hardware.pdf)
- [Configuración del broker MQTT](docs/configuracion_mqtt.pdf)
- [Guía de desarrollo](docs/guia_desarrollo.pdf)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para contribuir:

1. Haz fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Haz commit de tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Haz push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

Desarrollado como parte del proyecto para el curso de Arquitectura de Computadores y Ensambladores 2 de la Universidad de San Carlos de Guatemala, Facultad de Ingeniería.

**Catedrático:** Ing. Gabriel Díaz  
**Auxiliares:** Sergio André Lima Corado, Estuardo Sebastián Valle Bances