
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const AddResult = () => {
  const { userData } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [rollNumber, setRollNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [marksObtained, setMarksObtained] = useState<number | "">("");
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [studentSearched, setStudentSearched] = useState(false);

  // For subject auto-suggest
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);

  useEffect(() => {
    // Load existing subjects from results for auto-suggestion
    const storedResults = localStorage.getItem("results") || "[]";
    const results = JSON.parse(storedResults);
    
    // Extract unique subjects
    const uniqueSubjects = Array.from(new Set(results.map((r: any) => r.subject)));
    setSubjectSuggestions(uniqueSubjects as string[]);
    
    // Extract unique academic years
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(`${currentYear - i}-${currentYear - i + 1}`);
    }
    setAcademicYears(years);
  }, []);

  const searchStudent = () => {
    setStudentSearched(true);
    
    if (!rollNumber.trim()) {
      setStudentInfo(null);
      toast({
        title: "Roll Number Required",
        description: "Please enter a student roll number to search",
        variant: "destructive",
      });
      return;
    }
    
    // Search for student in localStorage
    const storedStudents = localStorage.getItem("students") || "[]";
    const students = JSON.parse(storedStudents);
    
    const foundStudent = students.find(
      (student: any) => student.rollNumber === rollNumber
    );
    
    if (!foundStudent) {
      setStudentInfo(null);
      toast({
        title: "Student Not Found",
        description: "No student found with the provided roll number",
        variant: "destructive",
      });
      return;
    }
    
    setStudentInfo(foundStudent);
    toast({
      title: "Student Found",
      description: `Found student: ${foundStudent.name}`,
    });
  };

  const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return "A+";
    else if (percentage >= 80) return "A";
    else if (percentage >= 70) return "B";
    else if (percentage >= 60) return "C";
    else if (percentage >= 50) return "D";
    else return "F";
  };

  const addResult = () => {
    setIsLoading(true);
    
    try {
      // Validate form
      if (!studentInfo) {
        throw new Error("Please search for a valid student first");
      }
      
      if (!subject) {
        throw new Error("Subject is required");
      }
      
      if (marksObtained === "" || isNaN(Number(marksObtained))) {
        throw new Error("Valid marks obtained are required");
      }
      
      if (!academicYear) {
        throw new Error("Academic year is required");
      }
      
      if (!semester) {
        throw new Error("Semester is required");
      }
      
      const numericMarksObtained = Number(marksObtained);
      
      if (numericMarksObtained < 0 || numericMarksObtained > totalMarks) {
        throw new Error(`Marks must be between 0 and ${totalMarks}`);
      }
      
      // Calculate percentage and grade
      const percentage = (numericMarksObtained / totalMarks) * 100;
      const grade = calculateGrade(percentage);
      
      // Create result object
      const resultId = `result_${Date.now()}`;
      const newResult = {
        id: resultId,
        student_id: studentInfo.id,
        student_name: studentInfo.name,
        subject,
        marks_obtained: numericMarksObtained,
        total_marks: totalMarks,
        academic_year: academicYear,
        semester,
        grade,
      };
      
      // Save to localStorage
      const storedResults = localStorage.getItem("results") || "[]";
      const results = JSON.parse(storedResults);
      results.push(newResult);
      localStorage.setItem("results", JSON.stringify(results));
      
      toast({
        title: "Result Added Successfully",
        description: `Added ${subject} result for ${studentInfo.name}`,
      });
      
      // Clear form
      setRollNumber("");
      setSubject("");
      setMarksObtained("");
      setTotalMarks(100);
      setAcademicYear("");
      setSemester("");
      setStudentInfo(null);
      setStudentSearched(false);
      
    } catch (error: any) {
      toast({
        title: "Error Adding Result",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation userType="teacher" userName={userData?.name} />
      
      <main className="flex-grow p-4 md:p-6 bg-gray-50">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-academic-900">Add New Result</h1>
            <p className="text-academic-600">Enter student result information</p>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Student Search</CardTitle>
              <CardDescription>
                Search for a student by their roll number
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="roll-number">Student Roll Number</Label>
                  <Input
                    id="roll-number"
                    placeholder="Enter roll number"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                  />
                </div>
                <div className="md:self-end">
                  <Button 
                    onClick={searchStudent}
                    className="w-full md:w-auto bg-academic-600 hover:bg-academic-700"
                  >
                    Search
                  </Button>
                </div>
              </div>
              
              {studentSearched && (
                <div className="mt-4">
                  {studentInfo ? (
                    <div className="p-4 bg-academic-50 rounded-md border border-academic-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-academic-200 flex items-center justify-center text-academic-700 font-bold">
                          {studentInfo.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{studentInfo.name}</h3>
                          <p className="text-academic-600">Roll Number: {studentInfo.rollNumber}</p>
                          <p className="text-academic-600">Email: {studentInfo.email}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50 text-red-800 rounded-md border border-red-200">
                      No student found with roll number "{rollNumber}"
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Result Details</CardTitle>
              <CardDescription>
                Enter the academic result information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addResult();
                }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <div className="relative">
                      <Input
                        id="subject"
                        placeholder="e.g., Mathematics"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        list="subject-suggestions"
                        required
                      />
                      <datalist id="subject-suggestions">
                        {subjectSuggestions.map((suggestion, index) => (
                          <option key={index} value={suggestion} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="academic-year">Academic Year</Label>
                    <Select
                      value={academicYear}
                      onValueChange={setAcademicYear}
                    >
                      <SelectTrigger id="academic-year">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select
                      value={semester}
                      onValueChange={setSemester}
                    >
                      <SelectTrigger id="semester">
                        <SelectValue placeholder="Select Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Semester 1</SelectItem>
                        <SelectItem value="2">Semester 2</SelectItem>
                        <SelectItem value="3">Semester 3</SelectItem>
                        <SelectItem value="4">Semester 4</SelectItem>
                        <SelectItem value="5">Semester 5</SelectItem>
                        <SelectItem value="6">Semester 6</SelectItem>
                        <SelectItem value="7">Semester 7</SelectItem>
                        <SelectItem value="8">Semester 8</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="marks-obtained">Marks Obtained</Label>
                    <Input
                      id="marks-obtained"
                      type="number"
                      min="0"
                      max={totalMarks}
                      placeholder="e.g., 85"
                      value={marksObtained}
                      onChange={(e) => setMarksObtained(e.target.value ? Number(e.target.value) : "")}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="total-marks">Total Marks</Label>
                    <Input
                      id="total-marks"
                      type="number"
                      min="1"
                      placeholder="e.g., 100"
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(Number(e.target.value))}
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="p-4 bg-academic-50 rounded-md border border-academic-200">
                      <h3 className="font-semibold mb-2">Result Preview</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-academic-600">Student:</span>{" "}
                          {studentInfo ? studentInfo.name : "Not selected"}
                        </div>
                        <div>
                          <span className="text-academic-600">Subject:</span>{" "}
                          {subject || "Not entered"}
                        </div>
                        <div>
                          <span className="text-academic-600">Year:</span>{" "}
                          {academicYear || "Not selected"}
                        </div>
                        <div>
                          <span className="text-academic-600">Semester:</span>{" "}
                          {semester || "Not selected"}
                        </div>
                        <div>
                          <span className="text-academic-600">Marks:</span>{" "}
                          {marksObtained !== "" ? `${marksObtained}/${totalMarks}` : "Not entered"}
                        </div>
                        <div>
                          <span className="text-academic-600">Grade:</span>{" "}
                          {marksObtained !== "" ? calculateGrade((Number(marksObtained) / totalMarks) * 100) : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/teacher/manage-results")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !studentInfo}
                    className="bg-academic-600 hover:bg-academic-700"
                  >
                    {isLoading ? "Adding..." : "Add Result"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AddResult;
