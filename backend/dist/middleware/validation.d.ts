import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
export declare const validateRequest: (schema: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}) => (req: Request, res: Response, next: NextFunction) => void;
export declare const commonSchemas: {
    pagination: z.ZodObject<{
        page: z.ZodDefault<z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>>;
        limit: z.ZodDefault<z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>>;
        sortBy: z.ZodOptional<z.ZodString>;
        sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        sortOrder: "asc" | "desc";
        sortBy?: string | undefined;
    }, {
        page?: string | undefined;
        limit?: string | undefined;
        sortBy?: string | undefined;
        sortOrder?: "asc" | "desc" | undefined;
    }>;
    id: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    email: z.ZodString;
    password: z.ZodString;
    ethiopianPhone: z.ZodString;
    ethiopianRegion: z.ZodEnum<["Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz", "Dire Dawa", "Gambela", "Harari", "Oromia", "Sidama", "SNNPR", "Somali", "Tigray"]>;
    languageCode: z.ZodEnum<["en", "am"]>;
    currency: z.ZodDefault<z.ZodEnum<["ETB", "USD"]>>;
    fileUpload: z.ZodObject<{
        filename: z.ZodString;
        mimetype: z.ZodString;
        size: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        filename: string;
        mimetype: string;
        size: number;
    }, {
        filename: string;
        mimetype: string;
        size: number;
    }>;
};
export declare const authSchemas: {
    register: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        name: z.ZodString;
        userType: z.ZodDefault<z.ZodEnum<["CUSTOMER", "TESTER"]>>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        password: string;
        name: string;
        userType: "CUSTOMER" | "TESTER";
    }, {
        email: string;
        password: string;
        name: string;
        userType?: "CUSTOMER" | "TESTER" | undefined;
    }>;
    login: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        password: string;
    }, {
        email: string;
        password: string;
    }>;
    refreshToken: z.ZodObject<{
        refreshToken: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        refreshToken: string;
    }, {
        refreshToken: string;
    }>;
    forgotPassword: z.ZodObject<{
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
    }, {
        email: string;
    }>;
    resetPassword: z.ZodObject<{
        token: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        password: string;
        token: string;
    }, {
        password: string;
        token: string;
    }>;
    changePassword: z.ZodObject<{
        currentPassword: z.ZodString;
        newPassword: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        currentPassword: string;
        newPassword: string;
    }, {
        currentPassword: string;
        newPassword: string;
    }>;
    verifyEmail: z.ZodObject<{
        token: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        token: string;
    }, {
        token: string;
    }>;
};
export declare const userSchemas: {
    updateProfile: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        avatar?: string | undefined;
    }, {
        name?: string | undefined;
        avatar?: string | undefined;
    }>;
    updateCustomerProfile: z.ZodObject<{
        company: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodString>;
        industry: z.ZodOptional<z.ZodString>;
        companySize: z.ZodOptional<z.ZodEnum<["1-10", "11-50", "51-200", "201-1000", "1000+"]>>;
    }, "strip", z.ZodTypeAny, {
        company?: string | undefined;
        website?: string | undefined;
        industry?: string | undefined;
        companySize?: "1-10" | "11-50" | "51-200" | "201-1000" | "1000+" | undefined;
    }, {
        company?: string | undefined;
        website?: string | undefined;
        industry?: string | undefined;
        companySize?: "1-10" | "11-50" | "51-200" | "201-1000" | "1000+" | undefined;
    }>;
    updateTesterProfile: z.ZodObject<{
        phone: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        region: z.ZodOptional<z.ZodEnum<["Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz", "Dire Dawa", "Gambela", "Harari", "Oromia", "Sidama", "SNNPR", "Somali", "Tigray"]>>;
        age: z.ZodOptional<z.ZodEnum<["18-24", "25-34", "35-44", "45-54", "55+"]>>;
        education: z.ZodOptional<z.ZodEnum<["High School", "Diploma", "Bachelor's Degree", "Master's Degree", "PhD"]>>;
        occupation: z.ZodOptional<z.ZodString>;
        experience: z.ZodOptional<z.ZodEnum<["Beginner", "Intermediate", "Advanced", "Expert"]>>;
        languages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        devices: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        internetSpeed: z.ZodOptional<z.ZodEnum<["Slow", "Medium", "Fast"]>>;
        availability: z.ZodOptional<z.ZodEnum<["1-5", "6-10", "11-20", "20+"]>>;
        motivation: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        phone?: string | undefined;
        city?: string | undefined;
        region?: "Addis Ababa" | "Afar" | "Amhara" | "Benishangul-Gumuz" | "Dire Dawa" | "Gambela" | "Harari" | "Oromia" | "Sidama" | "SNNPR" | "Somali" | "Tigray" | undefined;
        age?: "18-24" | "25-34" | "35-44" | "45-54" | "55+" | undefined;
        education?: "High School" | "Diploma" | "Bachelor's Degree" | "Master's Degree" | "PhD" | undefined;
        occupation?: string | undefined;
        experience?: "Beginner" | "Intermediate" | "Advanced" | "Expert" | undefined;
        languages?: string[] | undefined;
        devices?: string[] | undefined;
        internetSpeed?: "Slow" | "Medium" | "Fast" | undefined;
        availability?: "1-5" | "6-10" | "11-20" | "20+" | undefined;
        motivation?: string | undefined;
    }, {
        phone?: string | undefined;
        city?: string | undefined;
        region?: "Addis Ababa" | "Afar" | "Amhara" | "Benishangul-Gumuz" | "Dire Dawa" | "Gambela" | "Harari" | "Oromia" | "Sidama" | "SNNPR" | "Somali" | "Tigray" | undefined;
        age?: "18-24" | "25-34" | "35-44" | "45-54" | "55+" | undefined;
        education?: "High School" | "Diploma" | "Bachelor's Degree" | "Master's Degree" | "PhD" | undefined;
        occupation?: string | undefined;
        experience?: "Beginner" | "Intermediate" | "Advanced" | "Expert" | undefined;
        languages?: string[] | undefined;
        devices?: string[] | undefined;
        internetSpeed?: "Slow" | "Medium" | "Fast" | undefined;
        availability?: "1-5" | "6-10" | "11-20" | "20+" | undefined;
        motivation?: string | undefined;
    }>;
};
export declare const testSchemas: {
    createTest: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodString;
        instructions: z.ZodOptional<z.ZodString>;
        testType: z.ZodEnum<["USABILITY", "FEEDBACK", "SURVEY", "INTERVIEW"]>;
        platform: z.ZodEnum<["WEB", "MOBILE_APP", "DESKTOP"]>;
        targetUrl: z.ZodOptional<z.ZodString>;
        maxTesters: z.ZodDefault<z.ZodNumber>;
        paymentPerTester: z.ZodNumber;
        estimatedDuration: z.ZodNumber;
        requirements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        tasks: z.ZodOptional<z.ZodAny>;
        demographics: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        description: string;
        testType: "USABILITY" | "FEEDBACK" | "SURVEY" | "INTERVIEW";
        platform: "WEB" | "MOBILE_APP" | "DESKTOP";
        maxTesters: number;
        paymentPerTester: number;
        estimatedDuration: number;
        instructions?: string | undefined;
        targetUrl?: string | undefined;
        requirements?: string[] | undefined;
        tasks?: any;
        demographics?: any;
    }, {
        title: string;
        description: string;
        testType: "USABILITY" | "FEEDBACK" | "SURVEY" | "INTERVIEW";
        platform: "WEB" | "MOBILE_APP" | "DESKTOP";
        paymentPerTester: number;
        estimatedDuration: number;
        instructions?: string | undefined;
        targetUrl?: string | undefined;
        maxTesters?: number | undefined;
        requirements?: string[] | undefined;
        tasks?: any;
        demographics?: any;
    }>;
    updateTest: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        instructions: z.ZodOptional<z.ZodString>;
        maxTesters: z.ZodOptional<z.ZodNumber>;
        paymentPerTester: z.ZodOptional<z.ZodNumber>;
        estimatedDuration: z.ZodOptional<z.ZodNumber>;
        requirements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        tasks: z.ZodOptional<z.ZodAny>;
        demographics: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        title?: string | undefined;
        description?: string | undefined;
        instructions?: string | undefined;
        maxTesters?: number | undefined;
        paymentPerTester?: number | undefined;
        estimatedDuration?: number | undefined;
        requirements?: string[] | undefined;
        tasks?: any;
        demographics?: any;
    }, {
        title?: string | undefined;
        description?: string | undefined;
        instructions?: string | undefined;
        maxTesters?: number | undefined;
        paymentPerTester?: number | undefined;
        estimatedDuration?: number | undefined;
        requirements?: string[] | undefined;
        tasks?: any;
        demographics?: any;
    }>;
    publishTest: z.ZodObject<{
        publishedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        publishedAt?: string | undefined;
    }, {
        publishedAt?: string | undefined;
    }>;
};
export declare const sessionSchemas: {
    startSession: z.ZodObject<{
        testId: z.ZodString;
        deviceInfo: z.ZodOptional<z.ZodObject<{
            userAgent: z.ZodString;
            screenResolution: z.ZodOptional<z.ZodString>;
            deviceType: z.ZodOptional<z.ZodEnum<["mobile", "tablet", "desktop"]>>;
        }, "strip", z.ZodTypeAny, {
            userAgent: string;
            screenResolution?: string | undefined;
            deviceType?: "mobile" | "tablet" | "desktop" | undefined;
        }, {
            userAgent: string;
            screenResolution?: string | undefined;
            deviceType?: "mobile" | "tablet" | "desktop" | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        testId: string;
        deviceInfo?: {
            userAgent: string;
            screenResolution?: string | undefined;
            deviceType?: "mobile" | "tablet" | "desktop" | undefined;
        } | undefined;
    }, {
        testId: string;
        deviceInfo?: {
            userAgent: string;
            screenResolution?: string | undefined;
            deviceType?: "mobile" | "tablet" | "desktop" | undefined;
        } | undefined;
    }>;
    updateSession: z.ZodObject<{
        status: z.ZodOptional<z.ZodEnum<["IN_PROGRESS", "COMPLETED", "FAILED", "CANCELLED"]>>;
        feedback: z.ZodOptional<z.ZodString>;
        rating: z.ZodOptional<z.ZodNumber>;
        taskResults: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        status?: "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED" | undefined;
        rating?: number | undefined;
        feedback?: string | undefined;
        taskResults?: any;
    }, {
        status?: "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED" | undefined;
        rating?: number | undefined;
        feedback?: string | undefined;
        taskResults?: any;
    }>;
    submitRecording: z.ZodObject<{
        recordingUrl: z.ZodString;
        duration: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        recordingUrl: string;
        duration: number;
    }, {
        recordingUrl: string;
        duration: number;
    }>;
};
export declare const paymentSchemas: {
    createPayment: z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodDefault<z.ZodEnum<["ETB", "USD"]>>;
        method: z.ZodEnum<["CREDIT_CARD", "CHAPA", "TELEBIRR", "CBE_BIRR", "BANK_TRANSFER"]>;
        description: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        amount: number;
        currency: "ETB" | "USD";
        method: "CREDIT_CARD" | "CHAPA" | "TELEBIRR" | "CBE_BIRR" | "BANK_TRANSFER";
        description?: string | undefined;
        metadata?: any;
    }, {
        amount: number;
        method: "CREDIT_CARD" | "CHAPA" | "TELEBIRR" | "CBE_BIRR" | "BANK_TRANSFER";
        description?: string | undefined;
        currency?: "ETB" | "USD" | undefined;
        metadata?: any;
    }>;
    updatePayment: z.ZodObject<{
        status: z.ZodEnum<["PROCESSING", "COMPLETED", "FAILED", "REFUNDED"]>;
        transactionId: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        status: "COMPLETED" | "FAILED" | "PROCESSING" | "REFUNDED";
        metadata?: any;
        transactionId?: string | undefined;
    }, {
        status: "COMPLETED" | "FAILED" | "PROCESSING" | "REFUNDED";
        metadata?: any;
        transactionId?: string | undefined;
    }>;
};
export default validateRequest;
//# sourceMappingURL=validation.d.ts.map