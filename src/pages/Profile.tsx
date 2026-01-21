import HeroPic from "@/components/common/HeroPic";
import { Card } from "@/components/ui/card";
import PROFILE from "@/lib/profile";

const Profile = () => {
  return (
    <>
      {" "}
      <Card className="flex flex-col items-center justify-start gap-2 p-6">
        <HeroPic />
        <p className="text-lg font-bold">{PROFILE.name}</p>
        <p className="text-xs ">{PROFILE.experience} - {PROFILE.headline}</p>
        <p className="text-xs ">{PROFILE.location}</p>
      </Card>
    </>
  );
};

export default Profile;
