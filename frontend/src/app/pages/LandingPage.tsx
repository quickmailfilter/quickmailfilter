import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { 
  CheckCircle2, 
  Shield, 
  FileCheck, 
  TrendingUp, 
  Users,
  Star,
  ArrowRight,
  Server,
  Lock,
  Globe,
  AlertTriangle,
  Search,
  Activity
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F8FAFC]">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-12">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div data-aos="fade-right">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-[#2563EB] px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Activity className="w-4 h-4 animate-pulse" />
              Advanced Multi-Layer Verification Active
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight text-center lg:text-left">
              Hyper-Accurate<br />
              Email Validation<br />
              <span className="text-[#2563EB]">For Modern Growth.</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 leading-relaxed text-center lg:text-left">
              Go beyond simple syntax checks. Our 7-layer verification engine performs SMTP handshakes, DNS security audits, and data breach checks to ensure 99.9% deliverability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/signup" className="w-full sm:w-auto">
                <button 
                  className="w-full bg-[#2563EB] text-white text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-5 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1E40AF]"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link to="/docs" className="w-full sm:w-auto">
                <button 
                  className="w-full bg-white border-2 border-[#2563EB] text-[#2563EB] text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-5 active:scale-95 transition-all rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 hover:shadow-xl hover:-translate-y-1"
                >
                  View Documentation
                </button>
              </Link>
            </div>
          </div>
          <div className="relative" data-aos="zoom-in" data-aos-delay="200">
            <div className="absolute inset-0 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] rounded-3xl blur-[100px] opacity-20 animate-pulse"></div>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1763568258367-1c52beb60be7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbWFpbCUyMG1hcmtldGluZyUyMHByb2Zlc3Npb25hbCUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NzA2NTg0OTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Email Verification Dashboard"
              className="relative rounded-2xl shadow-[0_32px_64px_-16px_rgba(37,99,235,0.25)] w-full transform hover:scale-[1.02] transition-all duration-700 ease-out border border-[#E5E7EB]"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            The World's Most Comprehensive Verification Engine
          </h2>
          <p className="text-xl text-gray-600">
            Our 7-layer technology stacks deep technical checks to guarantee your sender reputation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Server,
              title: 'SMTP Deep Handshake',
              description: 'We connect directly to the recipient mail server to verify inbox existence without sending an email.',
              color: 'blue',
            },
            {
              icon: Shield,
              title: 'DNS Security Audit',
              description: 'Real-time analysis of SPF, DKIM, and DMARC records to evaluate sender trustworthiness.',
              color: 'green',
            },
            {
              icon: Lock,
              title: 'Data Breach Detection',
              description: 'Integrated with HaveIBeenPwned to identify if an email has been compromised in known breaches.',
              color: 'amber',
            },
            {
              icon: Globe,
              title: 'Domain Reputation',
              description: 'Checks domain age, WHOIS history, and TLD reputation to filter out new or "burner" domains.',
              color: 'blue',
            },
            {
              icon: Search,
              title: 'Advanced Pattern AI',
              description: 'Detects gibberish local-parts, suspicious character density, and bot-generated patterns.',
              color: 'green',
            },
            {
              icon: Activity,
              title: 'Deliverability Scoring',
              description: 'A unique 0-100 score weighing all 40+ data points to give you a definitive "Send" or "Skip" signal.',
              color: 'amber',
            },
            {
              icon: FileCheck,
              title: 'Disposable Filter',
              description: 'Real-time discovery of temporary and disposable email providers updated every 24 hours.',
              color: 'blue',
            },
            {
              icon: Users,
              title: 'Role-Based Detection',
              description: 'Identify generic roles (admin, support, sales) to segment personal vs. commercial outreach.',
              color: 'green',
            },
            {
              icon: TrendingUp,
              title: 'Typo Correction',
              description: 'Intelligently suggests corrections for misspelled domains like gnail.com or hotmial.com.',
              color: 'amber',
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            const colorClasses = {
              blue: 'bg-blue-50 text-[#2563EB]',
              green: 'bg-green-50 text-green-600',
              amber: 'bg-amber-50 text-amber-600',
            };

            return (
              <Card key={index} className="border-[#E5E7EB] border-opacity-50 hover:shadow-[0_20px_50px_rgba(37,99,235,0.1)] transition-all duration-300 hover:-translate-y-2 group cursor-default" data-aos="fade-up" data-aos-delay={index * 50}>
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl ${colorClasses[feature.color as keyof typeof colorClasses]} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm group-hover:shadow-md`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#2563EB] transition-colors">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm group-hover:text-gray-900 transition-colors">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Innovation Section: The 7-Step Journey */}
      <section className="bg-slate-900 py-24 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[128px]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[128px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20" data-aos="fade-down">
            <h2 className="text-4xl font-bold text-white mb-4">
              Our 7-Layer Intelligence Stack
            </h2>
            <p className="text-xl text-slate-400">
              How we achieve industry-leading 99.9% accuracy
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent -translate-y-1/2"></div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6 lg:gap-4 relative">
              {[
                { step: '01', title: 'Syntax', icon: CheckCircle2, desc: 'RFC Compliance', animation: 'fade-up' },
                { step: '02', title: 'Risk', icon: AlertTriangle, desc: 'Disposable Check', animation: 'fade-up' },
                { step: '03', title: 'DNS', icon: Globe, desc: 'MX & Security', animation: 'fade-up' },
                { step: '04', title: 'SMTP', icon: Server, desc: 'Real-time Ping', animation: 'fade-up' },
                { step: '05', title: 'Rep', icon: TrendingUp, desc: 'Domain Age', animation: 'fade-up' },
                { step: '06', title: 'Security', icon: Shield, desc: 'Breach Check', animation: 'fade-up' },
                { step: '07', title: 'Score', icon: Star, desc: 'Final AI Score', animation: 'fade-up' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center group cursor-default" data-aos={item.animation} data-aos-delay={i * 100}>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 mb-4 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 relative z-20 shadow-xl group-hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                    <item.icon className="w-8 h-8 sm:w-10 sm:h-10" />
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border border-slate-900 group-hover:scale-110 transition-transform">{item.step}</span>
                  </div>
                  <h4 className="text-white font-bold mb-1 text-sm sm:text-base group-hover:text-blue-400 transition-colors">{item.title}</h4>
                  <p className="text-slate-500 text-[10px] sm:text-xs group-hover:text-slate-300 transition-colors">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-20 text-center" data-aos="zoom-in">
            <div className="inline-block p-[1px] rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
              <div className="bg-slate-900 px-8 py-4 rounded-full">
                <p className="text-slate-300 text-sm">
                  <span className="text-blue-400 font-bold">Pro Tip:</span> Our system completes all 7 steps in less than <span className="text-white font-bold tracking-tight">800ms</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-[#2563EB] to-[#1E3A8A] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '50,000+', label: 'Active Users' },
              { value: '1.2B+', label: 'Emails Verified' },
              { value: '99.9%', label: 'Accuracy Rate' },
              { value: '24/7', label: 'Support' },
            ].map((stat, index) => (
              <div key={index} className="text-center" data-aos="zoom-in" data-aos-delay={index * 100}>
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-gray-600">
            See what our customers have to say
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: 'Sarah Johnson',
              role: 'Marketing Director',
              company: 'TechCorp Inc.',
              text: 'VerifyMail reduced our bounce rate from 12% to under 2%. The ROI is incredible.',
              rating: 5,
            },
            {
              name: 'Michael Chen',
              role: 'Email Campaign Manager',
              company: 'GrowthLabs',
              text: 'Best email verification tool we\'ve used. The bulk processing is lightning fast.',
              rating: 5,
            },
            {
              name: 'Emily Rodriguez',
              role: 'CTO',
              company: 'DataSync Solutions',
              text: 'Professional-grade accuracy and excellent API documentation. Highly recommended.',
              rating: 5,
            },
          ].map((testimonial, index) => (
            <Card key={index} className="border-[#E5E7EB] hover:shadow-lg transition-all hover:-translate-y-2" data-aos="fade-up" data-aos-delay={index * 100}>
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-[#2563EB]">{testimonial.company}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-0">
        <Card className="bg-gradient-to-r from-[#2563EB] to-[#1E3A8A] border-none shadow-2xl" data-aos="flip-up">
          <CardContent className="p-12 lg:p-16 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Clean Your Email List?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses that trust VerifyMail for their email verification needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <button 
                  className="bg-white text-[#2563EB] text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-5 shadow-xl w-full sm:w-auto rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link to="/docs">
                <button 
                  className="bg-white text-[#2563EB] text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-5 shadow-xl w-full sm:w-auto rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all"
                >
                  View Documentation
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};