"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface DocumentData {
  summary: {
    total_documents: number;
    total_pages: number;
    documents: Array<{
      filename: string;
      page_count: number;
      chunk_count: number;
    }>;
  };
  chunks: Array<{
    index: number;
    text: string;
    chunk_type: string;
    pages: number[];
  }>;
  markdown: string;
  total_chunks: number;
}

export default function DocumentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAndParseDocument() {
      try {
        setLoading(true);

        // Get the latest document from Vercel Blob
        const docResponse = await fetch('/api/parse-document');
        if (!docResponse.ok) throw new Error('Failed to fetch document');

        const docData = await docResponse.json();
        if (!docData.document) {
          setError('No documents found. Please upload a PDF first.');
          setLoading(false);
          return;
        }

        setDocumentUrl(docData.document.url);

        // Parse the document
        const parseResponse = await fetch('/api/parse-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentUrl: docData.document.url }),
        });

        if (!parseResponse.ok) throw new Error('Failed to parse document');

        const parseData = await parseResponse.json();
        setDocumentData(parseData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load document');
      } finally {
        setLoading(false);
      }
    }

    fetchAndParseDocument();
  }, []);

  if (loading) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "19rem" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Documents</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 items-center justify-center p-4">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#6366f1]" />
              <p className="text-muted-foreground">Parsing document...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "19rem" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Documents</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 items-center justify-center p-4">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Error Loading Document</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": "19rem" } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Documents</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 pt-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">SOP Document</h2>
            <p className="text-muted-foreground">
              Parsed Standard Operating Procedures
            </p>
          </div>

          {/* Document Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#6366f1]/10">
                    <FileText className="h-6 w-6 text-[#6366f1]" />
                  </div>
                  <div>
                    <CardTitle>{documentData?.summary.documents[0]?.filename || 'Document'}</CardTitle>
                    <CardDescription>
                      {documentData?.summary.total_pages} pages • {documentData?.total_chunks} chunks
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Parsed
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Pages</p>
                  <p className="text-2xl font-bold">{documentData?.summary.total_pages}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Chunks</p>
                  <p className="text-2xl font-bold">{documentData?.total_chunks}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Documents</p>
                  <p className="text-2xl font-bold">{documentData?.summary.total_documents}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-2xl font-bold">✓</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Content */}
          <Card>
            <CardHeader>
              <CardTitle>Document Content</CardTitle>
              <CardDescription>Extracted text from your SOP document</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {documentData?.chunks.slice(0, 10).map((chunk, index) => (
                  <div key={index} className="rounded-lg border p-4 bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">Chunk {chunk.index + 1}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Pages: {chunk.pages.join(', ')}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{chunk.text}</p>
                  </div>
                ))}
                {documentData && documentData.chunks.length > 10 && (
                  <p className="text-center text-sm text-muted-foreground">
                    Showing 10 of {documentData.chunks.length} chunks
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
