import React from "react";
import { ArrowRight, BookOpen, Settings2, Zap, Eye, Type, Focus, SplitSquareHorizontal } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-background text-foreground flex flex-col font-sans relative selection:bg-primary/30 selection:text-primary">
      {/* Ambient Mesh Gradient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] mix-blend-normal dark:mix-blend-screen" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] mix-blend-normal dark:mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-teal-500/10 blur-[120px] mix-blend-normal dark:mix-blend-screen" />
      </div>

      {/* Navigation (Glass) */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="text-lg font-semibold tracking-tight">Project Lucida</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Log in
          </a>
          <a
            href="/app"
            className="px-5 py-2 text-sm font-medium rounded-full bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] hover:bg-primary transition-all"
          >
            Open App
          </a>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center w-full z-10">
        {/* Hero Section */}
        <section className="w-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-24 lg:py-32 min-h-[90vh]">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Adaptive Reading Environment v1.0
          </div>
          
          <h1 className="max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Read at the speed of <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 drop-shadow-sm">
              pure comprehension.
            </span>
          </h1>
          
          <p className="max-w-2xl text-lg sm:text-xl text-muted-foreground mb-12 leading-relaxed">
            A high-performance reading environment that transforms any text into an individually tokenized experience. Regain your focus with granular highlighting and precise typographic control.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <a
              href="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform"
            >
              Start Reading
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-medium border border-border/50 bg-background/50 backdrop-blur-sm text-foreground hover:bg-muted/50 transition-colors"
            >
              See how it works
            </a>
          </div>

          {/* Abstract App Preview (Glass Card) */}
          <div className="mt-24 w-full max-w-5xl rounded-2xl border border-white/10 dark:border-white/5 bg-white/10 dark:bg-black/10 backdrop-blur-2xl p-2 sm:p-4 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-xl border border-border/50 bg-background/80 flex items-center justify-center relative overflow-hidden aspect-[16/9] shadow-inner transition-transform duration-700 group-hover:scale-[1.01]">
               
               {/* Decorative Sidebar */}
               <div className="absolute left-0 top-0 bottom-0 w-1/4 border-r border-border/50 bg-muted/20 p-6 hidden md:block backdrop-blur-md">
                 <div className="h-3 w-24 bg-border/60 rounded-full mb-8" />
                 <div className="space-y-6">
                   <div>
                     <div className="h-2 w-16 bg-border/40 rounded-full mb-3" />
                     <div className="h-8 w-full bg-background/50 border border-border/50 rounded-md" />
                   </div>
                   <div>
                     <div className="h-2 w-20 bg-border/40 rounded-full mb-3" />
                     <div className="h-2 w-full bg-border/30 rounded-full" />
                   </div>
                   <div>
                     <div className="h-2 w-12 bg-border/40 rounded-full mb-3" />
                     <div className="h-2 w-3/4 bg-border/30 rounded-full" />
                   </div>
                 </div>
               </div>

               {/* Decorative Reader */}
               <div className="flex-1 p-8 md:pl-[30%] flex flex-col gap-4 justify-center h-full relative">
                  <div className="absolute left-[28%] top-1/4 bottom-1/4 w-[3px] rounded-full bg-primary/50 shadow-[0_0_10px_rgba(var(--primary),0.5)] hidden md:block" />
                  <div className="text-2xl sm:text-4xl font-serif text-muted-foreground/40 leading-relaxed flex flex-wrap gap-x-3 gap-y-4">
                    <span>Project</span>
                    <span>Lucida</span>
                    <span>is</span>
                    <span>a</span>
                    <span className="text-foreground bg-primary/10 dark:bg-primary/20 px-2 py-1 rounded-md border border-primary/20 shadow-sm transition-all duration-500 scale-105">
                      high-performance
                    </span>
                    <span>adaptive</span>
                    <span>reading</span>
                    <span>environment.</span>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-24 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Reading, re-engineered.</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Three steps to achieving your highest level of reading comprehension and speed.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StepCard 
                number="01"
                title="Paste & Rehydrate"
                description="Drop in any article, essay, or document. Lucida breaks the text down into an individually tokenized database of words."
                icon={<SplitSquareHorizontal className="w-6 h-6 text-blue-500" />}
              />
              <StepCard 
                number="02"
                title="Tune the Typography"
                description="Adjust column width, line height, and font choices (like OpenDyslexic) to match your brain's optimal scanning pattern."
                icon={<Type className="w-6 h-6 text-purple-500" />}
              />
              <StepCard 
                number="03"
                title="Enter Immersion"
                description="Engage the progression timer. The UI fades away, and a subtle visual anchor guides your eyes forward, eliminating regression."
                icon={<Focus className="w-6 h-6 text-teal-500" />}
              />
            </div>
          </div>
        </section>

        {/* Bento Box Features */}
        <section className="w-full py-24 bg-muted/20 border-t border-border/30 relative z-10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2 lg:row-span-2 bg-background/60 backdrop-blur-md border border-border/50 p-8 rounded-3xl flex flex-col justify-end min-h-[300px] relative overflow-hidden group">
                <div className="absolute top-8 right-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
                <Zap className="w-8 h-8 text-primary mb-6" />
                <h3 className="text-2xl font-bold mb-3">Tokenized Engine</h3>
                <p className="text-muted-foreground leading-relaxed max-w-md">
                  We don't just render text. Every single word becomes an independently addressable node, allowing for instantaneous highlighting, analytics tracking, and spatial positioning without layout thrashing.
                </p>
              </div>
              
              <FeatureCard 
                icon={<Settings2 className="w-6 h-6" />}
                title="Absolute Control"
                description="Line height, word spacing, letter spacing—your eyes, your rules."
              />
              <FeatureCard 
                icon={<Eye className="w-6 h-6" />}
                title="Visual Anchoring"
                description="A smooth, animated gutter ruler keeps your vertical position locked."
              />
              <FeatureCard 
                icon={<BookOpen className="w-6 h-6" />}
                title="Accessibility First"
                description="Built-in dyslexia-friendly fonts and low-contrast background tints."
              />
              <div className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground p-8 rounded-3xl flex flex-col justify-center items-start border border-primary/20 shadow-lg">
                <h3 className="text-xl font-bold mb-2">Ready to focus?</h3>
                <a href="/app" className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-80 mt-4 transition-opacity">
                  Launch App <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border/40 bg-background/50 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
            <BookOpen className="w-5 h-5" />
            <span className="font-semibold tracking-tight">Project Lucida</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Project Lucida. Crafted for cognitive clarity.
          </p>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, title, description, icon }: { number: string, title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start p-8 rounded-3xl border border-border/50 bg-background/40 backdrop-blur-md hover:bg-background/60 transition-colors shadow-sm">
      <div className="text-5xl font-black text-muted/30 mb-6 font-mono tracking-tighter">{number}</div>
      <div className="mb-4 bg-muted/50 p-3 rounded-2xl border border-border/50">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl border border-border/50 bg-background/40 backdrop-blur-md hover:bg-background/60 transition-colors flex flex-col">
      <div className="w-12 h-12 rounded-2xl bg-muted/50 text-foreground flex items-center justify-center mb-6 border border-border/50">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">
        {description}
      </p>
    </div>
  );
}