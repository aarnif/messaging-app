import SelectUserButton from "../../components/ui/SelectUserButton";
import type { AddContactOption } from "../../types";

const SelectUserList = ({
  users,
  setSelectedIds,
}: {
  users: AddContactOption[];
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}) => {
  if (users.length === 0) {
    return (
      <p className="mt-8 w-full text-center text-xl font-semibold text-slate-600 dark:text-slate-300">
        No users found
      </p>
    );
  }

  const handleSelectUser = (id: string) => {
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
      {users.map((user) => (
        <SelectUserButton
          key={user.id}
          user={user}
          isSelected={user.isSelected}
          callback={() => {
            handleSelectUser(user.id);
          }}
        />
      ))}
    </div>
  );
};

export default SelectUserList;
