import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Zap, Shield } from "lucide-react";

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F8FAFC] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16" data-aos="fade-down">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            About QuickMailFilter
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            We're dedicated to providing the most accurate and efficient email
            verification service in the industry.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-20" data-aos="fade-up">
          <Card className="border-[#E5E7EB] bg-white">
            <CardContent className="p-8 sm:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Our Mission
                  </h2>
                  <p className="text-gray-600 mb-4">
                    To empower businesses with reliable email verification
                    technology that increases deliverability, reduces bounce
                    rates, and improves customer engagement.
                  </p>
                  <p className="text-gray-600 mb-6">
                    We believe that clean email lists are the foundation of
                    successful email marketing campaigns. Our advanced
                    validation algorithms ensure that your emails reach real
                    inboxes.
                  </p>
                  <Link to="/contact">
                    <Button className="bg-[#2563EB] hover:bg-[#1E40AF]">
                      Get in Touch <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Zap className="w-20 h-20 text-[#2563EB] mx-auto mb-4" />
                    <p className="text-gray-600">
                      Fast & Reliable Verification
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Why Choose Us */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Us
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Secure & Compliant",
                description:
                  "GDPR compliant with enterprise-grade security for your data",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description:
                  "Real-time validation with results in milliseconds",
              },
              {
                icon: Users,
                title: "Expert Support",
                description:
                  "24/7 dedicated support from our email verification experts",
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card
                  key={idx}
                  className="border-[#E5E7EB] hover:shadow-lg transition-all"
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

        {/* CTA */}
        <div className="text-center mb-12">
          <Card className="border-[#E5E7EB] bg-gradient-to-r from-blue-50 to-blue-100 p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Improve Your Email Deliverability?
            </h2>
            <p className="text-gray-600 mb-6">
              Join thousands of businesses that trust QuickMailFilter
            </p>
            <Link to="/pricing">
              <Button className="bg-[#2563EB] hover:bg-[#1E40AF]">
                View Pricing Plans <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};
