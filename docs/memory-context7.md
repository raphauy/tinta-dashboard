# Memoria: Context7 para Documentación Actualizada

## ¿Qué es Context7?

Context7 es un sistema que proporciona documentación actualizada de librerías y frameworks. Es la herramienta preferida para obtener información precisa y actualizada sobre cualquier librería.

## ¿Cuándo usar Context7?

### ✅ SIEMPRE usar Context7 cuando:
- Necesites documentación de una librería
- Quieras conocer comandos específicos
- Busques ejemplos de código actualizados
- Investigues configuraciones o setup de tools
- Necesites verificar sintaxis o APIs

### ❌ NO usar Context7 cuando:
- Hagas preguntas conceptuales generales
- Escribas código específico del proyecto
- Realices operaciones de archivos locales

## Proceso de 2 pasos

### 1. Resolver ID de librería
```typescript
// Buscar la librería por nombre
mcp__context7__resolve-library-id({ libraryName: "react-email" })
// Retorna el ID compatible: /resend/react-email
```

### 2. Obtener documentación
```typescript
// Usar el ID para obtener docs
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/resend/react-email",
  topic: "preview command setup",
  tokens: 3000
})
```

## Parámetros importantes

- **libraryName**: Nombre de la librería a buscar
- **context7CompatibleLibraryID**: ID exacto obtenido del paso 1
- **topic**: Tema específico a buscar (opcional pero recomendado)
- **tokens**: Límite de tokens (default: 10000, máx: recomendado)

## Ventajas de Context7

- ✅ Documentación siempre actualizada
- ✅ Ejemplos de código verificados
- ✅ Comandos y configuraciones correctas
- ✅ Cubre múltiples librerías y frameworks
- ✅ Información precisa y confiable

## Recordatorio

**SIEMPRE** usa Context7 antes de dar instrucciones sobre librerías, comandos, o configuraciones. Es la fuente más confiable de información actualizada.