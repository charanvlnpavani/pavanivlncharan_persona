import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

const HeroPic = () => {
  return (
    <>
      <Avatar
        className={`inline-flex h-20 w-20 rounded-full overflow-hidden align-middle justify-center items-center bg-neutral-100 dark:bg-neutral-800`}
      >
        <AvatarImage
          className="h-full w-full object-cover"
          src="/hero-pic.jpeg"
          alt="Hero Picture"
        />
        <AvatarFallback
          className="text-neutral-700 dark:text-neutral-300 flex items-center justify-center h-full w-full bg-neutral-100 dark:bg-neutral-800"
          delayMs={600}
        >
          PC
        </AvatarFallback>
      </Avatar>
    </>
  );
};

export default HeroPic;
