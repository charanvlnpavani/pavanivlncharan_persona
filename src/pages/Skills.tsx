import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

type Skill = { name: string; category: string };

const Skills: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    fetch("/skills.json")
      .then((res) => res.json())
      .then((data) => setSkills(data.skills ?? []))
      .catch(() => {});
  }, []);

  const byCategory = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8 border rounded-xl shadow  h-[93vh]">
      <h1 className="text-2xl font-bold mb-4">Skills</h1>

      <div className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <Badge key={s.name} className="capitalize">
            {s.name}
          </Badge>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {Object.keys(byCategory).map((cat) => (
          <div key={cat}>
            <h2 className="text-lg font-semibold mb-2">{cat}</h2>
            <div className="flex flex-wrap gap-2">
              {byCategory[cat].map((s) => (
                <Badge key={s.name}>{s.name}</Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skills;
