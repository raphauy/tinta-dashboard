import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components'

interface OtpEmailProps {
  otp?: string
}

export default function OtpEmail({ otp = "123456" }: OtpEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu código de verificación de Tinta Agency: {otp}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto py-4 px-4 w-[580px] max-w-full">
            <Section className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              {/* Header with Tinta branding */}
              <Section 
                className="text-white text-center py-4" 
                style={{background: '#143F3B', color: '#ffffff', textAlign: 'center', padding: '16px 0'}}
              >
                <Container className="px-4">
                  <Heading className="text-lg font-bold m-0 text-white" style={{color: '#ffffff', margin: 0}}>Tinta Agency</Heading>
                  <Text className="text-white mt-1 mb-0 text-sm opacity-90" style={{color: '#ffffff', fontSize: '14px', margin: '4px 0 0 0'}}>Embajadores de la cultura del vino</Text>
                </Container>
              </Section>

              {/* Main content */}
              <Section className="px-4 pt-2 pb-3">
                <Heading className="text-gray-900 text-lg font-semibold mb-2 mt-0">
                  Tu código de verificación
                </Heading>
                
                <Text className="text-gray-600 mb-4 leading-5 text-sm">
                  Usa el siguiente código de verificación para completar tu inicio de sesión. Este código expirará en 10 minutos.
                </Text>

                {/* OTP Code Box */}
                <Section className="text-center mb-4">
                  <div 
                    className="inline-block rounded-lg py-3 px-5"
                    style={{
                      backgroundColor: '#EBEBEB',
                      border: '2px dashed #DDBBC0',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      display: 'inline-block'
                    }}
                  >
                    <Text 
                      className="text-2xl font-bold tracking-[0.5em] m-0"
                      style={{
                        color: '#143F3B',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        letterSpacing: '0.5em',
                        margin: 0
                      }}
                    >
                      {otp}
                    </Text>
                  </div>
                </Section>

                <Text className="text-gray-600 text-xs leading-4 mb-3">
                  Por tu seguridad, no compartas este código con nadie. Si no solicitaste este código de verificación, ignora este email.
                </Text>

                {/* Security notice */}
                <Section 
                  className="rounded-lg p-2"
                  style={{
                    backgroundColor: '#E2E369',
                    border: '1px solid #AE8928',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                >
                  <Text 
                    className="text-xs m-0 font-medium"
                    style={{color: '#2E2E2E', fontSize: '12px', margin: 0, fontWeight: '500'}}
                  >
                    🔒 Tip de seguridad: Nunca te pediremos tu código de verificación por teléfono, email u otro método.
                  </Text>
                </Section>
              </Section>

              {/* Footer */}
              <Section 
                className="px-4 py-3"
                style={{
                  backgroundColor: '#EBEBEB',
                  borderTop: '1px solid #d1d5db',
                  padding: '12px 16px'
                }}
              >
                <Text 
                  className="text-xs text-center m-0"
                  style={{color: '#6b7280', fontSize: '12px', textAlign: 'center', margin: 0}}
                >
                  Este email fue enviado como parte de la seguridad de tu cuenta de Tinta Agency.
                </Text>
                <Text 
                  className="text-xs text-center mt-1 mb-0"
                  style={{color: '#9ca3af', fontSize: '12px', textAlign: 'center', margin: '4px 0 0 0'}}
                >
                  © 2025 Tinta Agency. Embajadores de la cultura del vino.
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}