const Avatar = ({
  name,
  size,
  avatar,
  isLatestMessage = false,
}: {
  name: string;
  size: "small" | "medium" | "large";
  avatar?: string | null | undefined;
  isLatestMessage?: boolean;
}) => {
  const sizeStyles = {
    small: "h-10 max-w-10 text-xl",
    medium: "h-12 max-w-12 text-2xl",
    large: "h-20 max-w-20 text-4xl",
  };

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={`${name}'s avatar`}
        className={`w-full rounded-full ${sizeStyles[size]} ${isLatestMessage && "animate-fade-in"}`}
      />
    );
  }

  const [first, last] = name.split(" ");

  return (
    <div
      className={`font-oswald flex w-full items-center justify-center rounded-full bg-slate-300 font-medium text-white ${sizeStyles[size]} ${isLatestMessage && "animate-fade-in"}`}
    >
      {first?.[0].toUpperCase()}
      {last?.[0].toUpperCase()}
    </div>
  );
};

export default Avatar;
