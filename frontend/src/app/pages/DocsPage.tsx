import { Card, CardContent } from '../components/ui/card';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { Button } from '../components/ui/button';
import { Book, Code, Mail, HelpCircle, ExternalLink } from 'lucide-react';

export const DocsPage = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F8FAFC] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16" data-aos="fade-down">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Documentation & Help Center
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to get started with VerifyMail
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              icon: Book,
              title: 'Getting Started',
              description: 'Learn the basics',
              color: 'blue',
              action: () => scrollToSection('faq')
            },
            {
              icon: Code,
              title: 'API Reference',
              description: 'Developer docs',
              color: 'green',
              action: () => scrollToSection('api')
            },
            {
              icon: Mail,
              title: 'Email Support',
              description: 'Contact us',
              color: 'amber',
              action: () => scrollToSection('support')
            },
            {
              icon: HelpCircle,
              title: 'FAQ',
              description: 'Common questions',
              color: 'blue',
              action: () => scrollToSection('faq')
            },
          ].map((item, index) => {
            const Icon = item.icon;
            const colorClasses = {
              blue: 'bg-blue-50 text-[#2563EB]',
              green: 'bg-green-50 text-green-600',
              amber: 'bg-amber-50 text-amber-600',
            };

            return (
              <Card 
                key={index} 
                className="border-[#E5E7EB] hover:shadow-lg transition-all cursor-pointer group"
                onClick={item.action}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 rounded-xl ${colorClasses[item.color as keyof typeof colorClasses]} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#2563EB] transition-colors">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div id="faq" className="max-w-3xl mx-auto mb-16 scroll-mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8" data-aos="fade-right">Frequently Asked Questions</h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            {[
              { id: 'item-1', q: 'How does our 7-layer verification work?', a: 'VerifyMail uses a sophisticated 7-layer technology stack: Syntax Check, Disposable Detection, DNS/MX Audit, Real-time SMTP Handshake, Domain Reputation Analysis, DNS Security (SPF/DKIM/DMARC) validation, and HaveIBeenPwned Breach status.' },
              { id: 'item-2', q: 'What file formats are supported for bulk uploads?', a: 'We support CSV (.csv) and Excel (.xlsx, .xls) file formats. Your file should contain email addresses in a column, and we\'ll automatically detect and process them. Maximum file size is 100MB or 500,000 emails per upload.' },
              { id: 'item-3', q: 'How accurate is the verification?', a: 'Our verification accuracy is 99.9%. We use advanced algorithms and real-time checks to ensure the highest quality results. Each email receives a confidence score indicating the reliability of the verification.' },
              { id: 'item-4', q: 'What happens to my data?', a: 'We take data privacy seriously. All data is encrypted in transit and at rest. We never share or sell your data to third parties. You can delete your data at any time from your account settings. We\'re GDPR and SOC 2 compliant.' },
              { id: 'item-5', q: 'Do you offer an API?', a: 'Yes! Business and Enterprise plans include API access. Our REST API allows you to integrate email verification directly into your applications. Full documentation is available for authenticated users.' },
              { id: 'item-6', q: 'How long does bulk verification take?', a: 'Bulk verification processes at around 1,000 emails per minute. For larger lists, we use background processing so you can navigate away while the work completes. You will receive an email notification when your results are ready for download.' }
            ].map((faq, idx) => (
              <AccordionItem key={idx} value={faq.id} className="bg-white border border-[#E5E7EB] rounded-xl px-6" data-aos="fade-up" data-aos-delay={idx * 50}>
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-[#2563EB]">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* API Documentation Preview */}
        <div id="api" className="max-w-4xl mx-auto mb-16 scroll-mt-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8" data-aos="fade-right">API Documentation</h2>
          
          <Card className="border-[#E5E7EB] mb-6 shadow-sm overflow-hidden" data-aos="zoom-in">
            <CardContent className="p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center flex-shrink-0">
                  <Code className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">RESTful API</h3>
                  <p className="text-gray-600">
                    Integrate email verification into your application with our simple REST API.
                  </p>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-4 sm:p-6 mb-6 overflow-x-auto">
                <pre className="text-xs sm:text-sm">
                  <code className="text-blue-400">POST</code> <code className="text-slate-300">https://api.verifymail.com/v1/verify</code>
                  <div className="mt-4 text-slate-400">{"{"}</div>
                  <div className="pl-4 text-slate-300">"email": <span className="text-green-400">"user@example.com"</span></div>
                  <div className="text-slate-400">{"}"}</div>
                  
                  <div className="mt-6 text-slate-500">// Response</div>
                  <div className="text-slate-400">{"{"}</div>
                  <div className="pl-4 text-slate-300">
                    <span className="text-purple-400">"valid"</span>: <span className="text-amber-400">true</span>,<br />
                    <span className="text-purple-400">"security_score"</span>: <span className="text-amber-400">98</span>,<br />
                    <span className="text-purple-400">"disposable"</span>: <span className="text-amber-400">false</span>,<br />
                    <span className="text-purple-400">"smtp_verified"</span>: <span className="text-amber-400">true</span>,<br />
                    <span className="text-purple-400">"spf_valid"</span>: <span className="text-amber-400">true</span>,<br />
                    <span className="text-purple-400">"breached"</span>: <span className="text-amber-400">false</span>,<br />
                    <span className="text-purple-400">"domain_reputation"</span>: <span className="text-amber-400">95</span>
                  </div>
                  <div className="text-slate-400">{"}"}</div>
                </pre>
              </div>

              <Button className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1E3A8A]">
                View Full API Documentation
                <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Support */}
        <div id="support" className="max-w-3xl mx-auto scroll-mt-20 px-4 sm:px-0">
          <Card className="bg-gradient-to-r from-[#2563EB] to-[#1E3A8A] border-none shadow-2xl overflow-hidden" data-aos="flip-up">
            <CardContent className="p-8 sm:p-12 text-center relative overflow-hidden">
              {/* Abstract Background for Mobile */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 sm:w-64 h-32 sm:h-64 bg-white/10 rounded-full blur-3xl"></div>
              
              <Mail className="w-12 h-12 sm:w-16 sm:h-16 text-white mx-auto mb-6 relative z-10" />
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 relative z-10">
                Still Have Questions?
              </h2>
              <p className="text-blue-100 mb-6 text-base sm:text-lg relative z-10">
                Our support team is here to help you 24/7
              </p>
              <button 
                className="w-full sm:w-auto bg-white text-[#2563EB] text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-5 shadow-xl rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all relative z-10"
              >
                Contact Support
              </button>
              <p className="text-sm text-blue-100 mt-4 relative z-10">
                Email: support@verifymail.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
