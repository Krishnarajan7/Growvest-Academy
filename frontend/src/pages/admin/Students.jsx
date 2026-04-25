import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Pencil, Trash2, Users, Copy, Eye, EyeOff, Download, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/axios";

const ageGroups = [
  { value: "6-8", label: "6-8 Years" },
  { value: "9-11", label: "9-11 Years" },
  { value: "12-14", label: "12-14 Years" },
  { value: "15-16", label: "15-16 Years" },
];

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAgeGroup, setFilterAgeGroup] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 15,
    total: 0,
    lastPage: 1
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    ageGroup: "",
    school: "",
    parentName: "",
    parentPhone: "",
    status: "Active",
  });

  const [generatedCredentials, setGeneratedCredentials] = useState(null);

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      age: "",
      ageGroup: "",
      school: "",
      parentName: "",
      parentPhone: "",
      status: "Active",
    });
    setGeneratedCredentials(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto generate credentials when first & last name are filled (only for ADD)
    if ((field === "firstName" || field === "lastName") && !isEditOpen) {
      const firstName = field === "firstName" ? value : formData.firstName;
      const lastName = field === "lastName" ? value : formData.lastName;
      
      if (firstName.length >= 2 && lastName.length >= 1) {
        setGeneratedCredentials({
          username: generateUsername(firstName, lastName),
          password: generatePassword(),
        });
      }
    }
  };

  const regenerateCredentials = () => {
    if (formData.firstName.length >= 2 && formData.lastName.length >= 1) {
      setGeneratedCredentials({
        username: generateUsername(formData.firstName, formData.lastName),
        password: generatePassword(),
      });
      toast.success("Credentials regenerated!");
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getStudents({
        page: pagination.page,
        per_page: pagination.perPage,
        search: searchQuery,
        ...(filterAgeGroup !== "all" && { age_group: filterAgeGroup })
      });
      
      if (response.success) {
        setStudents(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.total,
          lastPage: response.data.last_page
        }));
      }

      try {
        const statsResponse = await adminApi.getStudentStatistics();
        if (statsResponse.success) {
          setStats({
            total: statsResponse.data.total_students || response.data.total || 0,
            active: statsResponse.data.status_breakdown?.active || 0,
            pending: statsResponse.data.status_breakdown?.pending || 0,
            inactive: statsResponse.data.status_breakdown?.inactive || 0,
          });
        }
      } catch (err) {
        // Fallback to pagination total if stats API fails
        setStats(prev => ({ ...prev, total: response.data.total || 0 }));
      }
    } catch (error) {
      toast.error("Failed to fetch students");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.perPage, filterAgeGroup]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination(prev => ({ ...prev, page: 1 }));
      } else {
        fetchData();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddStudent = async () => {
    if (!formData.firstName || !formData.lastName || !formData.ageGroup) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const response = await adminApi.createStudent({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        age_group: formData.ageGroup,
        parent_name: formData.parentName,
        parent_phone: formData.parentPhone,
        status: formData.status.toLowerCase(),
        password: generatedCredentials?.password,
        username: generatedCredentials?.username
      });

      if (response.success) {
        toast.success("Student created successfully!");
        fetchData();
        setIsAddOpen(false);
        resetForm();
      }
    } catch (error) {
      toast.error(error.message || "Failed to create student");
    }
  };

  const handleEditStudent = async () => {
    if (!selectedStudent) return;

    try {
      const response = await adminApi.updateStudent(selectedStudent.id, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        age_group: formData.ageGroup,
        parent_name: formData.parentName,
        parent_phone: formData.parentPhone,
        status: formData.status.toLowerCase()
      });

      if (response.success) {
        toast.success("Student updated successfully");
        fetchData();
        setIsEditOpen(false);
        setSelectedStudent(null);
        resetForm();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update student");
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    try {
      const response = await adminApi.deleteStudent(selectedStudent.id);
      if (response.success) {
        toast.success("Student deleted successfully");
        fetchData();
        setIsDeleteOpen(false);
        setSelectedStudent(null);
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete student");
    }
  };

  const openEditDialog = (student) => {
    setSelectedStudent(student);
    setFormData({
      firstName: student.first_name || "",
      lastName: student.last_name || "",
      email: student.email || "",
      phone: student.phone || "",
      age: "",
      ageGroup: student.age_group || "",
      school: "", 
      parentName: student.parent_name || "",
      parentPhone: student.parent_phone || "",
      status: student.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1) : "Active",
    });
    setGeneratedCredentials({
      username: student.username,
      password: student.password || "••••••••••",
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const togglePasswordVisibility = (id) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const exportStudents = async () => {
    try {
      const response = await adminApi.exportStudents({
        search: searchQuery,
        ...(filterAgeGroup !== "all" && { age_group: filterAgeGroup })
      });
      const url = URL.createObjectURL(new Blob([response]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "students_export.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Students exported!");
    } catch (error) {
      toast.error("Failed to export students");
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Student Management</h1>
          <p className="text-muted-foreground mt-1">Manage students and their login credentials</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportStudents}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddOpen} onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Student</DialogTitle>
                <DialogDescription>
                  Username and password will be auto-generated after entering name
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Student Information */}
                <div className="space-y-4">
                  <h3 className="font-medium">Student Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name *</Label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="First name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name *</Label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="student@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+91 ..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Age</Label>
                      <Input
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleInputChange("age", e.target.value)}
                        placeholder="10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Age Group *</Label>
                      <Select
                        value={formData.ageGroup}
                        onValueChange={(val) => handleInputChange("ageGroup", val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select age group" />
                        </SelectTrigger>
                        <SelectContent>
                          {ageGroups.map(group => (
                            <SelectItem key={group.value} value={group.value}>
                              {group.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>School</Label>
                      <Input
                        value={formData.school}
                        onChange={(e) => handleInputChange("school", e.target.value)}
                        placeholder="School name"
                      />
                    </div>
                  </div>
                </div>

                {/* Parent Information */}
                <div className="space-y-4">
                  <h3 className="font-medium">Parent/Guardian Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Parent Name</Label>
                      <Input
                        value={formData.parentName}
                        onChange={(e) => handleInputChange("parentName", e.target.value)}
                        placeholder="Parent/Guardian name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Parent Phone</Label>
                      <Input
                        value={formData.parentPhone}
                        onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                        placeholder="+91 ..."
                      />
                    </div>
                  </div>
                </div>

                {/* Generated Credentials */}
                {generatedCredentials && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Login Credentials</h3>
                      <Button variant="ghost" size="sm" onClick={regenerateCredentials}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Regenerate
                      </Button>
                    </div>
                    <Card className="bg-muted/50">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-xs text-muted-foreground">Username</div>
                            <div className="font-mono">{generatedCredentials.username}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(generatedCredentials.username, "Username")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-xs text-muted-foreground">Password</div>
                            <div className="font-mono">{generatedCredentials.password}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(generatedCredentials.password, "Password")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Status */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => handleInputChange("status", val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddStudent}>Create Student</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inactive}</p>
                <p className="text-sm text-muted-foreground">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email, username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterAgeGroup} onValueChange={setFilterAgeGroup}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Age Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Age Groups</SelectItem>
                {ageGroups.map(group => (
                  <SelectItem key={group.value} value={group.value}>
                    {group.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Age Group</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      Loading students...
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {student.first_name} {student.last_name}
                          </div>
                          <div className="text-xs text-muted-foreground md:hidden">
                            {student.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{student.email}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">{student.age_group}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {student.username}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(student.username, "Username")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {showPasswords[student.id] && student.password ? student.password : "••••••••••"}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => togglePasswordVisibility(student.id)}
                            disabled={!student.password}
                          >
                            {showPasswords[student.id] ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                          {student.password && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(student.password, "Password")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            student.status === "active"
                              ? "bg-green-100 text-green-800"
                              : student.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {student.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(student)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => openDeleteDialog(student)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          {pagination.lastPage > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.lastPage}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.lastPage || isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student information</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Age Group</Label>
                <Select
                  value={formData.ageGroup}
                  onValueChange={(val) => handleInputChange("ageGroup", val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ageGroups.map(group => (
                      <SelectItem key={group.value} value={group.value}>
                        {group.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>School</Label>
                <Input
                  value={formData.school}
                  onChange={(e) => handleInputChange("school", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Parent Name</Label>
                <Input
                  value={formData.parentName}
                  onChange={(e) => handleInputChange("parentName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Parent Phone</Label>
                <Input
                  value={formData.parentPhone}
                  onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => handleInputChange("status", val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {generatedCredentials && (
              <div className="mt-6">
                <Label className="text-sm text-muted-foreground">Login Credentials (cannot be changed here)</Label>
                <div className="mt-2 p-3 bg-muted/60 rounded-md text-sm">
                  <div className="flex justify-between mb-2">
                    <span>Username:</span>
                    <code>{generatedCredentials.username}</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Password:</span>
                    <code>{generatedCredentials.password}</code>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditStudent}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>
                {selectedStudent?.first_name} {selectedStudent?.last_name}
              </strong>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteStudent}>
              Delete Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}