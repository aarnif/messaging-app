import Header from "../ui/Header";
import { Outlet } from "react-router";

const Home = () => (
  <div className="flex min-h-screen flex-col bg-[url(/background-light.svg)] dark:bg-[url(/background-dark.svg)]">
    <Header showBackground={true} />
    <div className="flex flex-grow items-center justify-center">
      <Outlet />
    </div>
  </div>
);

export default Home;
