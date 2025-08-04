import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getFormResponseById } from '@/services/form-response-service'
import { generateResponsePDF, processResponseImages } from '@/services/pdf-export-service'
import { generatePDFHTML } from '@/lib/pdf/generate-pdf-html'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener responseId del body
    const body = await request.json()
    const { responseId } = body

    if (!responseId) {
      return NextResponse.json(
        { error: 'ID de respuesta requerido' },
        { status: 400 }
      )
    }

    // Obtener la respuesta
    const response = await getFormResponseById(responseId)
    if (!response) {
      return NextResponse.json(
        { error: 'Respuesta no encontrada' },
        { status: 404 }
      )
    }

    // Procesar imágenes
    const processedResponse = await processResponseImages(response)

    // Generar HTML
    const fullHTML = generatePDFHTML(processedResponse)

    // Generar PDF
    const result = await generateResponsePDF(
      {
        responseId,
        userId: session.user.id
      },
      {},
      fullHTML
    )

    if (!result.success || !result.pdfBuffer) {
      return NextResponse.json(
        { error: result.error || 'Error al generar PDF' },
        { status: 500 }
      )
    }

    // Generar nombre de archivo
    const formTitle = response.form.title2 
      ? `${response.form.title}-${response.form.title2}` 
      : response.form.title
    const sanitizedTitle = formTitle.replace(/[^a-zA-Z0-9-_]/g, '_')
    const date = new Date(response.submittedAt).toISOString().split('T')[0]
    const filename = `respuesta-${sanitizedTitle}-${date}.pdf`

    // Retornar el PDF
    return new NextResponse(result.pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': result.pdfBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Error generando PDF:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}