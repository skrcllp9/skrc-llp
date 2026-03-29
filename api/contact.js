import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { name, email, phone, message } = req.body;

    // ✅ Validation
    if (!name || !email || !message) {
        return res.status(400).json({
            error: "Name, Email and Message are required",
        });
    }

    try {
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: "your-email@example.com",
            subject: "New Contact Form Submission",
            html: `
        <h2>New Contact Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone || "Not provided"}</p>
        <p><b>Message:</b><br/> ${message}</p>
      `,
        });

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Email failed" });
    }
}