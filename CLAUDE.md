# CLAUDE.md - Memoria de Trabajo

## Información Importante del Usuario

### Proceso de Testing
- **El usuario maneja el servidor de desarrollo por su cuenta**
- **NO ejecutar `npm run dev` automáticamente**
- **Cuando necesite que pruebe cambios, solo avisar al usuario**
- El usuario prefiere controlar cuándo reiniciar el servidor

### Estado Actual del Proyecto

#### Proyecto: RC Starter Kit - NextJS con Auth OTP
- **Stack**: NextJS 15, PostgreSQL (Neon), Auth.js V5, Resend, shadcn/ui
- **Autenticación**: Sistema OTP por email (sin contraseñas)
- **Base de datos**: PostgreSQL con Neon
- **Email**: Resend para envío de códigos OTP

#### Funcionalidades Implementadas ✅
1. **Sistema de Autenticación OTP completo**
   - Login con email + código de 6 dígitos
   - Templates de email en español
   - Verificación de códigos con expiración

2. **Panel de Administración**
   - Sidebar colapsible estilo Claude (con trigger animado)
   - Dashboard con métricas básicas
   - Header con dropdown de usuario
   - Navegación: Dashboard, Usuarios, Configuración

3. **Internacionalización**
   - Toda la UI traducida al español
   - Emails OTP en español
   - Metadata y configuración en español

#### Últimos Cambios Realizados
- **Gestión de Usuarios con RSC** ✅
  - Convertido sistema de usuarios a React Server Components (RSC)
  - Implementado patrón Suspense con skeleton loading
  - Separación clara: datos en servidor, interacciones en cliente
  - Estructura modular seguida correctamente según architecture.md

**Archivos modificados:**
- `src/app/admin/users/users-list.tsx` - Convertida a RSC, fetch de datos en servidor
- `src/app/admin/users/user-actions-client.tsx` - Nuevo componente cliente para acciones
- `src/services/user-service.ts` - Servicio ya existente usado por RSC
- `src/app/admin/users/page.tsx` - Ya tenía Suspense configurado correctamente

#### Variables de Entorno Configuradas
```
APP_NAME="RC Starter Kit"
DATABASE_URL=postgresql://... (Neon)
RESEND_API_KEY=re_... 
RESEND_FROM_EMAIL=notifications@raphauy.dev
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=...
```

#### Estructura del Sidebar (Estilo Claude)
- Header con título "Panel de Administración" + trigger a la derecha
- Trigger con animación (ícono panel → flecha en hover)
- Navegación: Panel de Control, Usuarios, Configuración
- Colapsible a solo íconos

#### Próximas Tareas Pendientes
- [x] Implementar gestión de usuarios con RSC
- [ ] Implementar página de Configuración
- [ ] Agregar más funcionalidades al dashboard

---

## Patrones de Desarrollo Establecidos

### React Server Components (RSC) - Patrón Implementado ✅
**Estructura para features con datos:**
```
src/app/admin/[feature]/
├── page.tsx              # RSC con Suspense boundary
├── [feature]-list.tsx    # RSC para datos (async function)
├── [feature]-client.tsx  # Cliente para interacciones
├── [feature]-skeleton.tsx # Loading skeleton
└── actions.ts           # Server actions
```

**Ejemplo implementado (usuarios):**
```typescript
// page.tsx - RSC con Suspense
<Suspense fallback={<UsersTableSkeleton />}>
  <UsersList />
</Suspense>

// users-list.tsx - RSC fetch datos
export async function UsersList() {
  const users = await getAllUsers()
  return <Table>...</Table>
}

// user-actions-client.tsx - Cliente para acciones
"use client"
export function UserActionsClient({ user }) {
  // Maneja dropdowns, toasts, confirmaciones
}
```

**Reglas del patrón RSC:**
- Datos: Fetch en servidor (RSC)
- Interacciones: Componentes cliente únicamente
- Loading: Suspense + skeleton
- Actions: Server actions en actions.ts

---

## Comandos de Testing
- `npm run dev` - Servidor de desarrollo (puerto 3000)
- `npm run build` - Build de producción
- `npm run lint` - Linter
- `npm run typecheck` - Verificación de tipos TypeScript

## URLs Importantes
- Login: http://localhost:3000/login
- Admin: http://localhost:3000/admin
- Dashboard: http://localhost:3000/admin (después del login)