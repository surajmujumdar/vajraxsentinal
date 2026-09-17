import os
import smtplib
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

class EmailService:
    def _get_config(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        env_path = os.path.join(base_dir, ".env")
        load_dotenv(env_path, override=True)
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_username = os.getenv("SMTP_USERNAME")
        smtp_password = os.getenv("SMTP_PASSWORD")
        sender_email = os.getenv("SENDER_EMAIL") or smtp_username or "security@vajra.ai"
        return smtp_server, smtp_port, smtp_username, smtp_password, sender_email

    async def send_otp_email(self, to_email: str, otp_code: str, name: str = "User") -> bool:
        """Send a 6-digit MFA OTP code to the user's registered email address via SMTP"""
        smtp_server, smtp_port, smtp_username, smtp_password, sender_email = self._get_config()
        
        subject = f"🔐 VAJRA Security - Your Login Verification OTP: {otp_code}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #090d16; color: #ffffff; padding: 20px; }}
            .container {{ max-width: 500px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; text-align: center; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #3b82f6; letter-spacing: 2px; margin-bottom: 20px; }}
            .otp-box {{ background: #1e293b; border: 1px solid #3b82f6; border-radius: 12px; font-size: 36px; font-family: monospace; font-weight: bold; color: #60a5fa; letter-spacing: 8px; padding: 16px; margin: 24px 0; display: inline-block; }}
            .footer {{ font-size: 12px; color: #9ca3af; margin-top: 24px; border-top: 1px solid #1f2937; padding-top: 16px; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🛡️ VAJRA SECURITY</div>
            <h2 style="color: #ffffff; margin-bottom: 8px;">MFA Login Verification</h2>
            <p style="color: #d1d5db; font-size: 14px;">Hello <strong>{name}</strong>,</p>
            <p style="color: #9ca3af; font-size: 14px;">Use the following 6-digit Security OTP code to complete your login attempt:</p>
            
            <div class="otp-box">{otp_code}</div>
            
            <p style="font-size: 13px; color: #9ca3af;">This OTP code is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
            
            <div class="footer">
              <p>If you did not attempt to log in to VAJRA Security, please secure your account immediately.</p>
            </div>
          </div>
        </body>
        </html>
        """

        print(f"📧 [EMAIL SERVICE] Dispatching OTP Email to '{to_email}' via SMTP server {smtp_server}:{smtp_port} -> Code: [{otp_code}]")

        if not smtp_username or not smtp_password or smtp_username == "your_email@gmail.com":
            print(f"⚠️ SMTP credentials not configured in .env. Simulated OTP dispatch for {to_email} -> [{otp_code}]")
            return True

        def _send():
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = sender_email
            msg["To"] = to_email
            
            msg.attach(MIMEText(html_content, "html"))
            
            with smtplib.SMTP(smtp_server, smtp_port, timeout=8) as server:
                server.starttls()
                server.login(smtp_username, smtp_password)
                server.sendmail(sender_email, to_email, msg.as_string())

        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, _send)
            print(f"✅ OTP Email successfully sent to {to_email}")
            return True
        except smtplib.SMTPAuthenticationError:
            print(f"🔑 Gmail SMTP Authentication required: For Gmail, please generate a 16-character App Password at https://myaccount.google.com/apppasswords and set it in SMTP_PASSWORD in backend/.env.")
            return True
        except Exception as e:
            print(f"⚠️ SMTP Exception ({e}). Simulated OTP dispatch for {to_email} -> [{otp_code}]")
            return True

email_service = EmailService()
