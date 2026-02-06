import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends a welcome email to the user.
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @returns {Promise<boolean>} - Returns true if sent successfully, false otherwise
 */
export const sendWelcomeEmail = async (email, name) => {
    try {
        const msg = {
            to: email,
            from: process.env.SENDGRID_FROM,
            subject: 'Welcome to The Golden Spoon 🍽️',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                        .header { background-color: #1a1a1a; padding: 20px; text-align: center; }
                        .header img { max-width: 150px; height: auto; }
                        .hero-image { width: 100%; height: 200px; object-fit: cover; background-image: url('https://images.unsplash.com/photo-1514362545857-3bc16549766b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'); background-size: cover; background-position: center; }
                        .content { padding: 30px; text-align: center; color: #333333; }
                        .h1-gold { color: #d4af37; margin-bottom: 10px; font-size: 28px; }
                        .text-lg { font-size: 16px; line-height: 1.6; color: #555555; margin-bottom: 20px; }
                        .btn { display: inline-block; background-color: #d4af37; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: bold; font-size: 16px; transition: background-color 0.3s; margin-top: 20px; }
                        .btn:hover { background-color: #bfa130; }
                        .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #888888; }
                        .social-links { margin-top: 10px; }
                        .social-links a { color: #d4af37; text-decoration: none; margin: 0 5px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <!-- Hero Section -->
                        <div class="header">
                            <h1 style="color: #d4af37; margin: 0; font-size: 24px;">THE GOLDEN SPOON</h1>
                        </div>
                        <div class="hero-image"></div>
                        
                        <!-- Content -->
                        <div class="content">
                            <h1 class="h1-gold">Welcome to the Family, ${name}!</h1>
                            <p class="text-lg">Thank you for joining <strong>The Golden Spoon</strong>. We are thrilled to invite you to a world of culinary excellence.</p>
                            <p class="text-lg">Discover our curated menu, experience premium dining, and enjoy meals crafted with passion.</p>
                            
                            <!-- Call to Action -->
                            <a href="https://thegoldenspoon-ten.vercel.app/" class="btn">Explore Our Menu</a>
                        </div>

                        <!-- Footer -->
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} The Golden Spoon. All rights reserved.</p>
                            <p>Delivering happiness to your doorstep.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        await sgMail.send(msg);
        console.log(`✅ Welcome email sent successfully to ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending welcome email:', error);
        if (error.response) {
            console.error('SendGrid Error Response:', error.response.body);
            if (error.code === 403 && error.response.body.errors && error.response.body.errors[0] && error.response.body.errors[0].message.includes('Sender Identity')) {
                console.error(`
    ❌ CRITICAL ERROR: The 'from' address (${process.env.SENDGRID_FROM}) is not verified in SendGrid.
    👉 Action Required: Go to your SendGrid Dashboard > Settings > Sender Authentication and verify this email.
                `);
            }
        }
        return false;
    }
};

/**
 * Sends an OTP email to the user.
 * @param {string} email - User's email address
 * @param {string} otp - The OTP code
 * @param {string} name - User's name
 * @returns {Promise<boolean>}
 */
export const sendOtpEmail = async (email, otp, name) => {
    try {
        const msg = {
            to: email,
            from: process.env.SENDGRID_FROM,
            subject: 'Your Password Reset OTP - The Golden Spoon',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #d4af37; text-align: center;">Password Reset Request</h2>
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>You requested to reset your password for your The Golden Spoon account.</p>
                    <p>Your One-Time Password (OTP) is:</p>
                    <div style="background-color: #fceea7; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <h1 style="margin: 0; color: #d4af37; letter-spacing: 5px;">${otp}</h1>
                    </div>
                    <p>This OTP is valid for 10 minutes.</p>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
            `,
        };

        await sgMail.send(msg);
        console.log(`✅ OTP email sent successfully to ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending OTP email:', error);
        return false;
    }
};

