"use client";

import { Button } from "@/components/ui/button";
import LogoCloud from "@/components/logo-cloud";
import { FileUpload } from "@/components/ui/file-upload";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const scrollToGetStarted = () => {
    document.getElementById("get-started")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  const handleFileUpload = (files: File[]) => {
    console.log("Uploaded files:", files);
    // Handle file upload logic here
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-foreground rounded grid grid-cols-2 gap-[2px] p-1">
              <div className="bg-background rounded-sm"></div>
              <div className="bg-background rounded-sm"></div>
              <div className="bg-background rounded-sm"></div>
              <div className="bg-background rounded-sm"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">LoanPro</h1>
              <p className="text-[10px] text-muted-foreground leading-none">
                Modern Credit Platform
              </p>
            </div>
          </div>
          <Button
            className="bg-[#6366f1] hover:bg-[#5558e3] text-white rounded-full px-6"
            size="lg"
          >
            Get in touch <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 md:px-12 lg:px-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-muted/30 to-transparent"></div>
          <div
            className="absolute bottom-0 left-0 w-full h-[50%] opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--muted-foreground) / 0.15) 1px, transparent 0)`,
              backgroundSize: '48px 48px'
            }}
          ></div>
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Subheading */}
          <p className="text-base md:text-lg text-muted-foreground font-normal">
            A better experience for lenders, better products for borrowers.
          </p>

          {/* Main Heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-[#1e1b4b] dark:text-foreground leading-[1.1]">
            The leading end-to-end<br />
            loan management system
          </h2>

          {/* Description */}
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Legacy platforms are rigid, outdated, and create more work than they save. LoanPro automates
            servicing and collections, strengthens compliance, and scales with you.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
            <Button
              size="lg"
              onClick={scrollToGetStarted}
              className="bg-[#6366f1] hover:bg-[#5558e3] text-white rounded-full px-8 text-base h-12"
            >
              Get started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 text-base h-12 border-2"
            >
              Learn more <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Partner Logos Section */}
      <LogoCloud />

      {/* Get Started Section */}
      <section id="get-started" className="w-full py-24 px-6 md:px-12 lg:px-16 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#1e1b4b] dark:text-foreground">
              Get Started in Minutes
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload your Standard Operating Procedures (SOP) and let our AI-powered system analyze and optimize your loan collection process.
            </p>
          </div>

          <div className="bg-card border rounded-2xl shadow-lg p-8 md:p-12">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  Upload Your SOP
                </h3>
                <p className="text-sm text-muted-foreground">
                  Share your standard operating procedures document and we'll help you streamline your collection workflow.
                </p>
              </div>

              <FileUpload onChange={handleFileUpload} />

              <div className="pt-4 border-t">
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#6366f1]/10 flex items-center justify-center mt-0.5">
                    <span className="text-[#6366f1] text-xs font-bold">✓</span>
                  </div>
                  <p>
                    Your documents are encrypted and processed securely. We support PDF, DOC, DOCX, and TXT formats.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
