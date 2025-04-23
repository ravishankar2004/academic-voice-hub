import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const Analytics = () => {
  const { userData } = useUser();
  const [results, setResults] = useState<ResultData[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("all_students");
  const [selectedSubject, setSelectedSubject] = useState<string>("all_subjects");
  const [selectedYear, setSelectedYear] = useState<string>("all_years");
  
  const [gradeDistribution, setGradeDistribution] = useState<any[]>([]);
  const [studentPerformance, setStudentPerformance] = useState<any[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<any[]>([]);
  const [yearlyProgress, setYearlyProgress] = useState<any[]>([]);
  
  const [subjects, setSubjects] = useState<string[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    // Load results
    const storedResults = localStorage.getItem("results") || "[]";
    const allResults = JSON.parse(storedResults);
    setResults(allResults);
    
    // Load students
    const storedStudents = localStorage.getItem("students") || "[]";
    const allStudents = JSON.parse(storedStudents);
    setStudents(allStudents);
    
    // Extract unique subjects and years
    const uniqueSubjects = Array.from(
      new Set(allResults.map((r: ResultData) => r.subject))
    );
    const uniqueYears = Array.from(
      new Set(allResults.map((r: ResultData) => r.academic_year))
    );
    
    setSubjects(uniqueSubjects as string[]);
    setAcademicYears(uniqueYears as string[]);
  }, []);

  // Calculate analytics when filters change
  useEffect(() => {
    if (!results.length) return;
    
    // Filter results based on selections
    let filteredResults = [...results];
    
    if (selectedStudent !== "all_students") {
      filteredResults = filteredResults.filter(
        (result) => result.student_id === selectedStudent
      );
    }
    
    if (selectedSubject !== "all_subjects") {
      filteredResults = filteredResults.filter(
        (result) => result.subject === selectedSubject
      );
    }
    
    if (selectedYear !== "all_years") {
      filteredResults = filteredResults.filter(
        (result) => result.academic_year === selectedYear
      );
    }
    
    // Calculate grade distribution
    const gradeCount = {
      "A+": 0,
      "A": 0,
      "B": 0,
      "C": 0,
      "D": 0,
      "F": 0
    };
    
    filteredResults.forEach((result) => {
      if (gradeCount[result.grade as keyof typeof gradeCount] !== undefined) {
        gradeCount[result.grade as keyof typeof gradeCount]++;
      }
    });
    
    const gradeData = Object.entries(gradeCount).map(([grade, count]) => ({
      grade,
      count,
      percentage: filteredResults.length > 0 
        ? Math.round((count / filteredResults.length) * 100) 
        : 0
    }));
    
    setGradeDistribution(gradeData);
    
    // Calculate student performance
    if (selectedStudent === "all_students") {
      // Group by student for overview
      const studentGroups: Record<string, { total: number; count: number; student: string }> = {};
      
      filteredResults.forEach((result) => {
        const percentage = (result.marks_obtained / result.total_marks) * 100;
        
        if (!studentGroups[result.student_id]) {
          studentGroups[result.student_id] = { 
            total: 0, 
            count: 0, 
            student: result.student_name 
          };
        }
        
        studentGroups[result.student_id].total += percentage;
        studentGroups[result.student_id].count++;
      });
      
      const studentData = Object.entries(studentGroups)
        .map(([id, data]) => ({
          student: data.student,
          studentId: id,
          averagePercentage: Math.round(data.total / data.count)
        }))
        .sort((a, b) => b.averagePercentage - a.averagePercentage)
        .slice(0, 10); // Top 10 students
      
      setStudentPerformance(studentData);
    } else {
      // Detailed performance for selected student
      const studentData = filteredResults
        .map((result) => ({
          subject: result.subject,
          percentage: Math.round((result.marks_obtained / result.total_marks) * 100),
          grade: result.grade,
          semester: result.semester,
          academicYear: result.academic_year
        }))
        .sort((a, b) => parseInt(a.semester) - parseInt(b.semester));
      
      setStudentPerformance(studentData);
    }
    
    // Calculate subject performance
    const subjectGroups: Record<string, { total: number; count: number }> = {};
    
    filteredResults.forEach((result) => {
      const percentage = (result.marks_obtained / result.total_marks) * 100;
      
      if (!subjectGroups[result.subject]) {
        subjectGroups[result.subject] = { total: 0, count: 0 };
      }
      
      subjectGroups[result.subject].total += percentage;
      subjectGroups[result.subject].count++;
    });
    
    const subjectData = Object.entries(subjectGroups).map(([subject, data]) => ({
      subject,
      averagePercentage: Math.round(data.total / data.count),
      studentCount: data.count
    }));
    
    setSubjectPerformance(subjectData);
    
    // Calculate yearly progress
    const yearSemesterGroups: Record<string, Record<string, { total: number; count: number }>> = {};
    
    filteredResults.forEach((result) => {
      const percentage = (result.marks_obtained / result.total_marks) * 100;
      const key = `${result.academic_year}-${result.semester}`;
      
      if (!yearSemesterGroups[result.academic_year]) {
        yearSemesterGroups[result.academic_year] = {};
      }
      
      if (!yearSemesterGroups[result.academic_year][result.semester]) {
        yearSemesterGroups[result.academic_year][result.semester] = { 
          total: 0, 
          count: 0 
        };
      }
      
      yearSemesterGroups[result.academic_year][result.semester].total += percentage;
      yearSemesterGroups[result.academic_year][result.semester].count++;
    });
    
    const yearlyData = Object.entries(yearSemesterGroups).flatMap(([year, semesters]) => 
      Object.entries(semesters).map(([semester, data]) => ({
        period: `${year} - Sem ${semester}`,
        year,
        semester,
        averagePercentage: Math.round(data.total / data.count)
      }))
    ).sort((a, b) => {
      // Sort by year then by semester
      if (a.year !== b.year) {
        return a.year.localeCompare(b.year);
      }
      return parseInt(a.semester) - parseInt(b.semester);
    });
    
    setYearlyProgress(yearlyData);
    
  }, [results, selectedStudent, selectedSubject, selectedYear]);

  const clearFilters = () => {
    setSelectedStudent("all_students");
    setSelectedSubject("all_subjects");
    setSelectedYear("all_years");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation userType="teacher" userName={userData?.name} />
      
      <main className="flex-grow p-4 md:p-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-academic-900">Performance Analytics</h1>
              <p className="text-academic-600">Detailed analysis of student results</p>
            </div>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Filter Analytics</CardTitle>
              <CardDescription>
                Select specific filters to view detailed analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Student</label>
                  <Select
                    value={selectedStudent}
                    onValueChange={setSelectedStudent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Students" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_students">All Students</SelectItem>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.rollNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <Select
                    value={selectedSubject}
                    onValueChange={setSelectedSubject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_subjects">All Subjects</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Academic Year</label>
                  <Select
                    value={selectedYear}
                    onValueChange={setSelectedYear}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_years">All Years</SelectItem>
                      {academicYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {(selectedStudent !== "all_students" || selectedSubject !== "all_subjects" || selectedYear !== "all_years") && (
                <Button variant="outline" onClick={clearFilters} className="ml-auto block">
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Grade Distribution</CardTitle>
              <CardDescription>
                Percentage of students achieving each grade
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gradeDistribution.some((item) => item.count > 0) ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gradeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ grade, percentage }) => `${grade}: ${percentage}%`}
                      >
                        {gradeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} results`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-academic-600">No grade data available</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedStudent 
                  ? `${students.find((s) => s.id === selectedStudent)?.name}'s Performance` 
                  : "Top Student Performance"}
              </CardTitle>
              <CardDescription>
                {selectedStudent 
                  ? "Subject-wise performance analysis" 
                  : "Average percentage across all subjects"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentPerformance.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {selectedStudent ? (
                      <BarChart
                        data={studentPerformance}
                        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="subject" 
                          tick={{ fontSize: 12 }} 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="percentage" 
                          name="Percentage" 
                          fill="#0088FE"
                        />
                      </BarChart>
                    ) : (
                      <BarChart
                        data={studentPerformance}
                        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis 
                          type="category" 
                          dataKey="student" 
                          width={150} 
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="averagePercentage" 
                          name="Average Percentage" 
                          fill="#00C49F" 
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-academic-600">No student performance data available</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
              <CardDescription>
                Average performance by subject
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subjectPerformance.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={subjectPerformance}
                      margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="subject" 
                        tick={{ fontSize: 12 }} 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="averagePercentage" 
                        name="Average Percentage" 
                        fill="#8884d8" 
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
          
          <Card>
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
              <CardDescription>
                Average performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {yearlyProgress.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={yearlyProgress}
                      margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="period" 
                        tick={{ fontSize: 12 }} 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="averagePercentage" 
                        name="Average Percentage"
                        stroke="#FF8042" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-academic-600">No trend data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
