export type IVerifyEmail = {
     email: string;
     oneTimeCode: number;
};

export type ILoginData = {
     contact?: string;
     password?: string;
     fingerPrintId?: string;
     fcmToken?: string;
     deviceId?: string;
     deviceType?: 'android' | 'ios';
};

export type IAuthResetPassword = {
     newPassword: string;
     confirmPassword: string;
};

export type IChangePassword = {
     currentPassword: string;
     newPassword: string;
     confirmPassword: string;
};
