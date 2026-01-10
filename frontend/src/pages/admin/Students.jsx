import { useState } from "react";
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
import { Search, Plus, Pencil, Trash2, Users, Copy, Eye, EyeOff, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const ageGroups = [
  { value: "6-8", label: "6-8 Years" },
  { value: "9-11", label: "9-11 Years" },
  { value: "12-14", label: "12-14 Years" },
  { value: "15-16", label: "15-16 Years" },
];

const generateUsername = (firstName, lastName) => {
  const base = `${firstName.toLowerCase().replace(/\s/g, '')}${lastName.charAt(0).toLowerCase()}`;
  const random = Math.floor(Math.random() * 1000);
  return `${base}${random}`;
};

const generatePassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const initialStudents = [
  { 
    id: 1, 
    firstName: "Arun", 
    lastName: "Kumar", 
    email: "arun@email.com", 
    phone: "+91 9876543210", 
    age: 10,
    ageGroup: "9-11",
    school: "Delhi Public School",
    parentName: "Vikram Kumar",
    parentPhone: "+91 9876543220",
    username: "arunk123",
    password: "Abc@12345",
    status: "Active", 
    enrolledDate: "Jan 5, 2026" 
  },
  { 
    id: 2, 
    firstName: "Priya", 
    lastName: "Sharma", 
    email: "priya@email.com", 
    phone: "+91 9876543211", 
    age: 8,
    ageGroup: "6-8",
    school: "Modern School",
    parentName: "Anjali Sharma",
    parentPhone: "+91 9876543221",
    username: "priyas456",
    password: "Xyz@78901",
    status: "Active", 
    enrolledDate: "Jan 4, 2026" 
  },
  { 
    id: 3, 
    firstName: "Rahul", 
    lastName: "Verma", 
    email: "rahul@email.com", 
    phone: "+91 9876543212", 
    age: 14,
    ageGroup: "12-14",
    school: "Kendriya Vidyalaya",
    parentName: "Suresh Verma",
    parentPhone: "+91 9876543222",
    username: "rahulv789",
    password: "Pqr@45678",
    status: "Pending", 
    enrolledDate: "Jan 3, 2026" 
  },
  { 
    id: 4, 
    firstName: "Sneha", 
    lastName: "Patel", 
    email: "sneha@email.com", 
    phone: "+91 9876543213", 
    age: 16,
    ageGroup: "15-16",
    school: "St. Xavier's High School",
    parentName: "Rajesh Patel",
    parentPhone: "+91 9876543223",
    username: "snehap234",
    password: "Lmn@67890",
    status: "Active", 
    enrolledDate: "Jan 2, 2026" 
  },
];

export default function AdminStudents() {
  const [students, setStudents] = useState(initialStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAgeGroup, setFilterAgeGroup] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});

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

  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAgeGroup = filterAgeGroup === "all" || student.ageGroup === filterAgeGroup;
    return matchesSearch && matchesAgeGroup;
  });

  const handleAddStudent = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.ageGroup) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!generatedCredentials) {
      toast.error("Credentials not generated. Please enter first and last name.");
      return;
    }

    const newStudent = {
      id: Math.max(...students.map(s => s.id), 0) + 1,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      age: Number(formData.age) || 0,
      ageGroup: formData.ageGroup,
      school: formData.school,
      parentName: formData.parentName,
      parentPhone: formData.parentPhone,
      username: generatedCredentials.username,
      password: generatedCredentials.password,
      status: formData.status,
      enrolledDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    setStudents([newStudent, ...students]);
    resetForm();
    setIsAddOpen(false);
    toast.success("Student created successfully!");
  };

  const handleEditStudent = () => {
    if (!selectedStudent) return;

    setStudents(students.map(s => 
      s.id === selectedStudent.id 
        ? { 
            ...s, 
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            age: Number(formData.age) || s.age,
            ageGroup: formData.ageGroup,
            school: formData.school,
            parentName: formData.parentName,
            parentPhone: formData.parentPhone,
            status: formData.status,
          } 
        : s
    ));

    setIsEditOpen(false);
    setSelectedStudent(null);
    resetForm();
    toast.success("Student updated successfully");
  };

  const handleDeleteStudent = () => {
    if (!selectedStudent) return;
    setStudents(students.filter(s => s.id !== selectedStudent.id));
    setIsDeleteOpen(false);
    setSelectedStudent(null);
    toast.success("Student deleted successfully");
  };

  const openEditDialog = (student) => {
    setSelectedStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      age: student.age.toString(),
      ageGroup: student.ageGroup,
      school: student.school,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      status: student.status,
    });
    setGeneratedCredentials({
      username: student.username,
      password: student.password,
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

  const exportStudents = () => {
    const headers = ["Name","Email","Phone","Age","Age Group","School","Parent","Username","Password","Status"];
    const rows = students.map(s => [
      `${s.firstName} ${s.lastName}`,
      s.email,
      s.phone,
      s.age,
      s.ageGroup,
      s.school,
      s.parentName,
      s.username,
      s.password,
      s.status,
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Students exported!");
  };

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === "Active").length,
    pending: students.filter(s => s.status === "Pending").length,
    inactive: students.filter(s => s.status === "Inactive").length,
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
          <CardTitle>Students ({filteredStudents.length})</CardTitle>
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
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground md:hidden">
                          {student.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{student.email}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">{student.ageGroup}</Badge>
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
                          {showPasswords[student.id] ? student.password : "••••••••••"}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => togglePasswordVisibility(student.id)}
                        >
                          {showPasswords[student.id] ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(student.password, "Password")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : student.status === "Pending"
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
                ))}

                {filteredStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
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
                {selectedStudent?.firstName} {selectedStudent?.lastName}
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