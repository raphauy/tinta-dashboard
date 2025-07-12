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
          id: 'brand-name',
          type: 'text',
          label: 'Nombre de la marca',
          helpText: 'Nombre de la marca',
          required: true,
          order: 1
        },
        {
          id: 'brand-description',
          type: 'textarea',
          label: 'Descripción breve',
          helpText: '¿Qué hace la marca y cuál es su propósito?',
          required: true,
          order: 2
        },
        {
          id: 'tagline',
          type: 'textarea',
          label: 'Tagline',
          helpText: '¿Tiene un slogan o tagline? (Si tiene o si desea incluir uno en el logo)',
          required: false,
          order: 3
        },
        {
          id: 'brand-values',
          type: 'textarea',
          label: 'Valores y personalidad',
          helpText: '¿Qué valores y personalidad debe reflejar el logo? (Ejemplo: confianza, innovación, cercanía, lujo, minimalismo, etc.)',
          required: true,
          order: 4
        },
        {
          id: 'brand-personality',
          type: 'textarea',
          label: 'Personalidad del logo',
          helpText: 'Si el logo fuera una persona, ¿cómo la describiría?',
          required: true,
          order: 5
        },
        {
          id: 'brand-keywords',
          type: 'textarea',
          label: 'Palabras clave',
          helpText: '¿Con qué palabras clave quiere que se asocie la marca?',
          required: true,
          order: 6
        },
        {
          id: 'corporate-colors',
          type: 'textarea',
          label: 'Colores corporativos',
          helpText: '¿Tienen colores corporativos definidos? (Si no, ¿qué colores les gustaría o cuáles no usarían?)',
          required: false,
          order: 7
        },
        {
          id: 'typography-preferences',
          type: 'textarea',
          label: 'Preferencias tipográficas',
          helpText: '¿Tienen preferencias tipográficas? (Ejemplo: serif, sans serif, manuscrita, decorativa)',
          required: false,
          order: 8
        },
        {
          id: 'logo-type',
          type: 'textarea',
          label: 'Tipo de marca',
          helpText: '¿Imaginan la marca como Isotipo, Logotipo, Imagotipo o Isologo?',
          required: false,
          order: 9
        },
        {
          id: 'reference-logos',
          type: 'textarea',
          label: 'Marcas que admiran',
          helpText: '¿Existen marcas o logos que admiren? (Pueden ser de cualquier sector, ¿qué les gusta de ellos?)',
          required: false,
          order: 10
        },
        {
          id: 'reference-images',
          type: 'textarea',
          label: 'Imágenes de referencia',
          helpText: 'Adjúntalas en esta carpeta',
          required: false,
          order: 11,
          allowAttachments: true
        },
        {
          id: 'elements-to-avoid',
          type: 'textarea',
          label: 'Elementos a evitar',
          helpText: '¿Existen elementos que quieren evitar?',
          required: false,
          order: 12
        },
        {
          id: 'logo-applications',
          type: 'textarea',
          label: 'Lugares de uso',
          helpText: '¿En qué lugares se usará el logo? (Ejemplo: redes sociales, web, packaging, papelería, uniformes, cartelería)',
          required: true,
          order: 13
        },
        {
          id: 'target-audience',
          type: 'textarea',
          label: 'Público objetivo',
          helpText: '¿A qué tipo de cliente o usuario está dirigida la marca? ¿Qué emociones o sensaciones debería generar el logo en la audiencia?',
          required: true,
          order: 14
        },
        {
          id: 'technical-requirements',
          type: 'textarea',
          label: 'Requisitos técnicos',
          helpText: '¿Existen requisitos técnicos o restricciones? ¿Hay un plazo de entrega definido? ¿Tienen un presupuesto estimado para el proyecto?',
          required: false,
          order: 15
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
          id: 'main-objective',
          type: 'textarea',
          label: 'Objetivo principal',
          helpText: '¿Cuál es el objetivo principal de la pieza?',
          required: true,
          order: 1
        },
        {
          id: 'target-audience',
          type: 'textarea',
          label: 'Público objetivo',
          helpText: '¿Cuál es el público objetivo al que estará dirigida la comunicación?',
          required: true,
          order: 2
        },
        {
          id: 'main-message',
          type: 'textarea',
          label: 'Mensaje principal',
          helpText: '¿Qué mensaje principal debe transmitir la pieza? (Puntos clave o ideas centrales)',
          required: true,
          order: 3
        },
        {
          id: 'related-campaign',
          type: 'textarea',
          label: 'Relación con productos/servicios',
          helpText: '¿Se relaciona con algún producto, servicio o campaña específica?',
          required: false,
          order: 4
        },
        {
          id: 'brand-elements',
          type: 'textarea',
          label: 'Elementos de marca',
          helpText: 'Adjuntar elementos de marca previos útiles para el diseño (Ejemplo: logos, manual de identidad, presentaciones, colores, tipografías)',
          required: false,
          order: 5,
          allowAttachments: true
        },
        {
          id: 'style-references',
          type: 'textarea',
          label: 'Referencias estilísticas',
          helpText: 'Hay referencias estilísticas que sirvan de inspiración? (Adjuntar ejemplos)',
          required: false,
          order: 6,
          allowAttachments: true
        },
        {
          id: 'style-restrictions',
          type: 'textarea',
          label: 'Restricciones de estilo',
          helpText: '¿Existen restricciones de estilo o elementos que se deben evitar? (Ejemplo: colores, tipografías, imágenes específicas)',
          required: false,
          order: 7
        },
        {
          id: 'usage-context',
          type: 'textarea',
          label: 'Contexto de uso',
          helpText: '¿Dónde se usará la pieza? (Digital, impreso o ambos)',
          required: true,
          order: 8
        },
        {
          id: 'format-specifications',
          type: 'textarea',
          label: 'Especificaciones de formato',
          helpText: '¿Cuáles son las dimensiones o formatos requeridos? Si es impreso: ¿Tamaño, técnica de impresión y tipo de papel o material? Si es digital: ¿Plataforma o medio donde se publicará? (Ejemplo: redes sociales, email marketing, sitio web, etc.)',
          required: true,
          order: 9
        },
        {
          id: 'additional-specifications',
          type: 'textarea',
          label: 'Especificaciones adicionales',
          helpText: '¿Existen especificaciones adicionales? (Ejemplo: márgenes, troqueles, plegados, adaptaciones para diferentes formatos)',
          required: false,
          order: 10
        },
        {
          id: 'budget-timeline-restrictions',
          type: 'textarea',
          label: 'Presupuesto, tiempo y restricciones',
          helpText: '¿Existe un presupuesto estimado para el proyecto? ¿Tienen un tiempo límite para la entrega ¿Hay restricciones o limitaciones que debamos considerar?',
          required: false,
          order: 11
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
          helpText: 'Nombre de la marca',
          required: true,
          order: 1
        },
        {
          id: 'brand-history',
          type: 'textarea',
          label: 'Historia breve',
          helpText: '¿Cómo nació la marca? ¿Qué camino ha recorrido hasta ahora en el mercado?',
          required: true,
          order: 2
        },
        {
          id: 'brand-perception',
          type: 'textarea',
          label: 'Percepción actual y futura',
          helpText: 'Si la marca tiene trayectoria ¿Cómo crees que es percibida actualmente la marca? (Fortalezas y debilidades según clientes y competencia) y cómo te gustaría que fuera percibida en el futuro? (Valores, emociones y sensaciones que debe transmitir)',
          required: true,
          order: 3
        },
        {
          id: 'brand-personality',
          type: 'textarea',
          label: 'Personalidad de marca',
          helpText: 'Si la marca fuera una persona, ¿cómo sería? (Personalidad, tono de voz, actitudes)',
          required: true,
          order: 4
        },
        {
          id: 'visual-associations',
          type: 'textarea',
          label: 'Asociaciones visuales',
          helpText: '¿Qué colores, formas o imágenes asocias con la marca?',
          required: true,
          order: 5
        },
        {
          id: 'brand-differentiators',
          type: 'textarea',
          label: 'Diferenciadores únicos',
          helpText: '¿Qué hace única a la marca? (Diferenciadores clave frente a la competencia)',
          required: true,
          order: 6
        },
        {
          id: 'customer-motivation',
          type: 'textarea',
          label: 'Motivación del cliente',
          helpText: '¿Qué motiva a los clientes a elegir la marca sobre otras opciones?',
          required: true,
          order: 7
        },
        {
          id: 'brand-benefits',
          type: 'textarea',
          label: 'Beneficios principales',
          helpText: '¿Cuáles son los beneficios principales que la marca comunica y cuáles debería comunicar?',
          required: true,
          order: 8
        },
        {
          id: 'target-lifestyle',
          type: 'textarea',
          label: 'Público objetivo',
          helpText: '¿A quién va dirigida la marca? ¿Cómo es el estilo de vida de sus clientes ideales? (Hábitos, intereses, lugares que frecuentan)',
          required: true,
          order: 9
        },
        {
          id: 'key-concept',
          type: 'textarea',
          label: 'Concepto clave',
          helpText: '¿Con qué palabra o concepto clave debería ser asociada la marca en la mente del consumidor?',
          required: true,
          order: 10
        },
        {
          id: 'competitors',
          type: 'textarea',
          label: 'Competidores principales',
          helpText: '¿Quiénes son los principales competidores? (Directos e indirectos)',
          required: true,
          order: 11
        },
        {
          id: 'admired-brands',
          type: 'textarea',
          label: 'Marcas que admiran',
          helpText: '¿Qué marcas admiran y por qué? (Pueden ser de cualquier sector)',
          required: false,
          order: 12
        },
        {
          id: 'brand-applications',
          type: 'textarea',
          label: 'Lugares y formatos de uso',
          helpText: '¿En qué lugares y formatos se usará la identidad de la marca? (Redes sociales, packaging, papelería, sitio web, etc.)',
          required: true,
          order: 13
        },
        {
          id: 'design-limitations',
          type: 'textarea',
          label: 'Limitaciones del diseño',
          helpText: '¿Existen limitaciones o restricciones para el diseño? (Ejemplo: colores a evitar, normativas, etc.)',
          required: false,
          order: 14
        },
        {
          id: 'budget-timeline',
          type: 'textarea',
          label: 'Presupuesto y timeline',
          helpText: '¿Existe un presupuesto estimado para el proyecto? ¿Tienen una fecha límite para su desarrollo?',
          required: false,
          order: 15
        },
        {
          id: 'visual-references',
          type: 'textarea',
          label: 'Referencias visuales',
          helpText: 'Adjuntar imágenes o referencias visuales que tengan el estilo que buscan para la marca.',
          required: false,
          order: 16,
          allowAttachments: true
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