import PROFILE from "@/lib/profile";
import type { Education } from "@/lib/profile";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
// ...existing code...

const Study = () => {
  const education: Education[] = PROFILE.education ?? [];

  const sorted = [...education].sort((a, b) => {
    const getYear = (t?: string) => {
      if (!t) return 0;
      const m = t.match(/(\d{4})$/);
      return m ? parseInt(m[1], 10) : 0;
    };
    return getYear(b.timeframe) - getYear(a.timeframe);
  });

  return (
    <div className="mx-auto w-[80vw] h-[93vh] border rounded-xl shadow py-12 px-4">
      <h1 className="text-xl font-bold mb-1">Education</h1>
      <p className="text-sm text-muted-foreground mb-6">Academic background</p>

      {sorted.length === 0 ? (
        <div className="p-6 rounded-lg bg-muted/5">
          <p className="text-sm text-muted-foreground">
            No education data available yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6 flex flex-col">
          {sorted.map((e, idx) => {
            return (
              <Card key={idx} className="w-[30vw]">
                <CardHeader className="flex items-start justify-between gap-4">
                  <div className="min-w-0 pr-4">
                    <CardTitle className="text-md leading-tight truncate">
                      {e.institution}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm truncate">
                      {e.degree}
                      {e.location ? ` · ${e.location}` : ""}
                    </CardDescription>

                    {e.summary && (
                      <CardDescription className="mt-3 text-sm">
                        {e.summary}
                      </CardDescription>
                    )}
                  </div>

                  <CardAction className="ml-4 text-sm text-muted-foreground whitespace-nowrap">
                    {e.timeframe}
                  </CardAction>
                </CardHeader>

                {e.courses && e.courses.length > 0 && (
                  <CardContent>
                    <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                      {e.courses.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Study;
