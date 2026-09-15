const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Add Resend import and map
const importResend = `import { Resend } from 'resend';\n\n// Store OTPs temporarily\nconst otpStorage = new Map<string, { code: string; expiresAt: number }>();\n`;
code = code.replace(/import express from "express";/, importResend + 'import express from "express";');

// 2. Replace the entire sendOfficialOTPEmail and /api/send-otp
const newSendOtp = `
  // API Route to dispatch real email verification codes via Resend
  app.post("/api/send-otp", async (req, res) => {
    const { email, lang } = req.body;
    if (!email) {
      res.status(400).json({ success: false, error: "Missing required params: email." });
      return;
    }

    try {
      console.log(\`Attempting to generate and send OTP to \${email}...\`);
      
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins
      otpStorage.set(email, { code, expiresAt });

      const resendKey = process.env.RESEND_API_KEY;
      const fromEmail = process.env.EMAIL_FROM || "security-auth@moe.om";
      
      if (!resendKey) {
        // Fallback for dev mode if no key provided
        res.status(200).json({ 
          success: true, 
          code, // Returning code for sandbox testing
          message: "No Resend key provided. OTP generated for sandbox testing." 
        });
        return;
      }

      const resend = new Resend(resendKey);
      
      const subject = lang === 'ar' 
        ? "رمز التحقق الموثّق لإعادة تعيين كلمة مرور البوابة التعليمية" 
        : "Security OTP Verification Code - MoE Administrative Portal";

      const emailHtml = lang === 'ar' ? \`
        <div style="direction: rtl; text-align: right; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background-color: #821315; padding: 26px 20px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 21px; font-weight: 800; letter-spacing: -0.5px;">سلطنة عمان - وزارة التعليم</h2>
            <p style="margin: 4px 0 0 0; font-size: 11px; opacity: 0.9; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">البوابة التعليمية الموحدة للمحتوى والامتحانات</p>
          </div>
          <div style="padding: 30px 25px;">
            <h3 style="color: #0f172a; margin-top: 0; font-size: 16px;">مرحباً بك في بوابة الإدارة الشاملة،</h3>
            <p style="color: #475569; font-size: 13px; line-height: 1.6;">لقد تلقينا طلباً لتوثيق وتعديل الصلاحيات الخاصة بحسابك الأكاديمي. يرجى استخدام رمز التوثيق الرسمي التالي المكون من 6 أرقام لتأكيد هويتك:</p>
            
            <div style="background-color: #f8fafc; border: 2px dashed #821315; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 25px;">
              <span style="font-family: monospace; font-size: 36px; font-weight: 900; color: #821315; letter-spacing: 10px;">\${code}</span>
            </div>
            
            <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 12px 15px; margin-bottom: 20px;">
              <p style="font-size: 11.5px; color: #b45309; font-weight: bold; margin: 0; line-height: 1.5;">🔒 تحذير أمني هام:</p>
              <p style="font-size: 11px; color: #d97706; margin: 3px 0 0 0; line-height: 1.5;">صلاحية هذا الرمز تنتهي خلال 15 دقيقة. يمنع منعاً باتاً مشاركة رمز التحقق مع أي شخص آخر، علماً بأن موظفي الوزارة لن يطلبوا منك الإفصاح عن أرقامك السرية أبداً.</p>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;">
            <p style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin: 0;">إذا لم تقم بطلب هذا التوثيق، لا حاجة لاتخاذ أي إجراء، وستبقى بياناتك بأمان تام.</p>
          </div>
          <div style="background-color: #f8fafc; padding: 18px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 10.5px; color: #94a3b8; font-family: sans-serif;">
            تم إصدار هذه الرسالة تلقائياً من نظام الأمان التابع لوزارة التربية والتعليم. © 2026 سلطنة عمان.
          </div>
        </div>
      \` : \`
        <div style="direction: ltr; text-align: left; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background-color: #821315; padding: 26px 20px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 21px; font-weight: 800; letter-spacing: -0.5px;">Sultanate of Oman - MoE</h2>
            <p style="margin: 4px 0 0 0; font-size: 11px; opacity: 0.9; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Unified Educational Portal</p>
          </div>
          <div style="padding: 30px 25px;">
            <h3 style="color: #0f172a; margin-top: 0; font-size: 16px;">Welcome to the Administrative Gateway,</h3>
            <p style="color: #475569; font-size: 13px; line-height: 1.6;">We have received a request to override the academic password for your profile. Please use the following official 6-digit verification code to establish your password:</p>
            
            <div style="background-color: #f8fafc; border: 2px dashed #821315; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 25px;">
              <span style="font-family: monospace; font-size: 36px; font-weight: 900; color: #821315; letter-spacing: 10px;">\${code}</span>
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
      \`;

      const { data, error } = await resend.emails.send({
        from: \`Oman MoE Security <\${fromEmail}>\`,
        to: [email],
        subject: subject,
        html: emailHtml
      });

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      res.status(200).json({ 
        success: true, 
        message: \`Email successfully dispatched to \${email}\`,
        code // returning code temporarily so the sandbox frontend still displays it
      });

    } catch (err) {
      console.error("Email dispatch failure detail:", err);
      res.status(500).json({ 
        success: false, 
        error: err.message || "Internal server error occurred while sending email." 
      });
    }
  });

  app.post("/api/verify-otp", async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
      res.status(400).json({ success: false, error: "Missing email or code." });
      return;
    }

    const stored = otpStorage.get(email);
    if (!stored) {
      res.status(400).json({ success: false, error: "No OTP found or expired." });
      return;
    }

    if (Date.now() > stored.expiresAt) {
      otpStorage.delete(email);
      res.status(400).json({ success: false, error: "OTP has expired." });
      return;
    }

    if (stored.code === code) {
      otpStorage.delete(email);
      res.status(200).json({ success: true, message: "OTP verified successfully." });
    } else {
      res.status(400).json({ success: false, error: "Invalid OTP." });
    }
  });
`;

code = code.replace(/async function sendOfficialOTPEmail[\s\S]*?async function startServer\(\) \{/, 'async function startServer() {');

code = code.replace(/\/\/ API Route to dispatch real email verification codes via SMTP or Resend[\s\S]*?  \/\/ Download the official moderation PDF guidelines uploaded by the user/, newSendOtp + '\n  // Download the official moderation PDF guidelines uploaded by the user');

fs.writeFileSync('server.ts', code);
