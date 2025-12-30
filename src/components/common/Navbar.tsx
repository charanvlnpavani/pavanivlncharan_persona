import Profile from "@/pages/Profile";
import { ButtonClick } from "./ButtonClick";
import { File, BookOpen, Briefcase, Smile, LocateFixed, FolderOpenDot } from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "../ui/sidebar";
import { Link } from "react-router-dom";
import SocialMedia from "@/pages/SocialMedia";

const Navbar = () => {
  return (
    <div className="flex flex-col  gap-4 md:gap-6 lg:gap-8 bg-neutral-50 dark:bg-neutral-900 p-4 border-r border-neutral-200 dark:border-neutral-800 h-screen w-70 justify-between ">
      <div className="flex flex-col gap-6 ">
        <Profile />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/">
                <Smile className="inline-block mr-2" />
                Profile
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/education">
                <BookOpen className="inline-block mr-2" />
                Education
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/experience">
                <Briefcase className="inline-block mr-2" />
                Experience
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/projects">
                <FolderOpenDot className="inline-block mr-2" />
                Projects
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/skills">
                <LocateFixed className="inline-block mr-2" />
                Skills
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
      <div>
        <ButtonClick
          titleName="Download CV"
          variant="outline"
          link="/documents/charanvlnpavani_cv.pdf"
          download
          logo={<File />}
        />
        <SocialMedia />
      </div>
    </div>
  );
};

export default Navbar;
