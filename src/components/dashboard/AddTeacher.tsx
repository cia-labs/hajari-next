"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { useAuth } from "@clerk/clerk-react";
import createAxiosInstance from "@/lib/axiosInstance";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function AddTeacher() {
  const { getToken } = useAuth();
  const axiosInstance = createAxiosInstance(getToken);

  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    email: "",
    password: "",
    role: "teacher",
  });

  const [formErrors, setFormErrors] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [csvSubmitting, setCsvSubmitting] = useState(false);
  const [csvSuccess, setCsvSuccess] = useState(false);

  const normalizeName = (name: string): string =>
    name
      .trim()
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");

  const validate = () => {
    const errors: any = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.employeeId.trim())
      errors.employeeId = "Employee ID is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.password.trim()) errors.password = "Password is required";
    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors((prev: any) => ({ ...prev, [name]: "" }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      employeeId: "",
      email: "",
      password: "",
      role: "teacher",
    });
    setFormErrors({});
    setSubmitted(false);
    setServerError("");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    setSubmitted(true);
    setSuccess(false);

    if (Object.keys(errors).length === 0) {
      setFormSubmitting(true);
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
        setTimeout(() => setSuccess(false), 3000);
        resetForm();
      } catch (err: any) {
        setServerError(err.response?.data?.error || "Something went wrong.");
      } finally {
        setFormSubmitting(false);
      }
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const data = (result.data as any[]).map((row) => {
          const cleanedRow: any = {};
          for (const key in row) {
            let cleanedValue = String(row[key]).trim();
            if (cleanedValue.endsWith(";"))
              cleanedValue = cleanedValue.slice(0, -1);
            cleanedRow[key] = cleanedValue;
          }
          return cleanedRow;
        });

        setCsvData(data);
        setColumns(Object.keys(data[0] || {}));
      },
      error: () => setServerError("CSV parsing failed."),
    });
  };

  const handleCsvUpload = async () => {
    if (!csvData.length) return;
    setCsvSubmitting(true);
    setCsvSuccess(false);

    try {
      await axiosInstance.post("/api/users/bulk-upload", csvData);
      setCsvData([]);
      setColumns([]);
      setCsvSuccess(true);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setServerError(err.response?.data?.error || "Upload failed.");
    } finally {
      setCsvSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <Card className="border-none shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-xl font-semibold">
            Bulk Upload Teachers
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="upload-csv">Upload CSV File</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="upload-csv"
                  type="file"
                  accept=".csv"
                  onChange={handleFile}
                  ref={fileInputRef}
                  className="flex-1 border border-[#4637d2]/20 hover:border-[#00d746]/40 focus:border-[#00d746]/60 transition-all"
                />
                <Button
                  onClick={handleCsvUpload}
                  disabled={!csvData.length || csvSubmitting}
                  variant="outline"
                  className="flex items-center gap-2 border border-[#4637d2]/20 hover:border-[#00d746]/40 text-[#4637d2] hover:text-[#00d746] transition-all"
                >
                  <Upload size={16} />
                  {csvSubmitting ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
          </div>

          {csvSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-700">
                Teachers uploaded successfully!
              </AlertDescription>
            </Alert>
          )}

          {serverError && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {csvData.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">
                Preview ({csvData.length} records)
              </h3>
              <div className="border rounded-md overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((col) => (
                        <TableHead key={col}>{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(0, 5).map((row, i) => (
                      <TableRow key={i}>
                        {columns.map((col) => (
                          <TableCell key={col}>{row[col]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                  {csvData.length > 5 && (
                    <TableCaption>
                      Showing 5 of {csvData.length} records
                    </TableCaption>
                  )}
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Add Form */}
      <Card className="border-none shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-xl font-semibold">
            Add Individual Teacher
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-700">
                  Teacher added successfully!
                </AlertDescription>
              </Alert>
            )}

            {serverError && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Teacher Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="border border-[#4637d2]/20 hover:border-[#00d746]/40 focus:border-[#00d746]/60 transition-all"
                />
                {submitted && formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
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
                  className="border border-[#4637d2]/20 hover:border-[#00d746]/40 focus:border-[#00d746]/60 transition-all"
                />
                {submitted && formErrors.employeeId && (
                  <p className="text-sm text-red-500">
                    {formErrors.employeeId}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="teacher@atriauniversity.edu.in"
                  className="border border-[#4637d2]/20 hover:border-[#00d746]/40 focus:border-[#00d746]/60 transition-all"
                />
                {submitted && formErrors.email && (
                  <p className="text-sm text-red-500">{formErrors.email}</p>
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
                  className="border border-[#4637d2]/20 hover:border-[#00d746]/40 focus:border-[#00d746]/60 transition-all"
                />
                {submitted && formErrors.password && (
                  <p className="text-sm text-red-500">{formErrors.password}</p>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="border border-[#4637d2]/20 hover:border-[#00d746]/40 text-[#4637d2] hover:text-[#00d746] transition-all"
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={formSubmitting}
                className="bg-[#4637d2]/10 hover:bg-[#00d746]/10 text-[#4637d2] hover:text-[#00d746] border border-[#4637d2]/20 hover:border-[#00d746]/60 transition-all"
              >
                {formSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
