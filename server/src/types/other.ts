export interface Contact {
  userId: number;
  contactId: number;
  isBlocked: boolean;
}

export interface Chat {
  type: "private" | "group";
  name: string | null;
  description: string | null;
  avatar: string | null;
  createdBy: number;
}

export interface ChatMember {
  userId: number;
  chatId: number;
  role: "member" | "admin";
}

// For supertest GraphQL HTTP response typing
export interface HTTPGraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: {
      code?: string;
      validationErrors?: Array<{
        message?: string;
      }>;
    };
  }>;
}
