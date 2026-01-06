import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Image, TrendingUp, ArrowUpRight, ArrowDownRight, GraduationCap, Video } from "lucide-react";

const statsCards = [
  {
    title: "Total Students",
    value: "2,847",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    description: "from last month",
  },
  {
    title: "Total Revenue",
    value: "$48,250",
    change: "+8.2%",
    trend: "up",
    icon: DollarSign,
    description: "from last month",
  },
  {
    title: "Active Courses",
    value: "24",
    change: "+3",
    trend: "up",
    icon: GraduationCap,
    description: "new this month",
  },
  {
    title: "Media Files",
    value: "156",
    change: "+18",
    trend: "up",
    icon: Image,
    description: "uploaded this month",
  },
];

const recentStudents = [
  { id: 1, name: "Arun Kumar", email: "arun@email.com", course: "Web Development", status: "Active", date: "Jan 5, 2026" },
  { id: 2, name: "Priya Sharma", email: "priya@email.com", course: "Data Science", status: "Active", date: "Jan 4, 2026" },
  { id: 3, name: "Rahul Verma", email: "rahul@email.com", course: "Machine Learning", status: "Pending", date: "Jan 3, 2026" },
  { id: 4, name: "Sneha Patel", email: "sneha@email.com", course: "Digital Marketing", status: "Active", date: "Jan 2, 2026" },
  { id: 5, name: "Vikram Singh", email: "vikram@email.com", course: "UI/UX Design", status: "Inactive", date: "Jan 1, 2026" },
];

const recentTransactions = [
  { id: 1, student: "Arun Kumar", amount: "$299", course: "Web Development Pro", date: "Jan 5, 2026" },
  { id: 2, student: "Priya Sharma", amount: "$499", course: "Data Science Complete", date: "Jan 4, 2026" },
  { id: 3, student: "Rahul Verma", amount: "$199", course: "Python Basics", date: "Jan 3, 2026" },
  { id: 4, student: "Sneha Patel", amount: "$349", course: "Marketing Mastery", date: "Jan 2, 2026" },
];

export default function AdminDashboard() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back to Grovvest Academy Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="flex items-center gap-1 text-sm mt-1">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tables Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Students */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Recent Students</CardTitle>
            <CardDescription>Latest student enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground">{student.course}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      student.status === "Active" ? "bg-green-500/10 text-green-500" :
                      student.status === "Pending" ? "bg-yellow-500/10 text-yellow-500" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {student.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <CardDescription>Latest revenue activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{transaction.student}</p>
                    <p className="text-sm text-muted-foreground">{transaction.course}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-primary">{transaction.amount}</p>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}