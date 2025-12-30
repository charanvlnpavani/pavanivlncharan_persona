import React from "react";
import HeroPic from "@/components/common/HeroPic";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import PROFILE from "@/lib/profile";

const About = () => {
  return (
    <div className="flex flex-col gap-6  m-auto  ">
      <Card className="h-[95vh]">
        <CardHeader>
          <div className="flex items-center gap-4 ">
            <HeroPic />
            <div>
              <CardTitle className="text-lg">{PROFILE.name}</CardTitle>
              <CardDescription>{PROFILE.headline}</CardDescription>
              <p className="text-xs text-muted-foreground">
                {PROFILE.location}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">{PROFILE.summary}</p>

          <h4 className="font-semibold mb-2">Specializations</h4>
          <ul className="list-inside list-disc grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {PROFILE.specializations.map((s) => (
              <li key={s} className="text-sm">
                {s}
              </li>
            ))}
          </ul>

          <h4 className="font-semibold mb-2">Skills</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {PROFILE.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
              >
                {skill}
              </span>
            ))}
          </div>

          <h4 className="font-semibold mt-4 mb-2">Interests</h4>
          <p className="text-sm">{PROFILE.interests}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;
