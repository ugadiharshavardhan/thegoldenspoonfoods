import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';

dotenv.config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Sends a welcome email to the user.
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @returns {Promise<boolean>} - Returns true if sent successfully, false otherwise
 */
export const sendWelcomeEmail = async (email, name) => {
    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.to = [{ email: email, name: name }];
        sendSmtpEmail.sender = { email: process.env.EMAIL_FROM, name: "The Golden Spoon" };
        sendSmtpEmail.subject = 'Welcome to The Golden Spoon';

        // Simple text fallback
        sendSmtpEmail.textContent = `Hello ${name}, Welcome to The Golden Spoon! We are excited to have you. Visit https://thegoldenspoonfoods.vercel.app/ to explore our menu.`;

        // Using the EXACT same HTML structure as the working OTP email
        sendSmtpEmail.htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #d4af37; text-align: center;">Welcome to The Golden Spoon</h2>
                <p>Hello <strong>${name}</strong>,</p>
                <p>Thank you for creating an account with us.</p>
                <p>We are thrilled to invite you to a world of culinary excellence.</p>
                <div style="background-color: #fceea7; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                    <p style="margin: 0; color: #d4af37; font-weight: bold; font-size: 18px;">Account Created Successfully</p>
                </div>
                <p>You can now explore our menu and order your favorite meals.</p>
                <p style="text-align: center; margin-top: 30px;">
                    <a href="https://thegoldenspoonfoods.vercel.app/" style="background-color: #d4af37; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Explore Menu</a>
                </p>
            </div>
        `;

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`✅ Welcome email sent successfully to ${email}. Message ID: ${data.messageId}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending welcome email:', error);
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
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.to = [{ email: email, name: name }];
        sendSmtpEmail.sender = { email: process.env.EMAIL_FROM, name: "The Golden Spoon" };
        sendSmtpEmail.subject = 'Your Password Reset OTP - The Golden Spoon';
        sendSmtpEmail.htmlContent = `
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
        `;

        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`✅ OTP email sent successfully to ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending OTP email:', error);
        return false;
    }
};


