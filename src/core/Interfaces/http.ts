export interface Iregister {
  name: string;
  email: string;
  password: string;
  roleId: number;
}

export interface ILogin {
  email: string;
  password: string;
}
