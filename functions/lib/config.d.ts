/**
 * Configuration des Cloud Functions
 */
export declare const getResendApiKey: () => string | null;
export declare const config: {
    resend: {
        fromEmail: string;
        adminEmail: string;
    };
    app: {
        name: string;
        url: string;
        adminUrl: string;
    };
};
