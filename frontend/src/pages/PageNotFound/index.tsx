import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate } from "react-router";

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">
      <div className="max-w-105 grow bg-[url(/background-light.svg)] dark:bg-[url(/background-dark.svg)]"></div>
      <div className="flex grow items-center justify-center bg-slate-50 p-8 dark:bg-slate-900">
        <div className="max-w-100 flex flex-col justify-center p-4">
          <h1 className="font-londrina text-green-600 dark:text-green-500 text-9xl mb-4">
            404
          </h1>

          <h2 className="mb-6 font-oswald text-[28px] font-medium text-slate-900 dark:text-slate-50">
            Page Not Found
          </h2>

          <p className="font-roboto font-medium text-slate-700 dark:text-slate-200 text-lg mb-12">
            Sorry, the page you're looking for doesn't exist. It might have been
            moved or deleted.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="text-green-600 dark:text-green-500 cursor-pointer font-roboto font-bold text-xl flex items-center gap-2 hover:underline underline-offset-4"
          >
            <FaArrowLeft size={24} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
