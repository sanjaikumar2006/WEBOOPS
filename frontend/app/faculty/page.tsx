'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/config';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
    BookOpen, ChevronRight, Megaphone, Beaker, Bell, 
    FilePlus, Users, Camera, FileText, UserCheck, 
    Calendar, ClipboardEdit, UploadCloud, Save, Trash2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function FacultyDashboard() {
    const [faculty, setFaculty] = useState<any>(null);
    const [theoryCourses, setTheoryCourses] = useState<any[]>([]);
    const [labCourses, setLabCourses] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', section: 'All' });
    const [message, setMessage] = useState('');
    
    // Feature: Progress Reports
    const [latestReport, setLatestReport] = useState<any>(null);

    // Profile Pic
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const router = useRouter();

    // --- Advisor Specific States ---
    const [isAdvisor, setIsAdvisor] = useState(false);
    const [myClassData, setMyClassData] = useState<any>(null);
    const [advisorStudents, setAdvisorStudents] = useState<any[]>([]);
    const [myUploadedDocs, setMyUploadedDocs] = useState<any[]>([]); // NEW: Manage uploads
    const [activeTab, setActiveTab] = useState<'teaching' | 'advisor'>('teaching');
    const [updateStatus, setUpdateStatus] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const userId = localStorage.getItem('user_id');

        if (!token || (role !== 'Faculty' && role !== 'HOD')) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                // 1. Fetch faculty profile
                const res = await axios.get(`${API_URL}/faculty/${userId}`);
                const facultyData = res.data;
                setFaculty(facultyData);

                if (facultyData.profile_pic) {
                    setProfilePic(facultyData.profile_pic);
                } else {
                    setProfilePic(`https://ui-avatars.com/api/?name=${facultyData.name}&background=random`);
                }

                // 2. Check Class Advisor Status
                try {
                    const advisorRes = await axios.get(`${API_URL}/advisors/my-class/${userId}`);
                    if (advisorRes.data) {
                        setIsAdvisor(true);
                        setMyClassData(advisorRes.data.class_info);
                        setAdvisorStudents(advisorRes.data.students);
                    }
                } catch (err) {
                    setIsAdvisor(false); 
                }

                // 3. Fetch Assigned Courses
                const coursesRes = await axios.get(`${API_URL}/courses?faculty_id=${userId}`);
                const assignedCourses = coursesRes.data;
                setTheoryCourses(assignedCourses.filter((c: any) => !c.title.includes('(Lab)')));
                setLabCourses(assignedCourses.filter((c: any) => c.title.includes('(Lab)')));

                // 4. Fetch Announcements
                const annRes = await axios.get(`${API_URL}/announcements?type=Faculty`);
                const globalAnnRes = await axios.get(`${API_URL}/announcements?type=Global`);
                setAnnouncements([...annRes.data, ...globalAnnRes.data]);

                // 5. Fetch latest progress report
                const { data: progressData, error } = await supabase
                    .from('faculty_progress_reports')
                    .select('pdf_url, created_at')
                    .eq('faculty_id', facultyData.staff_no)
                    .not('pdf_url', 'is', null)
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (!error && progressData && progressData.length > 0) {
                    setLatestReport(progressData[0]);
                }

            } catch (error) {
                console.error("Error loading dashboard data:", error);
            }
        };
        fetchData();
    }, [router]);

    // --- NEW: FETCH ADVISORY DOCUMENTS ---
    const fetchMyDocs = async () => {
        if (!myClassData) return;
        try {
            const res = await axios.get(`${API_URL}/advisors/my-docs/${myClassData.section}`);
            setMyUploadedDocs(res.data);
        } catch (err) {
            console.error("Error fetching docs");
        }
    };

    // Load docs whenever advisor tab is active
    useEffect(() => {
        if (activeTab === 'advisor' && myClassData) fetchMyDocs();
    }, [activeTab, myClassData]);

    // --- HANDLE ADVISOR DOCUMENT UPLOAD (TIMETABLE, PLANNER, EXAMS) ---
    const handlePushDoc = async (type: 'Timetable' | 'Academic Planner' | 'Exam Timetable') => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.jpg,.jpeg,.png';
        
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);
            formData.append('year', myClassData.year);
            formData.append('section', myClassData.section);

            try {
                setUpdateStatus(`Publishing ${type}...`);
                await axios.post(`${API_URL}/advisors/upload-docs`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert(`✅ ${type} has been published to Section ${myClassData.section}!`);
                setUpdateStatus('');
                fetchMyDocs(); // Refresh list after upload
            } catch (err) {
                console.error("Upload Error:", err);
                alert("Upload failed. Please check your connection.");
                setUpdateStatus('');
            }
        };
        input.click();
    };

    const handleDeleteDoc = async (id: number) => {
        if(!confirm("Are you sure you want to remove this document from the student dashboard?")) return;
        try {
            await axios.delete(`${API_URL}/advisors/delete-doc/${id}`);
            fetchMyDocs();
        } catch (err) {
            alert("Failed to delete.");
        }
    };

    // HANDLER: Advisor Updates Student Records
    const handleUpdateStudentStats = async (rollNo: string, cgpa: number, att: number) => {
        const formData = new FormData();
        formData.append('roll_no', rollNo);
        formData.append('cgpa', cgpa.toString());
        formData.append('attendance', att.toString());

        try {
            await axios.put(`${API_URL}/advisors/update-student-stats`, formData);
            setUpdateStatus(`Updated ${rollNo} successfully!`);
            setTimeout(() => setUpdateStatus(''), 3000);
        } catch (err) {
            alert("Failed to update student record.");
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const userId = localStorage.getItem('user_id');
            setProfilePic(URL.createObjectURL(file));
            const formData = new FormData();
            formData.append('file', file);
            try {
                const res = await axios.post(`${API_URL}/faculty/${userId}/photo`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (res.data && res.data.profile_pic) {
                    setProfilePic(res.data.profile_pic);
                    alert("Profile photo updated!");
                }
            } catch (err) {
                if (faculty) setProfilePic(`https://ui-avatars.com/api/?name=${faculty.name}&background=random`);
            }
        }
    };

    const handlePostAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                title: newAnnouncement.title,
                content: newAnnouncement.content,
                type: "Student",
                posted_by: faculty.name,
                course_code: "Global",
                section: newAnnouncement.section
            };
            await axios.post(`${API_URL}/announcements`, payload);
            setMessage("Announcement broadcasted!");
            setNewAnnouncement({ title: '', content: '', section: 'All' });
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage("Post failed.");
        }
    };

    if (!faculty) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-900">Staff Authentication...</div>;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8 flex-grow">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-blue-900">Faculty Dashboard</h1>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">{faculty.designation}</p>
                    </div>
                    
                    {isAdvisor && (
                        <div className="flex bg-white p-1 rounded-xl shadow-inner border self-end">
                            <button onClick={() => setActiveTab('teaching')} className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${activeTab === 'teaching' ? 'bg-blue-900 text-white shadow-md' : 'text-gray-400 hover:text-blue-900'}`}><BookOpen size={14} className="inline mr-2"/> Teaching</button>
                            <button onClick={() => setActiveTab('advisor')} className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${activeTab === 'advisor' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-orange-500'}`}><UserCheck size={14} className="inline mr-2"/> My Class (Advisor)</button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-900">
                            <div className="flex flex-col items-center mb-4">
                                <div className="relative group w-24 h-24 mb-4">
                                    <img src={profilePic || ""} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-sm" />
                                    <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer text-white">
                                        <Camera size={20} /><input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                    </label>
                                </div>
                                <h2 className="text-xl font-bold text-blue-900 text-center">{faculty.name}</h2>
                                <p className="text-xs text-gray-400 font-mono mt-1">{faculty.staff_no}</p>
                            </div>
                            <div className="space-y-3 text-sm border-t pt-4 font-medium">
                                <p className="flex justify-between"><span className="text-gray-500">Dept:</span> <span className="font-bold">AI & DS</span></p>
                                <p className="flex justify-between"><span className="text-gray-500">Joined:</span> <span className="font-bold">{faculty.doj}</span></p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Bell size={16} className="text-blue-600" /> Admin Notices</h3>
                            <div className="space-y-3">
                                {announcements.slice(0, 3).map((ann: any) => (
                                    <div key={ann.id} className="p-3 bg-blue-50 rounded border border-blue-100">
                                        <p className="text-xs font-bold text-blue-900">{ann.title}</p>
                                        <p className="text-[10px] text-gray-600 line-clamp-2">{ann.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-8">
                        {activeTab === 'teaching' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600">
                                    <h2 className="text-xl font-bold mb-4 text-blue-900 flex items-center gap-2"><BookOpen className="text-blue-600" /> My Theory Subjects</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {theoryCourses.length > 0 ? theoryCourses.map((course) => (
                                            <div key={course.id} className="border rounded-lg p-4 bg-gray-50 hover:border-blue-500 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-blue-900">{course.code}</h3>
                                                    <span className="bg-blue-100 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded uppercase">Sec {course.section}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-4 font-semibold line-clamp-2">{course.title}</p>
                                                <button onClick={() => router.push(`/faculty/manage/${course.code}/${course.section}`)} className="w-full bg-blue-900 text-white py-2 rounded text-[10px] font-bold hover:bg-orange-500 transition-colors uppercase tracking-widest">Manage Marks</button>
                                            </div>
                                        )) : <p className="col-span-2 text-center text-gray-400 italic py-4">No theory subjects assigned.</p>}
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600">
                                    <h2 className="text-xl font-bold mb-4 text-purple-900 flex items-center gap-2"><Beaker className="text-purple-600" /> My Lab Subjects</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {labCourses.length > 0 ? labCourses.map((lab) => (
                                            <div key={lab.id} className="border rounded-lg p-4 bg-purple-50/30 hover:border-purple-500 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-purple-900">{lab.code}</h3>
                                                    <span className="bg-purple-100 text-purple-700 text-[9px] font-black px-2 py-0.5 rounded uppercase">Sec {lab.section}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-4 font-semibold line-clamp-2">{lab.title.replace(' (Lab)', '')}</p>
                                                <button onClick={() => router.push(`/faculty/labmanage/${lab.code}/${lab.section}`)} className="w-full bg-purple-600 text-white py-2 rounded text-[10px] font-bold hover:bg-orange-500 transition-colors uppercase tracking-widest">Manage Lab</button>
                                            </div>
                                        )) : <p className="col-span-2 text-center text-gray-400 italic py-4">No lab subjects assigned.</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'advisor' && myClassData && (
                            <div className="space-y-8 animate-in slide-in-from-right duration-500">
                                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2"><ClipboardEdit className="text-orange-500" /> Class Management Portal</h2>
                                        <div className="text-right">
                                            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-tighter">Current Assignment</span>
                                            <span className="text-lg font-black text-orange-600 uppercase">{myClassData.year} Year - Sec {myClassData.section}</span>
                                        </div>
                                    </div>
                                    {updateStatus && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-200 text-center animate-pulse">{updateStatus}</div>}
                                    <div className="overflow-x-auto border rounded-xl mb-8">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b">
                                                <tr>
                                                    <th className="p-4">Roll No</th><th className="p-4">Name</th><th className="p-4">CGPA</th><th className="p-4">Attendance (%)</th><th className="p-4 text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y text-sm">
                                                {advisorStudents.map((stu) => (
                                                    <tr key={stu.roll_no} className="hover:bg-gray-50 transition-colors">
                                                        <td className="p-4 font-mono font-bold text-blue-600">{stu.roll_no}</td>
                                                        <td className="p-4 font-bold text-gray-800">{stu.name}</td>
                                                        <td className="p-4"><input type="number" step="0.01" defaultValue={stu.cgpa} id={`cgpa-${stu.roll_no}`} className="w-16 p-1 border rounded text-xs font-black text-blue-900 outline-none" /></td>
                                                        <td className="p-4"><input type="number" defaultValue={stu.attendance_percentage} id={`att-${stu.roll_no}`} className={`w-16 p-1 border rounded text-xs font-black outline-none ${stu.attendance_percentage < 75 ? 'text-red-600' : 'text-green-600'}`} /></td>
                                                        <td className="p-4 text-center"><button onClick={() => { const cgpa = (document.getElementById(`cgpa-${stu.roll_no}`) as HTMLInputElement).value; const att = (document.getElementById(`att-${stu.roll_no}`) as HTMLInputElement).value; handleUpdateStudentStats(stu.roll_no, Number(cgpa), Number(att)); }} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all"><Save size={16} /></button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col justify-between">
                                            <h4 className="font-black text-blue-900 uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2"><Calendar size={12}/> Timetable</h4>
                                            <button onClick={() => handlePushDoc('Timetable')} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-[10px] uppercase hover:bg-blue-700 transition-all flex items-center justify-center gap-2"><UploadCloud size={14}/> Push</button>
                                        </div>
                                        <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 flex flex-col justify-between">
                                            <h4 className="font-black text-orange-900 uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2"><FilePlus size={12}/> Planner</h4>
                                            <button onClick={() => handlePushDoc('Academic Planner')} className="w-full py-2 bg-orange-500 text-white rounded-lg font-bold text-[10px] uppercase hover:bg-orange-600 transition-all flex items-center justify-center gap-2"><UploadCloud size={14}/> Push</button>
                                        </div>
                                        <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 flex flex-col justify-between">
                                            <h4 className="font-black text-red-900 uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2"><FileText size={12}/> Exam Schedule</h4>
                                            <button onClick={() => handlePushDoc('Exam Timetable')} className="w-full py-2 bg-red-600 text-white rounded-lg font-bold text-[10px] uppercase hover:bg-red-700 transition-all flex items-center justify-center gap-2"><UploadCloud size={14}/> Push</button>
                                        </div>
                                    </div>

                                    {/* NEW: MANAGE LIVE UPLOADS */}
                                    <div className="mt-8 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Live Advisory Documents</h3>
                                        <div className="space-y-2">
                                            {myUploadedDocs.length > 0 ? myUploadedDocs.map((doc) => (
                                                <div key={doc.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100 group">
                                                    <div className="flex items-center gap-3">
                                                        <FileText size={16} className="text-blue-900" />
                                                        <div>
                                                            <p className="text-[11px] font-bold text-blue-900">{doc.title}</p>
                                                            <p className="text-[9px] text-gray-400 uppercase font-black">{doc.type}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleDeleteDoc(doc.id)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-md transition-all">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )) : <p className="text-center py-4 text-[10px] text-gray-400 uppercase font-bold tracking-widest italic">No active documents for this section.</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-orange-500">
                            <h2 className="text-xl font-bold mb-4 text-blue-900 flex items-center gap-2"><Megaphone className="text-orange-500" /> Notify My Students</h2>
                            {message && <p className="mb-4 p-2 bg-green-100 text-green-700 rounded text-xs text-center font-bold">{message}</p>}
                            <form onSubmit={handlePostAnnouncement} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input className="p-2 border rounded outline-none font-medium" placeholder="Headline..." value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} required />
                                    <select value={newAnnouncement.section} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, section: e.target.value })} className="p-2 border rounded bg-gray-50 font-bold text-xs">
                                        <option value="All">Target: All Sections</option>
                                        <option value="A">Section A Only</option>
                                        <option value="B">Section B Only</option>
                                        <option value="C">Section C Only</option>
                                    </select>
                                </div>
                                <textarea className="w-full p-2 border rounded outline-none h-20 font-medium" placeholder="Announcement details..." value={newAnnouncement.content} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} required />
                                <button type="submit" className="w-full bg-orange-500 text-white font-bold py-2 rounded hover:bg-orange-600 transition uppercase text-xs tracking-widest shadow-md">Broadcast Notice</button>
                            </form>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-12">
                            <div onClick={() => router.push("/faculty/Progress")} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-600 cursor-pointer hover:shadow-lg transition-all group">
                                <div className="flex items-center justify-between">
                                    <div><h2 className="text-lg font-bold text-green-900 flex items-center gap-2">Update Progress</h2><p className="text-xs text-gray-600 mt-1 font-medium italic">Record academic metrics.</p></div>
                                    <ChevronRight size={20} className="text-green-600 group-hover:translate-x-1 transition-transform" />
                                </div>
                                {latestReport && (
                                    <div className="mt-3 p-2 bg-indigo-50 border border-indigo-100 rounded">
                                        <p className="text-[10px] font-bold text-indigo-900">Latest PDF Generated</p>
                                        <a href={latestReport.pdf_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue-700 underline font-bold text-[10px]">Quick View</a>
                                    </div>
                                )}
                            </div>
                            <div onClick={() => router.push("/faculty/reports")} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-600 cursor-pointer hover:shadow-lg transition-all group">
                                <div className="flex items-center justify-between">
                                    <div><h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2"><FileText size={18} className="text-indigo-600" /> Report History</h2><p className="text-xs text-gray-600 mt-1 font-medium italic">Manage generated PDFs.</p></div>
                                    <ChevronRight size={20} className="text-indigo-600 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}