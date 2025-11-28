"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import createAxiosInstance from "@/lib/axiosInstance";

export default function AddBatch() {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({ name: "" });
  const [formErrors, setFormErrors] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const axiosInstance = createAxiosInstance(getToken);

  const validate = () => {
    const errors: any = {};
    if (!formData.name.trim()) errors.name = "Batch name is required";
    return errors;
  };

  const resetForm = () => {
    setFormData({ name: "" });
    setFormErrors({});
    setSubmitted(false);
    setServerError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    setSubmitted(true);

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        await axiosInstance.post("/api/batches/create", formData);
        setSuccess(true);
        resetForm();
      } catch (err: any) {
        setServerError(
          err.response?.data?.error || "Something went wrong. Please try again."
        );
        setSuccess(false);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-xl font-medium flex items-center gap-2">
            <BookOpen size={20} /> Create New Batch
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {serverError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-700">
                Batch created successfully!
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Batch Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter batch name (e.g., FOU110-WK2401)"
                className="max-w-md border border-[#4637d2]/20 hover:border-[#00d746]/40 focus:border-[#00d746]/60 transition-all duration-300"
              />
              {submitted && formErrors.name && (
                <p className="text-red-500 text-sm">{formErrors.name}</p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#4637d2]/10 hover:bg-[#00d746]/10 text-[#4637d2] hover:text-[#00d746] border border-[#4637d2]/20 hover:border-[#00d746]/60 transition-all duration-300"
              >
                {isSubmitting ? "Creating Batch..." : "Create Batch"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
