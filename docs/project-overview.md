# Project Overview

## Project Description

**Tinta Agency Form Builder** es una plataforma especializada para una agencia de marketing enfocada en vinos, diseñada para gestionar briefs de clientes y formularios personalizados. La aplicación extiende el RC Starter Kit existente para proporcionar un sistema basado en workspaces donde cada workspace representa un cliente, y los miembros de la agencia pueden crear, gestionar y recopilar información de briefs de clientes a través de formularios personalizados.

### Contexto de Negocio
Tinta Agency se especializa en marketing de vinos y necesita una forma eficiente de recopilar briefs detallados de sus clientes para varios servicios como diseño de logotipos, desarrollo de marca y trabajo de diseño general. La plataforma optimizará el proceso de recopilación de briefs proporcionando formularios estandarizados pero personalizables que los clientes pueden completar sin requerir acceso a cuentas de la agencia.

## Características Existentes del Starter Kit

### Sistema de Autenticación
- **Autenticación OTP por email** - Sistema sin contraseñas con códigos de 6 dígitos
- **NextAuth.js v5** - Autenticación moderna y segura con estrategia JWT
- **Middleware de protección** - Rutas protegidas automáticamente
- **Gestión de sesiones** - Tokens con expiración y limpieza automática

### Gestión de Workspaces
- **Workspaces colaborativos** - Espacios de trabajo para equipos (perfectos para organizar por cliente)
- **Roles granulares** - Admin y Miembro por workspace
- **URLs amigables** - Sistema `/w/[slug]` para navegación
- **Permisos robustos** - Verificación de membresía y roles

### Panel de Administración
- **Dashboard con métricas** - Usuarios, workspaces, invitaciones pendientes
- **Gestión de usuarios** - CRUD completo con roles del sistema
- **Gestión de workspaces** - Administración centralizada
- **Acceso de superadmin** - Control total del sistema

### Sistema de Email
- **Resend integrado** - API configurada para envío de emails
- **React Email templates** - Templates tipados con Tailwind CSS
- **Emails transaccionales** - OTP y invitaciones a workspace

### Sistema de Archivos
- **Vercel Blob Storage** - Para almacenamiento de archivos
- **Validación de archivos** - Tipo y tamaño
- **Gestión automática** - Subida y eliminación segura

### UI/UX
- **Dark mode completo** - Soporte para temas claro, oscuro y sistema
- **shadcn/ui** - Biblioteca completa de componentes modernos y accesibles
- **Tailwind CSS v4** - Sistema de diseño consistente
- **Responsive design** - Optimizado para todos los dispositivos

## Nuevas Características a Implementar

### 1. Sistema de Plantillas de Formularios
- **Plantillas globales predefinidas** basadas en los PDFs existentes:
  - Logo Brief Template (Tinta_Brief_DeLogotipo.pdf)
  - Design Brief Template (Tinta_Brief_DeDiseño.pdf)
  - Brand Brief Template (Tinta_Brief_DeMarca.pdf)
- **Creación de plantillas personalizadas** por workspace admins y superadmins
- **Promoción formulario → plantilla** para reutilización
- **Gestión CRUD** de plantillas con preview

### 2. Constructor de Formularios Avanzado
- **Editor drag-and-drop** para reordenamiento de campos
- **Tipos de campos soportados:**
  - Texto corto (single-line input)
  - Texto largo (textarea)
  - Subida de archivos (múltiples tipos, hasta 10MB)
- **Propiedades de campo** configurables (etiqueta, ayuda, requerido)
- **Vista previa en tiempo real** del formulario
- **Workflow plantilla → formulario** personalizable

### 3. Sistema de Formularios Públicos
- **Enlaces únicos seguros** con tokens criptográficos
- **URL structure**: `https://dashboard.tinta.wine/f/[unique-token]`
- **Acceso público sin autenticación** para minimizar fricción
- **Interfaz optimizada para clientes** con branding de Tinta
- **Responsive design** optimizado para móviles
- **Validación en tiempo real** y indicadores de progreso

### 4. Sistema de Gestión de Respuestas
- **Captura completa de submissions** con timestamps
- **Visualización formateada** de todas las respuestas
- **Gestión de archivos adjuntos** con descarga segura
- **Exportación a PDF** de respuestas completas
- **Estados de respuesta** (nuevo, revisado, procesado)
- **Dashboard de formularios** con conteos de respuestas

### 5. Sistema de Notificaciones Extendido
- **Emails automáticos** en nuevas submissions
- **Templates específicos** para form builder
- **Notificación a workspace** (todos los miembros + superadmins)
- **Contenido informativo** (cliente, formulario, timestamp, quick links)

### 6. Selector de Workspace Mejorado
- **Dropdown en sidebar** con todos los workspaces accesibles
- **Persistencia de selección** en sesión
- **Indicación visual** del workspace activo
- **Acceso diferenciado** por roles (users vs superadmins)

### 7. Integración de Sistema de Archivos Extendido
- **Tipos de archivo soportados**: PDF, DOC, DOCX, JPG, PNG, ZIP
- **Límite de tamaño**: 10MB por archivo
- **Múltiples archivos** por campo
- **Validación robusta** de tipos y tamaños
- **Interfaz drag-and-drop** con indicadores de progreso

## Stack Tecnológico

### Framework y Core
- **Framework**: Next.js 15 (App Router)
- **Base de datos**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Autenticación**: NextAuth.js v5

### Frontend y UI
- **UI Library**: shadcn/ui + Tailwind CSS v4
- **Iconografía**: Lucide React
- **Themes**: next-themes (light/dark/system)
- **Notifications**: Sonner

### Backend y Services
- **Email**: React Email + Resend
- **Storage**: Vercel Blob
- **Validaciones**: Zod
- **Tipado**: TypeScript strict mode

### Herramientas Adicionales Necesarias
- **Form Builder UI**: Biblioteca de drag-and-drop (a evaluar)
- **PDF Generation**: Para exportación de respuestas
- **File Validation**: Extensión del sistema actual

## Puntos de Integración

### Con Sistema de Autenticación Existente
- **Reutilización completa** del sistema OTP para miembros de agencia
- **Integración con middleware** existente para protección de rutas
- **Aprovechamiento de roles** para permisos de formularios

### Con Sistema de Workspaces Existente
- **Workspaces como contenedores de clientes** (sin cambios estructurales)
- **Roles existentes** para control de acceso a formularios
- **URLs de workspace** (`/w/[slug]`) para navegación de formularios

### Con Sistema de Email Existente
- **Extensión de templates** React Email para notificaciones
- **Reutilización de servicio** Resend configurado
- **Aprovechamiento de infraestructura** de emails transaccionales

### Con Sistema de Archivos Existente
- **Extensión del upload service** para múltiples tipos de archivo
- **Reutilización de Vercel Blob** para almacenamiento
- **Extensión de validaciones** para nuevos tipos de archivo

### Con Admin Panel Existente
- **Integración de métricas** de formularios en dashboard
- **Extensión de gestión** de plantillas globales
- **Aprovechamiento de layouts** y componentes existentes

## Consideraciones de Diseño

### Branding de Tinta
- **Manual de marca oficial 2025** - Usar `/docs/resources/Tinta_Guía2025_manual_de_marca.pdf` como referencia principal
- **Integración de identidad visual** completa según especificaciones oficiales
- **Paleta de colores corporativa** extraída del manual oficial
- **Tipografía corporativa** según estándares definidos en el manual
- **Logotipos y assets** implementados según guías de aplicación
- **Adaptación responsive** manteniendo consistencia de marca

### Experiencia de Usuario
- **Continuidad con UI existente** para miembros de agencia
- **Interfaz optimizada para clientes** en formularios públicos
- **Progressive enhancement** en funcionalidades de drag-and-drop
- **Accesibilidad WCAG 2.1 AA** mantenida

### Performance y Seguridad
- **Carga rápida** de formularios públicos (< 2 segundos)
- **Tokens criptográficamente seguros** para enlaces públicos
- **Validación robusta** de archivos subidos
- **Aislamiento de datos** por workspace mantenido