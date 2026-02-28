import { FileText } from 'lucide-react';

export const TermsOfServicePage = () => {
  return (
    <div className="bg-white min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 mb-8" data-aos="fade-down">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#2563EB] flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Terms of Service</h1>
            <p className="text-sm sm:text-base text-gray-500">Last updated: February 12, 2026</p>
          </div>
        </div>

        <div className="prose prose-blue max-w-none text-gray-600 space-y-6 text-sm sm:text-base">
          {[
            {
              title: '1. Agreement to Terms',
              content: 'By accessing or using VerifyMail, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.'
            },
            {
              title: '2. Service Usage',
              content: 'VerifyMail provides email verification and list cleaning services. You agree to use these services only for lawful purposes. You are prohibited from using our services to facilitate spam or any other form of unauthorized communication.'
            },
            {
              title: '3. Account Responsibility',
              content: 'You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account.'
            },
            {
              title: '4. Intellectual Property',
              content: 'The content, features, and functionality of VerifyMail are owned by us and are protected by international copyright, trademark, and other intellectual property laws.'
            },
            {
              title: '5. Disclaimer',
              content: 'The materials on VerifyMail\'s website are provided on an \'as is\' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability.'
            },
            {
              title: '6. Limitations',
              content: 'In no event shall VerifyMail or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use the services on the website.'
            }
          ].map((section, idx) => (
            <section key={idx} data-aos="fade-up" data-aos-delay={idx * 50}>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
              <p>{section.content}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
