"use client";
import { useState } from "react";
import { CalendarX, Upload, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function AttendanceExceptionRequestButton() {
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    reasonType: "",
    reason: "",
    proof: null,
  });
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (value) => {
    setFormData({ ...formData, reasonType: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, proof: file });
    setFileName(file ? file.name : "");
  };

  const resetForm = () => {
    setFormData({ date: "", reasonType: "", reason: "", proof: null });
    setFileName("");
    setError("");
    setSuccess(false);
  };

  const handleDialogChange = (open) => {
    setOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const isProofRequired =
    formData.reasonType === "Medical" || formData.reasonType === "Fest";

  const handleSubmit = async () => {
    setError("");
    if (!formData.date || !formData.reasonType || !formData.reason) {
      setError("Please fill all required fields.");
      return;
    }
    if (isProofRequired && !formData.proof) {
      setError("Proof document is required for Medical or Fest/Event reasons.");
      return;
    }

    setSubmitting(true);

    try {
      const token = await getToken();
      const res = await fetch("/api/students/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const studentData = await res.json();

      if (!studentData?.student?.id) {
        throw new Error("Student profile not found");
      }

      const payload = new FormData();
      payload.append("studentId", studentData.student.id);
      payload.append("date", formData.date);
      payload.append("reasonType", formData.reasonType);
      payload.append("reason", formData.reason);
      if (formData.proof) {
        payload.append("proof", formData.proof);
      }

      const uploadRes = await fetch("/api/attendance-exceptions/request", {
        method: "POST",
        body: payload,
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json();
        throw new Error(errData?.error || "Upload failed");
      }

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <div className="flex flex-col items-center justify-center group cursor-pointer relative">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-[#00d746]/10 hover:text-[#00d746] transition-all duration-200 group-hover:scale-110 transform"
              title="Submit Attendance Exception"
            >
              <CalendarX className="h-5 w-5" />
              <span className="sr-only">Submit Attendance Exception</span>

              <div className="absolute inset-0 rounded-md bg-[#00d746]/20 animate-ping opacity-0 group-hover:opacity-100"></div>

              <div className="absolute inset-0 rounded-md border-2 border-[#00d746]/30 animate-pulse"></div>
            </Button>

            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
            </div>
          </div>

          <div className="mt-2 relative">
            <div
              variant="outline"
              className="animate-pulse bg-gradient-to-r from-[#4637d2]/20 via-[#00b83d]/20 to-[#00d746]/20 border-[#4637d2]/40 text-[#4637d2] font-semibold text-xs px-3 py-1 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
            >
              <span className="animate-pulse bg-gradient-to-r from-[#000000] via-[#000000] to-[#000000] bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient">
                Request
              </span>
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <div
                  className="w-1 h-1 bg-[#00d746] rounded-full animate-ping"
                  style={{ animationDelay: "0s" }}
                ></div>
              </div>
              <div className="absolute -top-1 right-2">
                <div
                  className="w-0.5 h-0.5 bg-[#00d746] rounded-full animate-ping"
                  style={{ animationDelay: "0.5s" }}
                ></div>
              </div>
              <div className="absolute -top-1 left-2">
                <div
                  className="w-0.5 h-0.5 bg-[#00d746] rounded-full animate-ping"
                  style={{ animationDelay: "1s" }}
                ></div>
              </div>
            </div>

            {/* <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#00d746] rounded-full animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#00d746] rounded-full"></div> */}
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto border border-[#333742]/30 shadow-2xl backdrop-blur-sm bg-white/95">
        <DialogHeader className="pb-3 border-b border-[#333742]/10">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-[#00d746]/20 to-[#00b83d]/20 shadow-lg">
              <CalendarX className="h-4 w-4 text-[#00d746]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-[#191919]">
                Attendance Exception
              </DialogTitle>
              <DialogDescription className="text-[#333742]/70 text-sm">
                Submit your absence request
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <Alert
            variant="destructive"
            className="bg-red-50 border-red-200 text-red-800 shadow-sm py-2"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm">Error</AlertTitle>
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {success ? (
          <Card className="border-0 shadow-none flex flex-col items-center justify-center py-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#00d746]/20 to-[#00b83d]/20 flex items-center justify-center mb-3 shadow-lg animate-bounce">
              <CheckCircle2 className="h-8 w-8 text-[#00d746]" />
            </div>
            <h3 className="text-xl font-semibold text-[#191919] mb-2 bg-gradient-to-r from-[#00d746] to-[#00b83d] bg-clip-text text-transparent">
              Request Submitted!
            </h3>
            <p className="text-[#333742]/70 text-sm max-w-xs leading-relaxed">
              Your request has been submitted and is under review.
            </p>
          </Card>
        ) : (
          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <Label
                htmlFor="date"
                className="text-[#333742] font-medium text-sm flex items-center gap-1"
              >
                📅 Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="border-[#333742]/20 focus:border-[#00d746] focus:ring-[#00d746]/20 shadow-sm rounded-lg transition-all duration-200 h-9"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="reasonType"
                className="text-[#333742] font-medium text-sm flex items-center gap-1"
              >
                🏷️ Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.reasonType}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger className="border-[#333742]/20 focus:ring-[#00d746]/20 shadow-sm rounded-lg transition-all duration-200 h-9">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-lg shadow-xl border-[#333742]/20">
                  <SelectItem value="Medical" className="rounded-md">
                    <div className="flex items-center gap-2 py-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Medical
                    </div>
                  </SelectItem>
                  <SelectItem value="Fest" className="rounded-md">
                    <div className="flex items-center gap-2 py-1">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      Fest/Event
                    </div>
                  </SelectItem>
                  <SelectItem value="Personal" className="rounded-md">
                    <div className="flex items-center gap-2 py-1">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      Personal/Family
                    </div>
                  </SelectItem>
                  <SelectItem value="Other" className="rounded-md">
                    <div className="flex items-center gap-2 py-1">
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      Other
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="reason"
                className="text-[#333742] font-medium text-sm flex items-center gap-1"
              >
                📝 Explanation <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="Provide detailed explanation of your absence..."
                value={formData.reason}
                onChange={handleChange}
                className="min-h-20 border-[#333742]/20 focus:border-[#00d746] focus:ring-[#00d746]/20 resize-none shadow-sm rounded-lg transition-all duration-200 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="proof"
                className="text-[#333742] font-medium text-sm flex items-center gap-1"
              >
                📎 Document{" "}
                <span
                  className={`text-xs font-normal ${
                    isProofRequired ? "text-red-500" : "text-[#333742]/60"
                  }`}
                >
                  ({isProofRequired ? "required" : "optional"})
                </span>
              </Label>

              <div className="border-2 rounded-lg border-dashed border-[#333742]/30 p-4 text-center cursor-pointer bg-gradient-to-br from-[#333742]/5 to-[#00d746]/5 hover:bg-gradient-to-br hover:from-[#333742]/10 hover:to-[#00d746]/10 transition-all duration-300 hover:border-[#00d746]/50">
                <input
                  id="proof"
                  name="proof"
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                />
                <label htmlFor="proof" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    {fileName ? (
                      <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#333742]/10 px-4 shadow-md w-full">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#00d746]/20 to-[#00b83d]/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-3 w-3 text-[#00d746]" />
                        </div>
                        <span className="truncate text-[#333742] font-medium text-sm flex-1">
                          {fileName}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setFormData({ ...formData, proof: null });
                            setFileName("");
                          }}
                          className="text-[#333742]/60 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 flex-shrink-0"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#333742]/10 to-[#00d746]/10 flex items-center justify-center mb-1 shadow-lg">
                          <Upload className="h-5 w-5 text-[#333742]/60" />
                        </div>
                        <div className="text-xs">
                          <p className="font-medium text-[#333742] mb-1">
                            Upload document
                          </p>
                          <p className="text-[#333742]/60">
                            JPG, PNG, PDF (max 5MB)
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-[#333742]/10 mt-6 gap-2 flex-row justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-[#333742]/20 hover:bg-[#333742]/5 text-[#333742] font-medium px-4 rounded-lg transition-all duration-200 h-9"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-gradient-to-r from-[#00d746] to-[#00b83d] hover:from-[#00b83d] hover:to-[#00d746] text-white font-medium px-6 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed h-9"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-sm">Submitting...</span>
                  </div>
                ) : (
                  <span className="text-sm">Submit Request</span>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>

      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          animation: gradient 2s ease-in-out infinite;
        }
      `}</style>
    </Dialog>
  );
}
