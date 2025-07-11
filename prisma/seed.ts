import { PrismaClient, Role, WorkspaceRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Crear superadmin
  const superadmin = await prisma.user.upsert({
    where: { email: 'rapha.uy@rapha.uy' },
    update: {
      role: Role.superadmin,
    },
    create: {
      email: 'rapha.uy@rapha.uy',
      name: 'Super Admin',
      role: Role.superadmin,
    },
  })

  console.log('Superadmin created:', superadmin)

  // Crear workspace de ejemplo
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Default Workspace',
      slug: 'default',
      description: 'Workspace por defecto del sistema',
    },
  })

  console.log('Default workspace created:', workspace)

  // Agregar superadmin al workspace como admin
  await prisma.workspaceUser.upsert({
    where: {
      userId_workspaceId: {
        userId: superadmin.id,
        workspaceId: workspace.id,
      },
    },
    update: {},
    create: {
      userId: superadmin.id,
      workspaceId: workspace.id,
      role: WorkspaceRole.admin,
    },
  })

  console.log('Superadmin added to default workspace')

  // Crear usuario normal de ejemplo
  const normalUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Usuario Normal',
      // Sin rol de sistema - es un usuario normal
    },
  })

  // Agregar usuario normal al workspace
  await prisma.workspaceUser.upsert({
    where: {
      userId_workspaceId: {
        userId: normalUser.id,
        workspaceId: workspace.id,
      },
    },
    update: {},
    create: {
      userId: normalUser.id,
      workspaceId: workspace.id,
      role: WorkspaceRole.member,
    },
  })

  console.log('Normal user created and added to workspace:', normalUser)

  // Crear plantillas predefinidas de formularios basadas en los PDFs de Tinta
  const logoTemplate = await prisma.formTemplate.upsert({
    where: { 
      id: 'logo-brief-template' 
    },
    update: {},
    create: {
      id: 'logo-brief-template',
      name: 'Brief de Logotipo',
      description: 'Plantilla para recopilar información necesaria para el diseño de logotipos',
      fields: [
        {
          id: 'company-name',
          type: 'text',
          label: 'Nombre de la empresa',
          helpText: 'Ingrese el nombre completo de la empresa',
          required: true,
          order: 1
        },
        {
          id: 'company-description',
          type: 'textarea',
          label: 'Descripción de la empresa',
          helpText: 'Describa brevemente qué hace su empresa',
          required: true,
          order: 2
        },
        {
          id: 'target-audience',
          type: 'textarea',
          label: 'Público objetivo',
          helpText: '¿A quién se dirige su empresa? Describa su audiencia target',
          required: true,
          order: 3
        },
        {
          id: 'logo-style',
          type: 'textarea',
          label: 'Estilo de logotipo deseado',
          helpText: 'Describa el estilo que busca (moderno, clásico, minimalista, etc.)',
          required: true,
          order: 4
        },
        {
          id: 'color-preferences',
          type: 'textarea',
          label: 'Preferencias de color',
          helpText: 'Indique colores que le gusten o que representen su marca',
          required: false,
          order: 5
        },
        {
          id: 'inspiration-files',
          type: 'file',
          label: 'Archivos de inspiración',
          helpText: 'Suba imágenes, logos o referencias que le inspiren',
          required: false,
          order: 6,
          properties: {
            accept: ['image/jpeg', 'image/png', 'application/pdf'],
            multiple: true,
            maxFiles: 5
          }
        }
      ],
      createdById: superadmin.id
    }
  })

  const designTemplate = await prisma.formTemplate.upsert({
    where: { 
      id: 'design-brief-template' 
    },
    update: {},
    create: {
      id: 'design-brief-template',
      name: 'Brief de Diseño',
      description: 'Plantilla para proyectos de diseño general y materiales gráficos',
      fields: [
        {
          id: 'project-name',
          type: 'text',
          label: 'Nombre del proyecto',
          helpText: 'Indique el nombre o título del proyecto de diseño',
          required: true,
          order: 1
        },
        {
          id: 'project-type',
          type: 'text',
          label: 'Tipo de proyecto',
          helpText: 'Ej: Folleto, tarjetas, packaging, web, etc.',
          required: true,
          order: 2
        },
        {
          id: 'project-objectives',
          type: 'textarea',
          label: 'Objetivos del proyecto',
          helpText: '¿Qué busca lograr con este diseño?',
          required: true,
          order: 3
        },
        {
          id: 'design-specifications',
          type: 'textarea',
          label: 'Especificaciones técnicas',
          helpText: 'Dimensiones, formatos, cantidad, etc.',
          required: true,
          order: 4
        },
        {
          id: 'content-text',
          type: 'textarea',
          label: 'Contenido y textos',
          helpText: 'Proporcione todos los textos que deben incluirse',
          required: false,
          order: 5
        },
        {
          id: 'reference-materials',
          type: 'file',
          label: 'Materiales de referencia',
          helpText: 'Suba logos, imágenes, documentos de marca, etc.',
          required: false,
          order: 6,
          properties: {
            accept: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            multiple: true,
            maxFiles: 10
          }
        }
      ],
      createdById: superadmin.id
    }
  })

  const brandTemplate = await prisma.formTemplate.upsert({
    where: { 
      id: 'brand-brief-template' 
    },
    update: {},
    create: {
      id: 'brand-brief-template',
      name: 'Brief de Marca',
      description: 'Plantilla completa para desarrollo de identidad de marca',
      fields: [
        {
          id: 'brand-name',
          type: 'text',
          label: 'Nombre de la marca',
          helpText: 'Nombre oficial de la marca o empresa',
          required: true,
          order: 1
        },
        {
          id: 'brand-values',
          type: 'textarea',
          label: 'Valores de marca',
          helpText: '¿Cuáles son los valores fundamentales de su marca?',
          required: true,
          order: 2
        },
        {
          id: 'brand-personality',
          type: 'textarea',
          label: 'Personalidad de marca',
          helpText: 'Si su marca fuera una persona, ¿cómo sería?',
          required: true,
          order: 3
        },
        {
          id: 'competitive-landscape',
          type: 'textarea',
          label: 'Competencia',
          helpText: '¿Quiénes son sus principales competidores?',
          required: true,
          order: 4
        },
        {
          id: 'brand-positioning',
          type: 'textarea',
          label: 'Posicionamiento deseado',
          helpText: '¿Cómo quiere que su marca sea percibida?',
          required: true,
          order: 5
        },
        {
          id: 'visual-preferences',
          type: 'textarea',
          label: 'Preferencias visuales',
          helpText: 'Describa el estilo visual que busca para su marca',
          required: false,
          order: 6
        },
        {
          id: 'brand-applications',
          type: 'textarea',
          label: 'Aplicaciones de marca',
          helpText: '¿Dónde se usará la marca? (web, impreso, packaging, etc.)',
          required: true,
          order: 7
        },
        {
          id: 'brand-assets',
          type: 'file',
          label: 'Assets existentes',
          helpText: 'Suba logos actuales, materiales existentes, referencias',
          required: false,
          order: 8,
          properties: {
            accept: ['image/jpeg', 'image/png', 'application/pdf', 'application/zip'],
            multiple: true,
            maxFiles: 15
          }
        }
      ],
      createdById: superadmin.id
    }
  })

  console.log('Form templates created:', {
    logoTemplate: logoTemplate.name,
    designTemplate: designTemplate.name,
    brandTemplate: brandTemplate.name
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })