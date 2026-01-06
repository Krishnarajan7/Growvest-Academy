import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, DollarSign, TrendingUp, CreditCard, ArrowUpRight } from "lucide-react";

const revenueStats = [
  { title: "Total Revenue", value: "$148,250", change: "+12.5%", icon: DollarSign },
  { title: "This Month", value: "$24,800", change: "+8.2%", icon: TrendingUp },
  { title: "Pending Payments", value: "$4,350", change: "-2.1%", icon: CreditCard },
  { title: "Average Order", value: "$312", change: "+5.4%", icon: ArrowUpRight },
];

const transactions = [
  { id: "TXN001", student: "Arun Kumar", email: "arun@email.com", course: "Web Development Pro", amount: 299, status: "Completed", date: "Jan 5, 2026", method: "Credit Card" },
  { id: "TXN002", student: "Priya Sharma", email: "priya@email.com", course: "Data Science Complete", amount: 499, status: "Completed", date: "Jan 4, 2026", method: "UPI" },
  { id: "TXN003", student: "Rahul Verma", email: "rahul@email.com", course: "Python Basics", amount: 199, status: "Pending", date: "Jan 3, 2026", method: "Debit Card" },
  { id: "TXN004", student: "Sneha Patel", email: "sneha@email.com", course: "Marketing Mastery", amount: 349, status: "Completed", date: "Jan 2, 2026", method: "Net Banking" },
  { id: "TXN005", student: "Vikram Singh", email: "vikram@email.com", course: "UI/UX Design", amount: 399, status: "Refunded", date: "Jan 1, 2026", method: "Credit Card" },
  { id: "TXN006", student: "Anjali Reddy", email: "anjali@email.com", course: "Cloud Computing", amount: 449, status: "Completed", date: "Dec 30, 2025", method: "UPI" },
  { id: "TXN007", student: "Karthik Nair", email: "karthik@email.com", course: "Cybersecurity Basics", amount: 279, status: "Completed", date: "Dec 28, 2025", method: "Credit Card" },
  { id: "TXN008", student: "Meera Iyer", email: "meera@email.com", course: "AI Fundamentals", amount: 549, status: "Pending", date: "Dec 25, 2025", method: "Debit Card" },
];

export default function AdminRevenue() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || tx.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = transactions
    .filter((tx) => tx.status === "Completed")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Revenue</h1>
          <p className="text-muted-foreground mt-1">Track payments and financial performance</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {revenueStats.map((stat, index) => {
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
                  <span className={stat.change.startsWith("+") ? "text-green-500" : "text-red-500"}>
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground">from last period</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Transactions Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View and manage all payment transactions</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
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
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="hidden lg:table-cell">Course</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-sm">{tx.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{tx.student}</p>
                        <p className="text-xs text-muted-foreground">{tx.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{tx.course}</TableCell>
                    <TableCell className="font-semibold">${tx.amount}</TableCell>
                    <TableCell className="hidden md:table-cell">{tx.method}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        tx.status === "Completed" ? "bg-green-500/10 text-green-500" :
                        tx.status === "Pending" ? "bg-yellow-500/10 text-yellow-500" :
                        "bg-red-500/10 text-red-500"
                      }`}>
                        {tx.status}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{tx.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}