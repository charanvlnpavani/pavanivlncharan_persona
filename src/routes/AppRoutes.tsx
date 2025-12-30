import { Routes, Route } from "react-router-dom";
import About from "@/pages/About.tsx";
import Study from "@/pages/Study.tsx";
import Skills from "@/pages/Skills.tsx";
import Work from "@/pages/Work.tsx";
import NotFound from "@/pages/NotFound.tsx";
import Projects from "@/pages/Projects";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<About />} />
      <Route path="/education" element={<Study />} />
      <Route path="/skills" element={<Skills />} />
      <Route path="/experience" element={<Work />} />
        <Route path="/projects" element={<Projects />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
