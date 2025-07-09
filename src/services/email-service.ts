import { Resend } from "resend"
import { render } from "@react-email/render"
import OtpEmail from "@/components/emails/otp-email"

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Envía un email con código OTP
 */
export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  try {
    // Renderizar el template de React Email
    const emailHtml = await render(OtpEmail({ 
      otp, 
      appName: process.env.APP_NAME || "RC Starter Kit" 
    }))

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `Tu código de verificación de ${process.env.APP_NAME || "RC Starter Kit"}`,
      html: emailHtml,
    })
  } catch (error) {
    console.error("Error enviando email:", error)
    throw error
  }
}