export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
}

// In-memory store — replace with a real DB (MongoDB/PostgreSQL) later
const users: User[] = [];

export const findUserByEmail = (email: string): User | undefined =>
    users.find((u) => u.email.toLowerCase() === email.toLowerCase());

export const findUserById = (id: string): User | undefined =>
    users.find((u) => u.id === id);

export const createUser = (user: User): User => {
    users.push(user);
    return user;
};
