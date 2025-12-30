import React, { useEffect, useState } from "react";
import PROFILE from "@/lib/profile";
import type { Project as ProjectType } from "@/lib/profile";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectType[]>([]);

  useEffect(() => {
    fetch("/projects.json")
      .then((res) => res.json())
      .then((data) => setProjects(data.projects ?? PROFILE.projects))
      .catch(() => setProjects(PROFILE.projects));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 w-[80vw] h-[90vh] overflow-y-scroll">
      <h1 className="text-2xl font-bold mb-6">Projects</h1>

      {projects.length === 0 ? (
        <p className="text-muted-foreground">No projects found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <Card
              key={p.title}
              className="h-[45vh] overflow-scroll flex flex-col justify-between"
            >
              <CardHeader>
                <CardTitle className="text-lg">{p.title}</CardTitle>
                <CardDescription>{p.summary}</CardDescription>
              </CardHeader>
              <CardContent className="mt-4">
                {Array.isArray(p.lang) && p.lang.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {p.lang.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <a
                    href={p.link || undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1"
                    tabIndex={p.link ? 0 : -1}
                  >
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={!p.link}
                      type="button"
                    >
                      <ExternalLink className="mr-2" size={16} />
                      View
                    </Button>
                  </a>
                  <a
                    href={p.githublink || undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1"
                    tabIndex={p.githublink ? 0 : -1}
                  >
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={!p.githublink}
                      type="button"
                    >
                      <Github className="mr-2" size={16} />
                      GitHub
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
