'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DotGrid from '@/components/DotGrid';
import { API_URL } from '@/config';
import axios from 'axios';
import peekImage from "@/public/peek.jpg";
import MagicBento from '@/components/MagicBento';

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
}

interface Company {
  id: number;
  name: string;
  logo_url: string;
}

interface PlacedStudent {
  id: number;
  name: string;
  dept: string;
  lpa: number;
  company_name: string;
  photo_url: string;
  linkedin?: string;
}

const heroImages = [
  '/college-bg-1.jpg',
  '/college-bg-2.jpg',
  '/college-bg-3.jpg',
];

const aboutImages = [
  peekImage.src,
  '/college-bg-1.jpg',
  '/college-bg-2.jpg',
  '/college-bg-3.jpg',
];

export default function Home() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [placements, setPlacements] = useState<PlacedStudent[]>([]);
  const [currentBg, setCurrentBg] = useState(0);
  const [currentAboutImage, setCurrentAboutImage] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<PlacedStudent | null>(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes gradientRotate {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAboutImage((prev) => (prev + 1) % aboutImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      const heroGlass = document.getElementById("hero-glass");
      const heroLight = document.getElementById("hero-light");
      const aboutCard = document.getElementById('about-card');
      const aboutLight = document.getElementById('about-light');
      if (heroGlass && heroLight) {
        const rect = heroGlass.getBoundingClientRect();
        heroLight.style.setProperty("--x", `${e.clientX - rect.left}px`);
        heroLight.style.setProperty("--y", `${e.clientY - rect.top}px`);
      }
      if (aboutCard && aboutLight) {
        const rect = aboutCard.getBoundingClientRect();
        aboutLight.style.setProperty('--x', `${e.clientX - rect.left}px`);
        aboutLight.style.setProperty('--y', `${e.clientY - rect.top}px`);
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [annRes, compRes, placeRes] = await Promise.all([
          axios.get(`${API_URL}/announcements?type=Global`),
          axios.get(`${API_URL}/companies`),
          axios.get(`${API_URL}/placed-students`)
        ]);
        setAnnouncements(annRes.data);
        setCompanies(compRes.data);
        setPlacements(placeRes.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, []);

  const triggerCelebration = () => {
    const colors = ['#f97316', '#fb923c', '#fed7aa', '#0ea5e9', '#60a5fa', '#a78bfa', '#f472b6'];
    for (let i = 0; i < 130; i++) {
      const particle = document.createElement('div');
      particle.className = 'celebration-particle';
      particle.style.position = 'fixed';
      particle.style.width = `${6 + Math.random() * 14}px`;
      particle.style.height = particle.style.width;
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particle.style.borderRadius = Math.random() > 0.6 ? '50%' : '4px';
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '9999';
      particle.style.opacity = '0.95';
      particle.style.left = i % 2 === 0 ? '-5%' : '105%';
      particle.style.top = `${-10 + Math.random() * 30}vh`;
      document.body.appendChild(particle);
      const angle = (Math.random() * Math.PI * 2) - Math.PI / 4;
      const distance = 600 + Math.random() * 800;
      const duration = 1.8 + Math.random() * 1.6;
      particle.animate(
        [
          { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
          {
            transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0.2) rotate(${Math.random() * 720 - 360}deg)`,
            opacity: 0
          }
        ],
        {
          duration: duration * 1000,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }
      );
      setTimeout(() => {
        if (particle.parentNode) particle.remove();
      }, duration * 1000 + 200);
    }
  };

  const openStudentModal = (student: PlacedStudent) => {
    triggerCelebration();
    setSelectedStudent(student);
  };

  const closeModal = () => {
    setSelectedStudent(null);
  };

  const nextAboutImage = () => {
    setCurrentAboutImage((prev) => (prev + 1) % aboutImages.length);
  };

  const prevAboutImage = () => {
    setCurrentAboutImage((prev) => (prev - 1 + aboutImages.length) % aboutImages.length);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative text-white py-24 overflow-hidden z-20">
          {heroImages.map((img, index) => (
            <div
              key={img}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === currentBg ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url('${img}')` }}
            />
          ))}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-orange-500 to-transparent z-10"></div>
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-orange-400/60 via-orange-400/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-blue-700/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-blue-700/30 overflow-hidden">
            <div className="absolute top-0 left-[-50%] w-[250%] h-full bg-white/40 blur-2xl transform rotate-[25deg] animate-shine"></div>
          </div>
          <div id="hero-glass" className="absolute inset-0 pointer-events-none">
            <div id="hero-light" />
          </div>
          <div className="relative container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">Vel Tech High Tech</h1>
            <p className="text-xl md:text-2xl mb-8 font-light drop-shadow-md">
              Dr. Rangarajan Dr. Sakunthala Engineering College
            </p>
            <Link href="/login">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Department of Artificial Intelligence & Data Science
              </button>
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
        </section>

        {/* PLACED STUDENTS MARQUEE */}
        <section className="py-16 overflow-hidden border-b relative bg-white">
          <div className="container mx-auto px-4 mb-10 text-center relative z-10">
            <h2 className="text-3xl font-bold text-blue-900">Our Placed Students</h2>
            <div className="w-20 h-1 bg-orange-500 mx-auto mt-2 rounded-full"></div>
          </div>
          <div className="marquee-wrapper py-6 relative z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-300 via-white to-orange-300 z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-200/50 via-transparent to-orange-200/50 z-0"></div>

            <div className="animate-marquee flex gap-8 px-6 relative z-10">
              {[...placements, ...placements].map((student, index) => (
                <MagicBento
                  key={index}
                  textAutoHide={true}
                  enableStars={false}
                  enableSpotlight={true}
                  enableBorderGlow={true}
                  enableTilt={false}
                  enableMagnetism={false}
                  clickEffect={true}
                  spotlightRadius={220}
                  particleCount={8}
                  glowColor="0, 102, 255"
                  disableAnimations={false}
                >
                  <div
                    onClick={() => openStudentModal(student)}
                    className="relative min-w-[320px] bg-white backdrop-blur-lg rounded-xl shadow-xl flex items-center gap-5 p-5 cursor-pointer transition-all duration-500 group overflow-hidden"
                    style={{
                      border: '3px solid transparent',
                      backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #bfdbfe, #93c5fd, #60a5fa, #93c5fd, #bfdbfe)',
                      backgroundOrigin: 'border-box',
                      backgroundClip: 'padding-box, border-box',
                    }}
                  >
                    {/* LinkedIn icon in top right */}
                    {student.linkedin && (
                      <a
                        href={student.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-4 right-4 z-30 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg group/linkedin"
                        title="View LinkedIn Profile"
                      >
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    )}

                    <div
                      className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-75 blur-sm transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: 'linear-gradient(45deg, #bfdbfe, #93c5fd, #60a5fa, #93c5fd, #bfdbfe)',
                        backgroundSize: '400% 400%',
                        animation: 'gradientRotate 3s ease infinite',
                      }}
                    />

                    <div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: 'linear-gradient(110deg, transparent 0%, transparent 40%, rgba(255, 255, 255, 0.8) 50%, transparent 60%, transparent 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 2s infinite linear',
                      }}
                    />

                    <div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        boxShadow: '0 0 20px rgba(96, 165, 250, 0.4), 0 0 40px rgba(96, 165, 250, 0.2), inset 0 0 20px rgba(147, 197, 253, 0.1)',
                      }}
                    />

                    <img
                      src={student.photo_url}
                      alt={student.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-blue-200 shadow-lg flex-shrink-0 relative z-10 transition-all duration-500 group-hover:border-blue-400 group-hover:shadow-2xl group-hover:scale-110"
                    />
                    <div className="flex flex-col relative z-10 flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-lg leading-tight transition-colors duration-300 group-hover:text-blue-500 truncate max-w-[140px]">
                        {student.name}
                      </h4>
                      <p className="text-sm text-blue-600 font-medium transition-colors duration-300 group-hover:text-blue-700">
                        {student.dept}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 transition-colors duration-300 group-hover:text-gray-800 truncate max-w-[140px]">
                        Placed at <span className="font-semibold text-gray-800 group-hover:text-blue-500">{student.company_name}</span>
                      </p>
                      <div className="mt-2 inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 transition-all duration-300 group-hover:bg-blue-100 group-hover:text-blue-800 group-hover:border-blue-300 group-hover:shadow-md">
                        {student.lpa} LPA
                      </div>
                    </div>
                  </div>
                </MagicBento>
              ))}
            </div>
          </div>
        </section>

        {/* DEPARTMENT NEWS SECTION WITH CHECKERBOARD PATTERNS */}
        <section className="py-20 bg-white/70 backdrop-blur-sm relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
          
          {/* LEFT SIDE CHECKERBOARD PATTERN */}
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 pointer-events-none z-0 opacity-10">
            <div className="relative w-full h-full">
              {/* Checkerboard grid */}
              <div className="absolute inset-0 flex flex-col">
                {Array.from({ length: 20 }).map((_, rowIndex) => (
                  <div key={rowIndex} className="flex flex-1">
                    {Array.from({ length: 4 }).map((_, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`flex-1 ${
                          (rowIndex + colIndex) % 2 === 0 
                            ? 'bg-orange-500' 
                            : 'bg-blue-500'
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent"></div>
              
              {/* Border accent */}
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-orange-500 to-transparent"></div>
            </div>
          </div>

          {/* RIGHT SIDE CHECKERBOARD PATTERN */}
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 pointer-events-none z-0 opacity-10">
            <div className="relative w-full h-full">
              {/* Checkerboard grid (mirrored) */}
              <div className="absolute inset-0 flex flex-col">
                {Array.from({ length: 20 }).map((_, rowIndex) => (
                  <div key={rowIndex} className="flex flex-1">
                    {Array.from({ length: 4 }).map((_, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`flex-1 ${
                          (rowIndex + colIndex) % 2 === 0 
                            ? 'bg-blue-900' 
                            : 'bg-orange-900'
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-l from-white via-transparent to-transparent"></div>
              
              {/* Border accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-blue-500 to-transparent"></div>
            </div>
          </div>

          
          

          {/* CORNER ACCENTS */}
          <div className="absolute top-4 left-4 w-4 h-4 border-2 border-orange-500 opacity-20"></div>
          <div className="absolute top-4 right-4 w-4 h-4 border-2 border-blue-500 opacity-20"></div>
          <div className="absolute bottom-4 left-4 w-4 h-4 border-2 border-blue-500 opacity-20"></div>
          <div className="absolute bottom-4 right-4 w-4 h-4 border-2 border-orange-500 opacity-20"></div>

          <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
            <div className="w-full max-w-4xl">
              <h2 className="text-4xl font-bold text-center mb-10 text-blue-900 relative">
                Department News
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 rounded-full"></div>
              </h2>
              <MagicBento
                textAutoHide={true}
                enableStars={true}
                enableSpotlight={true}
                enableBorderGlow={true}
                enableTilt={false}
                enableMagnetism={false}
                clickEffect={true}
                spotlightRadius={400}
                particleCount={10}
                glowColor="249, 115, 22"
                disableAnimations={false}
              >
                <div className="overflow-y-auto h-[520px] scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-gray-200/40 p-6 space-y-6">
                  {announcements.length > 0 ? (
                    announcements.map((ann) => (
                      <div
                        key={ann.id}
                        className="group relative bg-white/90 p-6 rounded-xl border border-transparent hover:border-orange-400 transition-all duration-300 hover:shadow-lg backdrop-blur-sm"
                      >
                        <div className="absolute inset-[-2px] rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 opacity-0 group-hover:opacity-10 blur-sm transition duration-500 -z-10" />
                        <h3 className="font-bold text-xl mb-3 text-gray-900">{ann.title}</h3>
                        <p className="text-gray-700 leading-relaxed">{ann.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-12">No announcements at the moment.</div>
                  )}
                </div>
              </MagicBento>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION WITH COOL IMAGE SLIDER */}
        <section className="py-16 bg-white/60 backdrop-blur-sm relative">
          <div className="absolute inset-0 pointer-events-none z-0">
            <DotGrid
              dotSize={5}
              gap={15}
              baseColor="#ff6600"
              activeColor="#1803dc"
              proximity={120}
              speedTrigger={100}
              shockRadius={250}
              shockStrength={5}
              maxSpeed={5000}
              resistance={750}
              returnDuration={1.5}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div id="about-card" className="relative bg-gray-200/70 backdrop-blur-xl p-10 rounded-2xl shadow-xl">
              <div id="about-light" className="pointer-events-none absolute inset-0 rounded-2xl" style={{ background: `radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(139, 139, 139, 0.92) 0%, transparent 80%)`, mixBlendMode: "overlay" }} />
              <h2 className="text-3xl font-bold text-center mb-8 text-blue-900 relative z-10">About Our College</h2>
              <p className="text-gray-700 max-w-4xl mx-auto text-center leading-relaxed relative z-10 mb-8">
                Vel Tech High Tech Dr. Rangarajan Dr. Sakunthala Engineering College was established in 2002 by Col. Prof. Vel. Dr. R. Rangarajan and Dr. Sagunthala Rangarajan under the R.S. Trust. Located in Avadi, Chennai, it began as a minority institution approved by AICTE and affiliated with Anna University, initially focusing on Electrical and Electronics Engineering, Electronics and Communication Engineering, and Civil Engineering
              </p>

              {/* Cool Image Slider */}
              <div className="relative z-10 max-w-4xl mx-auto">
                <div className="relative overflow-hidden rounded-xl shadow-2xl group">
                  <div className="relative h-[400px]">
                    {aboutImages.map((img, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                          index === currentAboutImage
                            ? 'opacity-100 scale-100 translate-x-0'
                            : index < currentAboutImage
                            ? 'opacity-0 scale-95 -translate-x-full'
                            : 'opacity-0 scale-95 translate-x-full'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`College View ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={prevAboutImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
                    aria-label="Previous image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextAboutImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
                    aria-label="Next image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {aboutImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentAboutImage(index)}
                        className={`transition-all duration-300 rounded-full ${
                          index === currentAboutImage
                            ? 'w-8 h-2 bg-orange-500'
                            : 'w-2 h-2 bg-white/60 hover:bg-white/80'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPANY LOGOS MARQUEE */}
        <section className="relative py-6 overflow-hidden bg-white border-b border-orange-100/30 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-300 via-white to-orange-300 pointer-events-none z-0" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-200/50 via-transparent to-orange-200/50 pointer-events-none z-0" />

          <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
           
          </div>

          <div className="marquee-wrapper py-4 relative z-10">
            <div className="animate-marquee flex items-center gap-16 px-6">
              {[...companies, ...companies, ...companies, ...companies].map((company, index) => (
                <div key={index} className="flex items-center gap-4 min-w-max group">
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="company-logo h-10 w-auto object-contain cursor-pointer"
                  />
                  <span className="text-xs font-bold text-orange-900 uppercase tracking-widest transition group-hover:text-orange-600">
                    {company.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 text-3xl text-gray-600 hover:text-orange-600 transition-colors"
            >
              ×
            </button>
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white text-center">
              <img
                src={selectedStudent.photo_url}
                alt={selectedStudent.name}
                className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-white/40 shadow-xl mb-4"
              />
              <h3 className="text-2xl font-bold">{selectedStudent.name}</h3>
              <p className="text-blue-100 mt-1">{selectedStudent.dept}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-lg text-gray-700">
                  Placed at <strong className="text-blue-700">{selectedStudent.company_name}</strong>
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {selectedStudent.lpa} LPA
                </p>
              </div>
              {selectedStudent.linkedin && (
                <div className="text-center pt-4">
                  <a
                    href={selectedStudent.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-6 py-3 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    Connect on LinkedIn
                  </a>
                </div>
              )}
            </div>
            <div className="bg-gray-50/80 p-4 text-center text-sm text-gray-500 border-t">
              Proud moment for AI & DS Department!
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}