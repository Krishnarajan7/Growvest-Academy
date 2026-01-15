import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, GraduationCap, FileQuestion, ArrowUpRight } from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [courseDistribution, setCourseDistribution] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [studentGrowth, setStudentGrowth] = useState([]); // ← CHANGE 1: Added missing state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [
          statsRes,
          revenueRes,
          studentRes,
          questionRes,
          weeklyRes
        ] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getRevenueAnalytics(),
          adminApi.getStudentAnalytics(),
          adminApi.getQuestionAnalytics(),
          adminApi.getWeeklyActivity(),      // ← CHANGE 2: Correct API
        ]);

        const dashboardData = statsRes.data || {};


        setStats(dashboardData);

        // Revenue chart data
        const revenueChart = dashboardData.revenue_chart || { labels: [], datasets: [] };
        const revenueValues = revenueChart.datasets?.[0]?.data || [];
        setRevenueData(
          revenueValues.map((value, i) => ({
            month: revenueChart.labels?.[i] || `Month ${i + 1}`,
            revenue: value,
          }))
        );

        setWeeklyActivity(weeklyRes.data || []);
        questionRes.data?.by_subject

const monthlyTrends = studentRes.data?.monthly_trends || [];

setStudentGrowth(
  monthlyTrends.map(item => ({
    month: item.month,
    students: item.student_count
  }))
);




        const subjectData = dashboardData.question_statistics?.by_subject || [];
        setCourseDistribution(
          subjectData.map((item, index) => ({
            name: item.category || "Unknown",
            value: item.count || 0,
            color: ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"][index % 4],
          }))
        );

        // Note: recentStudents & recentTransactions still empty
        // You may want to add corresponding API endpoints later
        // setRecentStudents(studentRes.data.data?.recent_students || []);
        // setRecentTransactions(revenueRes.data.data?.recent_transactions || []);

      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Students",
      value: stats.total_students?.toLocaleString() || "0",
      change: "",
      trend: "up",
      icon: Users,
      description: "",
    },
    {
      title: "Total Revenue",
      value: `$${stats.total_revenue?.toLocaleString() || "0"}`,
      change: "",
      trend: "up",
      icon: DollarSign,
      description: "",
    },
    {
      title: "Active Tests",
      value: stats.active_tests?.toString() || "0",
      change: "",
      trend: "up",
      icon: GraduationCap,
      description: "",
    },
    {
      title: "Questions",
      value: stats.total_questions?.toString() || "0",
      change: "",
      trend: "up",
      icon: FileQuestion,
      description: "",
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back to Grovvest Academy Admin Panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</div>
                {stat.change && (
                  <div className="flex items-center gap-1 text-xs md:text-sm mt-1">
                    <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                    <span className="text-green-500">{stat.change}</span>
                    <span className="text-muted-foreground hidden sm:inline">{stat.description}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue + Weekly Activity */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6 md:mb-8">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue for the last 7 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
                    formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revenueGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Activity</CardTitle>
            <CardDescription>Enrollments vs Course Completions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                  <Legend />
                  <Bar dataKey="enrollments" name="Enrollments" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completions" name="Completions" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Distribution + Student Growth */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6 md:mb-8">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Course Distribution</CardTitle>
            <CardDescription>Students by course category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {courseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
                    formatter={(value) => [`${value}`, "Students"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {courseDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Student Growth</CardTitle>
            <CardDescription>Total students enrolled over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={studentGrowth}> {/* ← CHANGE 6: Fixed data source */}
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="students" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "hsl(var(--chart-2))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Students & Transactions (still placeholders) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Recent Students</CardTitle>
            <CardDescription>Latest student enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentStudents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No recent students</p>
              ) : (
                recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{student.name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground truncate">{student.email || "-"}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-foreground">{student.course || "-"}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        student.status === "Active" ? "bg-green-500/10 text-green-500" :
                        student.status === "Pending" ? "bg-yellow-500/10 text-yellow-500" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {student.status || "Unknown"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <CardDescription>Latest revenue activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No recent transactions</p>
              ) : (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{transaction.student || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground truncate">{transaction.course || "-"}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-semibold text-primary">{transaction.amount || "$0"}</p>
                      <p className="text-xs text-muted-foreground">{transaction.date || "-"}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}