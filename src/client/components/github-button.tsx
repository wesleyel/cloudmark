import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

const REPOSITORY_URL = "https://github.com/wesleyel/cloudmark";

export function GitHubButton() {
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className="hidden h-8 rounded-full px-2.5 text-muted-foreground hover:text-foreground min-[430px]:inline-flex"
    >
      <a
        href={REPOSITORY_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open Cloudmark on GitHub"
      >
        <Github className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </Button>
  );
}
