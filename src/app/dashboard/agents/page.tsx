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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Loader2, Phone, MapPin, DollarSign, Calendar, AlertCircle } from "lucide-react";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface BorrowerInfo {
  name: string;
  loan_number: string;
  outstanding_balance: string;
  days_past_due: number;
  last_payment_date: string;
  phone: string;
  address: string;
  delinquent_status: string;
}

export default function AgentsPage() {
  const [loading, setLoading] = useState(false);
  const [borrowers, setBorrowers] = useState<BorrowerInfo[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedImages(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: true
  });

  const handleParseImages = async () => {
    if (uploadedImages.length === 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      uploadedImages.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch('/api/parse-images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse images');
      }

      const data = await response.json();
      setBorrowers(data.borrowers);
    } catch (error) {
      console.error('Error parsing images:', error);
      alert('Failed to parse images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider style={{ "--sidebar-width": "19rem" } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Agents</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="container max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Collection Agents</h2>
              <p className="text-muted-foreground">
                Upload borrower information cards to extract and manage details
              </p>
            </div>

            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Borrower Cards</CardTitle>
                <CardDescription>
                  Upload images of borrower information cards to automatically extract details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-[#6366f1] bg-[#6366f1]/5'
                      : 'border-muted-foreground/25 hover:border-[#6366f1]/50 hover:bg-muted/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#6366f1]/10">
                      <Upload className="h-8 w-8 text-[#6366f1]" />
                    </div>
                    {uploadedImages.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-lg font-medium">
                          {uploadedImages.length} image{uploadedImages.length > 1 ? 's' : ''} selected
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {uploadedImages.map(f => f.name).join(', ')}
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-lg font-medium">
                          {isDragActive
                            ? 'Drop the images here'
                            : 'Drag & drop images here, or click to select'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Supports PNG, JPG, JPEG, WEBP
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="flex justify-end">
                    <Button
                      onClick={handleParseImages}
                      disabled={loading}
                      className="bg-[#6366f1] hover:bg-[#5558e3]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Parsing Images...
                        </>
                      ) : (
                        'Parse Images'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Section */}
            {borrowers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Borrower Information</CardTitle>
                  <CardDescription>
                    {borrowers.length} borrower{borrowers.length > 1 ? 's' : ''} extracted
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="0" className="w-full">
                    <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
                      {borrowers.map((borrower, index) => (
                        <TabsTrigger key={index} value={index.toString()} className="flex-shrink-0">
                          {borrower.name || `Borrower ${index + 1}`}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {borrowers.map((borrower, index) => (
                      <TabsContent key={index} value={index.toString()} className="mt-6">
                        <div className="rounded-lg border bg-card">
                          <div className="p-6 space-y-6">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-2xl font-bold">{borrower.name}</h3>
                                <p className="text-muted-foreground mt-1">
                                  Loan #{borrower.loan_number}
                                </p>
                              </div>
                              <Badge
                                className={
                                  borrower.delinquent_status.toLowerCase().includes('delinquent')
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                }
                              >
                                {borrower.delinquent_status}
                              </Badge>
                            </div>

                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#6366f1]/10">
                                  <DollarSign className="h-5 w-5 text-[#6366f1]" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                                  <p className="text-xl font-bold">{borrower.outstanding_balance}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                                  <AlertCircle className="h-5 w-5 text-red-500" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Days Past Due</p>
                                  <p className="text-xl font-bold">{borrower.days_past_due}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                                  <Calendar className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Last Payment</p>
                                  <p className="text-xl font-bold">{borrower.last_payment_date}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                                  <Phone className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Phone</p>
                                  <p className="text-xl font-bold">{borrower.phone}</p>
                                </div>
                              </div>
                            </div>

                            {/* Address */}
                            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                                <MapPin className="h-5 w-5 text-purple-500" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Address</p>
                                <p className="text-base font-medium mt-1">{borrower.address}</p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t">
                              <Button className="flex-1 bg-[#6366f1] hover:bg-[#5558e3]">
                                <Phone className="h-4 w-4 mr-2" />
                                Contact
                              </Button>
                              <Button variant="outline" className="flex-1">
                                Payment Plan
                              </Button>
                              <Button variant="outline" className="flex-1">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
