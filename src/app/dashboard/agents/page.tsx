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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Loader2, Phone, MapPin, DollarSign, Calendar, AlertCircle, CheckCircle2, Clock, PlayCircle, Shield } from "lucide-react";
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
  const [calling, setCalling] = useState<number | null>(null);
  const [paymentPlanModal, setPaymentPlanModal] = useState<{ open: boolean; borrower: BorrowerInfo | null }>({
    open: false,
    borrower: null,
  });
  const [viewDetailsModal, setViewDetailsModal] = useState<{ open: boolean; borrower: BorrowerInfo | null }>({
    open: false,
    borrower: null,
  });

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

  const handleCall = async (borrower: BorrowerInfo, index: number) => {
    setCalling(index);
    try {
      const response = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: borrower.phone,
          borrowerName: borrower.name,
          loanNumber: borrower.loan_number,
          outstandingBalance: borrower.outstanding_balance,
          daysPastDue: borrower.days_past_due,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate call');
      }

      const data = await response.json();
      alert(`Call initiated successfully! Call ID: ${data.callId}`);
    } catch (error) {
      console.error('Error initiating call:', error);
      alert('Failed to initiate call. Please try again.');
    } finally {
      setCalling(null);
    }
  };

  const handleOpenPaymentPlan = (borrower: BorrowerInfo) => {
    setPaymentPlanModal({ open: true, borrower });
  };

  const handleOpenViewDetails = (borrower: BorrowerInfo) => {
    setViewDetailsModal({ open: true, borrower });
  };

  const calculatePaymentPlan = (balance: string) => {
    const amount = parseFloat(balance.replace(/[$,]/g, ''));
    const monthlyPayment = amount / 6;
    const today = new Date();

    return Array.from({ length: 6 }, (_, i) => {
      const dueDate = new Date(today);
      dueDate.setMonth(dueDate.getMonth() + i + 1);
      return {
        month: i + 1,
        amount: monthlyPayment,
        dueDate: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: i === 0 ? 'upcoming' : 'pending',
      };
    });
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
                              <Button
                                className="flex-1 bg-[#6366f1] hover:bg-[#5558e3]"
                                onClick={() => handleCall(borrower, index)}
                                disabled={calling === index}
                              >
                                {calling === index ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Calling...
                                  </>
                                ) : (
                                  <>
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call Now
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleOpenPaymentPlan(borrower)}
                              >
                                Payment Plan
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleOpenViewDetails(borrower)}
                              >
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

      {/* Payment Plan Modal */}
      <Dialog open={paymentPlanModal.open} onOpenChange={(open) => setPaymentPlanModal({ open, borrower: null })}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Payment Plan Agreed During Call
            </DialogTitle>
            <DialogDescription>
              {paymentPlanModal.borrower?.name} agreed to a 6-month payment plan during the conversation
            </DialogDescription>
          </DialogHeader>

          {paymentPlanModal.borrower && (
            <div className="space-y-6 mt-4">
              {/* Plan Summary */}
              <Card className="border-2 border-[#6366f1]/20 bg-gradient-to-br from-[#6366f1]/5 to-transparent">
                <CardHeader>
                  <CardTitle>Plan Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold">{paymentPlanModal.borrower.outstanding_balance}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Monthly Payment</p>
                      <p className="text-2xl font-bold text-[#6366f1]">
                        ${(parseFloat(paymentPlanModal.borrower.outstanding_balance.replace(/[$,]/g, '')) / 6).toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Plan Duration</p>
                      <p className="text-2xl font-bold">6 Months</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Customer verbally agreed to this plan during the phone call
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Schedule Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Schedule</CardTitle>
                  <CardDescription>Monthly breakdown of the agreed payment plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Payment #</th>
                          <th className="text-left py-3 px-4 font-medium">Due Date</th>
                          <th className="text-right py-3 px-4 font-medium">Amount</th>
                          <th className="text-center py-3 px-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculatePaymentPlan(paymentPlanModal.borrower.outstanding_balance).map((payment, idx) => (
                          <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="py-4 px-4 font-medium">Payment {payment.month}</td>
                            <td className="py-4 px-4">{payment.dueDate}</td>
                            <td className="py-4 px-4 text-right font-semibold">${payment.amount.toFixed(2)}</td>
                            <td className="py-4 px-4 text-center">
                              {payment.status === 'upcoming' ? (
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                  Next Payment
                                </Badge>
                              ) : (
                                <Badge variant="outline">Scheduled</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Visual Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {calculatePaymentPlan(paymentPlanModal.borrower.outstanding_balance).map((payment, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-24 text-sm font-medium">Month {payment.month}</div>
                        <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                          <div
                            className={`h-full flex items-center px-3 text-sm font-medium text-white transition-all ${
                              payment.status === 'upcoming'
                                ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]'
                                : 'bg-gray-300 dark:bg-gray-700'
                            }`}
                            style={{ width: payment.status === 'upcoming' ? '100%' : '0%' }}
                          >
                            {payment.status === 'upcoming' && `$${payment.amount.toFixed(2)}`}
                          </div>
                        </div>
                        <div className="flex-shrink-0 w-24 text-sm text-right text-muted-foreground">
                          {payment.dueDate}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Agreement Note */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> This payment plan was verbally agreed upon during the collection call.
                  The borrower confirmed their commitment to make {calculatePaymentPlan(paymentPlanModal.borrower.outstanding_balance).length} monthly payments
                  starting from {calculatePaymentPlan(paymentPlanModal.borrower.outstanding_balance)[0].dueDate}.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={viewDetailsModal.open} onOpenChange={(open) => setViewDetailsModal({ open, borrower: null })}>
        <DialogContent className="!max-w-[1400px] !w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Account Details & Call History</DialogTitle>
            <DialogDescription>
              Complete information for {viewDetailsModal.borrower?.name} - Loan #{viewDetailsModal.borrower?.loan_number}
            </DialogDescription>
          </DialogHeader>

          {viewDetailsModal.borrower && (
            <div className="space-y-6 mt-4">
              {/* Account Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{viewDetailsModal.borrower.outstanding_balance}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Days Past Due</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-red-500">{viewDetailsModal.borrower.days_past_due}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Last Payment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{viewDetailsModal.borrower.last_payment_date}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Call Information */}
              <Card className="border-2 border-[#6366f1]/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-[#6366f1]" />
                    Recent Call Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Call Date
                      </p>
                      <p className="font-semibold">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Call Time
                      </p>
                      <p className="font-semibold">
                        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Duration
                      </p>
                      <p className="font-semibold">8:42 mins</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Outcome</p>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Payment Agreed
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Call Summary</p>
                    <p className="text-sm text-muted-foreground">
                      Successfully contacted borrower and discussed outstanding balance. Customer acknowledged the debt and
                      agreed to pay the full amount immediately. Payment was processed during the call via Stripe. Customer was
                      cooperative and confirmed the transaction. Account has been marked as paid in full and closed.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Call Recording */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 text-[#6366f1]" />
                    Call Recording
                  </CardTitle>
                  <CardDescription>Admin access only - Listen to call recording</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <Button className="bg-[#6366f1] hover:bg-[#5558e3]">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Play Recording
                    </Button>
                    <div className="flex-1">
                      <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full w-0 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]"></div>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground font-mono">0:00 / 8:42</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Recording ID: REC-{Date.now().toString().slice(-8)} • Stored securely • CFPB compliant
                  </p>
                </CardContent>
              </Card>

              {/* Payment Status */}
              <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    Payment Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-green-800 dark:text-green-200">Loan Cleared</p>
                        <p className="text-sm text-green-700 dark:text-green-300">Full payment received and processed</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500 text-white text-base px-4 py-2">
                      PAID IN FULL
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm text-muted-foreground">Payment Method</span>
                        <span className="font-semibold">Stripe</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm text-muted-foreground">Transaction ID</span>
                        <span className="font-mono text-sm">pi_{Date.now().toString().slice(-10)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm text-muted-foreground">Payment Date</span>
                        <span className="font-semibold">
                          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm text-muted-foreground">Amount Paid</span>
                        <span className="font-bold text-green-600">{viewDetailsModal.borrower.outstanding_balance}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm text-muted-foreground">Processing Fee</span>
                        <span className="font-semibold">$0.00</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge className="bg-green-500 text-white">Confirmed</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-background border rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-[#6366f1] mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold mb-1">Verified by Stripe</p>
                        <p className="text-sm text-muted-foreground">
                          Payment has been verified and confirmed by Stripe's secure payment processing system.
                          Funds have been successfully transferred and the account has been marked as paid in full.
                        </p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                        <div className="w-px h-full bg-border"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-semibold">Payment Received</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date().toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-sm mt-1">Full payment processed via Stripe</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6366f1]">
                          <Phone className="h-4 w-4 text-white" />
                        </div>
                        <div className="w-px h-full bg-border"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-semibold">Collection Call Completed</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(Date.now() - 3600000).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-sm mt-1">8:42 minute call - Payment plan agreed</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500">
                          <AlertCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Account Marked Delinquent</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(Date.now() - 86400000 * viewDetailsModal.borrower.days_past_due).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-sm mt-1">{viewDetailsModal.borrower.days_past_due} days past due</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
