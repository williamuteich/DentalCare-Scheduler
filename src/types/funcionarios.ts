export interface ApiUser {
    _id?: string;
    id?: string;
    name?: string;
    email: string;
    role?: string;
    active: true | false;
}

export interface Funcionario {
    id: string;
    name: string;
    email: string;
    role: "admin" | "staff";
    active: "true" | "false";
}

export interface FuncionarioInitialValues {
    id?: string;
    name?: string;
    email?: string;
    role?: "admin" | "staff";
    password?: string;
    active?: "true" | "false";
}