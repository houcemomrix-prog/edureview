import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";

// Initialize Gemini Client Lazily/Carefully
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined. Please add it to your secrets or environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Global utility helper to send a Real OTP email
async function sendOfficialOTPEmail(email: string, code: string, lang: 'ar' | 'en' = 'ar'): Promise<{ success: boolean; provider: string; details?: string }> {
  const provider = process.env.EMAIL_PROVIDER || 'smtp';
  const resendKey = process.env.RESEND_API_KEY;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || '587';
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.EMAIL_FROM || "security-auth@moe.om";

  const isSMTPConfigured = !!(smtpHost && smtpUser && smtpPass);
  const isResendConfigured = !!resendKey;

  const subject = lang === 'ar' 
    ? "رمز التحقق الموثّق لإعادة تعيين كلمة مرور البوابة التعليمية" 
    : "Security OTP Verification Code - MoE Administrative Portal";

  const emailHtml = lang === 'ar' ? `
    <div style="direction: rtl; text-align: right; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #821315; padding: 26px 20px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 21px; font-weight: 800; letter-spacing: -0.5px;">سلطنة عمان - وزارة التربية والتعليم</h2>
        <p style="margin: 4px 0 0 0; font-size: 11px; opacity: 0.9; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">البوابة التعليمية الموحدة للمحتوى والامتحانات</p>
      </div>
      <div style="padding: 35px 25px; background-color: #ffffff;">
        <p style="font-size: 15px; color: #1e293b; line-height: 1.6; font-weight: bold; margin-bottom: 15px;">أهلاً بك في بوابة سلطنة عمان الأكاديمية المشتركة،</p>
        <p style="font-size: 13.5px; color: #334155; line-height: 1.6; margin-bottom: 25px;">لقد تلقينا طلباً لتجاوز وتحديث رمز المرور الأمني الخاص بملفك التربوي. يرجى إدخال رمز الأمان الفريد التالي في البوابة لإتمام تعيين كلمة السر الجديدة:</p>
        
        <div style="background-color: #f8fafc; border: 2px dashed #821315; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 25px;">
          <span style="font-family: monospace; font-size: 36px; font-weight: 900; color: #821315; letter-spacing: 10px;">${code}</span>
        </div>

        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 12px 15px; margin-bottom: 20px;">
          <p style="font-size: 11.5px; color: #b45309; font-weight: bold; margin: 0; line-height: 1.5;">🔒 تنبيه أمني هام جداً:</p>
          <p style="font-size: 11px; color: #d97706; margin: 3px 0 0 0; line-height: 1.5;">هذا الرمز مخصص للاستخدام الأحادي وصالح لمستقبلك الشخصي فقط. لا تفصح عن هذا الرمز لأي طرف خارجي. طاقم الإشراف والتحقق بالوزارة لن يطلب منك هذا الرمز أبداً تحت أي ظرف.</p>
        </div>

        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;">
        <p style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin: 0;">إذا لم تكن أنت من بادر بإجراء هذا الطلب المباشر، يمكنك تجاهل هذه الرسالة حيث لم تطرأ أي تغييرات أمنية غير مصرح بها على حسابك حتى الآن.</p>
      </div>
      <div style="background-color: #f8fafc; padding: 18px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 10.5px; color: #94a3b8; font-family: sans-serif;">
        تم إصدار هذه الرسالة الآمنة تلقائياً بنظام التثبت المشترك. © 2026 سلطنة عمان. جميع الحقوق محفوظة.
      </div>
    </div>
  ` : `
    <div style="direction: ltr; text-align: left; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #821315; padding: 26px 20px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 19px; font-weight: 800; letter-spacing: -0.5px;">Sultanate of Oman - Ministry of Education</h2>
        <p style="margin: 4px 0 0 0; font-size: 10px; opacity: 0.9; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Unified Educational Portal Security Hub</p>
      </div>
      <div style="padding: 35px 25px; background-color: #ffffff;">
        <p style="font-size: 15px; color: #1e293b; line-height: 1.6; font-weight: bold; margin-bottom: 15px;">Greetings Academic Portal User,</p>
        <p style="font-size: 13.5px; color: #334155; line-height: 1.6; margin-bottom: 25px;">We received a request to override the academic password for your profile. Please use the following official 6-digit verification code to establish your password:</p>
        
        <div style="background-color: #f8fafc; border: 2px dashed #821315; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 25px;">
          <span style="font-family: monospace; font-size: 36px; font-weight: 900; color: #821315; letter-spacing: 10px;">${code}</span>
        </div>

        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 12px 15px; margin-bottom: 20px;">
          <p style="font-size: 11.5px; color: #b45309; font-weight: bold; margin: 0; line-height: 1.5;">🔒 Critical Security Warning:</p>
          <p style="font-size: 11px; color: #d97706; margin: 3px 0 0 0; line-height: 1.5;">This registration token expires in 15 minutes. Never disclose this transaction code to anyone. Ministry staff will never ask for your authentication keys.</p>
        </div>

        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;">
        <p style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin: 0;">If you did not initiate this authentication request, no further actions are needed. Your lock credentials remain intact.</p>
      </div>
      <div style="background-color: #f8fafc; padding: 18px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 10.5px; color: #94a3b8; font-family: sans-serif;">
        Automatic dispatch statement issued by the Oman MoE Security Portal. © 2026 Sultanate of Oman.
      </div>
    </div>
  `;

  if (isResendConfigured && (provider === 'resend' || !isSMTPConfigured)) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`
      },
      body: JSON.stringify({
        from: `Oman MoE Security <${fromEmail}>`,
        to: [email],
        subject: subject,
        html: emailHtml
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { success: false, provider: 'resend', details: errorText };
    }
    return { success: true, provider: 'resend' };
  } else if (isSMTPConfigured) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpPort === '465', // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    await transporter.sendMail({
      from: `"Oman MoE Security" <${smtpUser}>`,
      to: email,
      subject: subject,
      html: emailHtml
    });
    return { success: true, provider: 'smtp' };
  } else {
    return { success: false, provider: 'none', details: 'No server-side credentials set' };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing middleware
  app.use(express.json());

  // --- API Routes FIRST ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API Route to dispatch real email verification codes via SMTP or Resend
  app.post("/api/send-otp", async (req, res) => {
    const { email, code, lang } = req.body;
    if (!email || !code) {
      res.status(400).json({ success: false, error: "Missing required params: email, code." });
      return;
    }

    try {
      console.log(`Attempting to send real OTP ${code} to ${email}...`);
      const sendResult = await sendOfficialOTPEmail(email, code, lang);
      
      if (sendResult.success) {
        res.status(200).json({ 
          success: true, 
          provider: sendResult.provider,
          message: `Email successfully dispatched to ${email} via ${sendResult.provider}` 
        });
      } else {
        res.status(200).json({ 
          success: false, 
          provider: sendResult.provider, 
          error: sendResult.details || "No SMTP or Resend credentials provided in Server environment variables." 
        });
      }
    } catch (err: any) {
      console.error("Email dispatch failure detail:", err);
      res.status(500).json({ 
        success: false, 
        error: err.message || "Internal server error occurred while sending email." 
      });
    }
  });


  // Download the official moderation PDF guidelines uploaded by the user
  app.get("/api/download-guidelines-pdf", (req, res) => {
    const filePath = path.join(process.cwd(), "__ ضوابط الفحص والتدقيق النهائي نوفمبر 2025_1_2_3_4_5_6_7_8_9.pdf");
    res.download(filePath, "Examination_and_Verification_Regulations_Oman_Nov_2025.pdf", (err) => {
      if (err) {
        console.error("Guidelines PDF download error:", err);
        if (!res.headersSent) {
          res.status(404).send("File not found or cannot be downloaded.");
        }
      }
    });
  });

  // AI-Assisted Syllabus Matching and Pedagogical Integrity Pre-Check
  app.post("/api/ai-precheck", async (req, res) => {
    try {
      const { title, type, grade, subject, description, questions, keyAnswer } = req.body;

      if (!title || !questions || !keyAnswer) {
        res.status(400).json({ error: "Missing required fields for pre-check." });
        return;
      }

      const client = getGeminiClient();

      const systemInstruction = `You are an expert curriculum supervisor and educational quality controller for the Ministry of Education (MOE) of the Sultanate of Oman.
Your job is to analyze the uploaded student exam/quiz paper and provide professional, polite, and actionable feedback before they are sent to the human moderation team.
Focus your review on:
1. Syllabus Alignment & Grade Appropriateness for ${grade} in the subject of ${subject}.
2. Scientific/Factual Integrity and clarity of wording in the questions.
3. Marking scheme accuracy and completeness of the answer keys.
4. Correctness of formatting, spelling, and grade weightings.

Always output your response in structured JSON with the following format:
{
  "gradeVerdict": "Appropriate" | "Too Simple" | "Too Challenging" | "Requires Corrections",
  "syllabusMatchScore": 0-100 (integer representing level of alignment),
  "detailedFeedback": "markdown formatted feedback addressing clarity, curriculum fit, and spelling",
  "suggestedImprovements": [
    "improvement idea 1",
    "improvement idea 2"
  ]
}`;

      const prompt = `Please review this draft assessment:
Title: ${title}
Type: ${type}
Target Grade: ${grade}
Subject: ${subject}
Description: ${description || "None provided"}

QUESTIONS:
"""
${questions}
"""

MARKING GUIDE / ANSWER KEY:
"""
${keyAnswer}
"""
`;

      const gRes = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.2, // Low temperature for high precision and analytical feedback
        }
      });

      const responseText = gRes.text;
      if (!responseText) {
        throw new Error("No response from the moderation analysis model.");
      }

      res.status(200).json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.error("AI Pre-Check failure: ", error);
      res.status(500).json({ 
        error: error.message || "An unexpected error occurred during AI moderation assessment." 
      });
    }
  });

  // --- Serve Client/Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Support Express v4 generic catchall SPA matcher
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MOE Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
