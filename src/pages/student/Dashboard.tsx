
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Eye, FileText, Volume2, VolumeX } from "lucide-react";
import { generateResultPDF } from "@/utils/pdfGenerator";
import textToSpeechService from "@/services/textToSpeech";
import { Switch } from "@/components/ui/switch";

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

const StudentDashboard = () => {
  const { userData, userId } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [results, setResults] = useState<ResultData[]>([]);
  const [isVoiceOverEnabled, setIsVoiceOverEnabled] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [academics, setAcademics] = useState<{ years: string[], semesters: string[] }>({
    years: [],
    semesters: []
  });

  // Load results
  useEffect(() => {
    if (userId) {
      const storedResults = localStorage.getItem("results") || "[]";
      const allResults = JSON.parse(storedResults);
      const studentResults = allResults.filter((result: ResultData) => result.student_id === userId);
      setResults(studentResults);
      
      // Extract unique years and semesters
      const years = Array.from(new Set(studentResults.map((result: ResultData) => result.academic_year)));
      const semesters = Array.from(new Set(studentResults.map((result: ResultData) => result.semester)));
      
      setAcademics({
        years,
        semesters
      });
    }
  }, [userId]);

  // Load voice-over preference
  useEffect(() => {
    if (userData) {
      setIsVoiceOverEnabled(userData.voiceOverEnabled || false);
    }
  }, [userData]);

  const toggleVoiceOver = () => {
    const updatedValue = !isVoiceOverEnabled;
    
    // Update in localStorage
    const storedStudents = localStorage.getItem("students") || "[]";
    const students = JSON.parse(storedStudents);
    const userIndex = students.findIndex((student: any) => student.id === userId);
    
    if (userIndex !== -1) {
      students[userIndex].voiceOverEnabled = updatedValue;
      localStorage.setItem("students", JSON.stringify(students));
      
      // Update in current session
      const updatedUserData = { ...userData, voiceOverEnabled: updatedValue };
      localStorage.setItem("rms_user_data", JSON.stringify(updatedUserData));
      
      setIsVoiceOverEnabled(updatedValue);
      
      toast({
        title: updatedValue ? "Voice-Over Enabled" : "Voice-Over Disabled",
        description: updatedValue 
          ? "You can now listen to your results"
          : "Voice-over functionality has been disabled",
      });
    }
  };

  const filteredResults = results.filter(result => {
    const yearMatch = selectedYear === "all" || result.academic_year === selectedYear;
    const semesterMatch = selectedSemester === "all" || result.semester === selectedSemester;
    return yearMatch && semesterMatch;
  });

  // Calculate statistics
  const totalSubjects = filteredResults.length;
  const totalMarksObtained = filteredResults.reduce((sum, result) => sum + result.marks_obtained, 0);
  const totalMaxMarks = filteredResults.reduce((sum, result) => sum + result.total_marks, 0);
  const averagePercentage = totalMaxMarks > 0 ? ((totalMarksObtained / totalMaxMarks) * 100).toFixed(2) : "0.00";
  
  const grades = {
    "A+": filteredResults.filter(result => result.grade === "A+").length,
    "A": filteredResults.filter(result => result.grade === "A").length,
    "B": filteredResults.filter(result => result.grade === "B").length,
    "C": filteredResults.filter(result => result.grade === "C").length,
    "D": filteredResults.filter(result => result.grade === "D").length,
    "F": filteredResults.filter(result => result.grade === "F").length
  };

  const downloadResults = () => {
    if (filteredResults.length === 0) {
      toast({
        title: "No results to download",
        description: "There are no results available for the selected filters",
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
        description: "There are no results available for the selected filters",
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
    
    if (selectedYear !== "all") {
      speechText += `Academic Year ${selectedYear}. `;
    }
    
    if (selectedSemester !== "all") {
      speechText += `Semester ${selectedSemester}. `;
    }
    
    speechText += `Total subjects: ${totalSubjects}. Overall percentage: ${averagePercentage} percent. `;
    
    // Add individual subject results
    filteredResults.forEach(result => {
      speechText += `Subject: ${result.subject}. Marks: ${result.marks_obtained} out of ${result.total_marks}. Grade: ${result.grade}. `;
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
              <h1 className="text-2xl md:text-3xl font-bold text-academic-900">Student Dashboard</h1>
              <p className="text-academic-600">Welcome back, {userData?.name}</p>
            </div>
            <div className="flex items-center mt-4 md:mt-0 space-x-2">
              <span className="text-sm text-academic-600">Voice-Over:</span>
              <Switch
                checked={isVoiceOverEnabled}
                onCheckedChange={toggleVoiceOver}
              />
              <span className="text-sm text-academic-600">{isVoiceOverEnabled ? "Enabled" : "Disabled"}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="dash-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Total Subjects</CardTitle>
                <CardDescription>Number of subjects with results</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-academic-700">{totalSubjects}</p>
              </CardContent>
            </Card>
            
            <Card className="dash-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Average Percentage</CardTitle>
                <CardDescription>Overall performance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-academic-700">{averagePercentage}%</p>
              </CardContent>
            </Card>
            
            <Card className="dash-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Total Marks</CardTitle>
                <CardDescription>Across all subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-academic-700">
                  {totalMarksObtained}/{totalMaxMarks}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="results" className="mb-6">
            <TabsList className="mb-6">
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="results" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Results</CardTitle>
                  <CardDescription>
                    View and filter your academic results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 flex flex-wrap gap-4">
                    <div className="w-full md:w-auto">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Academic Year
                      </label>
                      <select 
                        className="w-full md:w-48 rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-academic-500"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                      >
                        <option value="all">All Years</option>
                        {academics.years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="w-full md:w-auto">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Semester
                      </label>
                      <select 
                        className="w-full md:w-48 rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-academic-500"
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                      >
                        <option value="all">All Semesters</option>
                        {academics.semesters.map((semester) => (
                          <option key={semester} value={semester}>
                            {semester}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-end gap-2 ml-auto">
                      <Button
                        variant="outline"
                        onClick={downloadResults}
                        className="flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Download PDF
                      </Button>
                      
                      {isVoiceOverEnabled && (
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
                      <p className="text-academic-600">No results found for the selected filters</p>
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setSelectedYear("all");
                          setSelectedSemester("all");
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analysis</CardTitle>
                  <CardDescription>
                    View your performance metrics across subjects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Grade Distribution</h3>
                      <div className="space-y-4">
                        {Object.entries(grades).map(([grade, count]) => (
                          <div key={grade}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-academic-700">{grade}</span>
                              <span className="text-sm text-academic-600">{count} subjects</span>
                            </div>
                            <div className="w-full bg-academic-100 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  grade === "A+" ? "bg-green-500" :
                                  grade === "A" ? "bg-emerald-500" :
                                  grade === "B" ? "bg-blue-500" :
                                  grade === "C" ? "bg-yellow-500" :
                                  grade === "D" ? "bg-orange-500" :
                                  "bg-red-500"
                                }`}
                                style={{ 
                                  width: `${totalSubjects > 0 ? (count / totalSubjects) * 100 : 0}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Overall Performance</h3>
                      <div className="bg-white p-4 rounded-lg border border-academic-100 space-y-6">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-academic-700">Overall Percentage</span>
                            <span className="text-sm text-academic-600">{averagePercentage}%</span>
                          </div>
                          <div className="w-full bg-academic-100 rounded-full h-2">
                            <div 
                              className="bg-academic-600 h-2 rounded-full"
                              style={{ width: `${Math.min(parseFloat(averagePercentage), 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-academic-100">
                          <h4 className="text-sm font-semibold mb-2">Performance Summary</h4>
                          <p className="text-academic-600 text-sm">
                            {parseFloat(averagePercentage) >= 90 ? (
                              "Excellent performance! You've achieved outstanding results across your subjects."
                            ) : parseFloat(averagePercentage) >= 80 ? (
                              "Great job! You're performing very well in your academics."
                            ) : parseFloat(averagePercentage) >= 70 ? (
                              "Good performance. You're on the right track with your studies."
                            ) : parseFloat(averagePercentage) >= 60 ? (
                              "Satisfactory performance. There's room for improvement in some subjects."
                            ) : parseFloat(averagePercentage) >= 50 ? (
                              "You've passed, but should focus on improving your performance."
                            ) : (
                              "You need to work harder to improve your academic performance."
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-center mt-6">
            <Button
              onClick={() => navigate("/student/results")}
              className="bg-academic-600 hover:bg-academic-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              View All Results
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
