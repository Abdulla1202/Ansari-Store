import logging
import threading
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

logger = logging.getLogger(__name__)


def _send_email_worker(subject, text_body, html_body, to_list, from_email):
    """
    Background worker thread function to send an email.
    Supports Resend HTTP API (Port 443, Render free tier compatible)
    with seamless fallback to Django SMTP backend.
    """
    import os
    import requests

    # 1. Try Brevo HTTP API if configured (Free 300 emails/day, sends to ANY recipient without domain verification, Port 443)
    brevo_api_key = getattr(settings, "BREVO_API_KEY", None) or os.environ.get("BREVO_API_KEY")
    if brevo_api_key:
        try:
            sender_email = os.environ.get("BREVO_SENDER_EMAIL") or getattr(settings, "DEFAULT_FROM_EMAIL", "abdularayan9695@gmail.com")
            payload = {
                "sender": {"name": "Ansari Store", "email": sender_email},
                "to": [{"email": recipient} for recipient in to_list],
                "subject": subject,
                "htmlContent": html_body or text_body or "",
            }
            if text_body:
                payload["textContent"] = text_body

            resp = requests.post(
                "https://api.brevo.com/v3/smtp/email",
                headers={
                    "api-key": brevo_api_key,
                    "Content-Type": "application/json"
                },
                json=payload,
                timeout=20
            )
            if resp.status_code in [200, 201]:
                print(f"[BREVO EMAIL SUCCESS] Sent to {to_list} | Subject: '{subject}'")
                logger.info(f"Brevo email sent to {to_list} with subject '{subject}'")
                return
            else:
                print(f"[BREVO EMAIL ERROR] Status {resp.status_code}: {resp.text}")
                logger.error(f"Brevo email error: {resp.status_code} - {resp.text}")
        except Exception as ex:
            print(f"[BREVO EXCEPTION] {ex}")
            logger.exception(f"Brevo exception: {ex}")

    # 2. Try Resend HTTP API if configured (Bypasses Render SMTP port blocking)
    resend_api_key = getattr(settings, "RESEND_API_KEY", None) or os.environ.get("RESEND_API_KEY")
    if resend_api_key:
        try:
            sender = from_email or os.environ.get("RESEND_FROM_EMAIL", "Ansari Store <onboarding@resend.dev>")
            payload = {
                "from": sender,
                "to": to_list,
                "subject": subject,
                "text": text_body or "",
            }
            if html_body:
                payload["html"] = html_body

            resp = requests.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {resend_api_key}",
                    "Content-Type": "application/json"
                },
                json=payload,
                timeout=20
            )
            if resp.status_code in [200, 201]:
                print(f"[RESEND EMAIL SUCCESS] Sent to {to_list} | Subject: '{subject}'")
                logger.info(f"Resend email sent to {to_list} with subject '{subject}'")
                return
            else:
                print(f"[RESEND EMAIL ERROR] Status {resp.status_code}: {resp.text}")
                logger.error(f"Resend email error: {resp.status_code} - {resp.text}")
        except Exception as ex:
            print(f"[RESEND EXCEPTION] {ex}")
            logger.exception(f"Resend exception: {ex}")

    # 2. Standard Django SMTP fallback
    try:
        sender = from_email or getattr(settings, "FROM_EMAIL", None) or getattr(settings, "DEFAULT_FROM_EMAIL", None)
        if sender:
            sender = str(sender).strip()

        msg = EmailMultiAlternatives(
            subject=subject,
            from_email=sender,
            to=to_list,
            body=text_body or "",
        )
        if html_body:
            msg.attach_alternative(html_body, "text/html")

        result = msg.send(fail_silently=False)
        print(f"[ASYNC EMAIL SUCCESS] Sent to {to_list} | Subject: '{subject}' | Result: {result}")
        logger.info(f"Async email sent to {to_list} with subject '{subject}'")
    except Exception as e:
        print(f"[ASYNC EMAIL ERROR] Failed to send email to {to_list}: {repr(e)}")
        logger.exception(f"Async email error to {to_list}: {e}")


def send_email_async(subject, text_body, html_body, to_list, from_email=None):
    """
    Dispatches an email in a background daemon thread so HTTP requests
    return immediately to the user without blocking on SMTP network latency.
    """
    if not to_list:
        return

    # Normalize to a clean list of emails
    if isinstance(to_list, str):
        to_list = [to_list]
    clean_recipients = [
        email.strip() for email in to_list if email and isinstance(email, str) and email.strip()
    ]
    if not clean_recipients:
        return

    thread = threading.Thread(
        target=_send_email_worker,
        args=(subject, text_body, html_body, clean_recipients, from_email),
    )
    thread.daemon = True
    thread.start()
