export declare class EmailService {
    sendVerificationEmail(email: string, name: string, token: string): Promise<void>;
    sendPasswordResetEmail(email: string, name: string, token: string): Promise<void>;
    sendTestInvitation(email: string, name: string, testDetails: any): Promise<void>;
    sendTestCompletionNotification(email: string, name: string, testDetails: any): Promise<void>;
    sendPaymentNotification(email: string, name: string, paymentDetails: any): Promise<void>;
    sendWelcomeEmail(email: string, name: string, userType: 'CUSTOMER' | 'TESTER'): Promise<void>;
    private sendEmail;
}
export declare const emailService: EmailService;
export default emailService;
//# sourceMappingURL=emailService.d.ts.map