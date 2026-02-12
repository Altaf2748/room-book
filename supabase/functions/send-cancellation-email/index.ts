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

interface CancellationEmailRequest {
  email: string;
  guestName: string;
  roomName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  bookingId: string;
  depositPaid: number;
  refundAmount: number;
  refundPercentage: number;
  policyMessage: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      email,
      guestName,
      roomName,
      bookingDate,
      startTime,
      endTime,
      bookingId,
      depositPaid,
      refundAmount,
      refundPercentage,
      policyMessage,
    }: CancellationEmailRequest = await req.json();

    // Validate required fields
    if (!email || !guestName || !roomName || !bookingDate) {
      throw new Error("Missing required fields");
    }

    const formattedDate = new Date(bookingDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formatTime12h = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const badgeColor = refundPercentage === 100 
      ? '#10b981' // green
      : refundPercentage === 50
      ? '#f59e0b' // amber
      : '#ef4444'; // red

    const emailResponse = await resend.send({
      from: "StayHour Bookings <onboarding@resend.dev>",
      to: [email],
      subject: `Booking Cancelled - ${roomName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Cancelled</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Booking Cancelled</h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9);">Your reservation has been cancelled</p>
            </div>
            
            <!-- Content -->
            <div style="background-color: #ffffff; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px;">
                Hello <strong>${guestName}</strong>,
              </p>
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px;">
                Your booking with StayHour has been successfully cancelled. Here are your cancellation details:
              </p>
              
              <!-- Booking Details Card -->
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #ef4444;">
                <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 20px; font-weight: 600;">${roomName}</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">📅 Date</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500; text-align: right;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">🕐 Time</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500; text-align: right;">${formatTime12h(startTime)} - ${formatTime12h(endTime)}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Refund Details -->
              <div style="background-color: #fef3c7; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px; color: #92400e; font-size: 16px; font-weight: 600;">💰 Refund Details</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #92400e; font-size: 14px;">Deposit Paid</td>
                    <td style="padding: 8px 0; color: #92400e; font-size: 14px; font-weight: 600; text-align: right;">₹${depositPaid.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #92400e; font-size: 14px;">Refund Percentage</td>
                    <td style="padding: 8px 0; color: #92400e; font-size: 14px; font-weight: 600; text-align: right;">${refundPercentage}%</td>
                  </tr>
                  <tr style="border-top: 2px solid #fcd34d;">
                    <td style="padding: 12px 0; color: #92400e; font-size: 16px; font-weight: 700;">Refund Amount</td>
                    <td style="padding: 12px 0; color: #92400e; font-size: 16px; font-weight: 700; text-align: right;">₹${refundAmount.toLocaleString('en-IN')}</td>
                  </tr>
                </table>

                <div style="margin-top: 16px; padding: 12px; background-color: rgba(255, 255, 255, 0.5); border-radius: 8px;">
                  <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
                    <strong>Policy:</strong> ${policyMessage}
                  </p>
                </div>
              </div>

              <!-- Processing Information -->
              <div style="background-color: #f0fdf4; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #10b981;">
                <h3 style="margin: 0 0 12px; color: #166534; font-size: 16px; font-weight: 600;">✓ What happens next?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #166534; font-size: 14px; line-height: 1.8;">
                  ${refundAmount > 0 
                    ? `<li>Your refund of <strong>₹${refundAmount.toLocaleString('en-IN')}</strong> will be processed within 5-7 business days</li>`
                    : `<li>Per the cancellation policy, no refund is applicable for this cancellation</li>`
                  }
                  <li>The refund will be credited to the original payment method</li>
                  <li>You'll receive a confirmation email once the refund is processed</li>
                </ul>
              </div>
              
              <!-- Booking Reference -->
              <div style="text-align: center; padding: 16px; background-color: #f3f4f6; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Original Booking Reference</p>
                <p style="margin: 4px 0 0; color: #1f2937; font-size: 18px; font-weight: 700; font-family: monospace;">${bookingId.slice(0, 8).toUpperCase()}</p>
              </div>

              <!-- Support -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  Have questions about your cancellation?
                </p>
                <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">
                  Contact us at <strong>support@stayhour.com</strong>
                </p>
              </div>
              
              <!-- Footer -->
              <div style="margin-top: 32px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 24px;">
                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                  © ${new Date().getFullYear()} StayHour. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Cancellation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-cancellation-email function:", error);
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
