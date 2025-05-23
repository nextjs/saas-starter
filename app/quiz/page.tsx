import { getUser } from '@/lib/db/queries';
import { Header } from '@/app/(protected-app)/components';
// Import the client-side Quiz component directly
import Quiz from '../../components/Quiz';

export default async function QuizPage() {
  // Próba pobrania informacji o użytkowniku - może być null dla niezalogowanych użytkowników
  const user = await getUser();
  
  // Define quiz questions (could be loaded from props or API)
  const questions = [
    {
      id: 1,
      question: "What is your gender?",
      type: "single_choice",
      options: [
        { label: "Female", value: "female", iconClass: "fa-solid fa-venus" },
        { label: "Male", value: "male", iconClass: "fa-solid fa-mars" },
        { label: "Other", value: "other", iconClass: "fa-solid fa-asterisk" }
      ]
    },
    {
      id: 2,
      question: "What is your age group?",
      type: "single_choice",
      iconClass: "fa-solid fa-user-clock",
      options: [
        { label: "18–24", value: "18_24" },
        { label: "25–34", value: "25_34" },
        { label: "35–44", value: "35_44" },
        { label: "45+", value: "45_plus" }
      ]
    },
    {
      id: 3,
      question: "What is your goal?",
      type: "single_choice",
      iconClass: "fa-solid fa-bullseye",
      options: [
        { label: "Career Growth", value: "career", iconClass: "fa-solid fa-chart-line" },
        { label: "Work–Life Balance", value: "balance", iconClass: "fa-solid fa-scale-balanced" },
        { label: "Grow Wealth", value: "wealth", iconClass: "fa-solid fa-sack-dollar" },
        { label: "Work less", value: "work_less", iconClass: "fa-solid fa-hourglass-half" },
        { label: "More Travel", value: "travel", iconClass: "fa-solid fa-plane" },
        { label: "Pursue My Passion", value: "passion", iconClass: "fa-solid fa-heart" },
        { label: "I don't know yet", value: "not_sure", iconClass: "fa-solid fa-circle-question" }
      ]
    },
    {
      id: 4,
      question: "What is your current income source?",
      type: "single_choice",
      iconClass: "fa-solid fa-money-bill-wave",
      options: [
        { label: "Full-time job", value: "full_time", iconClass: "fa-solid fa-briefcase" },
        { label: "Part-time work", value: "part_time", iconClass: "fa-solid fa-business-time" },
        { label: "Self-employed", value: "self_employed", iconClass: "fa-solid fa-laptop-house" },
        { label: "Currently unemployed", value: "unemployed", iconClass: "fa-solid fa-user-clock" },
        { label: "Retired", value: "retired", iconClass: "fa-solid fa-person-cane" }
      ]
    },
    {
      id: 5,
      question: "How many hours do you typically work each day?",
      type: "single_choice",
      iconClass: "fa-solid fa-clock",
      options: [
        { label: "Less than 4 hours", value: "lt_4", iconClass: "fa-solid fa-hourglass-start" },
        { label: "4–6 hours", value: "4_6", iconClass: "fa-solid fa-hourglass-half" },
        { label: "6–8 hours", value: "6_8", iconClass: "fa-solid fa-hourglass-end" },
        { label: "More than 8 hours", value: "gt_8", iconClass: "fa-solid fa-hourglass" }
      ]
    },
    {
      id: 7,
      question: "What is your current income range?",
      type: "single_choice",
      iconClass: "fa-solid fa-euro-sign",
      options: [
        { label: "Under €10,000 yearly", value: "lt_20000", iconClass: "fa-solid fa-coins" },
        { label: "€10,000 – €30,000 yearly", value: "20k_50k", iconClass: "fa-solid fa-hand-holding-dollar" },
        { label: "€30,000 – €50,000 yearly", value: "30k_50k", iconClass: "fa-solid fa-money-bill" },
        { label: "€50,000 – €80,000 yearly", value: "50k_80k", iconClass: "fa-solid fa-money-bill-wave" },
        { label: "€80,000 – €100,000 yearly", value: "80k_100k", iconClass: "fa-solid fa-money-bills" },
        { label: "Over €100,000 per year", value: "gt_100k", iconClass: "fa-solid fa-money-check-dollar" }
      ]
    },
    {
      id: 8,
      question: "What is your ideal income goal?",
      type: "single_choice",
      iconClass: "fa-solid fa-arrow-trend-up",
      options: [
        { label: "€20,000 – €50,000 yearly", value: "20k_50k", iconClass: "fa-solid fa-chart-simple" },
        { label: "€50,000 – €100,000 yearly", value: "50k_100k", iconClass: "fa-solid fa-chart-line" },
        { label: "€100,000 – €200,000 yearly", value: "100k_200k", iconClass: "fa-solid fa-chart-column" },
        { label: "Over €200,000 per year", value: "gt_200k", iconClass: "fa-solid fa-chart-pie" }
      ]
    },
    {
      id: 9,
      type: "info",
      iconClass: "fa-solid fa-fire fa-5x",
      color: "red",
      title: "Success Is Just Around The Corner!",
      message: "Join countless others who've embraced AI technology to increase earnings, reclaim hours in your day, and achieve greater independence. Your journey begins now!",
      button_label: "Next Step"
    },
    {
      id: 10,
      question: "Is achieving harmony between professional responsibilities and personal time important to you?",
      type: "single_choice",
      iconClass: "fa-solid fa-balance-scale",
      options: [
        { label: "Not particularly", value: "no", iconClass: "fa-solid fa-thumbs-down" },
        { label: "Absolutely", value: "yes", iconClass: "fa-solid fa-thumbs-up" }
      ]
    },
    {
      id: 11,
      question: "Do you ever experience that your professional obligations prevent you from engaging in your personal passions?",
      type: "single_choice",
      iconClass: "fa-solid fa-heart-crack",
      options: [
        { label: "Rarely or never", value: "no", iconClass: "fa-solid fa-face-smile" },
        { label: "Frequently", value: "yes", iconClass: "fa-solid fa-face-sad-tear" }
      ]
    },
    {
      id: 12,
      question: "Do you consider flexibility in your income potential, workspace location, and schedule a priority in your career?",
      type: "single_choice",
      iconClass: "fa-solid fa-location-crosshairs",
      options: [
        { label: "Not essential", value: "no", iconClass: "fa-solid fa-thumbs-down" },
        { label: "Highly important", value: "yes", iconClass: "fa-solid fa-thumbs-up" }
      ]
    },
    {
      id: 13,
      type: "info",
      iconClass: "fa-solid fa-scale-balanced fa-5x",
      color: "green",
      title: "Your Need for Better Balance Resonates With Us",
      message: "There's no need to sacrifice personal fulfillment for professional achievement. Artificial intelligence tools can empower you to enhance productivity, increase revenue, and design a sustainable lifestyle that delivers both career success and personal freedom. Ready to explore these opportunities together?",
      button_label: "Let's Proceed"
    },
    {
      id: 14,
      question: "Have you ventured into income-generating activities outside traditional employment?",
      type: "single_choice",
      iconClass: "fa-solid fa-route",
      options: [
        { label: "Yes, I've engaged in supplementary work opportunities", value: "side_gigs", iconClass: "fa-solid fa-briefcase-medical" },
        { label: "I'm interested though haven't taken action yet", value: "curious", iconClass: "fa-solid fa-compass" },
        { label: "I currently operate independently as a freelancer or entrepreneur", value: "freelance", iconClass: "fa-solid fa-laptop-code" }
      ]
    },
    {
      id: 15,
      question: "Have you contemplated offering your services as an independent contractor on a part-time basis?",
      type: "single_choice",
      iconClass: "fa-solid fa-business-time",
      options: [
        { label: "Yes, it has crossed my mind", value: "yes_thought", iconClass: "fa-solid fa-lightbulb" },
        { label: "No, I've never explored this option", value: "no_not_considered", iconClass: "fa-solid fa-circle-xmark" },
        { label: "I currently dedicate a portion of my time to freelance work", value: "freelance_part_time", iconClass: "fa-solid fa-user-clock" },
        { label: "I am exclusively engaged in freelance activities", value: "freelance_full_time", iconClass: "fa-solid fa-user-tie" }
      ]
    },
    {
      id: 16,
      question: "What is your level of experience with artificial intelligence applications?",
      type: "single_choice",
      iconClass: "fa-solid fa-robot",
      options: [
        { label: "Complete beginner – Eager to start learning fundamentals.", value: "new", iconClass: "fa-solid fa-baby" },
        { label: "Basic awareness – Familiar with concepts but no practical usage.", value: "heard", iconClass: "fa-solid fa-ear-listen" },
        { label: "Initial exploration – Some experience but seeking greater proficiency.", value: "tried", iconClass: "fa-solid fa-microscope" },
        { label: "Advanced practitioner – Regularly implement AI solutions professionally.", value: "experienced", iconClass: "fa-solid fa-user-graduate" }
      ]
    },
    {
      id: 17,
      question: "Are you aware that artificial intelligence technologies can enhance your efficiency and earning potential?",
      type: "single_choice",
      iconClass: "fa-solid fa-lightbulb",
      options: [
        { label: "Yes, I'm familiar with this concept", value: "heard", iconClass: "fa-solid fa-check-circle" },
        { label: "Somewhat aware, but seeking deeper understanding", value: "curious", iconClass: "fa-solid fa-magnifying-glass" },
        { label: "This is new information that intrigues me", value: "interested", iconClass: "fa-solid fa-star" }
      ]
    },
    {
      id: 18,
      type: "info",
      title: "Artificial Intelligence: Your Professional Companion",
      iconClass: "fa-solid fa-microchip fa-5x",
      color: "blue",
      message: "Modern AI technology streamlines workflows, simplifies complex tasks, and enhances revenue generation—producing correspondence, written materials, and graphics with remarkable efficiency. Optimize your productivity, reclaim valuable hours, and elevate your financial outcomes with minimal effort!",
      button_label: "Proceed"
    },
    {
      id: 19,
      question: "Which professional domains would appeal to you most if you pursued independent contract work?",
      type: "multi_choice",
      iconClass: "fa-solid fa-compass",
      note: "Select all options that interest you",
      options: [
        { label: "Visual Communication & Design", value: "graphic_design", iconClass: "fa-solid fa-palette" },
        { label: "Professional Writing & Copywriting", value: "content_writing", iconClass: "fa-solid fa-pencil-alt" },
        { label: "Online Advertising & Promotion", value: "digital_marketing", iconClass: "fa-solid fa-chart-bar" },
        { label: "Community Engagement & Platform Management", value: "social_media", iconClass: "fa-solid fa-camera" },
        { label: "Motion Graphics & Film Post-Production", value: "video_editing", iconClass: "fa-solid fa-video" },
        { label: "Online Retail & Digital Commerce", value: "ecommerce", iconClass: "fa-solid fa-box" },
        { label: "Website Creation & Programming", value: "web_dev", iconClass: "fa-solid fa-laptop" },
        { label: "Workflow Optimization with Artificial Intelligence", value: "ai_automation", iconClass: "fa-solid fa-robot" },
        { label: "Strategic Advisory & Personal Development", value: "consulting", iconClass: "fa-solid fa-briefcase" }
      ]
    },
    {
      id: 20,
      question: "How would you evaluate your existing capabilities in Online Marketing and Promotion?",
      type: "single_choice",
      iconClass: "fa-solid fa-bullhorn",
      options: [
        { label: "Advanced Practitioner – I actively oversee marketing initiatives", value: "expert", iconClass: "fa-solid fa-chess-queen" },
        { label: "Competent – I comprehend fundamental principles and approaches", value: "proficient", iconClass: "fa-solid fa-lightbulb" },
        { label: "Developing – I have experimented with various techniques", value: "intermediate", iconClass: "fa-solid fa-search" },
        { label: "Novice – I'm enthusiastic about developing new skills!", value: "beginner", iconClass: "fa-solid fa-seedling" }
      ]
    },
    {
      id: 21,
      type: "info",
      iconClass: "fa-solid fa-rocket fa-5x",
      title: "Success Is Accessible At Every Skill Level!",
      message: "From seasoned professionals to complete newcomers, online promotion has become significantly more approachable through artificial intelligence solutions. Extensive background knowledge isn't a prerequisite for thriving as an independent contractor – access to appropriate resources and methodologies is what truly matters. Together, we'll discover your capabilities and position you for achievement in a perfectly suited professional capacity!",
      button_label: "Move Forward"
    },
    {
      id: 22,
      question: "Which artificial intelligence platforms, applications, or technologies have you previously encountered or used?",
      type: "multi_choice",
      iconClass: "fa-solid fa-microchip",
      note: "Choose all that apply",
      options: [
        { label: "I'm new to AI tools – Excited to start learning!", value: "new_to_ai", iconClass: "fa-solid fa-rocket" },
        { label: "ChatGPT – AI-powered content & conversations.", value: "chatgpt", iconPNG: "./img/icons8-chatgpt.svg" },
        { label: "Copilot – AI assistance for work & productivity.", value: "copilot", iconPNG: "./img/icons8-microsoft-copilot.svg" },
        { label: "Google Gemini – Smart AI search & automation.", value: "gemini", iconPNG: "./img/icons8-google_cb.svg" },
        { label: "Midjourney – AI-generated art & design.", value: "midjourney",  iconPNG: "./img/icons8-midjourney_1.svg"  },
        { label: "Jasper – AI copywriting & marketing automation.", value: "jasper", iconPNG: "./img/icons8-jasper-ai.svg" },
        { label: "Mistral AI – AI-powered image creation.", value: "dalle", iconPNG: "./img/mistral-ai-icon.svg" },
        { label: "Perplexity – AI-powered image creation.", value: "dalle", iconPNG: "./img/icons8-perplexity-ai.svg" },
        { label: "DeepSeek – AI-driven research & insights.", value: "deepseek", iconPNG: "./img/icons8-deepseek.svg" }
      ]
    },
    {
      id: 23,
      type: "info",
      iconClass: "fa-solid fa-chart-line fa-5x",
      title: "Artificial Intelligence Represents Tomorrow's Economy—With Substantial Financial Opportunities!",
      message: "The AI sector is experiencing unprecedented expansion, projected to increase from €103 billion in 2023 to exceeding €1 trillion by 2030. Forward-thinking individuals have already implemented AI technologies to enhance revenue streams, streamline operational processes, and accelerate business growth at remarkable rates. This present moment offers an ideal opportunity to establish yourself at the forefront of innovation and begin capitalizing on AI-driven solutions!",
      button_label: "Proceed"
    },
    {
      id: 24,
      question: "What is your desired monthly income goal from AI-powered online activities?",
      type: "single_choice",
      iconClass: "fa-solid fa-euro-sign",
      options: [
        { label: "Less than €1000", value: "up_to_1000", iconClass: "fa-solid fa-coins" },
        { label: "Between €1,000 and €3,000", value: "1000_3000", iconClass: "fa-solid fa-money-bill-wave" },
        { label: "Between €3,000 and €5,000", value: "3000_5000", iconClass: "fa-solid fa-hand-holding-dollar" },
        { label: "Between €5,000 and €10,000", value: "5000_10000", iconClass: "fa-solid fa-wallet" },
        { label: "More than €10,000", value: "over_10000", iconClass: "fa-solid fa-euro-sign" }
      ]
    },
    {
      id: 25,
      question: "Upon achieving your financial objectives, how do you intend to celebrate your success?",
      type: "multi_choice",
      iconClass: "fa-solid fa-champagne-glasses",
      note: "Select all options that apply to your aspirations",
      options: [
        { label: "Purchase residential property", value: "new_home", iconClass: "fa-solid fa-house" },
        { label: "Enhance travel experiences & premium getaways", value: "travel", iconClass: "fa-solid fa-plane" },
        { label: "Acquire your aspirational vehicle", value: "car", iconClass: "fa-solid fa-car" },
        { label: "Invest in fine accessories and adornments", value: "jewelry", iconClass: "fa-solid fa-gem" },
        { label: "Eliminate outstanding financial obligations", value: "debt_free", iconClass: "fa-solid fa-file-invoice-dollar" },
        { label: "Allocate resources toward self-improvement", value: "personal_growth", iconClass: "fa-solid fa-brain" },
        { label: "Finance your ideal matrimonial celebration", value: "wedding", iconClass: "fa-solid fa-ring" },
        { label: "Pursue comprehensive lifestyle enhancements", value: "everything", iconClass: "fa-solid fa-gifts" },
        { label: "Alternative preference", value: "other", iconClass: "fa-solid fa-ellipsis-h" }
      ]
    },
    {
      id: 26,
      question: "What duration can you dedicate each day to developing your artificial intelligence skills?",
      type: "single_choice",
      iconClass: "fa-solid fa-calendar-day",
      options: [
        { label: "Approximately 10 minutes daily", value: "10", iconClass: "fa-solid fa-stopwatch" },
        { label: "About 15 minutes per day", value: "15", iconClass: "fa-solid fa-clock" },
        { label: "Roughly 20 minutes each day", value: "20", iconClass: "fa-solid fa-hourglass-half" },
        { label: "Half an hour daily", value: "30", iconClass: "fa-solid fa-hourglass-start" }
      ]
    },
    {
      id: 27,
      type: "summary",
      title: "Your Customized AI Professional Independence Strategy",
      subtitle: "Tailored according to your questionnaire responses...",
      iconClass: "fa-solid fa-wand-magic-sparkles",
      goal_prc: "{{you_p}}",
      button_label: "Proceed"
    }
  ];
  return (
    <>
      <Header user={user} />
      <div className="flex-1 p-8 max-w-4xl mx-auto">
        {/* Render the Quiz component with defined questions */}
        <Quiz questions={questions} />
      </div>
    </>
  );
} 