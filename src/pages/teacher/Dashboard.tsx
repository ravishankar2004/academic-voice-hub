
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, Plus, Search, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ResultData {
  id: string;
  student_id: string;
  student_name: string;
  subject: string;
  marks_obtained: number;
  total_marks: number;
  academic_year: string;
  semester: string;
  grade: string;
}

const TeacherDashboard = () => {
  const { userData } = useUser();
  const navigate = useNavigate();
  const [results, setResults] = useState<ResultData[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [recentResults, setRecentResults] = useState<ResultData[]>([]);
  const [gradeDistribution, setGradeDistribution] = useState<any[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<any[]>([]);

  useEffect(() => {
    // Load results
    const storedResults = localStorage.getItem("results") || "[]";
    const allResults = JSON.parse(storedResults);
    setResults(allResults);
    
    // Set recent results (last 5)
    setRecentResults(allResults.slice(-5).reverse());
    
    // Load students
    const storedStudents = localStorage.getItem("students") || "[]";
    const allStudents = JSON.parse(storedStudents);
    setStudents(allStudents);
    
    // Calculate grade distribution
    const gradeCount = {
      "A+": 0,
      "A": 0,
      "B": 0,
      "C": 0,
      "D": 0,
      "F": 0
    };
    
    allResults.forEach((result: ResultData) => {
      if (gradeCount[result.grade as keyof typeof gradeCount] !== undefined) {
        gradeCount[result.grade as keyof typeof gradeCount]++;
      }
    });
    
    const gradeData = Object.entries(gradeCount).map(([grade, count]) => ({
      grade,
      count
    }));
    
    setGradeDistribution(gradeData);
    
    // Calculate subject performance
    const subjectGroups: Record<string, { total: number; count: number }> = {};
    
    allResults.forEach((result: ResultData) => {
      const percentage = (result.marks_obtained / result.total_marks) * 100;
      
      if (!subjectGroups[result.subject]) {
        subjectGroups[result.subject] = { total: 0, count: 0 };
      }
      
      subjectGroups[result.subject].total += percentage;
      subjectGroups[result.subject].count++;
    });
    
    const subjectData = Object.entries(subjectGroups).map(([subject, data]) => ({
      subject,
      averagePercentage: Math.round(data.total / data.count)
    }));
    
    setSubjectPerformance(subjectData);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation userType="teacher" userName={userData?.name} />
      
      <main className="flex-grow p-4 md:p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-academic-900">Teacher Dashboard</h1>
              <p className="text-academic-600">Welcome back, {userData?.name}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <Button 
                onClick={() => navigate("/teacher/add-result")}
                className="bg-academic-600 hover:bg-academic-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Result
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/teacher/manage-results")}
                className="flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Manage Results
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 bg-gradient-to-r from-academic-50 to-transparent">
                <CardTitle className="text-lg font-medium">Total Students</CardTitle>
                <CardDescription>Number of registered students</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-3xl font-bold text-academic-700">{students.length}</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 bg-gradient-to-r from-academic-50 to-transparent">
                <CardTitle className="text-lg font-medium">Total Results</CardTitle>
                <CardDescription>Number of results recorded</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-3xl font-bold text-academic-700">{results.length}</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 bg-gradient-to-r from-academic-50 to-transparent">
                <CardTitle className="text-lg font-medium">Average Grade</CardTitle>
                <CardDescription>Overall student performance</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-3xl font-bold text-academic-700">
                  {results.length ? (
                    (() => {
                      const totalMarksObtained = results.reduce((sum, result) => sum + result.marks_obtained, 0);
                      const totalPossibleMarks = results.reduce((sum, result) => sum + result.total_marks, 0);
                      const avgPercentage = (totalMarksObtained / totalPossibleMarks) * 100;
                      
                      if (avgPercentage >= 90) return "A+";
                      else if (avgPercentage >= 80) return "A";
                      else if (avgPercentage >= 70) return "B";
                      else if (avgPercentage >= 60) return "C";
                      else if (avgPercentage >= 50) return "D";
                      else return "F";
                    })()
                  ) : "-"}
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Student List */}
          <Card className="mb-8 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-academic-50 to-transparent">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Student List
                  </CardTitle>
                  <CardDescription>
                    All registered students in the system
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {students.length > 0 ? (
                <div className="overflow-auto rounded-md border">
                  <Table>
                    <TableHeader className="bg-academic-50">
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Roll Number</TableHead>
                        <TableHead>Results</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.rollNumber}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/teacher/analytics?student=${student.id}`)}
                            >
                              View Performance
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-academic-600">No students registered yet</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-academic-50 to-transparent">
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>
                  Distribution of grades across all subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                {gradeDistribution.length > 0 && gradeDistribution.some(item => item.count > 0) ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={gradeDistribution}
                        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="grade" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="count"
                          name="Number of Students"
                          fill="#4a7fb5"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-academic-600">No grade data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-academic-50 to-transparent">
                <CardTitle>Subject Performance</CardTitle>
                <CardDescription>
                  Average performance percentage by subject
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subjectPerformance.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={subjectPerformance}
                        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis type="category" dataKey="subject" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="averagePercentage"
                          name="Average Percentage"
                          fill="#266eb4"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-academic-600">No subject performance data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-academic-50 to-transparent">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Results</CardTitle>
                  <CardDescription>
                    Recently added student results
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate("/teacher/manage-results")}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentResults.length > 0 ? (
                <div className="overflow-auto rounded-md border">
                  <Table>
                    <TableHeader className="bg-academic-50">
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Academic Info</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentResults.map((result) => (
                        <TableRow key={result.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{result.student_name}</TableCell>
                          <TableCell>{result.subject}</TableCell>
                          <TableCell>
                            {result.marks_obtained}/{result.total_marks}
                            <span className="text-xs text-academic-600 ml-2">
                              ({((result.marks_obtained / result.total_marks) * 100).toFixed(2)}%)
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              result.grade === "A+" ? "bg-green-100 text-green-800" :
                              result.grade === "A" ? "bg-emerald-100 text-emerald-800" :
                              result.grade === "B" ? "bg-blue-100 text-blue-800" :
                              result.grade === "C" ? "bg-yellow-100 text-yellow-800" :
                              result.grade === "D" ? "bg-orange-100 text-orange-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {result.grade}
                            </span>
                          </TableCell>
                          <TableCell>
                            {result.academic_year}, Semester {result.semester}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-academic-600">No results added yet</p>
                  <Button 
                    variant="link" 
                    onClick={() => navigate("/teacher/add-result")}
                    className="text-academic-600"
                  >
                    Add your first result
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => navigate("/teacher/analytics")}
              variant="outline"
              className="flex items-center gap-2 bg-academic-50 hover:bg-academic-100"
            >
              <FileText className="w-4 h-4" />
              View Detailed Analytics
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
