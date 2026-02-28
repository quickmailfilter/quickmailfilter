import { Lock } from 'lucide-react';

export const GDPRPage = () => {
  return (
    <div className="bg-white min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#2563EB] flex-shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">GDPR Compliance</h1>
            <p className="text-sm sm:text-base text-gray-500">Last updated: February 12, 2026</p>
          </div>
        </div>

        <div className="prose prose-blue max-w-none text-gray-600 space-y-6 text-sm sm:text-base">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. GDPR Overview</h2>
            <p>
              The General Data Protection Regulation (GDPR) is a regulation in EU law on data protection and privacy in the European Union and the European Economic Area. VerifyMail is fully committed to compliance with the GDPR.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Your Rights Under GDPR</h2>
            <p>
              Under the GDPR, you have several rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Right to Access:</strong> You can request a copy of the personal data we hold about you.</li>
              <li><strong>Right to Rectification:</strong> You can ask us to correct any inaccurate or incomplete data.</li>
              <li><strong>Right to Erasure:</strong> Also known as the 'right to be forgotten', you can request the deletion of your data.</li>
              <li><strong>Right to Data Portability:</strong> You can request that we transfer your data to another service.</li>
              <li><strong>Right to Object:</strong> You can object to the processing of your data in certain circumstances.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Ensure Compliance</h2>
            <p>
              We have implemented measures such as:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Data processing agreements with our sub-processors.</li>
              <li>Privacy by design in our product development process.</li>
              <li>Regular security audits and data protection impact assessments.</li>
              <li>Automatic data deletion policies for uploaded email lists.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Processing</h2>
            <p>
              When you use our email verification service, we act as a Data Processor. We process the email addresses you upload strictly according to your instructions and for the purpose of verification only. These lists are never shared, sold, or used for any other purpose.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
