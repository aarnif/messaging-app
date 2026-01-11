const Header = ({ showBackground = false }: { showBackground: boolean }) => (
  <header
    className={`flex items-center justify-center px-4 py-2 ${showBackground && "bg-slate-50 dark:bg-slate-900"}`}
  >
    <h1 className="font-londrina text-2xl font-black text-green-600 dark:text-green-500">
      Messaging App
    </h1>
  </header>
);

export default Header;
