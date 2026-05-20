export interface Iregister {
  firstname: string;
  secondname: string;
  email: string;
  password: string;
  roleId: number;
}

export interface ILogin {
  email: string;
  password: string;
}

export interface IResetPassword {
  email: string;
  token: string;
  newPassword: string;
}
