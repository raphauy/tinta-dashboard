# Tinta Dashboard - Documentación de Características

## Overview del Proyecto

Tinta Dashboard es una aplicación web full-stack construida con Next.js 15 que proporciona un sistema de gestión de espacios de trabajo colaborativos. La plataforma permite a los equipos organizar su trabajo en espacios compartidos con un sistema de autenticación sin contraseñas basado en códigos OTP enviados por email.

### Stack Tecnológico Principal
- **Frontend/Backend**: Next.js 15 con App Router
- **Base de datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js v5 con sistema OTP personalizado
- **UI**: shadcn/ui + Tailwind CSS v4
- **Email**: React Email + Resend
- **Almacenamiento**: Vercel Blob

## Características Principales

### 🔐 Sistema de Autenticación
- **Login sin contraseña**: Autenticación mediante códigos OTP de 6 dígitos enviados por email
- **Gestión de sesiones**: Sesiones persistentes con NextAuth.js
- **Onboarding personalizado**: Flujo de configuración inicial para nuevos usuarios

### 👥 Gestión de Usuarios
- **Perfiles de usuario**: Información personal editable
- **Roles del sistema**:
  - Usuario regular (sin rol global)
  - Administrador de workspace
  - Superadministrador (acceso global)

### 🏢 Espacios de Trabajo (Workspaces)
- **Creación de workspaces**: Espacios colaborativos con URLs únicas (`/w/[slug]`)
- **Gestión de miembros**: 
  - Invitación por email
  - Asignación de roles (admin/miembro)
  - Listado y búsqueda de miembros
- **Configuración del workspace**:
  - Nombre y descripción editables
  - Gestión de permisos
  - Eliminación de workspace

### 📧 Sistema de Invitaciones
- **Invitaciones por email**: Sistema de tokens únicos para unirse a workspaces
- **Flujo de aceptación**: Proceso guiado para aceptar invitaciones
- **Gestión de invitaciones pendientes**: Vista y cancelación de invitaciones

### 👨‍💼 Panel de Administración (Superadmin)
- **Gestión global de usuarios**:
  - Listado completo de usuarios
  - Búsqueda y filtrado
  - Edición de roles globales
  - Eliminación de usuarios
- **Gestión global de workspaces**:
  - Vista de todos los workspaces
  - Estadísticas de uso
  - Administración centralizada

### 📊 Dashboard y Métricas
- **Métricas de workspace**: 
  - Número de miembros
  - Actividad reciente
  - Estadísticas de uso
- **Dashboard personalizado**: Vista general adaptada al rol del usuario

### 🎨 Interfaz de Usuario
- **Diseño responsivo**: Optimizado para desktop y móvil
- **Modo oscuro**: Soporte completo para tema oscuro
- **Componentes reutilizables**: Biblioteca de componentes basada en shadcn/ui
- **Navegación intuitiva**: Breadcrumbs y menús contextuales

### 📤 Gestión de Archivos
- **Carga de archivos**: Integración con Vercel Blob
- **Almacenamiento seguro**: Gestión de permisos por workspace

### 🔧 Características Técnicas
- **Server Actions**: Mutaciones sin necesidad de API routes
- **React Server Components**: Renderizado optimizado en servidor
- **Validación de datos**: Esquemas Zod en toda la aplicación
- **Base de datos relacional**: Modelo de datos robusto con Prisma

### 📝 Sistema de Formularios Dinámicos

#### Arquitectura del Sistema
El sistema de formularios es una característica central que permite crear formularios personalizados para recopilar información específica del negocio vitivinícola.

#### Creación y Gestión de Formularios
- **Constructor visual de formularios**: Interface drag-and-drop para crear formularios
- **Plantillas reutilizables**: Sistema de templates globales para formularios comunes
- **Campos personalizables**:
  - Texto corto (`text`)
  - Texto largo (`textarea`)
  - Soporte para archivos adjuntos por campo
- **Metadatos del formulario**:
  - Título principal y secundario (para diseños específicos)
  - Color del círculo (usando colores de marca Tinta)
  - Subtítulo descriptivo
  - Información del proyecto y cliente
- **Enlaces públicos únicos**: Cada formulario tiene un token único para compartir
- **Control de estado**: Formularios activos/inactivos
- **Opciones de edición**: Permitir o no ediciones múltiples de respuestas

#### Sistema de Respuestas

##### Envío de Respuestas
- **Formularios públicos**: Accesibles vía `/f/[token]` y `/f2/[token]` (versiones diferentes de UI)
- **Captura de datos estructurada**: Las respuestas se almacenan como JSON
- **Soporte de archivos**: Upload de archivos por campo con Vercel Blob
- **Metadatos de respuesta**:
  - IP del remitente (opcional)
  - Timestamp de envío
  - Estado de la respuesta

##### Estados de Respuestas
- **`new`**: Respuesta recién recibida
- **`reviewed`**: Respuesta revisada por el equipo
- **`processed`**: Respuesta procesada/completada

##### Gestión de Respuestas
- **Vista de respuestas por formulario**: Lista todas las respuestas de un formulario
- **Vista individual de respuesta**: Detalles completos con archivos adjuntos
- **Filtros por estado**: Ver respuestas nuevas, revisadas o procesadas
- **Búsqueda de respuestas**: Por contenido del formulario
- **Cambio de estado**: Actualizar el estado de procesamiento
- **Eliminación de respuestas**: Con eliminación en cascada de archivos

#### Notificaciones y Alertas
- **Email de nueva respuesta**: Notificación automática a miembros del workspace
- **Dashboard de respuestas**: Vista centralizada de todas las respuestas

#### Estadísticas y Métricas
- **Contador de respuestas**: Por formulario y global
- **Respuestas por estado**: Distribución new/reviewed/processed
- **Respuestas del día**: Métrica de actividad diaria
- **Formularios con respuestas**: Identificación de formularios activos

### 📱 Formularios y Validación
- **Formularios progresivos**: Funcionan sin JavaScript
- **Validación en tiempo real**: Feedback inmediato al usuario
- **Manejo de errores**: Mensajes claros y recuperación de errores

### 🔒 Seguridad
- **Autenticación segura**: Tokens OTP con expiración
- **Control de acceso**: Verificación de permisos a nivel de workspace
- **Protección de rutas**: Middleware de autenticación en todas las rutas protegidas

## Flujos Principales

1. **Registro y onboarding**: Email → OTP → Configuración de perfil
2. **Creación de workspace**: Nuevo workspace → Invitar miembros → Colaborar
3. **Gestión de equipo**: Ver miembros → Invitar → Asignar roles
4. **Administración global**: Panel superadmin → Gestión centralizada
5. **Creación de formulario**: Workspace → Crear formulario → Configurar campos → Compartir enlace
6. **Recepción de respuestas**: Cliente completa formulario → Notificación al equipo → Revisar → Procesar

## Detalles Técnicos para Desarrolladores

### Modelo de Datos de Formularios

#### Tabla `forms`
```typescript
{
  id: string           // CUID único
  title: string        // Título principal
  title2?: string      // Título secundario
  color?: string       // Color del círculo (hex o nombre)
  subtitle?: string    // Descripción
  projectName?: string // Para header PDF
  client?: string      // Para header PDF
  fields: Json         // Array de FormField
  workspaceId: string  // Relación con workspace
  templateId?: string  // Plantilla de origen
  shareToken: string   // Token único para URL pública
  isActive: boolean    // Estado del formulario
  allowEdits: boolean  // Permitir múltiples ediciones
}
```

#### Tabla `form_responses`
```typescript
{
  id: string             // CUID único
  formId: string         // Relación con formulario
  data: Json             // Respuestas {fieldId: value}
  status: ResponseStatus // new | reviewed | processed
  submittedAt: DateTime  // Timestamp de envío
  submitterIP?: string   // IP opcional
}
```

#### Tabla `form_response_files`
```typescript
{
  id: string         // CUID único
  responseId: string // Relación con respuesta
  fieldName: string  // ID del campo que subió el archivo
  fileName: string   // Nombre original
  fileUrl: string    // URL en Vercel Blob
  fileSize: number   // Tamaño en bytes
  fileType: string   // MIME type
}
```

### Servicios Principales

#### `form-service.ts`
- `createForm()`: Crea nuevo formulario con validación Zod
- `getFormByToken()`: Obtiene formulario público con sus relaciones
- `updateForm()`: Actualiza campos del formulario
- `regenerateShareToken()`: Genera nuevo token de compartir
- `deleteForm()`: Elimina si no tiene respuestas

#### `form-response-service.ts`
- `submitFormResponse()`: Procesa nueva respuesta con archivos
- `getFormResponses()`: Lista respuestas de un formulario
- `updateResponseStatus()`: Cambia estado de procesamiento
- `getResponsesByWorkspace()`: Todas las respuestas del workspace
- `getResponseStatsForWorkspace()`: Métricas de respuestas

### Endpoints y Rutas

#### Rutas de Administración
- `/w/[slug]/forms`: Lista de formularios del workspace
- `/w/[slug]/forms/new`: Crear nuevo formulario
- `/w/[slug]/forms/[id]/edit`: Editar formulario existente
- `/w/[slug]/forms/[id]/responses`: Ver respuestas
- `/w/[slug]/forms/[id]/share`: Obtener enlace público

#### Rutas Públicas
- `/f/[token]`: Formulario público (estilo PDF)
- `/f2/[token]`: Formulario público (estilo alternativo)

### Integración con Notificaciones

Cuando se recibe una nueva respuesta:
1. Se guarda en la base de datos con estado `new`
2. Se envía email a todos los miembros del workspace
3. Aparece en el dashboard como respuesta pendiente
4. Los usuarios pueden cambiar el estado a `reviewed` o `processed`

Esta aplicación está diseñada para escalar con las necesidades del equipo, proporcionando una base sólida para la colaboración empresarial y la recolección estructurada de información.



## 🚀 Siguientes Features a Implementar

<!-- Esta sección será actualizada dinámicamente como parte del proceso de desarrollo con agentes 
Template (no borrar):
<FEATURE number="1" status="PENDING" prp-file-path="">
...
</FEATURE>
-->

<FEATURE number="1" status="PRP-DONE" prp-file-path="/docs/PRPs/export-response-pdf-prp.md">
Quiero que la UI de ver una respuesta (src/app/w/[slug]/forms/[id]/responses/[responseId]) tenga la posibilidad de exportar toda la información a un pdf, incluso los archivos que son imágnes, integrarlas al pdf.
La visual del pdf en lo posible que sea similar a cómo se ve el formulario al momento en que tienen que llenar, al menos el cabezal que tiene un diseño, dejo una captura: docs/resources/form-design-example.png
Esa imagen sale de esta route: src/app/f/[token]
La idea es que un admin pueda exportar la información brindada por un cliente, es decir las respuestas del cliente para formularios, por ej un brief de marca y enviar ese pdf al diseñador.
</FEATURE>
