import React from "react";
import { ArrowRight, BookOpen, Settings2, Zap, Eye, Type, Focus, SplitSquareHorizontal } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-[#FAFBFE] text-slate-800 flex flex-col font-sans relative selection:bg-violet-200 selection:text-violet-900">

      {/* Soft ambient pastel blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-8%] left-[-5%] w-[45%] h-[45%] rounded-full bg-violet-200/40 blur-[100px]" />
        <div className="absolute top-[15%] right-[-8%] w-[40%] h-[40%] rounded-full bg-rose-200/30 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[25%] w-[50%] h-[50%] rounded-full bg-sky-200/30 blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-violet-100/60 bg-white/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-violet-600" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-800">Cadence</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="/login" className="text-sm font-medium text-slate-400 hover:text-slate-700 transition-colors duration-200">
            Log in
          </a>
          <a
            href="/app"
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-violet-600 text-white shadow-[0px_4px_0px_#7c3aed] hover:bg-violet-500 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_#7c3aed] transition-all duration-200"
          >
            Open App
          </a>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center w-full z-10">
        {/* Hero Section */}
        <section className="w-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-24 lg:py-32 min-h-[90vh]">
          <div className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-violet-500 mb-10">
            <span className="flex h-2 w-2 rounded-full bg-violet-400 mr-2.5 animate-pulse"></span>
            Adaptive Reading Environment v1.0
          </div>
          
          <h1 className="max-w-4xl text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.95] text-slate-800">
            Read at the speed of <br className="hidden sm:block" />
            <span className="text-violet-500">
              pure comprehension.
            </span>
          </h1>
          
          <p className="max-w-2xl text-lg sm:text-xl text-slate-400 mb-14 leading-relaxed font-normal">
            A high-performance reading environment that transforms any text into an individually tokenized experience. Regain your focus with granular highlighting and precise typographic control.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <a
              href="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-semibold bg-violet-600 text-white shadow-[0px_5px_0px_#6d28d9] hover:bg-violet-500 hover:-translate-y-1 active:translate-y-0.5 active:shadow-[0px_0px_0px_#6d28d9] transition-all duration-200"
            >
              Start Reading
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-medium border border-slate-200 bg-white/80 text-slate-600 hover:bg-white hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            >
              See how it works
            </a>
          </div>

          {/* Abstract App Preview */}
          <div className="mt-24 w-full max-w-5xl rounded-3xl border border-violet-100 bg-white/70 backdrop-blur-sm p-2 sm:p-4 shadow-xl shadow-violet-100/50 relative overflow-hidden group">
            <div className="rounded-2xl border border-slate-100 bg-white flex items-center justify-center relative overflow-hidden aspect-[16/9] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-lg">
               
               {/* Decorative Sidebar */}
               <div className="absolute left-0 top-0 bottom-0 w-1/4 border-r border-slate-100 bg-violet-50/30 p-6 hidden md:block">
                 <div className="h-3 w-24 bg-violet-100 rounded-full mb-8 animate-pulse" />
                 <div className="space-y-6">
                   <div>
                     <div className="h-2 w-16 bg-violet-100 rounded-full mb-3 animate-pulse" />
                     <div className="h-8 w-full bg-white border border-violet-100 rounded-lg" />
                   </div>
                   <div>
                     <div className="h-2 w-20 bg-rose-100 rounded-full mb-3 animate-pulse" />
                     <div className="h-2 w-full bg-rose-100/60 rounded-full" />
                   </div>
                   <div>
                     <div className="h-2 w-12 bg-sky-100 rounded-full mb-3 animate-pulse" />
                     <div className="h-2 w-3/4 bg-sky-100/60 rounded-full" />
                   </div>
                 </div>
               </div>

               {/* Decorative Reader */}
               <div className="flex-1 p-8 md:pl-[30%] flex flex-col gap-4 justify-center h-full relative">
                  <div className="absolute left-[28%] top-1/4 bottom-1/4 w-[2px] bg-violet-200 hidden md:block" />
                  <div className="text-2xl sm:text-4xl font-serif text-slate-300 leading-relaxed flex flex-wrap gap-x-3 gap-y-4">
                    <span>Project</span>
                    <span>Lucida</span>
                    <span>is</span>
                    <span>a</span>
                    <span className="text-slate-800 bg-amber-100 px-2 py-1 rounded-lg border border-amber-200/60 transition-all duration-500 scale-105">
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
            <div className="text-center mb-20">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-400 mb-4">How It Works</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-800 mb-5">Reading, re-engineered.</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">Three steps to achieving your highest level of reading comprehension and speed.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StepCard 
                number="01"
                title="Paste & Rehydrate"
                description="Drop in any article, essay, or document. Lucida breaks the text down into an individually tokenized database of words."
                icon={<SplitSquareHorizontal className="w-6 h-6 text-sky-500" />}
                accentBg="bg-sky-50"
                accentBorder="border-sky-100"
                numberColor="text-sky-100"
              />
              <StepCard 
                number="02"
                title="Tune the Typography"
                description="Adjust column width, line height, and font choices (like OpenDyslexic) to match your brain's optimal scanning pattern."
                icon={<Type className="w-6 h-6 text-violet-500" />}
                accentBg="bg-violet-50"
                accentBorder="border-violet-100"
                numberColor="text-violet-100"
              />
              <StepCard 
                number="03"
                title="Enter Immersion"
                description="Engage the progression timer. The UI fades away, and a subtle visual anchor guides your eyes forward, eliminating regression."
                icon={<Focus className="w-6 h-6 text-rose-400" />}
                accentBg="bg-rose-50"
                accentBorder="border-rose-100"
                numberColor="text-rose-100"
              />
            </div>
          </div>
        </section>

        {/* Bento Box Features */}
        <section className="w-full py-24 bg-violet-50/40 border-t border-violet-100/50 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-400 mb-4">Core Features</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-800">Built for deep focus.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Hero Feature Card */}
              <div className="lg:col-span-2 lg:row-span-2 bg-white/80 backdrop-blur-sm border border-violet-100 p-10 rounded-3xl flex flex-col justify-end min-h-[300px] relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100/50 transition-all duration-200 ease-out">
                <div className="absolute top-8 right-8 w-32 h-32 bg-violet-100/40 rounded-full blur-2xl group-hover:bg-violet-200/40 transition-colors duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mb-6">
                  <Zap className="w-7 h-7 text-violet-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-800 tracking-tight">Tokenized Engine</h3>
                <p className="text-slate-400 leading-relaxed max-w-md">
                  We don't just render text. Every single word becomes an independently addressable node, allowing for instantaneous highlighting, analytics tracking, and spatial positioning without layout thrashing.
                </p>
              </div>
              
              <FeatureCard 
                icon={<Settings2 className="w-6 h-6" />}
                title="Absolute Control"
                description="Line height, word spacing, letter spacing—your eyes, your rules."
                accentBg="bg-sky-50"
                accentBorder="border-sky-100"
                iconColor="text-sky-600"
              />
              <FeatureCard 
                icon={<Eye className="w-6 h-6" />}
                title="Visual Anchoring"
                description="A smooth, animated gutter ruler keeps your vertical position locked."
                accentBg="bg-amber-50"
                accentBorder="border-amber-100"
                iconColor="text-amber-600"
              />
              <FeatureCard 
                icon={<BookOpen className="w-6 h-6" />}
                title="Accessibility First"
                description="Built-in dyslexia-friendly fonts and low-contrast background tints."
                accentBg="bg-emerald-50"
                accentBorder="border-emerald-100"
                iconColor="text-emerald-600"
              />
              {/* CTA Card */}
              <div className="bg-violet-600 text-white p-8 rounded-3xl flex flex-col justify-center items-start shadow-[0px_6px_0px_#6d28d9] hover:-translate-y-1 hover:shadow-[0px_8px_0px_#6d28d9] active:translate-y-0.5 active:shadow-[0px_0px_0px_#6d28d9] transition-all duration-200 cursor-pointer">
                <h3 className="text-xl font-bold mb-2 tracking-tight">Ready to focus?</h3>
                <p className="text-violet-200 text-sm mb-4">Launch the workspace and start reading smarter.</p>
                <a href="/app" className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white transition-colors duration-200">
                  Launch App <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-violet-100/50 bg-white/60 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-violet-500" />
            </div>
            <span className="font-bold tracking-tight text-slate-700">Cadence</span>
          </div>
          <p className="text-[11px] uppercase tracking-widest text-slate-300 font-medium">
            © {new Date().getFullYear()} Cadence. Crafted for cognitive clarity.
          </p>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, title, description, icon, accentBg, accentBorder, numberColor }: { number: string, title: string, description: string, icon: React.ReactNode, accentBg: string, accentBorder: string, numberColor: string }) {
  return (
    <div className="flex flex-col items-start p-8 rounded-3xl border border-slate-100 bg-white/80 backdrop-blur-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100/30 transition-all duration-200 ease-out">
      <div className={`text-6xl font-black ${numberColor} mb-6 font-mono tracking-tighter leading-none`}>{number}</div>
      <div className={`mb-5 ${accentBg} p-3.5 rounded-2xl border ${accentBorder}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-800 tracking-tight">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-[15px]">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description, accentBg, accentBorder, iconColor }: { icon: React.ReactNode, title: string, description: string, accentBg: string, accentBorder: string, iconColor: string }) {
  return (
    <div className="p-8 rounded-3xl border border-slate-100 bg-white/80 backdrop-blur-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100/30 transition-all duration-200 ease-out flex flex-col">
      <div className={`w-12 h-12 rounded-2xl ${accentBg} ${iconColor} flex items-center justify-center mb-6 border ${accentBorder}`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2 text-slate-800 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed flex-1">
        {description}
      </p>
    </div>
  );
}