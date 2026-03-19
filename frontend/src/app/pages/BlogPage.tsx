import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar, ArrowRight, User } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "The Complete Guide to Email Validation",
    excerpt:
      "Learn everything you need to know about email validation and why it matters for your business.",
    author: "Sarah Chen",
    date: "Mar 15, 2024",
    category: "Guide",
    image: "bg-gradient-to-br from-blue-100 to-blue-200",
  },
  {
    id: 2,
    title: "How to Improve Email Deliverability in 2024",
    excerpt:
      "Discover the latest strategies and best practices to ensure your emails reach the inbox.",
    author: "Mike Johnson",
    date: "Mar 10, 2024",
    category: "Best Practices",
    image: "bg-gradient-to-br from-green-100 to-green-200",
  },
  {
    id: 3,
    title: "Understanding Bounce Rates and How to Reduce Them",
    excerpt:
      "Explore the different types of email bounces and actionable strategies to minimize them.",
    author: "Emma Rodriguez",
    date: "Mar 5, 2024",
    category: "Technical",
    image: "bg-gradient-to-br from-purple-100 to-purple-200",
  },
  {
    id: 4,
    title: "SPF, DKIM, and DMARC: Email Authentication Explained",
    excerpt:
      "A deep dive into email authentication protocols and how they protect your sending reputation.",
    author: "David Chen",
    date: "Feb 28, 2024",
    category: "Security",
    image: "bg-gradient-to-br from-red-100 to-red-200",
  },
  {
    id: 5,
    title: "Email List Quality: Why It Matters More Than Size",
    excerpt:
      "Learn why a smaller, verified email list outperforms a larger list with questionable addresses.",
    author: "Lisa Thompson",
    date: "Feb 20, 2024",
    category: "Strategy",
    image: "bg-gradient-to-br from-yellow-100 to-yellow-200",
  },
  {
    id: 6,
    title: "Compliance and GDPR: Email Marketing Best Practices",
    excerpt:
      "Ensure your email marketing campaigns comply with GDPR and other data protection regulations.",
    author: "James Wilson",
    date: "Feb 15, 2024",
    category: "Compliance",
    image: "bg-gradient-to-br from-indigo-100 to-indigo-200",
  },
];

export const BlogPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F8FAFC] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16" data-aos="fade-down">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Blog & Resources
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest insights on email validation,
            deliverability, and marketing best practices.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {blogPosts.map((post, idx) => (
            <Card
              key={post.id}
              className="border-[#E5E7EB] hover:shadow-lg transition-all overflow-hidden cursor-pointer"
              data-aos="fade-up"
              data-aos-delay={idx * 50}
            >
              <div
                className={`h-48 ${post.image} flex items-center justify-center`}
              >
                <span className="text-gray-600 font-medium">
                  {post.category}
                </span>
              </div>
              <CardContent className="p-6">
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-[#2563EB] text-sm font-medium rounded-full">
                    {post.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {post.author}
                  </div>
                </div>

                <Button className="w-full mt-4 bg-[#2563EB] hover:bg-[#1E40AF]">
                  Read More <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-20">
          <Card className="border-[#E5E7EB] bg-gradient-to-r from-blue-50 to-blue-100 p-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Subscribe to Our Newsletter
              </h2>
              <p className="text-gray-600 mb-6">
                Get the latest email marketing tips and insights delivered to
                your inbox.
              </p>
              <div className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
                <Button className="bg-[#2563EB] hover:bg-[#1E40AF]">
                  Subscribe
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
