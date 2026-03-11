import type { UserContact } from "../types";
import SelectUserButton from "./SelectUserButton";

const SelectContactsList = ({
  contacts,
  setSelectedIds,
}: {
  contacts: UserContact[];
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}) => {
  if (contacts.length === 0) {
    return (
      <p className="mt-8 w-full text-center text-xl font-semibold text-slate-600 dark:text-slate-300">
        No contacts found
      </p>
    );
  }

  const handleSelectContact = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="flex h-0 w-full grow flex-col overflow-y-scroll bg-white pr-4 dark:bg-slate-800">
      {contacts.map((contact) => (
        <SelectUserButton
          key={contact.id}
          user={contact.contactDetails}
          isSelected={contact.isSelected}
          callback={() => handleSelectContact(contact.contactDetails.id)}
        />
      ))}
    </div>
  );
};

export default SelectContactsList;
