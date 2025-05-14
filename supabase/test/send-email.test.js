import { describe, it, expect } from 'vitest';

describe('Email Service', () => {
  it('should send an email with invoice template', async () => {
    const response = await fetch("https://oknofqytitpxmlprvekn.supabase.co/functions/v1/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "to": "alex91gul@gmail.com",
        "subject": "Your Invoice #INV-2024-001",
        "template_name": "payment_invoice",
        "variables": {
          "invoice_number": "INV-2024-001",
          "customer_name": "Alex Gul",
          "item_description": "Premium Subscription (April 2024)",
          "amount": "49.99",
          "due_date": "2024-05-31"
        },
        "attachments": [
          {
            "filename": "invoice-INV-2024-001.pdf",
            "content": "JVBERi0xLjUK",  // base64-encoded PDF
            "type": "application/pdf"
          }
        ]
      })
    });

    const data = await response.json();
    console.log(data);
    expect(data.id).toBeDefined();
  });
});