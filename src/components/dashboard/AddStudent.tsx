"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import { useAuth } from "@clerk/clerk-react";
import createAxiosInstance from "@/lib/axiosInstance";

type Batch = { id: string; name: string };

export default function AddStudent() {
  const { getToken } = useAuth();
  const axiosInstance = createAxiosInstance(getToken);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    usnNumber: "",
    email: "",
    batch: "",
  });

  const [formErrors, setFormErrors] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [csvSubmitting, setCsvSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const CHUNK = 15;

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get("/api/batches/list");
        setBatches(res.data);
      } catch (error) {
        console.error("Failed to fetch batches");
      }
    })();
  }, []);

  const validate = () => {
    const errors: any = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.usnNumber.trim()) errors.usnNumber = "USN is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.batch) errors.batch = "Batch is required";
    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, batch: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    setSubmitted(true);

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        const payload = {
          ...formData,
          batch: [formData.batch],
        };
        await axiosInstance.post("/api/students/create", payload);
        setFormData({ name: "", usnNumber: "", email: "", batch: "" });
        setSubmitted(false);
        setServerError("");
        alert("Student added successfully!");
      } catch (err: any) {
        setServerError(err.response?.data?.error || "Something went wrong.");
      } finally {
        setIsSubmitting(false);
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
        const data = result.data as any[];
        setCsvData(data);
        setColumns(Object.keys(data[0] || {}));
        setShowPreview(true);
      },
      error: () => {
        setServerError("CSV parsing failed.");
      },
    });
  };

  const handleCsvUpload = async () => {
  if (!csvData.length) return;
  setCsvSubmitting(true);
  setServerError("");

  try {
    const all = { created: [], updated: [], failed: [] };

    for (let i = 0; i < csvData.length; i += CHUNK) {
      const slice = csvData.slice(i, i + CHUNK);
      const res = await axiosInstance.post("/api/students/bulk-upload", slice);

      ["created", "updated", "failed"].forEach((k) => {
        if (res.data.results?.[k]) {
          all[k].push(...res.data.results[k]);
        }
      });
    }

    let message = `✅Upload finished!\n` +
      `• Created: ${all.created.length}\n` +
      `• Updated: ${all.updated.length}\n` +
      `• Failed : ${all.failed.length}`;

    if (all.failed.length) {
      const failedDetails = all.failed
        .map((f: any) => `Row ${f.row}: ${f.reason}`)
        .join("\n");
      message += `\n\n❌ Failed Rows:\n${failedDetails}`;
    }

    alert(message);
  } catch (err: any) {

    console.error("Upload error", err);
    const failed = err.response?.data?.results?.failed ?? [];
    const fallbackMsg = failed.length
      ? failed.map((f: any) => `Row ${f.row}: ${f.reason}`).join("\n")
      : "Something went wrong during upload.";
    alert(`❌ Upload Failed\n\n${fallbackMsg}`);
  } finally {
    setCsvSubmitting(false);
  }
};


  return (
    <div className="space-y-10">

      <Card className="border-none shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-xl font-semibold">
            Bulk Upload Students
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
                  className="flex-1 border border-[#4637d2]/20 hover:border-[#00d746]/40 focus:border-[#00d746]/60 transition-all duration-300"
                />
                <Button
                  onClick={handleCsvUpload}
                  disabled={!csvData.length || csvSubmitting}
                  variant="outline"
                  className="flex items-center gap-2 border border-[#4637d2]/20 hover:border-[#00d746]/40 text-[#4637d2] hover:text-[#00d746] transition-all duration-300"
                >
                  <Upload size={16} />
                  {csvSubmitting ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
          </div>

          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {showPreview && csvData.length > 0 && (
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

      {/* Manual Add Student Form */}
      <Card className="border-none shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-xl font-semibold">
            Add Individual Student
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Student Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="border border-[#4637d2]/20 hover:border-[#00d746]/40 focus:border-[#00d746]/60 transition-all duration-300"
                />
                {submitted && formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="usnNumber">USN Number</Label>
                <Input
                  id="usnNumber"
                  name="usnNumber"
                  value={formData.usnNumber}
                  onChange={handleChange}
                  placeholder="AU00UG-000"
                  className="border border-[#4637d2]/20 hover:border-[#00d746]/40 focus:border-[#00d746]/60 transition-all duration-300"
                />
                {submitted && formErrors.usnNumber && (
                  <p className="text-sm text-red-500">{formErrors.usnNumber}</p>
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
                  placeholder="student@atriauniversity.edu.in"
                  className="border border-[#4637d2]/20 hover:border-[#00d746]/40 focus:border-[#00d746]/60 transition-all duration-300"
                />
                {submitted && formErrors.email && (
                  <p className="text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="batch">Batch</Label>
                <Select
                  onValueChange={handleSelectChange}
                  value={formData.batch}
                >
                  <SelectTrigger
                    id="batch"
                    className="border border-[#4637d2]/20 hover:border-[#00d746]/40 focus:border-[#00d746]/60 transition-all duration-300"
                  >
                    <SelectValue placeholder="Select a batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {submitted && formErrors.batch && (
                  <p className="text-sm text-red-500">{formErrors.batch}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#4637d2]/10 hover:bg-[#00d746]/10 text-[#4637d2] hover:text-[#00d746] border border-[#4637d2]/20 hover:border-[#00d746]/60 transition-all duration-300"
            >
              {isSubmitting ? "Adding..." : "Add Student"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
