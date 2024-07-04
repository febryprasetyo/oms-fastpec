export type TAuthStore = {
  user: TAuthResponse | null;
  doLogin: (arg: { username: string; password: string }) => Promise<void>;
  doLogout: () => void;
};
