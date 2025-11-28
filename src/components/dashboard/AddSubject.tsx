"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, Upload, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Papa from "papaparse";
import { useAuth } from "@clerk/clerk-react";
import createAxiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";

type Batch = { id: string; name: string };
type Teacher = { id: string; name: string };

export default function AddSubject() {
  const { getToken } = useAuth();
  const axiosInstance = createAxiosInstance(getToken);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    batchIds: [] as string[],
    teacherIds: [] as string[], 
    startDate: "",
    endDate: "",
  });

  const [formErrors, setFormErrors] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [batchOpen, setBatchOpen] = useState(false);
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [batchSearchTerm, setBatchSearchTerm] = useState("");
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [csvSubmitting, setCsvSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

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

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get("/api/users/list");
        setTeachers(res.data.filter((u: any) => u.role === "teacher"));
      } catch (error) {
        console.error("Failed to fetch teachers");
      }
    })();
  }, []);

  const validate = () => {
    const errors: any = {};

    if (!formData.name.trim()) errors.name = "Subject name is required";
    if (!formData.batchIds.length)
      errors.batchIds = "At least one batch must be selected";
    if (!formData.teacherIds.length) 
      errors.teacherIds = "At least one teacher must be selected";
    if (!formData.startDate) errors.startDate = "Start date is required";
    if (!formData.endDate) errors.endDate = "End date is required";

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) <= new Date(formData.startDate)
    ) {
      errors.endDate = "End date must be after start date";
    }

    if (formData.startDate && new Date(formData.startDate) < new Date(new Date().toDateString())) {
      errors.startDate = "Start date cannot be in the past";
    }

    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" });
    }
  };

  const handleSelectBatch = (batchId: string) => {
    setFormData((prev) => {
      if (prev.batchIds.includes(batchId)) {
        return prev;
      }
      return {
        ...prev,
        batchIds: [...prev.batchIds, batchId],
      };
    });

    if (formErrors.batchIds) {
      setFormErrors({ ...formErrors, batchIds: "" });
    }
  };

  const handleRemoveBatch = (batchId: string) => {
    setFormData((prev) => ({
      ...prev,
      batchIds: prev.batchIds.filter((id) => id !== batchId),
    }));
  };

  const handleSelectTeacher = (teacherId: string) => {
    setFormData((prev) => {
      if (prev.teacherIds.includes(teacherId)) {
        return prev;
      }
      return {
        ...prev,
        teacherIds: [...prev.teacherIds, teacherId],
      };
    });

    if (formErrors.teacherIds) {
      setFormErrors({ ...formErrors, teacherIds: "" });
    }
  };

  const handleRemoveTeacher = (teacherId: string) => {
    setFormData((prev) => ({
      ...prev,
      teacherIds: prev.teacherIds.filter((id) => id !== teacherId),
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    setSubmitted(true);

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        await axiosInstance.post("/api/subjects/create", {
          name: formData.name,
          batchIds: formData.batchIds,
          teacherIds: formData.teacherIds,
          startDate: formData.startDate,
          endDate: formData.endDate,
        });

        setFormData({ 
          name: "", 
          batchIds: [], 
          teacherIds: [], 
          startDate: "", 
          endDate: "" 
        });
        setSubmitted(false);
        setServerError("");

        toast.success("Subject added successfully!");
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || "Something went wrong.";
        setServerError(errorMessage);

        toast.error(errorMessage);
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
        const parsedData = result.data.map((row: any) => ({
          ...row,
          batchIds: row.Batches?.split(",").map((b: string) => b.trim()),
        }));
        setCsvData(parsedData);
        setColumns(Object.keys(parsedData[0] || {}));
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
    try {
      await axiosInstance.post("/api/subjects/bulk-upload", csvData);
      setCsvData([]);
      setColumns([]);
      setShowPreview(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("CSV uploaded successfully!");
    } catch (err: any) {
      setServerError(err.response?.data?.error || "Upload failed");
      toast.error("Upload failed");
    } finally {
      setCsvSubmitting(false);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="space-y-8">
      <Card className="border-none shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-xl font-medium">
            Bulk Upload Subjects
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="upload-csv" className="block mb-2">
                  Upload CSV File
                </Label>
                <div className="flex items-center gap-2">
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

            {serverError && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            {showPreview && csvData.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">
                  Preview ({csvData.length} records)
                </h3>
                <div className="border rounded-md overflow-hidden">
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
          </div>
        </CardContent>
      </Card>

      {/* Manual Add Subject Form */}
      <Card className="border-none shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-xl font-medium">
            Add Individual Subject
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter subject name"
                  className="border border-[#4637d2]/20 hover:border-[#00d746]/40 focus:border-[#00d746]/60 transition-all"
                />
                {submitted && formErrors.name && (
                  <p className="text-red-500 text-sm">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Select Batches</Label>
                <Popover open={batchOpen} onOpenChange={setBatchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={batchOpen}
                      className="w-full justify-between border border-[#4637d2]/20 hover:border-[#00d746]/40 text-[#4637d2] hover:text-[#00d746] transition-all"
                    >
                      {formData.batchIds.length === 0
                        ? "Select batches..."
                        : `${formData.batchIds.length} batch${
                            formData.batchIds.length > 1 ? "es" : ""
                          } selected`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search batches..."
                        onValueChange={(value) => setBatchSearchTerm(value)}
                      />
                      <CommandEmpty>No batch found.</CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-72">
                          {batches
                            .filter((batch) =>
                              batch.name
                                .toLowerCase()
                                .includes(batchSearchTerm.toLowerCase())
                            )
                            .map((batch) => (
                              <CommandItem
                                key={batch.id}
                                value={batch.id}
                                onSelect={() => {
                                  handleSelectBatch(batch.id);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    formData.batchIds.includes(batch.id)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                                {batch.name}
                              </CommandItem>
                            ))}
                        </ScrollArea>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>

                {formData.batchIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.batchIds.map((id) => {
                      const batch = batches.find((b) => b.id === id);
                      return batch ? (
                        <Badge
                          key={id}
                          variant="secondary"
                          className="pl-2 pr-1 py-1 flex items-center gap-1"
                        >
                          {batch.name}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => handleRemoveBatch(id)}
                          >
                            <X size={12} />
                          </Button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
                {submitted && formErrors.batchIds && (
                  <p className="text-red-500 text-sm">{formErrors.batchIds}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Select Teachers</Label>
                <Popover open={teacherOpen} onOpenChange={setTeacherOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={teacherOpen}
                      className="w-full justify-between border border-[#4637d2]/20 hover:border-[#00d746]/40 text-[#4637d2] hover:text-[#00d746] transition-all"
                    >
                      {formData.teacherIds.length === 0
                        ? "Select teachers..."
                        : `${formData.teacherIds.length} teacher${
                            formData.teacherIds.length > 1 ? "s" : ""
                          } selected`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search teachers..."
                        onValueChange={(value) => setTeacherSearchTerm(value)}
                      />
                      <CommandEmpty>No teacher found.</CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-72">
                          {teachers
                            .filter((teacher) =>
                              teacher.name
                                .toLowerCase()
                                .includes(teacherSearchTerm.toLowerCase())
                            )
                            .map((teacher) => (
                              <CommandItem
                                key={teacher.id}
                                value={teacher.id}
                                onSelect={() => {
                                  handleSelectTeacher(teacher.id);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    formData.teacherIds.includes(teacher.id)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                                {teacher.name}
                              </CommandItem>
                            ))}
                        </ScrollArea>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>

                {formData.teacherIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.teacherIds.map((id) => {
                      const teacher = teachers.find((t) => t.id === id);
                      return teacher ? (
                        <Badge
                          key={id}
                          variant="secondary"
                          className="pl-2 pr-1 py-1 flex items-center gap-1"
                        >
                          {teacher.name}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => handleRemoveTeacher(id)}
                          >
                            <X size={12} />
                          </Button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
                {submitted && formErrors.teacherIds && (
                  <p className="text-red-500 text-sm">{formErrors.teacherIds}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 sm:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    min={getTodayDate()}
                    className="border border-[#4637d2]/20 hover:border-[#00d746]/40 focus:border-[#00d746]/60 transition-all"
                  />
                  {submitted && formErrors.startDate && (
                    <p className="text-red-500 text-sm">
                      {formErrors.startDate}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate || getTodayDate()}
                    className="border border-[#4637d2]/20 hover:border-[#00d746]/40 focus:border-[#00d746]/60 transition-all"
                  />
                  {submitted && formErrors.endDate && (
                    <p className="text-red-500 text-sm">{formErrors.endDate}</p>
                  )}
                </div>
              </div>
            </div>

            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <Button
              type="button"
              onClick={handleFormSubmit}
              disabled={isSubmitting}
              className="bg-[#4637d2]/10 hover:bg-[#00d746]/10 text-[#4637d2] hover:text-[#00d746] border border-[#4637d2]/20 hover:border-[#00d746]/60 transition-all"
            >
              {isSubmitting ? "Adding Subject..." : "Add Subject"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}