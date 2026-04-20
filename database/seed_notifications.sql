-- Seed notification templates (optional)
INSERT INTO notification_templates (key, subject, body_text, sms_body) VALUES
  ('booking_confirmation', 'Your WWM Booking is Confirmed', 'Your booking {{booking_reference}} for {{event_date}} is confirmed. Enjoy your experience!', 'WWM: Booking {{booking_reference}} confirmed for {{event_date}}.'),
  ('payment_confirmation', 'Payment Received', 'We have received your payment of GHS {{amount}} for booking {{booking_reference}}.', 'WWM: Payment of GHS {{amount}} received for {{booking_reference}}.'),
  ('vendor_new_booking', 'New Booking Request', 'You have a new paid booking {{booking_reference}} for {{event_date}}. Please log in to accept or decline.', 'WWM: New booking {{booking_reference}} - please accept or decline.'),
  ('booking_reminder', 'Upcoming Experience', 'Reminder: Your Walk With Me experience ({{booking_reference}}) is tomorrow. We look forward to seeing you!', 'WWM: Your experience {{booking_reference}} is tomorrow.')
ON CONFLICT (key) DO NOTHING;
