import useField from "../hooks/useField";
import Header from "../ui/Header";
import Notify from "../ui/Notify";
import FormField from "../ui/FormField";
import Button from "../ui/Button";
import { useNavigate } from "react-router";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { CREATE_USER, LOGIN } from "../graphql/mutations";
import useNotifyMessage from "../hooks/useNotifyMessage";
import { AnimatePresence } from "motion/react";

const SignUp = () => {
  const client = useApolloClient();
  const navigate = useNavigate();
  const { message, showMessage } = useNotifyMessage();
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
        client.resetStore();
        navigate("/chats");
        console.log("Form submitted succesfully!");
      }
    }
  };

  return (
    <div className="flex flex-col">
      <Header showBackground={false} />
      <div className="flex justify-center p-8">
        <form
          className="mt-8 flex w-full max-w-80 flex-col gap-8 rounded-2xl bg-white p-4 sm:mt-16 dark:bg-slate-800"
          onSubmit={handleSubmit}
        >
          <h1 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
            Sign Up
          </h1>
          <div className="flex w-full flex-col gap-4">
            <AnimatePresence>
              {message && <Notify message={message} />}
            </AnimatePresence>
            <FormField field={username} />
            <FormField field={password} />
            <FormField field={confirmPassword} />
          </div>
          <div className="flex w-full flex-col gap-2">
            <Button type="submit" variant="primary" text="Sign Up" />

            <Button
              type="button"
              variant="secondary"
              text="Return to Sign In"
              onClick={() => navigate("/signin")}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
