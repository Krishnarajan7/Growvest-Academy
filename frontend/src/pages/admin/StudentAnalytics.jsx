import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody, 
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
} from "recharts";
import { Search, Users, TrendingUp, Award, Target, GraduationCap, BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/axios";

const categories = [
  { id: "spoken-english", name: "Spoken English", color: "#6366f1" },
  { id: "phonics-song",   name: "Phonics Song",   color: "#0ea5e9" },
  { id: "general-maths",  name: "Mathematics",    color: "#10b981" },
  { id: "basic-computer", name: "Computer Basics",color: "#8b5cf6" },
  { id: "general-knowledge", name: "General Knowledge", color: "#f59e0b" }, 
  { id: "public-speaking", name: "Public Speaking", color: "#ec4899" },
];

const ageGroups = ["6-8 years", "9-11 years", "12-14 years", "15-16 years"];

const getCategoryKey = (catId) => {
  const map = {
    "spoken-english":    "spokenEnglish",
    "phonics-song":      "phonicsSong",
    "general-maths":     "maths",
    "basic-computer":    "computer",
    "general-knowledge": "gk",
    "public-speaking":   "publicSpeaking",
  };
  return map[catId] || null;
};

const getScoreColor = (score) => {
  if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 80) return "text-blue-600 dark:text-blue-400";
  if (score >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
};

const getPerformanceBadge = (score) => {
  if (score >= 90) return { label: "Outstanding", variant: "default" };
  if (score >= 80) return { label: "Excellent",   variant: "secondary" };
  if (score >= 70) return { label: "Good",        variant: "outline" };
  return { label: "Needs Work", variant: "destructive" };
};

export default function StudentAnalytics() {
  const [students, setStudents] = useState([]);
  const [quickStats, setQuickStats] = useState(null);
  const [categoryAverages, setCategoryAverages] = useState([]);
  const [ageGroupPerformance, setAgeGroupPerformance] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [ageFilter, setAgeFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          studentsRes,
          statsRes,
          categoryRes,
          ageGroupRes,
          trendsRes,
          topRes,
        ] = await Promise.all([
          adminApi.getStudentAnalyticsList(),
          adminApi.getStudentAnalyticsStats(),
          adminApi.getStudentCategoryPerformance(),
          adminApi.getStudentAgeGroups(),
          adminApi.getStudentMonthlyTrends(),
          adminApi.getTopPerformers(),
        ]);

        const studentsData = studentsRes?.data ?? [];
        const statsData   = statsRes?.data ?? {};
        const categoryData = categoryRes?.data ?? [];
        const ageGroupData = ageGroupRes?.data ?? [];
        const trendsData   = trendsRes?.data ?? [];
        const topData      = topRes?.data ?? [];

        setQuickStats({
          totalStudents: statsData?.overall_stats?.total_students ?? 0,
          overallAverage: statsData?.overall_stats?.avg_score_overall ?? 0,
          totalTests: statsData?.overall_stats?.total_tests_taken ?? 0,
          ninetyPlusCount: statsData?.overall_stats?.ninety_plus ?? 0,
        });

        setStudents(
          Array.isArray(studentsData)
            ? studentsData.map((s) => ({
                id: s.id,
                name: s.name || "Unknown",
                age: s.age || "Unknown",
                avgScore: s.avg_score ?? 0,
                testsCompleted: s.tests_completed ?? 0,

                spokenEnglish: s.spoken_english ?? 0,
                phonicsSong:   s.phonics_song    ?? 0,
                maths:         s.general_maths   ?? 0,
                computer:      s.basic_computer  ?? 0,
                gk:            s.general_knowledge ?? 0,
                publicSpeaking:s.public_speaking ?? 0,
              }))
            : []
        );

        setCategoryAverages(Array.isArray(categoryData) ? categoryData : []);
        setAgeGroupPerformance(Array.isArray(ageGroupData) ? ageGroupData : []);
        setMonthlyTrends(Array.isArray(trendsData) ? trendsData : []);
        setTopPerformers(Array.isArray(topData) ? topData : []);

      } catch (err) {
        console.error("Analytics fetch error:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load analytics data";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Safeguard: ensure students is always an array
  const safeStudents = Array.isArray(students) ? students : [];

  // Client-side filtering
  const filteredStudents = safeStudents.filter((student) => {
    if (!student || typeof student !== "object") return false;
    const matchesSearch = (student.name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesAge = ageFilter === "all" || student.age === ageFilter;
    return matchesSearch && matchesAge;
  });

  // Radar chart data
  const radarData = categories.map((cat) => {
    const key = getCategoryKey(cat.id);
    const avg =
      filteredStudents.length > 0
        ? filteredStudents.reduce((sum, s) => sum + (Number(s?.[key]) || 0), 0) / filteredStudents.length
        : 0;

    return {
      subject: cat.name.split(" ")[0],
      score: Math.round(avg),
      fullMark: 100,
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-destructive text-xl mb-4">Failed to load data</div>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Super Kids Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Performance overview • Last updated: January 10, 2026
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{quickStats?.totalStudents ?? 0}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{quickStats?.overallAverage ?? 0}%</p>
                <p className="text-sm text-muted-foreground">Overall Avg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{quickStats?.totalTests ?? 0}</p>
                <p className="text-sm text-muted-foreground">Tests Taken</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{quickStats?.ninetyPlusCount ?? 0}</p>
                <p className="text-sm text-muted-foreground">90+ Scorers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Category Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer>
                <BarChart data={categoryAverages} layout="vertical" margin={{ right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 13 }} />
                  <Tooltip formatter={(val) => [`${val}%`, "Average"]} />
                  <Bar dataKey="average" radius={[0, 6, 6, 0]}>
                    {categoryAverages.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color || "#6366f1"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Age Group Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Performance by Age Group
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer>
                <BarChart data={ageGroupPerformance} margin={{ top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
                  <XAxis dataKey="age_group" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avg_score" name="Avg Score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="students" name="Students" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progress Trend (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer>
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
                  <XAxis dataKey="month" />
                  <YAxis domain={[60, 100]} />
                  <Tooltip formatter={(val) => [`${val}%`, "Average"]} />
                  <Line
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#6366f1" }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Skill Profile (Current Filter)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer>
                <RadarChart outerRadius="80%" data={radarData}>
                  <PolarGrid strokeOpacity={0.4} />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={5} />
                  <Radar
                    name="Average"
                    dataKey="score"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.35}
                  />
                  <Tooltip formatter={(val) => [`${val}%`, "Score"]} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Top 5 Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {topPerformers.slice(0, 5).map((student, index) => (
              <div
                key={student?.id || index}
                className="flex flex-col items-center p-5 rounded-xl bg-muted/40 border text-center transition-all hover:shadow-md"
              >
                <div
                  className={`h-14 w-14 rounded-full flex items-center justify-center text-xl font-bold mb-3 shadow-sm ${
                    index === 0
                      ? "bg-amber-500/20 text-amber-600"
                      : index === 1
                      ? "bg-gray-300/30 text-gray-500"
                      : index === 2
                      ? "bg-amber-700/20 text-amber-700"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  #{index + 1}
                </div>
                <p className="font-semibold text-lg">{student?.name || "—"}</p>
                <p className="text-sm text-muted-foreground mb-2">{student?.age || "—"}</p>
                <p className={`text-2xl font-bold ${getScoreColor(student?.avgScore || 0)}`}>
                  {student?.avgScore ?? "—"}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student List + Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Student Performance Details</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={ageFilter} onValueChange={setAgeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Age Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Age Groups</SelectItem>
                  {ageGroups.map((age) => (
                    <SelectItem key={age} value={age}>
                      {age}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead className="hidden sm:table-cell">Age</TableHead>
                  <TableHead>Avg Score</TableHead>
                  <TableHead className="hidden md:table-cell">English</TableHead>
                  <TableHead className="hidden md:table-cell">Phonics</TableHead>
                  <TableHead className="hidden lg:table-cell">Maths</TableHead>
                  <TableHead className="hidden lg:table-cell">Computer</TableHead>
                  <TableHead className="hidden xl:table-cell">GK</TableHead>
                  <TableHead className="hidden xl:table-cell">Speaking</TableHead>
                  <TableHead className="hidden sm:table-cell">Tests</TableHead>
                  <TableHead>Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">{student.age}</Badge>
                    </TableCell>
                    <TableCell className={`font-bold ${getScoreColor(student.avgScore)}`}>
                      {student.avgScore}%
                    </TableCell>
                    <TableCell className={`hidden md:table-cell ${getScoreColor(student.spokenEnglish)}`}>
                      {student.spokenEnglish ?? "—"}%
                    </TableCell>
                    <TableCell className={`hidden md:table-cell ${getScoreColor(student.phonicsSong)}`}>
                      {student.phonicsSong ?? "—"}%
                    </TableCell>
                    <TableCell className={`hidden lg:table-cell ${getScoreColor(student.maths)}`}>
                      {student.maths ?? "—"}%
                    </TableCell>
                    <TableCell className={`hidden lg:table-cell ${getScoreColor(student.computer)}`}>
                      {student.computer ?? "—"}%
                    </TableCell>
                    <TableCell className={`hidden xl:table-cell ${getScoreColor(student.gk)}`}>
                      {student.gk ?? "—"}%
                    </TableCell>
                    <TableCell className={`hidden xl:table-cell ${getScoreColor(student.publicSpeaking)}`}>
                      {student.publicSpeaking ?? "—"}%
                    </TableCell>
                    <TableCell className="hidden sm:table-cell font-medium">
                      {student.testsCompleted ?? 0}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPerformanceBadge(student.avgScore).variant}>
                        {getPerformanceBadge(student.avgScore).label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-10 text-muted-foreground">
                      No students found matching your filters
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