/**
 * Campus Connect - Initial Seed Data & Mock Database
 * Software Engineering Lab Project
 */

const DEFAULT_USERS = [
  {
    id: "usr_student_1",
    name: "Alex Rivera",
    email: "student@campus.edu",
    password: "password123",
    role: "student", // student, faculty, admin
    department: "Computer Science & Engineering",
    year: "3rd Year (Class of '25)",
    avatar: "AR",
    avatarBg: "#4f46e5",
    connectionsCount: 42,
    connectedUserIds: ["usr_student_2", "usr_student_3", "usr_faculty_1"],
    postsCount: 15,
    facultyAdvisor: "Dr. Meera Kapoor",
    bio: "Passionate about Full-Stack Web Development, Cloud Computing, and Open Source. Currently working on SE Lab project CampusConnect.",
    skills: ["JavaScript", "Python", "React", "Data Structures", "Git"],
    github: "github.com/alexrivera",
    linkedin: "linkedin.com/in/alexrivera",
    rollNo: "CS21B042",
    status: "Active"
  },
  {
    id: "usr_student_2",
    name: "Jane Doe",
    email: "jane.doe@campus.edu",
    password: "password123",
    role: "student",
    department: "Artificial Intelligence & Data Science",
    year: "2nd Year",
    avatar: "JD",
    avatarBg: "#818cf8",
    connectionsCount: 38,
    connectedUserIds: ["usr_student_1", "usr_faculty_2"],
    postsCount: 9,
    facultyAdvisor: "Dr. Arjun Rao",
    bio: "AI enthusiast exploring deep learning, computer vision, and neural networks. MLSA core team member.",
    skills: ["Python", "PyTorch", "Pandas", "Scikit-Learn"],
    github: "github.com/janedoe",
    linkedin: "linkedin.com/in/janedoe",
    rollNo: "AI22B019",
    status: "Active"
  },
  {
    id: "usr_student_3",
    name: "John Smith",
    email: "john.smith@campus.edu",
    password: "password123",
    role: "student",
    department: "Electrical & Electronics Engineering",
    year: "3rd Year",
    avatar: "JS",
    avatarBg: "#6366f1",
    connectionsCount: 56,
    connectedUserIds: ["usr_student_1"],
    postsCount: 12,
    facultyAdvisor: "Prof. Kavita Menon",
    bio: "Embedded systems & IoT hobbyist. Robotics Club lead hardware developer.",
    skills: ["Embedded C", "Arduino", "Circuit Design", "IoT", "MATLAB"],
    github: "github.com/johnsmith",
    linkedin: "linkedin.com/in/johnsmith",
    rollNo: "EE21B088",
    status: "Active"
  },
  {
    id: "usr_faculty_1",
    name: "Dr. Meera Kapoor",
    email: "faculty@campus.edu",
    password: "password123",
    role: "faculty",
    department: "Computer Science & Engineering",
    year: "Associate Professor",
    avatar: "MK",
    avatarBg: "#10b981",
    connectionsCount: 128,
    connectedUserIds: ["usr_student_1"],
    postsCount: 24,
    facultyAdvisor: "Head of AI & Systems Lab",
    bio: "Associate Professor in CSE. Supports student projects, mentoring, research publications, and department activities.",
    skills: ["Distributed Systems", "Software Engineering", "Cloud Architecture", "Research Mentoring"],
    github: "github.com/dr-meera-kapoor",
    linkedin: "linkedin.com/in/meera-kapoor",
    rollNo: "FAC-CS-104",
    status: "Active"
  },
  {
    id: "usr_faculty_2",
    name: "Dr. Arjun Rao",
    email: "arjun.rao@campus.edu",
    password: "password123",
    role: "faculty",
    department: "Artificial Intelligence & Data Science",
    year: "Professor & Dean Academics",
    avatar: "AR",
    avatarBg: "#059669",
    connectionsCount: 210,
    postsCount: 31,
    facultyAdvisor: "Dean of Academic Affairs",
    bio: "Professor in AI & DS. Research focus on Natural Language Processing and Responsible AI.",
    skills: ["NLP", "Machine Learning", "Academic Curriculum", "Data Ethics"],
    github: "github.com/arjunrao-ai",
    linkedin: "linkedin.com/in/arjun-rao",
    rollNo: "FAC-AI-101",
    status: "Active"
  },
  {
    id: "usr_admin_1",
    name: "Campus Administrator",
    email: "admin@campus.edu",
    password: "password123",
    role: "admin",
    department: "Campus Administration & IT Services",
    year: "System Administrator",
    avatar: "CA",
    avatarBg: "#4338ca",
    connectionsCount: 350,
    postsCount: 45,
    facultyAdvisor: "Office of Registrar",
    bio: "Central System Administrator for Campus Connect portal. Managing college events, clubs, user verifications, and announcements.",
    skills: ["Portal Management", "User Verification", "Event Moderation", "Campus IT"],
    github: "github.com/campus-admin",
    linkedin: "linkedin.com/company/campus-connect",
    rollNo: "ADM-IT-001",
    status: "Active"
  }
];

const DEFAULT_POSTS = [
  {
    id: "post_1",
    userId: "usr_student_2",
    authorName: "Jane Doe",
    authorRole: "Student",
    authorDept: "AI & Data Science",
    authorAvatar: "JD",
    authorBg: "#818cf8",
    content: "Looking for a study group for the upcoming Data Structures midterm! Anyone interested?",
    timestamp: "2 hours ago",
    likes: 12,
    likedBy: [],
    comments: [
      { id: "c1", author: "John Smith", text: "Count me in! Let's meet at Central Library tomorrow at 4 PM.", timestamp: "1 hour ago" },
      { id: "c2", author: "Alex Rivera", text: "I can share my notes on Graph Algorithms and Heaps.", timestamp: "45 mins ago" },
      { id: "c3", author: "Jane Doe", text: "Awesome! Setting up a group on the Library 2nd floor.", timestamp: "30 mins ago" }
    ],
    photo: null,
    isAnnouncement: false
  },
  {
    id: "post_2",
    userId: "usr_student_3",
    authorName: "John Smith",
    authorRole: "Student",
    authorDept: "Electrical Engineering",
    authorAvatar: "JS",
    authorBg: "#6366f1",
    content: "The new cafeteria menu is amazing today. Highly recommend the pasta bar!",
    timestamp: "5 hours ago",
    likes: 45,
    likedBy: [],
    comments: [
      { id: "c4", author: "Alex Rivera", text: "Totally agree! The garlic bread is top notch too.", timestamp: "3 hours ago" }
    ],
    photo: null,
    isAnnouncement: false
  },
  {
    id: "post_3",
    userId: "usr_faculty_1",
    authorName: "Dr. Meera Kapoor",
    authorRole: "Faculty",
    authorDept: "Computer Science & Engineering",
    authorAvatar: "MK",
    authorBg: "#10b981",
    content: "📢 Official Notice: Submissions for the Software Engineering Lab Mini-Projects are due this Friday by 5:00 PM. Please ensure your project repository and documentation are updated.",
    timestamp: "8 hours ago",
    likes: 64,
    likedBy: [],
    comments: [
      { id: "c5", author: "Jane Doe", text: "Thank you ma'am, will submit by Thursday evening.", timestamp: "7 hours ago" },
      { id: "c6", author: "Alex Rivera", text: "Should the presentation slides also be included in the submission folder?", timestamp: "6 hours ago" },
      { id: "c7", author: "Dr. Meera Kapoor", text: "Yes Alex, please attach the PDF of slides in the root directory.", timestamp: "5 hours ago" }
    ],
    photo: null,
    isAnnouncement: true
  },
  {
    id: "post_4",
    userId: "usr_student_1",
    authorName: "Alex Rivera",
    authorRole: "Student",
    authorDept: "Computer Science '25",
    authorAvatar: "AR",
    authorBg: "#4f46e5",
    content: "Completed the CampusConnect login and profile templates for SE Lab.",
    timestamp: "1 day ago",
    likes: 8,
    likedBy: [],
    comments: [
      { id: "c8", author: "Dr. Meera Kapoor", text: "Great progress Alex! Keep the interface clean and user-friendly.", timestamp: "1 day ago" },
      { id: "c9", author: "Jane Doe", text: "Looks super neat! Can't wait to test the clubs module.", timestamp: "20 hours ago" }
    ],
    photo: null,
    isAnnouncement: false
  }
];

const DEFAULT_EVENTS = [
  {
    id: "evt_1",
    title: "Campus Innovation Hackathon",
    status: "Upcoming", // Upcoming, Ongoing, Completed
    category: "Competition & Innovation",
    date: "OCT 29",
    fullDate: "October 29, 2026",
    time: "9:00 AM - 6:00 PM",
    location: "Innovation Hub",
    description: "Build creative solutions with students from every department. Cash prizes, mentorship, and incubator opportunities.",
    organizer: "Dr. Meera Kapoor (CSE Dept)",
    attendees: 86,
    isAttending: false
  },
  {
    id: "evt_2",
    title: "Founders' Day Celebration",
    status: "Upcoming",
    category: "College Festival",
    date: "NOV 05",
    fullDate: "November 05, 2026",
    time: "4:00 PM onwards",
    location: "Central Quadrangle",
    description: "Celebrate our college community with performances, food stalls, department awards, and alumni networking.",
    organizer: "Student Council & Dean of Affairs",
    attendees: 320,
    isAttending: false
  },
  {
    id: "evt_3",
    title: "Inter-Department Sports Meet",
    status: "Ongoing",
    category: "Sports & Athletics",
    date: "OCT 26-27",
    fullDate: "October 26-27, 2026",
    time: "All day",
    location: "College Sports Ground",
    description: "Cheer on college teams in the annual athletics and games festival. Football, Basketball, Badminton, and Track events.",
    organizer: "Physical Education Dept",
    attendees: 195,
    isAttending: true
  },
  {
    id: "evt_4",
    title: "Library Research & Book Fair",
    status: "Ongoing",
    category: "Academic & Research",
    date: "OCT 26",
    fullDate: "October 26, 2026",
    time: "Until 5:00 PM",
    location: "Central Library",
    description: "Explore new academic resources, journals, digital archives, and meet visiting authors and research scholars.",
    organizer: "Central Library Committee",
    attendees: 112,
    isAttending: false
  },
  {
    id: "evt_5",
    title: "Green Campus Volunteer Day",
    status: "Completed",
    category: "Community Service",
    date: "OCT 20",
    fullDate: "October 20, 2026",
    time: "Completed",
    location: "Botanical Garden",
    description: "Students and staff came together to plant trees and clean up green areas across campus.",
    organizer: "EcoCampus Club",
    attendees: 74,
    isAttending: false
  },
  {
    id: "evt_6",
    title: "AI & Future of Work Talk",
    status: "Completed",
    category: "Guest Lecture",
    date: "OCT 18",
    fullDate: "October 18, 2026",
    time: "Completed",
    location: "Main Auditorium",
    description: "A college lecture and discussion with technology industry guests on career paths in machine learning.",
    organizer: "ACM Student Chapter & MLSA",
    attendees: 240,
    isAttending: false
  }
];

const DEFAULT_CLUBS = [
  {
    id: "club_1",
    tag: "TECHNOLOGY",
    name: "Microsoft Learn Student Ambassadors (MLSA)",
    description: "Learn cloud and developer technologies through hands-on workshops, hackathons, and real-world projects.",
    lead: "Jane Doe",
    members: 142,
    isJoined: true,
    meetingTime: "Every Thursday, 4:30 PM",
    room: "Lab 3B, Tech Block"
  },
  {
    id: "club_2",
    tag: "ENGINEERING",
    name: "IEEE Student Branch",
    description: "Connect with engineers and take part in technical talks, national paper presentations, and competitions.",
    lead: "John Smith",
    members: 185,
    isJoined: false,
    meetingTime: "Alternate Wednesdays, 5:00 PM",
    room: "Seminar Hall 2"
  },
  {
    id: "club_3",
    tag: "COMPUTING",
    name: "ACM Student Chapter",
    description: "Practice problem-solving, competitive programming, algorithmic puzzles, and computer science research.",
    lead: "Alex Rivera",
    members: 210,
    isJoined: true,
    meetingTime: "Tuesdays & Fridays, 5:00 PM",
    room: "Coding Arena, CSE Dept"
  },
  {
    id: "club_4",
    tag: "INNOVATION",
    name: "Robotics & Makers Club",
    description: "Design, build, and test autonomous robots, drones, and hands-on engineering hardware projects.",
    lead: "Rohan Varma",
    members: 98,
    isJoined: false,
    meetingTime: "Saturdays, 10:00 AM",
    room: "Makerspace, Mechanical Block"
  },
  {
    id: "club_5",
    tag: "COMMUNITY",
    name: "EcoCampus Club",
    description: "Make campus more sustainable through green awareness drives, tree plantation, and volunteer activities.",
    lead: "Ananya Sharma",
    members: 115,
    isJoined: false,
    meetingTime: "Every Monday, 4:00 PM",
    room: "Botanical Gazebo"
  },
  {
    id: "club_6",
    tag: "ARTS & CULTURE",
    name: "Campus Arts Society",
    description: "Share your talents in music, fine art, theatre, dance, creative writing, and visual arts production.",
    lead: "Vikram Malhotra",
    members: 160,
    isJoined: false,
    meetingTime: "Fridays, 4:30 PM",
    room: "Cultural Auditorium"
  }
];

const DEFAULT_INQUIRIES = [
  {
    id: "inq_1",
    studentId: "usr_student_1",
    studentName: "Alex Rivera",
    studentEmail: "student@campus.edu",
    facultyId: "usr_faculty_1",
    facultyName: "Dr. Meera Kapoor",
    subject: "SE Lab Mini-Project Guidance - Campus Connect Architecture",
    message: "Respected Ma'am, we have finalized the schema and wireframes for Campus Connect. Would you be available for a 15-minute review tomorrow during office hours?",
    status: "Approved", // Pending, Approved, Resolved
    reply: "Yes Alex, please drop by my office at 3:30 PM tomorrow.",
    date: "Oct 28, 2026"
  },
  {
    id: "inq_2",
    studentId: "usr_student_2",
    studentName: "Jane Doe",
    studentEmail: "jane.doe@campus.edu",
    facultyId: "usr_faculty_1",
    facultyName: "Dr. Meera Kapoor",
    subject: "Summer Research Internship in Distributed Systems",
    message: "Dear Dr. Kapoor, I would love to contribute to your ongoing distributed AI research project. I have attached my CV and GitHub portfolio.",
    status: "Pending",
    reply: null,
    date: "Oct 29, 2026"
  }
];

const DEFAULT_EVENT_REGISTRATIONS = [
  {
    id: "reg_1",
    eventId: "evt_1",
    eventTitle: "Campus Innovation Hackathon",
    studentId: "usr_student_1",
    studentName: "Alex Rivera",
    studentEmail: "student@campus.edu",
    studentRoll: "CS21B042",
    studentDept: "Computer Science & Engineering",
    appliedDate: "Oct 27, 2026",
    status: "Approved", // Pending, Approved, Rejected
    reviewNote: "Team lead for project Campus Connect. Approved by Dr. Meera Kapoor."
  },
  {
    id: "reg_2",
    eventId: "evt_1",
    eventTitle: "Campus Innovation Hackathon",
    studentId: "usr_student_2",
    studentName: "Jane Doe",
    studentEmail: "jane.doe@campus.edu",
    studentRoll: "AI22B019",
    studentDept: "Artificial Intelligence & Data Science",
    appliedDate: "Oct 28, 2026",
    status: "Pending",
    reviewNote: ""
  },
  {
    id: "reg_3",
    eventId: "evt_1",
    eventTitle: "Campus Innovation Hackathon",
    studentId: "usr_student_3",
    studentName: "John Smith",
    studentEmail: "john.smith@campus.edu",
    studentRoll: "EE21B088",
    studentDept: "Electrical Engineering",
    appliedDate: "Oct 28, 2026",
    status: "Pending",
    reviewNote: ""
  },
  {
    id: "reg_4",
    eventId: "evt_3",
    eventTitle: "Inter-Department Sports Meet",
    studentId: "usr_student_3",
    studentName: "John Smith",
    studentEmail: "john.smith@campus.edu",
    studentRoll: "EE21B088",
    studentDept: "Electrical Engineering",
    appliedDate: "Oct 25, 2026",
    status: "Approved",
    reviewNote: "Confirmed for Football & Badminton."
  },
  {
    id: "reg_5",
    eventId: "evt_2",
    eventTitle: "Founders' Day Celebration",
    studentId: "usr_student_2",
    studentName: "Jane Doe",
    studentEmail: "jane.doe@campus.edu",
    studentRoll: "AI22B019",
    studentDept: "Artificial Intelligence & Data Science",
    appliedDate: "Oct 29, 2026",
    status: "Approved",
    reviewNote: "Cultural Society volunteer badge allotted."
  }
];

// Initialize Storage if not already populated
function initCampusConnectStorage() {
  if (!localStorage.getItem("cc_users")) {
    localStorage.setItem("cc_users", JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem("cc_posts")) {
    localStorage.setItem("cc_posts", JSON.stringify(DEFAULT_POSTS));
  }
  if (!localStorage.getItem("cc_events")) {
    localStorage.setItem("cc_events", JSON.stringify(DEFAULT_EVENTS));
  }
  if (!localStorage.getItem("cc_clubs")) {
    localStorage.setItem("cc_clubs", JSON.stringify(DEFAULT_CLUBS));
  }
  if (!localStorage.getItem("cc_inquiries")) {
    localStorage.setItem("cc_inquiries", JSON.stringify(DEFAULT_INQUIRIES));
  }
  if (!localStorage.getItem("cc_event_registrations")) {
    localStorage.setItem("cc_event_registrations", JSON.stringify(DEFAULT_EVENT_REGISTRATIONS));
  }
  // Default logged in user: student
  if (!localStorage.getItem("cc_current_user_id")) {
    localStorage.setItem("cc_current_user_id", "usr_student_1");
  }
}

// Reset data to defaults
function resetCampusConnectStorage() {
  localStorage.setItem("cc_users", JSON.stringify(DEFAULT_USERS));
  localStorage.setItem("cc_posts", JSON.stringify(DEFAULT_POSTS));
  localStorage.setItem("cc_events", JSON.stringify(DEFAULT_EVENTS));
  localStorage.setItem("cc_clubs", JSON.stringify(DEFAULT_CLUBS));
  localStorage.setItem("cc_inquiries", JSON.stringify(DEFAULT_INQUIRIES));
  localStorage.setItem("cc_event_registrations", JSON.stringify(DEFAULT_EVENT_REGISTRATIONS));
  localStorage.setItem("cc_current_user_id", "usr_student_1");
  localStorage.removeItem("cc_logged_out");
}

// Run storage init immediately
initCampusConnectStorage();
