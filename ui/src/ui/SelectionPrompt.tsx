const SelectionPrompt = ({ message }: { message: string }) => (
  <div className="hidden flex-grow items-center justify-center sm:flex">
    <p className="rounded-xl bg-slate-200 p-2 text-sm font-semibold text-slate-800 dark:bg-slate-700 dark:text-slate-100">
      {message}
    </p>
  </div>
);

export default SelectionPrompt;
