import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center w-[80vw] h-[90vh] px-4 ">
      <div className="text-center space-y flex flex-col gap-4">
        <h1 className="text-8xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold text-foreground">
          Page Not Found
        </h2>
        <p className="text-lg text-muted-foreground max-w-md">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>

        <Link to="/">
          <Button size="lg" className="mt-4">
            Go Back Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
