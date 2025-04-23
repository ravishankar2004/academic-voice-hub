
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { useUser } from "@/context/UserContext";
import { FileText, Filter, Volume2, VolumeX, X } from "lucide-react";
import textToSpeechService from "@/services/textToSpeech";
import { generateResultPDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const StudentResults = () => {
  const { userData, userId } = useUser();
  const { toast } = useToast();
  const [results, setResults] = useState<ResultData[]>([]);
  const [filteredResults, setFilteredResults] = useState<ResultData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    year: "",
    semester: "",
    subject: "",
  });
  const [years, setYears] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  // Load results
  useEffect(() => {
    if (userId) {
      const storedResults = localStorage.getItem("results") || "[]";
      const allResults = JSON.parse(storedResults);
      const studentResults = allResults.filter(
        (result: ResultData) => result.student_id === userId
      );
      setResults(studentResults);

      // Extract unique values for filters with proper type casting
      const uniqueYears = Array.from(
        new Set(studentResults.map((r: ResultData) => r.academic_year))
      ) as string[];
      
      const uniqueSemesters = Array.from(
        new Set(studentResults.map((r: ResultData) => r.semester))
      ) as string[];
      
      const uniqueSubjects = Array.from(
        new Set(studentResults.map((r: ResultData) => r.subject))
      ) as string[];

      setYears(uniqueYears);
      setSemesters(uniqueSemesters);
      setSubjects(uniqueSubjects);
    }
  }, [userId]);

  // Apply filters
  useEffect(() => {
    let filtered = [...results];

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(
        (result) =>
          result.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.academic_year.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.semester.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters - ensure we only filter if the value is not a special "all_*" value and not empty
    if (filters.year && filters.year !== "all_years") {
      filtered = filtered.filter((result) => result.academic_year === filters.year);
    }
    if (filters.semester && filters.semester !== "all_semesters") {
      filtered = filtered.filter((result) => result.semester === filters.semester);
    }
    if (filters.subject && filters.subject !== "all_subjects") {
      filtered = filtered.filter((result) => result.subject === filters.subject);
    }

    setFilteredResults(filtered);
  }, [searchTerm, filters, results]);

  const clearFilters = () => {
    setFilters({
      year: "",
      semester: "",
      subject: "",
    });
    setSearchTerm("");
  };

  const downloadResults = () => {
    if (filteredResults.length === 0) {
      toast({
        title: "No results to download",
        description: "There are no results available with the current filters",
        variant: "destructive",
      });
      return;
    }
    
    generateResultPDF(filteredResults, userData.name, userData.rollNumber);
    
    toast({
      title: "PDF Generated",
      description: "Your results have been downloaded as a PDF",
    });
  };

  const speakResults = () => {
    if (filteredResults.length === 0) {
      toast({
        title: "No results to read",
        description: "There are no results available with the current filters",
        variant: "destructive",
      });
      return;
    }
    
    if (isSpeaking) {
      textToSpeechService.stop();
      setIsSpeaking(false);
      return;
    }
    
    setIsSpeaking(true);
    
    // Create text for voice-over
    let speechText = `Results for ${userData.name}, Roll Number ${userData.rollNumber}. `;
    
    if (filters.year && filters.year !== "all_years") {
      speechText += `Academic Year ${filters.year}. `;
    }
    
    if (filters.semester && filters.semester !== "all_semesters") {
      speechText += `Semester ${filters.semester}. `;
    }
    
    if (filters.subject && filters.subject !== "all_subjects") {
      speechText += `Subject ${filters.subject}. `;
    }
    
    speechText += `Total subjects: ${filteredResults.length}. `;
    
    // Add individual subject results
    filteredResults.forEach((result, index) => {
      speechText += `Result ${index + 1}: Subject: ${result.subject}. Academic Year: ${result.academic_year}. Semester: ${result.semester}. Marks: ${result.marks_obtained} out of ${result.total_marks}. Grade: ${result.grade}. `;
    });
    
    textToSpeechService.speak(speechText, {
      rate: 1,
      pitch: 1,
    });
    
    // Update state when speech is complete
    setTimeout(() => {
      setIsSpeaking(false);
    }, speechText.length * 65); // Rough estimation of speech duration
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation userType="student" userName={userData?.name} />
      
      <main className="flex-grow p-4 md:p-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-academic-900">Your Results</h1>
              <p className="text-academic-600">View and search all your academic results</p>
            </div>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Result Search</CardTitle>
              <CardDescription>Search and filter through your results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by subject, year, or semester..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
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
                  {(filters.year || filters.semester || filters.subject) && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="text-destructive"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Active filters */}
              {(filters.year || filters.semester || filters.subject) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {filters.year && (
                    <div className="bg-academic-100 text-academic-800 px-3 py-1 rounded-full text-sm flex items-center">
                      Year: {filters.year}
                      <button
                        onClick={() => setFilters({ ...filters, year: "" })}
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
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Results</CardTitle>
                  <CardDescription>
                    {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={downloadResults}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Download PDF
                  </Button>
                  
                  {userData?.voiceOverEnabled && (
                    <Button
                      variant={isSpeaking ? "destructive" : "outline"}
                      onClick={speakResults}
                      className="flex items-center gap-2"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-4 h-4" />
                          Stop Reading
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          Read Results
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredResults.length > 0 ? (
                <div className="overflow-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-academic-50 text-academic-700">
                        <th className="border border-academic-200 p-2 text-left">Subject</th>
                        <th className="border border-academic-200 p-2 text-left">Year</th>
                        <th className="border border-academic-200 p-2 text-left">Semester</th>
                        <th className="border border-academic-200 p-2 text-left">Marks</th>
                        <th className="border border-academic-200 p-2 text-left">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResults.map((result) => (
                        <tr key={result.id} className="hover:bg-academic-50">
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-academic-600">No results found</p>
                  {(searchTerm || filters.year || filters.semester || filters.subject) && (
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
      
      {/* Filter Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Results</DialogTitle>
            <DialogDescription>
              Select filters to narrow down your result view
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Academic Year</label>
              <Select
                value={filters.year}
                onValueChange={(value) => setFilters({ ...filters, year: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Semester</label>
              <Select
                value={filters.semester}
                onValueChange={(value) => setFilters({ ...filters, semester: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Semesters</SelectItem>
                  {semesters.map((semester) => (
                    <SelectItem key={semester} value={semester}>
                      {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select
                value={filters.subject}
                onValueChange={(value) => setFilters({ ...filters, subject: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
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
    </div>
  );
};

export default StudentResults;
