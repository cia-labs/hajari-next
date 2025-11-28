"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@clerk/clerk-react";
import { AlertCircle, CheckCircle } from "lucide-react";
import createAxiosInstance from "@/lib/axiosInstance";

export default function AddAdmin() {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    email: "",
    password: "",
    role: "admin",
  });
  const [formErrors, setFormErrors] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const normalizeName = (name: string): string =>
    name
      .trim()
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");

  const axiosInstance = createAxiosInstance(getToken);

  const validate = () => {
    const errors: any = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.password.trim()) errors.password = "Password is required";
    return errors;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      employeeId: "",
      email: "",
      password: "",
      role: "admin",
    });
    setFormErrors({});
    setSubmitted(false);
    setServerError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors((prev: any) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    setSubmitted(true);
    setSuccess(false);

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        const cleanedData = {
          ...formData,
          name: normalizeName(formData.name),
          email: formData.email.trim().toLowerCase(),
          password: formData.password.trim(),
          employeeId: formData.employeeId.trim(),
        };

        await axiosInstance.post("/api/users/create", cleanedData);
        setSuccess(true);
        resetForm();
        setTimeout(() => setSuccess(false), 3000);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setServerError(
            "Access Denied: You don't have permission to add an admin."
          );
        } else {
          setServerError(
            err.response?.data?.error ||
              "Something went wrong. Please try again."
          );
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border-none shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-xl font-semibold">
            Add Administrator
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
                Administrator added successfully!
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Admin Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="border border-[#00d746]/20 hover:border-[#4637d2]/40 focus:border-[#4637d2]/60"
                />
                {submitted && formErrors.name && (
                  <p className="text-red-500 text-sm">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="Employee ID"
                  className="border border-[#00d746]/20 hover:border-[#4637d2]/40 focus:border-[#4637d2]/60"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@atriauniversity.edu.in"
                  className="border border-[#00d746]/20 hover:border-[#4637d2]/40 focus:border-[#4637d2]/60"
                />
                {submitted && formErrors.email && (
                  <p className="text-red-500 text-sm">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="border border-[#00d746]/20 hover:border-[#4637d2]/40 focus:border-[#4637d2]/60"
                />
                {submitted && formErrors.password && (
                  <p className="text-red-500 text-sm">{formErrors.password}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={resetForm}
                className="border border-[#00d746]/20 hover:border-[#4637d2]/40"
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#4637d2]/10 hover:bg-[#00d746]/10 text-[#4637d2] hover:text-[#00d746] border border-[#4637d2]/20 hover:border-[#00d746]/60"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
