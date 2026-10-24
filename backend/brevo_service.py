import os
import threading
import requests

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def get_brevo_config():
    """Retrieve Brevo API key and sender details from environment variables."""
    api_key = os.environ.get("BREVO_API_KEY", "").strip()
    sender_email = os.environ.get("BREVO_SENDER_EMAIL", "").strip()
    sender_name = os.environ.get("BREVO_SENDER_NAME", "Campus Circle").strip() or "Campus Circle"
    return api_key, sender_email, sender_name


def send_brevo_email(to_email, to_name, subject, html_content):
    """
    Directly call Brevo's transactional email API (v3).
    Returns (success: bool, response_or_error: str)
    """
    api_key, sender_email, sender_name = get_brevo_config()

    if not api_key:
        print("[Brevo Warning] BREVO_API_KEY is not configured in .env. Skipping email dispatch.")
        return False, "BREVO_API_KEY missing"

    if not sender_email:
        print("[Brevo Warning] BREVO_SENDER_EMAIL is not configured in .env. Skipping email dispatch.")
        return False, "BREVO_SENDER_EMAIL missing"

    if not to_email:
        print("[Brevo Warning] Recipient email is empty.")
        return False, "Recipient email missing"

    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json",
    }

    payload = {
        "sender": {
            "name": sender_name,
            "email": sender_email,
        },
        "to": [
            {
                "email": to_email,
                "name": to_name or to_email.split("@")[0],
            }
        ],
        "subject": subject,
        "htmlContent": html_content,
    }

    try:
        response = requests.post(BREVO_API_URL, json=payload, headers=headers, timeout=10)
        if response.status_code in (200, 201, 202):
            msg_id = response.json().get("messageId", "ok")
            print(f"[Brevo Success] Email sent to {to_email}. MessageId: {msg_id}")
            return True, msg_id
        else:
            err = f"HTTP {response.status_code}: {response.text}"
            print(f"[Brevo Error] Failed to send email to {to_email}: {err}")
            return False, err
    except Exception as e:
        err = str(e)
        print(f"[Brevo Exception] Error sending to {to_email}: {err}")
        return False, err


def send_email_in_background(to_email, to_name, subject, html_content):
    """Dispatches email sending asynchronously so user requests are never blocked."""
    t = threading.Thread(
        target=send_brevo_email,
        args=(to_email, to_name, subject, html_content),
        daemon=True,
    )
    t.start()


# ─────────────────────────────────────────────────────────────────────────────
# HTML Email Templates (Campus Circle Brand Theme: #243b31 & #cfe870)
# ─────────────────────────────────────────────────────────────────────────────

def build_welcome_html(user):
    name = user.get("name", "Student")
    email = user.get("email", "")
    reg_no = user.get("reg_no", "N/A")
    department = user.get("department", "N/A")
    class_name = user.get("class", "N/A")

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Campus Circle</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2d3748;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f6f4; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #243b31; padding: 32px 30px; text-align: left;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <span style="display: inline-block; background-color: #cfe870; color: #243b31; font-weight: 800; font-size: 20px; width: 36px; height: 36px; line-height: 36px; text-align: center; border-radius: 50%; margin-right: 10px; vertical-align: middle;">c.</span>
                    <span style="color: #ffffff; font-size: 24px; font-weight: 700; vertical-align: middle; letter-spacing: -0.5px;">Campus Circle</span>
                  </td>
                </tr>
              </table>
              <p style="color: #cfe870; margin: 10px 0 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                Er. Perumal Manimekalai College of Engineering
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 35px 30px;">
              <h1 style="color: #1a202c; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 12px;">
                Welcome to Campus Circle, {name}! 🎓
              </h1>
              <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                Your account is active. You can now discover all college events, register with a single click, and generate verifiable participation certificates.
              </p>

              <!-- Student Profile Card -->
              <div style="background-color: #f9fbf9; border: 1px solid #e2ebd8; border-left: 4px solid #243b31; border-radius: 8px; padding: 18px 20px; margin: 24px 0;">
                <h3 style="color: #243b31; font-size: 14px; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 12px 0;">
                  Student Profile Details
                </h3>
                <table role="presentation" width="100%" style="font-size: 14px; color: #4a5568; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 5px 0; font-weight: 600; width: 130px; color: #718096;">Full Name:</td>
                    <td style="padding: 5px 0; color: #1a202c; font-weight: 500;">{name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: 600; color: #718096;">Email:</td>
                    <td style="padding: 5px 0; color: #1a202c;">{email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: 600; color: #718096;">Registration No:</td>
                    <td style="padding: 5px 0; color: #1a202c;">{reg_no}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: 600; color: #718096;">Department:</td>
                    <td style="padding: 5px 0; color: #1a202c;">{department} ({class_name})</td>
                  </tr>
                </table>
              </div>

              <!-- Quick Highlights -->
              <h3 style="color: #1a202c; font-size: 15px; font-weight: 600; margin: 25px 0 12px 0;">
                What you can do on Campus Circle:
              </h3>
              <table role="presentation" width="100%" style="font-size: 14px; color: #4a5568;">
                <tr>
                  <td style="padding: 6px 0; vertical-align: top; width: 24px; color: #243b31; font-size: 16px;">✦</td>
                  <td style="padding: 6px 0;"><strong>Discover Events:</strong> Filter by Technical, Workshop, Cultural, Placement, and Seminars.</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; vertical-align: top; width: 24px; color: #243b31; font-size: 16px;">✦</td>
                  <td style="padding: 6px 0;"><strong>One-Click Registration:</strong> Reserve your seat immediately with automatic confirmation.</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; vertical-align: top; width: 24px; color: #243b31; font-size: 16px;">✦</td>
                  <td style="padding: 6px 0;"><strong>Instant Certificates:</strong> Print verifiable, signature-stamped certificates right from your dashboard.</td>
                </tr>
              </table>

              <!-- Call To Action -->
              <div style="text-align: center; margin: 32px 0 10px 0;">
                <a href="https://campuscirclepmc.vercel.app" style="display: inline-block; background-color: #243b31; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; padding: 13px 32px; border-radius: 8px; box-shadow: 0 2px 6px rgba(36, 59, 49, 0.25);">
                  Explore Campus Events →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8faf8; padding: 22px 30px; text-align: center; border-top: 1px solid #edf2f7; font-size: 12px; color: #718096;">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #4a5568;">
                Campus Circle — Department of Information Technology
              </p>
              <p style="margin: 0;">
                Er. Perumal Manimekalai College of Engineering, Hosur
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def build_event_confirmation_html(user, event):
    student_name = user.get("name", "Student")
    title = event.get("title", "Campus Event")
    category = event.get("category", "General")
    date = event.get("date", "TBA")
    event_time = event.get("time", "TBA")
    venue = event.get("venue", "Campus")
    description = event.get("description", "")

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmed - {title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2d3748;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f6f4; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #243b31; padding: 32px 30px; text-align: left;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <span style="display: inline-block; background-color: #cfe870; color: #243b31; font-weight: 800; font-size: 20px; width: 36px; height: 36px; line-height: 36px; text-align: center; border-radius: 50%; margin-right: 10px; vertical-align: middle;">c.</span>
                    <span style="color: #ffffff; font-size: 24px; font-weight: 700; vertical-align: middle; letter-spacing: -0.5px;">Campus Circle</span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: #cfe870; color: #243b31; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                      ✓ Confirmed
                    </span>
                  </td>
                </tr>
              </table>
              <p style="color: #cfe870; margin: 10px 0 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                Event Registration Pass
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 35px 30px;">
              <h1 style="color: #1a202c; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 8px;">
                You're in, {student_name}! 🎟️
              </h1>
              <p style="color: #4a5568; font-size: 15px; line-height: 1.5; margin: 0 0 24px 0;">
                Your registration for <strong>{title}</strong> is confirmed. Here are the details for your schedule:
              </p>

              <!-- Event Ticket / Details Box -->
              <div style="background-color: #fafcf9; border: 1px solid #dbe6d3; border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
                
                <!-- Ticket Top Bar -->
                <div style="background-color: #243b31; color: #ffffff; padding: 14px 20px;">
                  <span style="background-color: #cfe870; color: #243b31; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">
                    {category}
                  </span>
                  <h2 style="color: #ffffff; font-size: 19px; font-weight: 700; margin: 8px 0 0 0;">
                    {title}
                  </h2>
                </div>

                <!-- Ticket Schedule Info -->
                <div style="padding: 20px;">
                  <table role="presentation" width="100%" style="font-size: 14px; color: #4a5568; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; width: 100px; color: #718096; font-weight: 600;">📅 Date:</td>
                      <td style="padding: 8px 0; color: #1a202c; font-weight: 600; font-size: 15px;">{date}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #718096; font-weight: 600;">⏰ Time:</td>
                      <td style="padding: 8px 0; color: #1a202c; font-weight: 600;">{event_time}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #718096; font-weight: 600;">📍 Venue:</td>
                      <td style="padding: 8px 0; color: #1a202c; font-weight: 600;">{venue}</td>
                    </tr>
                    {f'''<tr>
                      <td style="padding: 8px 0; color: #718096; font-weight: 600; vertical-align: top;">📝 About:</td>
                      <td style="padding: 8px 0; color: #4a5568; font-size: 13.5px; line-height: 1.5;">{description}</td>
                    </tr>''' if description else ''}
                  </table>
                </div>
              </div>

              <!-- Important Reminder -->
              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 14px 18px; margin-bottom: 24px; font-size: 13.5px; color: #92400e; line-height: 1.5;">
                <strong>📌 Important Reminder:</strong> Please arrive 10-15 minutes prior to the start time with your College ID card.
              </div>

              <!-- Certificate Notice -->
              <p style="color: #4a5568; font-size: 13.5px; line-height: 1.5; margin: 0 0 24px 0;">
                🎖️ <strong>Participation Certificate:</strong> After attending the event, you can view and download your signed certificate directly from your Campus Circle dashboard.
              </p>

              <!-- Call To Action -->
              <div style="text-align: center; margin: 28px 0 10px 0;">
                <a href="https://campuscirclepmc.vercel.app" style="display: inline-block; background-color: #243b31; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14.5px; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 6px rgba(36, 59, 49, 0.25);">
                  View Registered Events →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8faf8; padding: 22px 30px; text-align: center; border-top: 1px solid #edf2f7; font-size: 12px; color: #718096;">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #4a5568;">
                Campus Circle — Department of Information Technology
              </p>
              <p style="margin: 0;">
                Er. Perumal Manimekalai College of Engineering, Hosur
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


# ─────────────────────────────────────────────────────────────────────────────
# High-Level Trigger Functions (called from app.py)
# ─────────────────────────────────────────────────────────────────────────────

def send_welcome_email(user):
    """Sends a branded welcome email to the newly registered student."""
    to_email = user.get("email")
    to_name = user.get("name", "Student")
    if not to_email:
        return
    subject = f"Welcome to Campus Circle, {to_name}! 🎓"
    html = build_welcome_html(user)
    send_email_in_background(to_email, to_name, subject, html)


def send_event_confirmation_email(user, event):
    """Sends a branded confirmation email with event details to the student."""
    to_email = user.get("email")
    to_name = user.get("name", "Student")
    event_title = event.get("title", "Campus Event")
    if not to_email:
        return
    subject = f"Registration Confirmed: {event_title} 🎟️"
    html = build_event_confirmation_html(user, event)
    send_email_in_background(to_email, to_name, subject, html)
