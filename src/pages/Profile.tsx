import HeroPic from "@/components/common/HeroPic";
import { Card } from "@/components/ui/card";
const Profile = () => {
  return (
    <>
      {" "}
      <Card className="flex flex-col items-center justify-start gap-2 p-6">
        <HeroPic />
        <p className="text-lg font-bold">Pavani VLN Charan</p>
        <p className="text-md ">Software Engineer </p>
        <p className="text-xs ">Hyderabad</p>
      </Card>
    </>
  );
};

export default Profile;
