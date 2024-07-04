interface UserData {
  user_id: number;
  username: string;
  fullname: string;
  email: string;
  phone: string;
  is_active: boolean;
  role_id: string;
  role_name: string;
}

interface Token {
  access_token: string;
  expires_in: number;
  interface: string;
}

interface TAuthResponse {
  success: boolean;
  user_data?: UserData;
  token?: Token;
  message?: string;
}
