import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

transporter.verify((error) => { if (error) { console.error("❌ SMTP ERROR:", error); } else { console.log("✅ Brevo SMTP connected"); } });

export const sendBookingMail = async (booking) => {
  try {
    const formattedDate = new Date(booking.travel_date).toLocaleDateString(
      "en-IN",
      { day: "2-digit", month: "long", year: "numeric" }
    );

    await transporter.sendMail({
      from: `"Travel Website ✈️" <pallapusureshkumar7799@gmail.com>`, // ✅ VERIFIED SENDER
      to: booking.email, // customer
      cc: "pallapusuresh7799@gmail.com", // ✅ optional: admin copy
      subject: "🎉 Your Travel Booking is Confirmed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
          <h2 style="color:#16a34a;">Booking Confirmed 🎉</h2>

          <p>Hello <strong>${booking.name}</strong>,</p>

          <p>Your trip has been successfully booked. Here are your travel details:</p>

          <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;">
            <tr><td><strong>Booking ID</strong></td><td>#TRV-${booking.id}</td></tr>
            <tr><td><strong>Destination</strong></td><td>${booking.place_name}</td></tr>
            <tr><td><strong>Travel Date</strong></td><td>${formattedDate}</td></tr>
            <tr><td><strong>People</strong></td><td>${booking.people}</td></tr>
            <tr><td><strong>City</strong></td><td>${booking.location}</td></tr>
            <tr><td><strong>Total Price</strong></td><td>₹ ${booking.price}</td></tr>
          </table>

          <p style="margin-top:16px;">
            ✈️ We look forward to making your journey memorable.
          </p>

          <p>
            Regards,<br/>
            <strong>Travel Website Team</strong>
          </p>
        </div>
      `,
    });

    console.log("✅ Booking email sent to:", booking.email);
  } catch (error) {
    console.error("❌ EMAIL ERROR:", error);
  }
};
