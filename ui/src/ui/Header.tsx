const Header = ({ showBackground = false }: { showBackground: boolean }) => (
  <header
    className={`flex items-center justify-center px-4 py-2 ${showBackground && "lg:bg-slate-100 lg:dark:bg-slate-900"}`}
  >
    <h1 className="text-2xl font-black text-green-600 font-londrina dark:text-green-500">
      Messaging App
    </h1>
  </header>
);

export default Header;
