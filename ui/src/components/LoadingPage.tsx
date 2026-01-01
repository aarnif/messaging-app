import Spinner from "../ui/Spinner";

const LoadingPage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[url(/background-light.svg)] dark:bg-[url(/background-dark.svg)]">
      <div className="flex flex-1 flex-col items-center justify-center gap-28 p-2">
        <h1 className="font-londrina text-5xl font-black text-green-600 sm:text-6xl dark:text-green-500">
          Messaging App
        </h1>
        <div className="flex flex-col items-center gap-8">
          <Spinner />
          <p className="text-center text-lg text-slate-700 dark:text-slate-200">
            Server is starting up, this may take a moment...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
