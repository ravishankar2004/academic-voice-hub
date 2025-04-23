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
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Edit, Filter, Plus, Search, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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

const ManageResults = () => {
  const { userData } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [results, setResults] = useState<ResultData[]>([]);
  const [filteredResults, setFilteredResults] = useState<ResultData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  
  const [filters, setFilters] = useState({
    student: "",
    subject: "",
    academicYear: "",
    semester: "",
  });
  
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<ResultData | null>(null);
  const [editFormData, setEditFormData] = useState({
    subject: "",
    academicYear: "",
    semester: "",
    marks_obtained: 0,
    total_marks: 100,
  });
  
  useEffect(() => {
    const loadData = () => {
      const storedResults = localStorage.getItem("results") || "[]";
      const allResults = JSON.parse(storedResults);
      setResults(allResults);
      setFilteredResults(allResults);
      
      const storedStudents = localStorage.getItem("students") || "[]";
      const allStudents = JSON.parse(storedStudents);
      setStudents(allStudents);
      
      const uniqueSubjects = Array.from(
        new Set(allResults.map((r: ResultData) => r.subject))
      );
      const uniqueYears = Array.from(
        new Set(allResults.map((r: ResultData) => r.academic_year))
      );
      const uniqueSemesters = Array.from(
        new Set(allResults.map((r: ResultData) => r.semester))
      );
      
      setSubjects(uniqueSubjects as string[]);
      setAcademicYears(uniqueYears as string[]);
      setSemesters(uniqueSemesters as string[]);
    };
    
    loadData();
  }, []);
  
  useEffect(() => {
    let filtered = [...results];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (result) =>
          result.student_name.toLowerCase().includes(searchLower) ||
          result.subject.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.student) {
      filtered = filtered.filter((result) => result.student_id === filters.student);
    }
    
    if (filters.subject) {
      filtered = filtered.filter((result) => result.subject === filters.subject);
    }
    
    if (filters.academicYear) {
      filtered = filtered.filter((result) => result.academic_year === filters.academicYear);
    }
    
    if (filters.semester) {
      filtered = filtered.filter((result) => result.semester === filters.semester);
    }
    
    setFilteredResults(filtered);
  }, [results, searchTerm, filters]);
  
  const clearFilters = () => {
    setFilters({
      student: "",
      subject: "",
      academicYear: "",
      semester: "",
    });
    setSearchTerm("");
  };
  
  const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return "A+";
    else if (percentage >= 80) return "A";
    else if (percentage >= 70) return "B";
    else if (percentage >= 60) return "C";
    else if (percentage >= 50) return "D";
    else return "F";
  };
  
  const deleteResult = (resultId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this result? This action cannot be undone."
    );
    
    if (confirmDelete) {
      const updatedResults = results.filter((result) => result.id !== resultId);
      localStorage.setItem("results", JSON.stringify(updatedResults));
      
      setResults(updatedResults);
      
      toast({
        title: "Result Deleted",
        description: "The result has been deleted successfully",
      });
    }
  };
  
  const openEditDialog = (result: ResultData) => {
    setEditingResult(result);
    setEditFormData({
      subject: result.subject,
      academicYear: result.academic_year,
      semester: result.semester,
      marks_obtained: result.marks_obtained,
      total_marks: result.total_marks,
    });
    setIsEditDialogOpen(true);
  };
  
  const saveEditedResult = () => {
    if (!editingResult) return;
    
    try {
      if (!editFormData.subject) {
        throw new Error("Subject is required");
      }
      
      if (!editFormData.academicYear) {
        throw new Error("Academic year is required");
      }
      
      if (!editFormData.semester) {
        throw new Error("Semester is required");
      }
      
      if (editFormData.marks_obtained < 0 || editFormData.marks_obtained > editFormData.total_marks) {
        throw new Error(`Marks must be between 0 and ${editFormData.total_marks}`);
      }
      
      const percentage = (editFormData.marks_obtained / editFormData.total_marks) * 100;
      const grade = calculateGrade(percentage);
      
      const updatedResult = {
        ...editingResult,
        subject: editFormData.subject,
        academic_year: editFormData.academicYear,
        semester: editFormData.semester,
        marks_obtained: editFormData.marks_obtained,
        total_marks: editFormData.total_marks,
        grade,
      };
      
      const updatedResults = results.map((result) =>
        result.id === editingResult.id ? updatedResult : result
      );
      
      localStorage.setItem("results", JSON.stringify(updatedResults));
      
      setResults(updatedResults);
      
      toast({
        title: "Result Updated",
        description: "The result has been updated successfully",
      });
      
      setIsEditDialogOpen(false);
      setEditingResult(null);
    } catch (error: any) {
      toast({
        title: "Error Updating Result",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation userType="teacher" userName={userData?.name} />
      
      <main className="flex-grow p-4 md:p-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-academic-900">Manage Results</h1>
              <p className="text-academic-600">View, edit, or delete student results</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                onClick={() => navigate("/teacher/add-result")}
                className="bg-academic-600 hover:bg-academic-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Result
              </Button>
            </div>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search & Filter Results</CardTitle>
              <CardDescription>Find specific student results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      placeholder="Search by student name or subject..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsFilterDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filter
                  </Button>
                  {(filters.student || filters.subject || filters.academicYear || filters.semester) && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              
              {(filters.student || filters.subject || filters.academicYear || filters.semester) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {filters.student && (
                    <div className="bg-academic-100 text-academic-800 px-3 py-1 rounded-full text-sm flex items-center">
                      Student: {students.find((s) => s.id === filters.student)?.name || "Unknown"}
                      <button
                        onClick={() => setFilters({ ...filters, student: "" })}
                        className="ml-2 text-academic-600 hover:text-academic-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {filters.subject && (
                    <div className="bg-academic-100 text-academic-800 px-3 py-1 rounded-full text-sm flex items-center">
                      Subject: {filters.subject}
                      <button
                        onClick={() => setFilters({ ...filters, subject: "" })}
                        className="ml-2 text-academic-600 hover:text-academic-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {filters.academicYear && (
                    <div className="bg-academic-100 text-academic-800 px-3 py-1 rounded-full text-sm flex items-center">
                      Year: {filters.academicYear}
                      <button
                        onClick={() => setFilters({ ...filters, academicYear: "" })}
                        className="ml-2 text-academic-600 hover:text-academic-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {filters.semester && (
                    <div className="bg-academic-100 text-academic-800 px-3 py-1 rounded-full text-sm flex items-center">
                      Semester: {filters.semester}
                      <button
                        onClick={() => setFilters({ ...filters, semester: "" })}
                        className="ml-2 text-academic-600 hover:text-academic-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>
                {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-academic-50 text-academic-700">
                        <th className="border border-academic-200 p-2 text-left">Student</th>
                        <th className="border border-academic-200 p-2 text-left">Subject</th>
                        <th className="border border-academic-200 p-2 text-left">Academic Year</th>
                        <th className="border border-academic-200 p-2 text-left">Semester</th>
                        <th className="border border-academic-200 p-2 text-left">Marks</th>
                        <th className="border border-academic-200 p-2 text-left">Grade</th>
                        <th className="border border-academic-200 p-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResults.map((result) => (
                        <tr key={result.id} className="hover:bg-academic-50">
                          <td className="border border-academic-200 p-2">{result.student_name}</td>
                          <td className="border border-academic-200 p-2">{result.subject}</td>
                          <td className="border border-academic-200 p-2">{result.academic_year}</td>
                          <td className="border border-academic-200 p-2">{result.semester}</td>
                          <td className="border border-academic-200 p-2">
                            {result.marks_obtained}/{result.total_marks}
                            <span className="text-xs text-academic-600 ml-2">
                              ({((result.marks_obtained / result.total_marks) * 100).toFixed(2)}%)
                            </span>
                          </td>
                          <td className="border border-academic-200 p-2">
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
                          </td>
                          <td className="border border-academic-200 p-2">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(result)}
                                className="h-8 px-2 text-academic-700 hover:text-academic-900 hover:bg-academic-100"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteResult(result.id)}
                                className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-academic-600">No results found</p>
                  {(searchTerm || filters.student || filters.subject || filters.academicYear || filters.semester) && (
                    <Button variant="link" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Results</DialogTitle>
            <DialogDescription>
              Select filters to narrow down the results
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Student</Label>
              <Select
                value={filters.student}
                onValueChange={(value) => setFilters({ ...filters, student: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Students</SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.rollNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select
                value={filters.subject}
                onValueChange={(value) => setFilters({ ...filters, subject: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Select
                value={filters.academicYear}
                onValueChange={(value) => setFilters({ ...filters, academicYear: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Years</SelectItem>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select
                value={filters.semester}
                onValueChange={(value) => setFilters({ ...filters, semester: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Semesters</SelectItem>
                  {semesters.map((semester) => (
                    <SelectItem key={semester} value={semester}>
                      Semester {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={clearFilters}>
              Reset Filters
            </Button>
            <Button
              onClick={() => setIsFilterDialogOpen(false)}
              className="bg-academic-600 hover:bg-academic-700"
            >
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Result</DialogTitle>
            <DialogDescription>
              Update the result for {editingResult?.student_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-subject">Subject</Label>
              <Input
                id="edit-subject"
                value={editFormData.subject}
                onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-academic-year">Academic Year</Label>
              <Select
                value={editFormData.academicYear}
                onValueChange={(value) => setEditFormData({ ...editFormData, academicYear: value })}
              >
                <SelectTrigger id="edit-academic-year">
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
              <Label htmlFor="edit-semester">Semester</Label>
              <Select
                value={editFormData.semester}
                onValueChange={(value) => setEditFormData({ ...editFormData, semester: value })}
              >
                <SelectTrigger id="edit-semester">
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester) => (
                    <SelectItem key={semester} value={semester}>
                      Semester {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-marks-obtained">Marks Obtained</Label>
                <Input
                  id="edit-marks-obtained"
                  type="number"
                  min="0"
                  max={editFormData.total_marks}
                  value={editFormData.marks_obtained}
                  onChange={(e) => setEditFormData({ ...editFormData, marks_obtained: Number(e.target.value) })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-total-marks">Total Marks</Label>
                <Input
                  id="edit-total-marks"
                  type="number"
                  min="1"
                  value={editFormData.total_marks}
                  onChange={(e) => setEditFormData({ ...editFormData, total_marks: Number(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="p-4 bg-academic-50 rounded-md border border-academic-200">
              <h3 className="font-semibold mb-2">Result Preview</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-academic-600">Grade:</span>{" "}
                  {calculateGrade((editFormData.marks_obtained / editFormData.total_marks) * 100)}
                </div>
                <div>
                  <span className="text-academic-600">Percentage:</span>{" "}
                  {((editFormData.marks_obtained / editFormData.total_marks) * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={saveEditedResult}
              className="bg-academic-600 hover:bg-academic-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageResults;
