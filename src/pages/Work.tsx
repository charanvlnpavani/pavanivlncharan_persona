import PROFILE from "@/lib/profile";
import type { Experience } from "@/lib/profile";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

const Work = () => {
  const experiences: Experience[] = PROFILE.experiences ?? [];

  const sorted = [...experiences].sort((a, b) => {
    const year = (t?: string) => {
      if (!t) return 0;
      const m = t.match(/(\d{4})$/);
      return m ? parseInt(m[1], 10) : 0;
    };
    return year(b.timeframe) - year(a.timeframe);
  });

  return (
    <div className="mx-auto  py-12 px-4 overflow-y-scroll  h-[93vh] w-[80vw] border rounded-xl shadow ">
      <h1 className="text-3xl font-bold mb-1">Experience</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Professional experience
      </p>

      {sorted.length === 0 ? (
        <div className="p-6 rounded-lg bg-muted/5">
          <p className="text-sm text-muted-foreground">
            No work experience available yet.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {sorted.map((exp, idx) => (
            <Card key={idx} className="w-[60vw]  my-5">
              <CardHeader className="flex items-start justify-between gap-4">
                <div className="min-w-0 pr-6">
                  <CardTitle className="text-lg font-semibold leading-tight">
                    {exp.role}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {exp.company}
                    {exp.employmentType ? ` · ${exp.employmentType}` : ""}
                  </CardDescription>
                  {exp.location && (
                    <CardDescription className="mt-1 text-sm text-muted-foreground">
                      {exp.location}
                    </CardDescription>
                  )}
                </div>

                <CardAction className="text-sm text-muted-foreground whitespace-nowrap">
                  {exp.timeframe}
                </CardAction>
              </CardHeader>

              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {exp.bullets.map((b, i) => (
                    <p key={i} className="mb-2">
                      {b}
                    </p>
                  ))}
                </div>
              </CardContent>

              {exp.skills && exp.skills.length > 0 && (
                <CardFooter>
                  <div className="mt-3 text-sm">
                    <strong>Skills:</strong>{" "}
                    <span className="text-muted-foreground">
                      {exp.skills.join(", ")}
                    </span>
                  </div>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Work;
