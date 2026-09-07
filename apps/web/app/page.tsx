// @ts-nocheck
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Header from "@/src/components/Header";
import MobileHomeHero from "@/src/components/MobileHomeHero";
import { SplashScreen } from "@healhub/ui/splash";
import StatsButtons from "@/src/components/StatsButtons";
import StatsCarousel from "@/src/components/StatsCarousel";
import SpecialityMenu from "@/src/components/SpecialityMenu";
import Banner from "@/src/components/Banner";
import ApiHealth from "@/src/components/ApiHealth";

const faqs = [
  {
    question: "How do I book an appointment on Healhub?",
    answer:
      "Simply browse through our list of doctors or hospitals/clinics, select your preferred specialist, choose an available time slot, and confirm your booking. You can also filter by speciality, hospital/clinic, or availability.",
  },
  {
    question: "Can I choose which hospital or clinic to visit?",
    answer:
      "Yes! Healhub lets you browse registered hospitals and clinics, view their profiles, specialties, and available doctors. You can book appointments with doctors at your preferred hospital or clinic.",
  },
  {
    question: "How do I view my appointment history?",
    answer:
      "After logging in, navigate to 'My Appointments' from your profile dropdown. You'll see all your past, upcoming, and cancelled appointments along with prescriptions if provided.",
  },
  {
    question: "Is my medical data secure on Healhub?",
    answer:
      "Absolutely. We use industry-standard encryption and secure authentication (JWT) to protect your data. Only you and your authorized healthcare providers can access your medical information.",
  },
  {
    question: "Can I read health-related blogs on Healhub?",
    answer:
      "Yes! Our Blog section features articles written by verified doctors and affiliated hospitals & clinics covering wellness tips, medical insights, and health awareness topics.",
  },
  {
    question: "What if I need to cancel or reschedule?",
    answer:
      "You can cancel an upcoming appointment from the 'My Appointments' page. To reschedule, cancel the existing appointment and book a new slot at your convenience.",
  },
];

const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <div className="bg-background-card border border-border rounded-2xl md:rounded-lg overflow-hidden">
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 text-left hover:bg-background-muted transition-colors touch-none-outline"
    >
      <span className="font-medium text-text-primary text-sm md:text-base">
        {question}
      </span>
      {isOpen ? (
        <ChevronUp className="w-5 h-5 text-text-secondary flex-shrink-0" />
      ) : (
        <ChevronDown className="w-5 h-5 text-text-secondary flex-shrink-0" />
      )}
    </button>
    {isOpen && (
      <div className="px-4 pb-4 text-sm text-text-secondary leading-relaxed">
        {answer}
      </div>
    )}
  </div>
);

const Home = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  return (
    <div>
      <SplashScreen />
      <ApiHealth />
      <div className="hidden md:block">
        <Header />
      </div>
      <MobileHomeHero />
      <StatsButtons />
      <StatsCarousel />
      <SpecialityMenu />
      <Banner />

      {/* FAQs Section */}
      <div className="my-10 md:my-16 md:mx-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-medium text-text-primary">
            Frequently Asked Questions
          </h2>
          <p className="text-text-secondary mt-2 text-sm">
            Find answers to common questions about Healhub
          </p>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openFAQ === index}
              onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
