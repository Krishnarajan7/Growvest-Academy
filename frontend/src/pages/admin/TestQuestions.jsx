import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Upload,
  Download,
  Loader2,
  Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/lib/axios";
import { cn } from "@/lib/utils"; // Make sure you have this utility (common in shadcn/ui projects)

export default function TestQuestions() {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAgeGroup, setFilterAgeGroup] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    question: "",
    category: "",
    age_group: "",
    difficulty: "medium",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "a",
    explanation: "",
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      question: "",
      category: "",
      age_group: "",
      difficulty: "medium",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "a",
      explanation: "",
      is_active: true,
    });
    setEditingQuestion(null);
  };

  const loadFilters = async () => {
    try {
      const [catRes, ageRes] = await Promise.all([
        adminApi.getQuestionFilters(),
        adminApi.getAgeGroups(),
      ]);

      console.log("Category API response:", catRes.data);

      setCategories(
        (catRes.data.categories || []).map((cat) => ({
          name: cat.name,
          slug: cat.slug,
        }))
      );

      setAgeGroups(
        (ageRes.data || []).map((age) => ({
          id: age.id,
          name: age.name,
          slug: age.slug,
        }))
      );
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to load filters",
        description: err.message || "Please try again later",
      });
    }
  };

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm || undefined,
        category: filterCategory !== "all" ? filterCategory : undefined,
        age_group: filterAgeGroup !== "all" ? filterAgeGroup : undefined,
        difficulty: filterDifficulty !== "all" ? filterDifficulty : undefined,
      };

      const res = await adminApi.getQuestions(params);
      setQuestions(res.data.data || []);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to load questions",
        description: err.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [searchTerm, filterCategory, filterAgeGroup, filterDifficulty]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      setSelectedFile(file);
    } else if (file) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select a .csv file",
      });
      setSelectedFile(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "text/csv") {
      setSelectedFile(file);
    } else if (file) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please drop a .csv file",
      });
    }
  };

  const handleBulkImport = async () => {
  if (!selectedFile) {
    toast({
      variant: "destructive",
      title: "No file selected",
      description: "Please choose or drop a CSV file",
    });
    return;
  }

  setUploading(true);

  try {
    await adminApi.importQuestions(selectedFile);

    toast({
      title: "Import successful",
      description: "Questions have been imported from CSV",
    });

    setIsBulkImportOpen(false);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    loadQuestions();
  } catch (err) {
    toast({
      variant: "destructive",
      title: "Import failed",
      description: err.message || "Failed to process CSV file",
    });
  } finally {
    setUploading(false);
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.question || !formData.category || !formData.age_group) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Question, category and age group are required",
      });
      return;
    }

    if (!formData.option_a || !formData.option_b || !formData.option_c || !formData.option_d) {
      toast({
        variant: "destructive",
        title: "Missing options",
        description: "All four answer options are required",
      });
      return;
    }

    const payload = {
      question: formData.question,
      category: formData.category,
      age_group: formData.age_group,
      difficulty: formData.difficulty,
      explanation: formData.explanation,
      is_active: formData.is_active,
      options: [
        { id: "a", text: formData.option_a, is_correct: formData.correct_answer === "a" },
        { id: "b", text: formData.option_b, is_correct: formData.correct_answer === "b" },
        { id: "c", text: formData.option_c, is_correct: formData.correct_answer === "c" },
        { id: "d", text: formData.option_d, is_correct: formData.correct_answer === "d" },
      ],
    };

    try {
      if (editingQuestion) {
        await adminApi.updateQuestion(editingQuestion.id, payload);
        toast({ title: "Question updated" });
      } else {
        await adminApi.createQuestion(payload);
        toast({ title: "Question created" });
      }

      setIsDialogOpen(false);
      resetForm();
      loadQuestions();
    } catch (err) {
      toast({
        variant: "destructive",
        title: editingQuestion ? "Update failed" : "Creation failed",
        description: err.response?.data?.message || err.message || "Something went wrong",
      });
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      category: question.category_slug || question.category,
      age_group: question.age_group_slug || question.age_group,
      difficulty: question.difficulty,
      option_a: question.options?.find(o => o.id === "a")?.text || "",
      option_b: question.options?.find(o => o.id === "b")?.text || "",
      option_c: question.options?.find(o => o.id === "c")?.text || "",
      option_d: question.options?.find(o => o.id === "d")?.text || "",
      correct_answer: question.options?.find(o => o.is_correct)?.id || "a",
      explanation: question.explanation || "",
      is_active: question.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      await adminApi.deleteQuestion(id);
      toast({ title: "Question deleted" });
      loadQuestions();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: err.message || "Could not delete question",
      });
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await adminApi.toggleQuestionStatus(id);
      loadQuestions();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Status update failed",
        description: err.message || "Operation failed",
      });
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await adminApi.duplicateQuestion(id);
      toast({ title: "Question duplicated" });
      loadQuestions();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Duplicate failed",
        description: err.message || "Could not create copy",
      });
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await adminApi.downloadQuestionTemplate();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "super_kids_questions_template.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Could not download template",
      });
    }
  };

  const handleExportQuestions = async () => {
    try {
      const res = await adminApi.exportQuestions();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "super_kids_questions.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({ title: "Export successful" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Could not export questions",
      });
    }
  };

  const getDifficultyVariant = (diff) => {
    switch (diff?.toLowerCase()) {
      case "easy":    return "bg-green-500/10 text-green-600 hover:bg-green-500/20";
      case "medium":  return "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20";
      case "hard":    return "bg-red-500/10 text-red-600 hover:bg-red-500/20";
      default:        return "bg-gray-500/10 text-gray-600";
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Super Kids Questions</h1>
          <p className="text-muted-foreground mt-1">
            Manage quiz questions for different categories & age groups
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleExportQuestions}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>

          <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Bulk Import Questions</DialogTitle>
                <DialogDescription>
                  Upload a CSV file containing multiple questions
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="flex flex-col gap-3">
                  <Button variant="outline" onClick={handleDownloadTemplate}>
                    Download Template CSV
                  </Button>

                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                      selectedFile ? "bg-muted/40" : ""
                    )}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    <div className="mx-auto w-16 h-16 mb-4 text-muted-foreground">
                      {uploading ? (
                        <Loader2 className="h-full w-full animate-spin" />
                      ) : (
                        <Upload className="h-full w-full" />
                      )}
                    </div>

                    <p className="text-sm font-medium mb-1">
                      {uploading
                        ? "Uploading..."
                        : dragActive
                        ? "Drop CSV file here"
                        : "Drag & drop CSV file here, or click to select"}
                    </p>

                    {selectedFile && !uploading && (
                      <p className="text-xs text-green-600 mt-3 font-medium">
                        Selected: {selectedFile.name}
                      </p>
                    )}

                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-4"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      Select File
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsBulkImportOpen(false);
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleBulkImport}
                    disabled={uploading || !selectedFile}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      "Import Now"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingQuestion ? "Edit Question" : "New Question"}
                </DialogTitle>
                <DialogDescription>
                  {editingQuestion
                    ? "Modify existing question details"
                    : "Create a new quiz question"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label>Question *</Label>
                  <Textarea
                    placeholder="Enter the question text..."
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.slug} value={cat.slug}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Age Group *</Label>
                    <Select
                      value={formData.age_group}
                      onValueChange={(v) => setFormData({ ...formData, age_group: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        {ageGroups.map((age) => (
                          <SelectItem key={age.id} value={age.slug}>
                            {age.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Difficulty *</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(v) => setFormData({ ...formData, difficulty: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Answer Options * (select correct one)</Label>
                  {["a", "b", "c", "d"].map((opt) => (
                    <div key={opt} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correct_answer"
                        id={`correct-${opt}`}
                        checked={formData.correct_answer === opt}
                        onChange={() => setFormData({ ...formData, correct_answer: opt })}
                        className="h-4 w-4"
                      />
                      <label
                        htmlFor={`correct-${opt}`}
                        className="font-medium w-6 text-muted-foreground"
                      >
                        {opt.toUpperCase()}.
                      </label>
                      <Input
                        placeholder={`Option ${opt.toUpperCase()}`}
                        value={formData[`option_${opt}`]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [`option_${opt}`]: e.target.value,
                          })
                        }
                        className={
                          formData.correct_answer === opt
                            ? "border-green-500 bg-green-50/50 dark:bg-green-950/30"
                            : ""
                        }
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Explanation (optional)</Label>
                  <Textarea
                    placeholder="Why is this the correct answer? (helps students learn)"
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active (available in tests)</Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingQuestion ? "Save Changes" : "Create Question"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.slug} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterAgeGroup} onValueChange={setFilterAgeGroup}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Age Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ages</SelectItem>
            {ageGroups.map((age) => (
              <SelectItem key={age.id} value={age.slug}>
                {age.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Questions Table */}
      <Card>
        <CardContent className="p-0 pt-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead className="min-w-[280px]">Question</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Age Group</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        No questions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    questions.map((q) => (
                      <TableRow key={q.id}>
                        <TableCell className="font-medium">#{q.id}</TableCell>
                        <TableCell className="font-medium line-clamp-2">
                          {q.question}
                        </TableCell>
                        <TableCell>
                          {categories.find(c => c.slug === (q.category_slug || q.category))?.name || q.category}
                        </TableCell>
                        <TableCell>
                          {ageGroups.find(a => a.slug === (q.age_group_slug || q.age_group))?.name || q.age_group}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getDifficultyVariant(q.difficulty)}>
                            {q.difficulty?.charAt(0).toUpperCase() + q.difficulty?.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={q.is_active}
                            onCheckedChange={() => handleToggleActive(q.id)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(q)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDuplicate(q.id)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive/90"
                              onClick={() => handleDelete(q.id)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}