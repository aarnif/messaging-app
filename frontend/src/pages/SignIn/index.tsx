import { useApolloClient, useMutation } from "@apollo/client/react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import type { LoginInput } from "../../__generated__/graphql";
import Button from "../../components/ui/Button";
import Error from "../../components/ui/Error";
import FormField from "../../components/ui/FormField";
import { LOGIN } from "../../graphql/mutations";
import useErrorMessage from "../../hooks/useErrorMessage";
import useField from "../../hooks/useField";

const SignIn = ({
  setToken,
}: {
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const client = useApolloClient();
  const navigate = useNavigate();
  const { message, showMessage, closeMessage } = useErrorMessage();
  const username = useField("username", "text", "Enter your username here...");
  const password = useField(
    "password",
    "password",
    "Enter your password here...",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [mutate] = useMutation(LOGIN, {
    onError: (error) => {
      console.log(error);
      showMessage(error.message);
      setIsSubmitting(false);
    },
  });

  const signIn = async (input: LoginInput) => {
    setIsSubmitting(true);

    const { data } = await mutate({ variables: { input } });

    if (data?.login.value) {
      localStorage.setItem("messaging-app-token", data.login.value);
      setToken(data.login.value);
      client.resetStore();
      setIsSubmitting(false);
      navigate("/");
    }
  };

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (!username.value.length || !password.value.length) {
      showMessage("Please fill all fields.");
      return;
    }

    await signIn({ username: username.value, password: password.value });
  };

  return (
    <div className="flex min-h-screen">
      <div className="max-w-105 grow bg-[url(/background-light.svg)] dark:bg-[url(/background-dark.svg)]"></div>
      <div className="flex grow items-center justify-center bg-slate-50 p-8 dark:bg-slate-900">
        <form
          className="flex w-full max-w-96 flex-col gap-12 rounded-2xl p-4"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-6">
            <h1 className="font-londrina text-3xl font-black text-green-600 dark:text-green-500">
              Messaging App
            </h1>
            <p className="max-w-100 text-left font-medium text-slate-700 dark:text-slate-200">
              Add contacts, create private or group chats, and send text
              messages. Stay connected with the people that matter most.
            </p>
          </div>

          <div className="flex w-full flex-col gap-4">
            <AnimatePresence>
              {message && (
                <Error message={message} closeMessage={closeMessage} />
              )}
            </AnimatePresence>
            <FormField
              field={username}
              inputBgColor="bg-slate-200 border-slate-200 dark:bg-slate-800 dark:border-slate-800"
              disabled={isSubmitting}
            />
            <FormField
              field={password}
              inputBgColor="bg-slate-200 border-slate-200 dark:bg-slate-800 dark:border-slate-800"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex w-full flex-col gap-2">
            <Button
              type="submit"
              variant="primary"
              text={isSubmitting ? "Signing In..." : "Sign In"}
            />
            <div className="flex items-center gap-4 py-2 text-sm text-slate-700 dark:text-slate-200">
              <hr className="grow border-slate-200 dark:border-slate-700" />
              or
              <hr className="grow border-slate-200 dark:border-slate-700" />
            </div>
            <Button
              type="button"
              variant="secondary"
              text="Continue as Test User"
              disabled={isSubmitting}
              // Public test account from the seed data
              onClick={() => signIn({ username: "test", password: "password" })}
            />
            <p className="pt-2 text-center text-sm text-slate-700 dark:text-slate-200">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-bold text-green-600 underline-offset-4 hover:underline dark:text-green-500"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
