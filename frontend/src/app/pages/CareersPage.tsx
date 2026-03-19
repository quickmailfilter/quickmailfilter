import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, Briefcase, ArrowRight, Users, Award, Zap } from "lucide-react";

const jobListings = [
  {
    id: 1,
    title: "Senior Backend Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description:
      "Looking for an experienced backend engineer to help scale our email validation infrastructure.",
  },
  {
    id: 2,
    title: "Frontend Developer (React)",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description:
      "Join our frontend team to build beautiful and performant user interfaces with React and TypeScript.",
  },
  {
    id: 3,
    title: "DevOps Engineer",
    department: "Infrastructure",
    location: "Remote",
    type: "Full-time",
    description:
      "Help us manage and optimize our cloud infrastructure, automation, and deployment pipelines.",
  },
  {
    id: 4,
    title: "Sales Development Representative",
    department: "Sales",
    location: "Remote",
    type: "Full-time",
    description:
      "Build relationships with prospects and help grow our customer base in the SaaS market.",
  },
  {
    id: 5,
    title: "Customer Success Manager",
    department: "Support",
    location: "Remote",
    type: "Full-time",
    description:
      "Be the voice of our customers and ensure they get maximum value from our platform.",
  },
  {
    id: 6,
    title: "Marketing Manager",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    description:
      "Drive our go-to-market strategy and build our brand presence in the email validation space.",
  },
];

export const CareersPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F8FAFC] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16" data-aos="fade-down">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Join Our Team
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Help us revolutionize email verification and make the internet a
            better place, one email at a time.
          </p>
        </div>

        {/* Why Work Here */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Work at QuickMailFilter
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: "Amazing Team",
                description:
                  "Work alongside talented professionals passionate about solving real problems",
              },
              {
                icon: Award,
                title: "Growth Opportunities",
                description:
                  "Continuous learning, professional development, and career advancement",
              },
              {
                icon: Zap,
                title: "Innovative Culture",
                description:
                  "Freedom to experiment and implement your ideas in a fast-paced environment",
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card
                  key={idx}
                  className="border-[#E5E7EB]"
                  data-aos="fade-up"
                  data-aos-delay={idx * 100}
                >
                  <CardContent className="p-6 text-center">
                    <Icon className="w-12 h-12 text-[#2563EB] mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Benefits */}
        <div
          className="mb-20 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-12"
          data-aos="fade-up"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Benefits & Perks
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "💰 Competitive salary and equity",
              "🏥 Comprehensive health insurance",
              "🏡 Flexible remote work",
              "📚 Learning & development budget",
              "🎯 Performance bonuses",
              "⏱️ Unlimited PTO",
              "👨‍👩‍👧‍👦 Family-friendly policies",
              "🖥️ Top-of-the-line equipment",
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-2xl">{benefit.split(" ")[0]}</span>
                <span className="text-gray-700">{benefit.substring(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Open Positions
          </h2>
          <div className="space-y-4">
            {jobListings.map((job, idx) => (
              <Card
                key={job.id}
                className="border-[#E5E7EB] hover:shadow-lg transition-all hover:border-[#2563EB] cursor-pointer"
                data-aos="fade-up"
                data-aos-delay={idx * 50}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="inline-block px-2 py-1 bg-blue-100 text-[#2563EB] text-xs font-medium rounded">
                          {job.type}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-3">{job.description}</p>
                    </div>
                    <Button className="bg-[#2563EB] hover:bg-[#1E40AF] whitespace-nowrap">
                      Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mb-12">
          <Card className="border-[#E5E7EB] bg-gradient-to-r from-blue-50 to-blue-100 p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Don't see a position that fits?
            </h2>
            <p className="text-gray-600 mb-6">
              We're always looking for talented people. Send us your resume!
            </p>
            <Link to="/contact">
              <Button className="bg-[#2563EB] hover:bg-[#1E40AF]">
                Get in Touch <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};
