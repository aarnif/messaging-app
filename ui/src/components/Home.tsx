import Header from "../ui/Header";
import Menu from "./Menu";
import { Outlet } from "react-router";

const Home = () => (
  <div className="flex min-h-screen flex-col bg-[url(/background-light.svg)] dark:bg-[url(/background-dark.svg)]">
    <Header showBackground={true} />
    <div className="flex flex-grow flex-col sm:flex-row-reverse">
      <div className="flex flex-grow justify-center">
        <Outlet />
      </div>
      <Menu />
    </div>
  </div>
);

export default Home;
