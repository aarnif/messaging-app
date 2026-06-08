import { z } from "zod";

export const findContactInputSchema = z.object({
  id: z.string(),
  lookupBy: z.enum(["ID", "USER_ID"]),
});

export const newUserInputSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const editProfileInputSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  about: z.string().nullable(),
  is24HourClock: z.boolean(),
  isDarkMode: z.boolean(),
});

export const newChatSchema = z
  .object({
    name: z.string().nullable(),
    description: z.string().nullable(),
    members: z.string().array(),
    initialMessage: z.string().min(1, "Message content cannot be empty"),
  })
  .refine(
    (data) => {
      if (data.members.length > 1) {
        return data.name && data.name.trim().length >= 3;
      }
      return true;
    },
    {
      message: "Group chat name must be at least 3 characters long",
      path: ["name"],
    },
  );

export const editChatSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "Group chat name must be at least 3 characters long"),
  description: z.string().nullable(),
  members: z.string().array(),
});

export const newMessageInputSchema = z.object({
  id: z.string(),
  content: z.string().min(1, "Message content cannot be empty"),
  isNotification: z.boolean(),
});

export const editMessageInputSchema = z.object({
  id: z.string(),
  content: z.string().min(1, "Message content cannot be empty"),
});

export const changePasswordInputSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters long"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
