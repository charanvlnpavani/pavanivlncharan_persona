import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

const HeroPic = () => {
  return (
    <>
      <Avatar
        className={`inline-flex h-20 w-20 rounded-full overflow-hidden align-middle justify-center items-center bg-neutral-100 dark:bg-neutral-800`}
      >
        <AvatarImage
          className="h-full w-full object-cover"
          src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.zB1rsS80G2GPbY0mMvKnigHaEK%3Fpid%3DApi&f=1&ipt=376339d16d178237dbb49384b22d7ef70d5724ffdc9c75269cf4dbfc74a8bc01&ipo=images"
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
