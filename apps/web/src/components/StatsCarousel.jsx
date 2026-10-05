import { Stethoscope, Calendar, Users, FileText, Award } from "lucide-react";

const StatsCarousel = () => {
  const services = [
    { icon: Calendar, label: "Book Appointments", description: "Schedule appointments with trusted doctors" },
    { icon: Stethoscope, label: "Find Doctors", description: "Browse verified doctors by speciality" },
    { icon: Users, label: "Hospital & Clinics", description: "Discover top-rated healthcare facilities" },
    { icon: FileText, label: "Health Blogs", description: "Read health tips from medical experts" },
    { icon: Award, label: "Verified Ratings", description: "See patient reviews and ratings" },
  ];

  return (
    <div className="my-8 md:mx-10">
      <div className="overflow-hidden rounded-lg p-6">
        <div className="flex gap-8 animate-scroll">
          {[...services, ...services].map((item, index) => (
            <div
              key={index}
              className="flex-shrink-0 min-w-max flex items-center gap-4 bg-background-card px-6 py-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <item.icon size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {item.label}
                </p>
                <p className="text-xs text-text-secondary">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default StatsCarousel;
