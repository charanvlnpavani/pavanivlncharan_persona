import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { Badge } from "@/components/ui/badge";

type IconName = keyof typeof Icons;

type Social = {
  id: string;
  name: string;
  href: string;
  icon: IconName;
};

const SocialMedia: React.FC = () => {
  const [socials, setSocials] = useState<Social[]>([]);

  useEffect(() => {
    fetch("/socials.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch socials");
        return res.json();
      })
      .then((data) => setSocials(data))
      .catch((err) => console.error("Failed to load socials", err));
  }, []);

  return (
    <div className="space-y-4 pb-6 flex flex-col gap-2 ">
      <ul className="flex flex-row pt-5 m-auto gap-2">
        {socials.map((s) => {
          const Icon = Icons[s.icon] as React.ComponentType<{ size: number }>;

          return (
            <li key={s.id}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline"
              >
                <Badge variant="outline" className="flex items-center gap-2">
                  <Icon size={16} />
                </Badge>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SocialMedia;
