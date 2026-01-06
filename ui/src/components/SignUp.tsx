import useField from "../hooks/useField";
import Notify from "../ui/Notify";
import FormField from "../ui/FormField";
import Button from "../ui/Button";
import { useNavigate } from "react-router";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { CREATE_USER, LOGIN } from "../graphql/mutations";
import useNotifyMessage from "../hooks/useNotifyMessage";
import { AnimatePresence } from "motion/react";

const SignUp = ({
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
  const confirmPassword = useField(
    "Confirm Password",
    "password",
    "Confirm your password here..."
  );

  const [createUser] = useMutation(CREATE_USER, {
    onError: (error) => {
      console.log(error);
      showMessage(error.message);
    },
  });

  const [login] = useMutation(LOGIN, {
    onError: (error) => {
      console.log(error);
      showMessage(error.message);
    },
  });

  const validateSignUpForm = (
    username: string,
    password: string,
    confirmPassword: string
  ): string | null => {
    if (!username.length || !password.length || !confirmPassword.length) {
      return "Please fill all fields.";
    }

    if (username.length < 3) {
      return "Username must be at least 3 characters long";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match";
    }

    return null;
  };

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    const validationError = validateSignUpForm(
      username.value,
      password.value,
      confirmPassword.value
    );

    if (validationError) {
      showMessage(validationError);
      return;
    }

    console.log("Submitting form...");

    const { data } = await createUser({
      variables: {
        input: {
          username: username.value,
          password: password.value,
          confirmPassword: confirmPassword.value,
        },
      },
    });

    if (data) {
      const { data } = await login({
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
    }
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
              Create an account to start connecting with friends and family.
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
              inputBgColor="bg-slate-200 border-slate-200 dark:bg-slate-800 dark:border-slate-800"
            />
            <FormField
              field={password}
              inputBgColor="bg-slate-200 border-slate-200 dark:bg-slate-800 dark:border-slate-800"
            />
            <FormField
              field={confirmPassword}
              inputBgColor="bg-slate-200 border-slate-200 dark:bg-slate-800 dark:border-slate-800"
            />
          </div>
          <div className="flex w-full flex-col gap-2">
            <Button
              testId="submit-button"
              type="submit"
              variant="primary"
              text="Sign Up"
            />

            <div>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                Already have an account?
              </p>
              <Button
                type="button"
                variant="secondary"
                text="Return to Sign In"
                onClick={() => navigate("/signin")}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
