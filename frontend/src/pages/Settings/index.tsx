import { Outlet } from "react-router";
import { useQuery } from "@apollo/client/react";
import { ME } from "../../graphql/queries";
import Spinner from "../../components/ui/Spinner";
import ListMenu from "./ListMenu";

const Settings = () => {
  const { data, loading } = useQuery(ME);
  const currentUser = data?.me;

  return (
    <div className="flex grow">
      <ListMenu />
      {loading ? (
        <div className="flex grow items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <Outlet context={{ currentUser }} />
      )}
    </div>
  );
};

export default Settings;
