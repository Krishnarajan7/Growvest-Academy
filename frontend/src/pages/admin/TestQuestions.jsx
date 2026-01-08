import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, FileQuestion, CheckCircle, XCircle, Copy, Upload, Download, FileSpreadsheet, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


// Super Kids Categories
const categories = [
  { id: "spoken-english", name: "Spoken English", color: "bg-blue-500" },
  { id: "physics", name: "Physics", color: "bg-purple-500" },
  { id: "general-maths", name: "General Maths", color: "bg-green-500" },
  { id: "basic-computer", name: "Basic Computer", color: "bg-orange-500" },
  { id: "general-knowledge", name: "General Knowledge", color: "bg-pink-500" },
  { id: "public-speaking", name: "Public Speaking", color: "bg-cyan-500" },
];

const ageGroups = [
  { id: "6-8", name: "6-8 Years" },
  { id: "9-11", name: "9-11 Years" },
  { id: "12-14", name: "12-14 Years" },
  { id: "15-16", name: "15-16 Years" },
];

const initialQuestions = [
  {
    id: 1,
    question: "What is the correct way to greet someone in the morning?",
    category: "spoken-english",
    ageGroup: "6-8",
    difficulty: "easy",
    options: [
      { id: "a", text: "Good morning!", isCorrect: true },
      { id: "b", text: "Good night!", isCorrect: false },
      { id: "c", text: "Good bye!", isCorrect: false },
      { id: "d", text: "See you later!", isCorrect: false },
    ],
    explanation: "Good morning is the appropriate greeting used in the morning hours until noon.",
    isActive: true,
    createdAt: "2026-01-05",
  },
  {
    id: 2,
    question: "What is the unit of force?",
    category: "physics",
    ageGroup: "12-14",
    difficulty: "medium",
    options: [
      { id: "a", text: "Meter", isCorrect: false },
      { id: "b", text: "Newton", isCorrect: true },
      { id: "c", text: "Kilogram", isCorrect: false },
      { id: "d", text: "Joule", isCorrect: false },
    ],
    explanation: "The SI unit of force is Newton (N), named after Sir Isaac Newton.",
    isActive: true,
    createdAt: "2026-01-04",
  },
  {
    id: 3,
    question: "What is 15 + 27?",
    category: "general-maths",
    ageGroup: "6-8",
    difficulty: "easy",
    options: [
      { id: "a", text: "40", isCorrect: false },
      { id: "b", text: "42", isCorrect: true },
      { id: "c", text: "43", isCorrect: false },
      { id: "d", text: "41", isCorrect: false },
    ],
    explanation: "15 + 27 = 42. Add the ones place first (5+7=12, carry 1), then tens (1+2+1=4).",
    isActive: true,
    createdAt: "2026-01-03",
  },
  {
    id: 4,
    question: "What is the brain of a computer called?",
    category: "basic-computer",
    ageGroup: "9-11",
    difficulty: "easy",
    options: [
      { id: "a", text: "Monitor", isCorrect: false },
      { id: "b", text: "Keyboard", isCorrect: false },
      { id: "c", text: "CPU", isCorrect: true },
      { id: "d", text: "Mouse", isCorrect: false },
    ],
    explanation: "CPU (Central Processing Unit) is called the brain of the computer as it processes all instructions.",
    isActive: true,
    createdAt: "2026-01-02",
  },
  {
    id: 5,
    question: "What is the capital of India?",
    category: "general-knowledge",
    ageGroup: "6-8",
    difficulty: "easy",
    options: [
      { id: "a", text: "Mumbai", isCorrect: false },
      { id: "b", text: "New Delhi", isCorrect: true },
      { id: "c", text: "Kolkata", isCorrect: false },
      { id: "d", text: "Chennai", isCorrect: false },
    ],
    explanation: "New Delhi is the capital city of India and the seat of the Indian government.",
    isActive: true,
    createdAt: "2026-01-01",
  },
];

export default function TestQuestions() {
  const [questions, setQuestions] = useState(initialQuestions);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAgeGroup, setFilterAgeGroup] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [bulkImportText, setBulkImportText] = useState("");
  const [importErrors, setImportErrors] = useState([]);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    question: "",
    category: "",
    ageGroup: "",
    difficulty: "medium" ,
    options: [
      { id: "a", text: "", isCorrect: true },
      { id: "b", text: "", isCorrect: false },
      { id: "c", text: "", isCorrect: false },
      { id: "d", text: "", isCorrect: false },
    ],
    explanation: "",
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      question: "",
      category: "",
      ageGroup: "",
      difficulty: "medium",
      options: [
        { id: "a", text: "", isCorrect: true },
        { id: "b", text: "", isCorrect: false },
        { id: "c", text: "", isCorrect: false },
        { id: "d", text: "", isCorrect: false },
      ],
      explanation: "",
      isActive: true,
    });
    setEditingQuestion(null);
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      category: question.category,
      ageGroup: question.ageGroup,
      difficulty: question.difficulty,
      options: [...question.options],
      explanation: question.explanation,
      isActive: question.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDuplicate = (question) => {
    const newQuestion= {
      ...question,
      id: Math.max(...questions.map(q => q.id)) + 1,
      question: `${question.question} (Copy)`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setQuestions([newQuestion, ...questions]);
    toast({
      title: "Question duplicated",
      description: "The question has been duplicated successfully.",
    });
  };

  const handleDelete = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
    toast({
      title: "Question deleted",
      description: "The question has been removed.",
      variant: "destructive",
    });
  };

  const handleToggleActive = (id) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, isActive: !q.isActive } : q
    ));
  };

  const handleOptionChange = (index, text) => {
    const newOptions = [...formData.options];
    newOptions[index].text = text;
    setFormData({ ...formData, options: newOptions });
  };

  const handleCorrectAnswerChange = (index) => {
    const newOptions = formData.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.question || !formData.category || !formData.ageGroup || formData.options.some(o => !o.text)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (editingQuestion) {
      setQuestions(questions.map(q => 
        q.id === editingQuestion.id 
          ? { ...q, ...formData, options: [...formData.options] }
          : q
      ));
      toast({
        title: "Question updated",
        description: "The question has been updated successfully.",
      });
    } else {
      const newQuestion= {
        id: Math.max(...questions.map(q => q.id), 0) + 1,
        ...formData,
        options: [...formData.options],
        createdAt: new Date().toISOString().split('T')[0],
      };
      setQuestions([newQuestion, ...questions]);
      toast({
        title: "Question created",
        description: "New question has been added successfully.",
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  // Bulk Import Functions
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      setBulkImportText(text);
      parseAndValidateCSV(text);
    };
    reader.readAsText(file);
  };

  const parseAndValidateCSV = (csvText) => {
    const errors= [];
    const lines = csvText.trim().split('\n');
    
    if (lines.length < 2) {
      errors.push("CSV must have a header row and at least one data row.");
      setImportErrors(errors);
      return;
    }

    const header = lines[0].toLowerCase();
    if (!header.includes('question') || !header.includes('category')) {
      errors.push("CSV must include 'question' and 'category' columns.");
    }

    setImportErrors(errors);
  };

  const handleBulkImport = () => {
    if (!bulkImportText.trim()) {
      toast({
        title: "No data",
        description: "Please paste CSV data or upload a file.",
        variant: "destructive",
      });
      return;
    }

    const lines = bulkImportText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    
    const questionIndex = headers.indexOf('question');
    const categoryIndex = headers.indexOf('category');
    const ageGroupIndex = headers.indexOf('age_group');
    const difficultyIndex = headers.indexOf('difficulty');
    const optionAIndex = headers.indexOf('option_a');
    const optionBIndex = headers.indexOf('option_b');
    const optionCIndex = headers.indexOf('option_c');
    const optionDIndex = headers.indexOf('option_d');
    const correctIndex = headers.indexOf('correct_answer');
    const explanationIndex = headers.indexOf('explanation');

    const newQuestions= [];
    const errors = [];
    let maxId = Math.max(...questions.map(q => q.id), 0);

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length < 2 || !values[questionIndex]) {
        errors.push(`Row ${i + 1}: Missing required data`);
        continue;
      }

      const correctAnswer = values[correctIndex]?.toLowerCase() || 'a';
      const category = values[categoryIndex] || 'general-knowledge';
      const validCategory = categories.find(c => 
        c.id === category.toLowerCase() || c.name.toLowerCase() === category.toLowerCase()
      );

      maxId++;
      newQuestions.push({
        id: maxId,
        question: values[questionIndex],
        category: validCategory?.id || 'general-knowledge',
        ageGroup: values[ageGroupIndex] || '9-11',
        difficulty: (values[difficultyIndex]?.toLowerCase(),
        options),
        explanation,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
      });
    }

    if (newQuestions.length > 0) {
      setQuestions([...newQuestions, ...questions]);
      toast({
        title: "Import successful",
        description: `${newQuestions.length} questions imported successfully.`,
      });
      setIsBulkImportOpen(false);
      setBulkImportText("");
      setImportErrors([]);
    } else {
      toast({
        title: "Import failed",
        description: "No valid questions found in the data.",
        variant: "destructive",
      });
    }

    if (errors.length > 0) {
      setImportErrors(errors);
    }
  };

  const downloadTemplate = () => {
    const template = `question,category,age_group,difficulty,option_a,option_b,option_c,option_d,correct_answer,explanation
"What is 2 + 2?",general-maths,6-8,easy,"3","4","5","6",b,"2 + 2 equals 4"
"What is the capital of France?",general-knowledge,9-11,medium,"London","Paris","Berlin","Madrid",b,"Paris is the capital city of France"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportQuestions = () => {
    const csvContent = [
      'question,category,age_group,difficulty,option_a,option_b,option_c,option_d,correct_answer,explanation',
      ...questions.map(q => {
        const correctOption = q.options.find(o => o.isCorrect)?.id || 'a';
        return `"${q.question}","${q.category}","${q.ageGroup}","${q.difficulty}","${q.options[0].text}","${q.options[1].text}","${q.options[2].text}","${q.options[3].text}","${correctOption}","${q.explanation}"`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'super_kids_questions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || q.category === filterCategory;
    const matchesAgeGroup = filterAgeGroup === "all" || q.ageGroup === filterAgeGroup;
    const matchesDifficulty = filterDifficulty === "all" || q.difficulty === filterDifficulty;
    return matchesSearch && matchesCategory && matchesAgeGroup && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy": return "bg-green-500/10 text-green-500";
      case "medium": return "bg-yellow-500/10 text-yellow-500";
      case "hard": return "bg-red-500/10 text-red-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find(c => c.id === categoryId) || { name: categoryId, color: "bg-gray-500" };
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Super Kids Test Questions</h1>
        <p className="text-muted-foreground mt-1">Create and manage quiz questions for Super Kids assessments</p>
      </div>

      {/* Stats by Category */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-6 md:mb-8">
        {categories.map((cat) => {
          const count = questions.filter(q => q.category === cat.id).length;
          return (
            <Card key={cat.id} className="bg-card border-border">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${cat.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-foreground">{count}</p>
                    <p className="text-xs text-muted-foreground truncate">{cat.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileQuestion className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{questions.length}</p>
                <p className="text-sm text-muted-foreground">Total Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{questions.filter(q => q.isActive).length}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{questions.filter(q => !q.isActive).length}</p>
                <p className="text-sm text-muted-foreground">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{ageGroups.length}</p>
                <p className="text-sm text-muted-foreground">Age Groups</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterAgeGroup} onValueChange={setFilterAgeGroup}>
            <SelectTrigger>
              <SelectValue placeholder="Age Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ages</SelectItem>
              {ageGroups.map(age => (
                <SelectItem key={age.id} value={age.id}>{age.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger>
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
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button variant="outline" onClick={exportQuestions} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          
          {/* Bulk Import Dialog */}
          <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Bulk Import Questions</DialogTitle>
                <DialogDescription>
                  Import multiple questions at once using CSV format
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Upload CSV
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>CSV Data</Label>
                  <Textarea
                    placeholder={`Paste CSV data here or upload a file...

Format:
question,category,age_group,difficulty,option_a,option_b,option_c,option_d,correct_answer,explanation`}
                    value={bulkImportText}
                    onChange={(e) => {
                      setBulkImportText(e.target.value);
                      if (e.target.value) parseAndValidateCSV(e.target.value);
                    }}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>

                {importErrors.length > 0 && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-destructive mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Validation Errors</span>
                    </div>
                    <ul className="text-sm text-destructive/80 list-disc list-inside">
                      {importErrors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm font-medium mb-2">CSV Columns:</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>question</strong> (required): The question text</p>
                    <p><strong>category</strong>: spoken-english, physics, general-maths, basic-computer, general-knowledge, public-speaking</p>
                    <p><strong>age_group</strong>: 6-8, 9-11, 12-14, 15-16</p>
                    <p><strong>difficulty</strong>: easy, medium, hard</p>
                    <p><strong>option_a, option_b, option_c, option_d</strong>: Answer choices</p>
                    <p><strong>correct_answer</strong>: a, b, c, or d</p>
                    <p><strong>explanation</strong>: Optional explanation</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => { setIsBulkImportOpen(false); setBulkImportText(""); setImportErrors([]); }} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleBulkImport} className="flex-1">
                    Import Questions
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Question Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingQuestion ? "Edit Question" : "Add New Question"}</DialogTitle>
                <DialogDescription>
                  {editingQuestion ? "Update the question details below." : "Create a new quiz question for Super Kids."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Question *</Label>
                  <Textarea
                    id="question"
                    placeholder="Enter your question..."
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${cat.color}`} />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Age Group *</Label>
                    <Select 
                      value={formData.ageGroup} 
                      onValueChange={(value) => setFormData({ ...formData, ageGroup: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        {ageGroups.map(age => (
                          <SelectItem key={age.id} value={age.id}>{age.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty *</Label>
                    <Select 
                      value={formData.difficulty} 
                      onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
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
                  <Label>Answer Options * (Select the correct answer)</Label>
                  {formData.options.map((option, index) => (
                    <div key={option.id} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={option.isCorrect}
                        onChange={() => handleCorrectAnswerChange(index)}
                        className="h-4 w-4 text-primary"
                      />
                      <span className="font-medium text-muted-foreground w-6">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <Input
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className={option.isCorrect ? "border-green-500 bg-green-500/5" : ""}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="explanation">Explanation (Optional)</Label>
                  <Textarea
                    id="explanation"
                    placeholder="Explain why this is the correct answer..."
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active (visible in tests)</Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingQuestion ? "Update Question" : "Create Question"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Questions Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="w-12">ID</TableHead>
                  <TableHead className="min-w-[250px]">Question</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question) => {
                  const catInfo = getCategoryInfo(question.category);
                  const ageInfo = ageGroups.find(a => a.id === question.ageGroup);
                  return (
                    <TableRow key={question.id} className="border-border">
                      <TableCell className="font-medium">#{question.id}</TableCell>
                      <TableCell>
                        <p className="line-clamp-2">{question.question}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="whitespace-nowrap">
                          <div className={`h-2 w-2 rounded-full ${catInfo.color} mr-1.5`} />
                          {catInfo.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{ageInfo?.name || question.ageGroup}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={question.isActive}
                          onCheckedChange={() => handleToggleActive(question.id)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(question)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDuplicate(question)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(question.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredQuestions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No questions found. Create your first question!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}