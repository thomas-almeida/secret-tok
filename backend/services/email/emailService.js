import axios from 'axios';
import { affiliateCommissionTemplate } from './templates/affiliateTemplates.js';

class EmailService {
  constructor() {
    this.baseUrl = process.env.BANANASEND_BASEURL;
    this.accountId = process.env.ZOHO_ACCOUNT_ID;
    this.fromAddress = process.env.EMAIL_FROM_ADDRESS || 'Suporte Rapidinhas <thomas.rodrigues@bananasend.top>';
    this.userId = process.env.BANANASEND_USERID;
    this.enabled = this.baseUrl && this.accountId && this.fromAddress && this.userId;
  }

  async sendMail({ toAddress, subject, htmlContent, textContent }) {
    if (!this.enabled) {
      console.log('📧 [EMAIL] Email service not configured, skipping email:', { toAddress, subject });
      return { success: false, reason: 'Email service not configured' };
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/zoho/send-mail`,
        {
          accountId: this.accountId,
          fromAddress: this.fromAddress,
          toAddress,
          subject,
          content: htmlContent,
          userId: this.userId
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Email sent successfully to ${toAddress}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`❌ Failed to send email to ${toAddress}:`, error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  async sendAffiliateCommissionEmail(affiliateUser, commissionData) {
    const { name, email } = affiliateUser;
    const { newBalance, totalAssociated } = commissionData;

    const template = affiliateCommissionTemplate(
      { name, email },
      { newBalance, totalAssociated }
    );

    return this.sendMail({
      toAddress: email,
      subject: template.subject,
      htmlContent: template.html,
      textContent: template.text
    });
  }
}

export default new EmailService();
