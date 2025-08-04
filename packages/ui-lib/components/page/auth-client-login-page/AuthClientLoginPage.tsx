import { AuthUser, LoginPage, LoginPageProps } from "../login-page/LoginPage.tsx";

export interface AuthClientLoginPageProps extends LoginPageProps<AuthUser> {}

export function AuthClientLoginPage(props: AuthClientLoginPageProps) {
  return <LoginPage<AuthUser> showOAuth={false} {...props} />;
}

export default AuthClientLoginPage;
