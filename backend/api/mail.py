import logging
import threading
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

logger = logging.getLogger(__name__)


def _send_email_worker(subject, text_body, html_body, to_list, from_email):
    """
    Background worker thread function to send an email via Django mail backend.
    Catches all exceptions so the calling thread/request is never affected.
    """
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
