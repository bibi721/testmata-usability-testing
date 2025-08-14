import { UserType, UserStatus } from '@prisma/client';
interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
        userType: UserType;
        status: UserStatus;
        emailVerified: boolean;
    };
    accessToken: string;
    refreshToken: string;
}
interface RegisterData {
    email: string;
    password: string;
    name: string;
    userType: UserType;
}
interface TesterRegisterData extends RegisterData {
    phone?: string;
    city?: string;
    region?: string;
    age?: string;
    education?: string;
    occupation?: string;
    experience?: string;
    languages?: string[];
    devices?: string[];
    internetSpeed?: string;
    availability?: string;
    motivation?: string;
}
export declare class AuthService {
    register(data: RegisterData | TesterRegisterData): Promise<AuthResponse>;
    login(email: string, password: string): Promise<AuthResponse>;
    refreshToken(refreshTokenString: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshTokenString: string): Promise<void>;
    verifyEmail(token: string): Promise<void>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    private generateTokens;
    private sendVerificationEmail;
}
export declare const authService: AuthService;
export default authService;
//# sourceMappingURL=authService.d.ts.map