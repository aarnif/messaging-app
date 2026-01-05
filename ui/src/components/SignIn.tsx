import useField from "../hooks/useField";
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
    <div className="flex min-h-screen">
      <div className="max-w-105 grow bg-[url(/background-light.svg)] dark:bg-[url(/background-dark.svg)]"></div>
      <div className="flex grow items-center justify-center bg-slate-50 p-8 dark:bg-slate-900">
        <form
          className="flex w-full max-w-96 flex-col gap-12 rounded-2xl p-4 sm:mt-16"
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
                <Notify message={message} closeMessage={closeMessage} />
              )}
            </AnimatePresence>
            <FormField
              field={username}
              labelBgClass="bg-slate-100 dark:bg-slate-800"
              peerFocusBgClass="peer-focus:bg-slate-50 peer-focus:dark:bg-slate-900"
            />
            <FormField
              field={password}
              labelBgClass="bg-slate-100 dark:bg-slate-800"
              peerFocusBgClass="peer-focus:bg-slate-50 peer-focus:dark:bg-slate-900"
            />
          </div>
          <div className="flex w-full flex-col gap-2">
            <Button type="submit" variant="primary" text="Sign In" />
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-200">
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
