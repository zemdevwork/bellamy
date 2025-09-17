export type Role = {
  id: string;
  name: string;
  value: string;
  description?: string;
};


// export type User = {
//   id: string;
//   name: string;
//   email: string;
//   role: string; // This is likely role.name or role.id, depending on usage
//   branch: string;
//   createdAt: Date;
//   updatedAt: Date;
// };

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  branch: string;
  role: string;
};

export type UsersTableProps = {
  users: User[];
  roles: Role[];
};

export type UserFormData = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: string;
};

export type UserFormProps = {
  roles: Role[];
  onSuccess?: () => void;
  initialData?: Partial<UserFormData>;
  isEdit?: boolean;
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
}
