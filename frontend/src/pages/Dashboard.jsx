
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, User, Check, Plus } from 'lucide-react';

const Dashboard = () => {
  // Mock user data
  const user = {
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    joinedDate: '2024-01-01',
    isPremium: true,
    coursesCompleted: 3,
    totalCourses: 8,
    learningStreak: 12
  };

  const enrolledCourses = [
    {
      id: 1,
      title: 'Mutual Funds 101: Getting Started',
      progress: 100,
      completed: true,
      lastAccessed: '2024-01-14',
      totalLessons: 12,
      completedLessons: 12
    },
    {
      id: 2,
      title: 'Building Your First Portfolio',
      progress: 75,
      completed: false,
      lastAccessed: '2024-01-15',
      totalLessons: 10,
      completedLessons: 8
    },
    {
      id: 3,
      title: 'Tax-Efficient Investing',
      progress: 30,
      completed: false,
      lastAccessed: '2024-01-12',
      totalLessons: 8,
      completedLessons: 3
    }
  ];

  const achievements = [
    { title: 'First Course Completed', icon: '🎓', earned: true },
    { title: '7-Day Learning Streak', icon: '🔥', earned: true },
    { title: 'Portfolio Builder', icon: '📊', earned: true },
    { title: 'Tax Expert', icon: '💰', earned: false },
    { title: 'Advanced Investor', icon: '🚀', earned: false }
  ];

  const recentActivity = [
    { action: 'Completed lesson', course: 'Building Your First Portfolio', date: '2 hours ago' },
    { action: 'Started new course', course: 'Tax-Efficient Investing', date: '1 day ago' },
    { action: 'Earned achievement', course: 'Portfolio Builder Badge', date: '3 days ago' },
    { action: 'Completed course', course: 'Mutual Funds 101', date: '1 week ago' }
  ];

  return (
    <div className="section-padding py-8">
      <div className="container-width">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-green-600 to-green-400 rounded-2xl p-8 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
                  <p className="text-green-100 text-lg">
                    Continue your investment learning journey
                  </p>
                  <div className="flex items-center mt-4 space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{user.coursesCompleted}</div>
                      <div className="text-green-100 text-sm">Courses Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{user.learningStreak}</div>
                      <div className="text-green-100 text-sm">Day Streak</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  {user.isPremium && (
                    <Badge className="bg-yellow-500 text-yellow-900 px-4 py-2 text-sm font-medium">
                      Premium Member
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Continue Learning */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2" size={24} />
                  Continue Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {enrolledCourses.map((course) => (
                    <div key={course.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                          <p className="text-gray-600 text-sm">
                            {course.completedLessons} of {course.totalLessons} lessons completed
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {course.completed && (
                            <Badge className="bg-green-100 text-green-800">
                              <Check size={14} className="mr-1" />
                              Completed
                            </Badge>
                          )}
                          <Link to={`/course/${course.id}`}>
                            <Button size="sm" variant={course.completed ? 'outline' : 'default'}>
                              {course.completed ? 'Review' : 'Continue'}
                            </Button>
                          </Link>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-2">
                        Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Link to="/courses">
                    <Button variant="outline">
                      <Plus className="mr-2" size={16} />
                      Browse More Courses
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`text-center p-4 rounded-lg border-2 transition-colors ${
                        achievement.earned
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50 opacity-50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <p className="text-sm font-medium">{achievement.title}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2" size={20} />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member since:</span>
                    <span>{new Date(user.joinedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-medium text-green-600">
                      {user.isPremium ? 'Premium' : 'Free'}
                    </span>
                  </div>
                </div>
                
                <Button className="w-full" variant="outline">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2" size={20} />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.action}</span>{' '}
                          <span className="text-gray-600">{activity.course}</span>
                        </p>
                        <p className="text-xs text-gray-500">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/premium">
                  <Button className="w-full btn-primary">
                    Upgrade to Premium
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button variant="outline" className="w-full">
                    Browse Courses
                  </Button>
                </Link>
                <Link to="/blog">
                  <Button variant="outline" className="w-full">
                    Read Blog Posts
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
