import { ThemeToggle } from "@/components/theme-toggle";
import { TableEditor } from "@/components/table";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center pt-24 px-4">
      <div className="text-center max-w-2xl mb-16">
        <h1 
          className="text-5xl md:text-6xl font-normal mb-4 tracking-tight"
          style={{ fontFamily: "'Crimson Text', serif" }}
        >
          Tableau
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl font-light leading-relaxed">
          A lightweight and composable React component for quickly making table editors
        </p>
      </div>
      
      <div className="w-full max-w-4xl">
        <div className="h-px bg-border mb-16" />
        <TableEditor />
      </div>
      
      <ThemeToggle />
    </div>
  );
}
