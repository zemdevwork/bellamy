import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { IconBrandGithub } from "@tabler/icons-react";
import { APP_CONFIG } from "@/config/app";
import { AdminHeader } from "../admin/admin-header";

const { showGitHubLink, defaultTitle } = APP_CONFIG.siteHeader;
const { author } = APP_CONFIG;

interface SiteHeaderProps {
  title?: string;
}

export function SiteHeader({ title = defaultTitle }: SiteHeaderProps = {}) {
  return (
    <div>
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear w-full group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          {showGitHubLink && (
            <Button
              variant="ghost"
              asChild
              size="sm"
              className="hidden sm:flex"
            >
              <a
                href={author.url}
                rel="noopener noreferrer"
                target="_blank"
                className="dark:text-foreground flex items-center gap-2"
              >
                <IconBrandGithub />
                GitHub
              </a>
            </Button>
          )}
        </div>
      </div>
    </header>
        <AdminHeader />
    </div>
  );
}
