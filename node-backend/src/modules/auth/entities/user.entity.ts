// user.entity.ts
// This file acts as the domain representation (business rules) of a User.
// In a full Domain-Driven Design, this would contain business logic for the User aggregate root.
// For now, it maps the Prisma schema to a Domain Model.

export interface UserEntity {
  id: string;
  email: string;
  password?: string; // Optional for security when returning
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
