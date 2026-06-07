import type { Contact } from "../types/other.js";

const contacts: Contact[] = [
  { ownerId: 1, contactId: 2, isBlocked: false },
  { ownerId: 1, contactId: 3, isBlocked: false },
  { ownerId: 1, contactId: 4, isBlocked: false },
  { ownerId: 1, contactId: 5, isBlocked: false },
  { ownerId: 1, contactId: 6, isBlocked: false },
  { ownerId: 1, contactId: 7, isBlocked: false },
  { ownerId: 1, contactId: 8, isBlocked: false },
  { ownerId: 1, contactId: 9, isBlocked: false },
  { ownerId: 1, contactId: 10, isBlocked: false },
  { ownerId: 1, contactId: 11, isBlocked: false },

  { ownerId: 2, contactId: 1, isBlocked: true },
  { ownerId: 2, contactId: 1, isBlocked: false },
  { ownerId: 2, contactId: 3, isBlocked: false },
  { ownerId: 2, contactId: 5, isBlocked: false },

  { ownerId: 3, contactId: 1, isBlocked: false },
  { ownerId: 3, contactId: 2, isBlocked: false },
  { ownerId: 3, contactId: 6, isBlocked: false },

  { ownerId: 4, contactId: 1, isBlocked: false },
  { ownerId: 4, contactId: 5, isBlocked: false },
  { ownerId: 4, contactId: 7, isBlocked: false },

  { ownerId: 5, contactId: 1, isBlocked: false },
  { ownerId: 5, contactId: 2, isBlocked: false },
  { ownerId: 5, contactId: 4, isBlocked: false },
  { ownerId: 5, contactId: 8, isBlocked: false },

  { ownerId: 6, contactId: 1, isBlocked: false },
  { ownerId: 6, contactId: 7, isBlocked: false },
  { ownerId: 6, contactId: 9, isBlocked: false },

  { ownerId: 7, contactId: 1, isBlocked: false },
  { ownerId: 7, contactId: 4, isBlocked: false },
  { ownerId: 7, contactId: 6, isBlocked: false },
  { ownerId: 7, contactId: 10, isBlocked: false },

  { ownerId: 8, contactId: 1, isBlocked: false },
  { ownerId: 8, contactId: 5, isBlocked: false },
  { ownerId: 8, contactId: 11, isBlocked: false },

  { ownerId: 9, contactId: 1, isBlocked: false },
  { ownerId: 9, contactId: 6, isBlocked: false },
  { ownerId: 9, contactId: 10, isBlocked: false },

  { ownerId: 10, contactId: 1, isBlocked: false },
  { ownerId: 10, contactId: 7, isBlocked: false },
  { ownerId: 10, contactId: 9, isBlocked: false },

  { ownerId: 11, contactId: 1, isBlocked: false },
  { ownerId: 11, contactId: 8, isBlocked: false },
];

export default contacts;
