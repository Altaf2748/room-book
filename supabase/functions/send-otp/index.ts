import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

class ResendClient {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(params: {
    from: string;
    to: string[];
    subject: string;
    html: string;
  }) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send email");
    }

    return response.json();
  }
}

const resend = new ResendClient(RESEND_API_KEY || "");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OTPRequest {
  email: string;
  otp: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp }: OTPRequest = await req.json();

    // Validate required fields
    if (!email || !otp) {
      throw new Error("Missing required fields: email and otp");
    }

    const emailResponse = await resend.send({
      from: "Staycation <onboarding@resend.dev>",
      to: [email],
      subject: "Your Verification Code - Staycation",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 0;">
                <table role="presentation" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #c7a17a 0%, #b8956e 100%); padding: 32px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Staycation</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 32px;">
                      <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center;">
                        Your Verification Code
                      </h2>
                      <p style="margin: 0 0 32px; color: #666666; font-size: 16px; line-height: 1.6; text-align: center;">
                        Enter this code to verify your email and complete your sign-in:
                      </p>
                      
                      <!-- OTP Box -->
                      <div style="background: linear-gradient(135deg, #f8f5f1 0%, #f0ebe4 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
                        <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; color: #c7a17a; letter-spacing: 8px;">
                          ${otp}
                        </span>
                      </div>
                      
                      <p style="margin: 0 0 8px; color: #888888; font-size: 14px; text-align: center;">
                        This code expires in <strong>10 minutes</strong>.
                      </p>
                      <p style="margin: 0; color: #888888; font-size: 14px; text-align: center;">
                        If you didn't request this code, please ignore this email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 24px 32px; text-align: center; border-top: 1px solid #eee;">
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} Staycation. All rights reserved.
                      </p>
                      <p style="margin: 8px 0 0; color: #999999; font-size: 12px;">
                        Luxury stays, hourly rates
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("OTP email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
