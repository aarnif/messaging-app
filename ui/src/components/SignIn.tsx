import useField from "../hooks/useField";
import Header from "../ui/Header";
import Notify from "../ui/Notify";
import FormField from "../ui/FormField";
import Button from "../ui/Button";
import { useNavigate } from "react-router";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { LOGIN } from "../graphql/mutations";
import useNotifyMessage from "../hooks/useNotifyMessage";
import { AnimatePresence } from "motion/react";

const SignIn = ({
  setToken,
}: {
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const client = useApolloClient();
  const navigate = useNavigate();
  const { message, showMessage, closeMessage } = useNotifyMessage();
  const username = useField("username", "text", "Enter your username here...");
  const password = useField(
    "password",
    "password",
    "Enter your password here..."
  );

  const [mutate] = useMutation(LOGIN, {
    onError: (error) => {
      console.log(error);
      showMessage(error.message);
    },
  });

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (!username.value.length || !password.value.length) {
      showMessage("Please fill all fields.");
      return;
    }

    console.log("Submitting form...");

    const { data } = await mutate({
      variables: {
        input: {
          username: username.value,
          password: password.value,
        },
      },
    });

    if (data?.login?.value) {
      localStorage.setItem("token", data.login.value);
      setToken(data.login.value);
      client.resetStore();
      navigate("/");
      console.log("Form submitted succesfully!");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[url(/background-light.svg)] dark:bg-[url(/background-dark.svg)]">
      <Header showBackground={false} />
      <div className="flex justify-center p-8">
        <form
          className="mt-8 flex w-full max-w-80 flex-col gap-8 rounded-2xl bg-white p-4 sm:mt-16 dark:bg-slate-800"
          onSubmit={handleSubmit}
        >
          <h1 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
            Sign In
          </h1>
          <div className="flex w-full flex-col gap-4">
            <AnimatePresence>
              {message && (
                <Notify message={message} closeMessage={closeMessage} />
              )}
            </AnimatePresence>
            <FormField field={username} />
            <FormField field={password} />
          </div>
          <div className="flex w-full flex-col gap-2">
            <Button type="submit" variant="primary" text="Sign In" />
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Don't have an account?
              </p>
              <Button
                type="button"
                variant="secondary"
                text="Sign Up"
                onClick={() => navigate("/signup")}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
