import { Cookie } from 'lucide-react';

export const CookiePolicyPage = () => {
  return (
    <div className="bg-white min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#2563EB] flex-shrink-0">
            <Cookie className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Cookie Policy</h1>
            <p className="text-sm sm:text-base text-gray-500">Last updated: February 12, 2026</p>
          </div>
        </div>

        <div className="prose prose-blue max-w-none text-gray-600 space-y-6 text-sm sm:text-base">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. What are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Cookies</h2>
            <p>
              We use cookies for several reasons:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Essential Cookies:</strong> These are necessary for the website to function properly. They include, for example, cookies that enable you to log into secure areas.</li>
              <li><strong>Analytical Cookies:</strong> They allow us to recognize and count the number of visitors and to see how visitors move around our website when they are using it.</li>
              <li><strong>Functionality Cookies:</strong> These are used to recognize you when you return to our website, enabling us to personalize our content for you.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Managing Cookies</h2>
            <p>
              Most web browsers allow some control of most cookies through the browser settings. You can choose to block or delete cookies, but please note that if you do this, some parts of our website may not function correctly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Third-Party Cookies</h2>
            <p>
              In some cases, we also use cookies provided by trusted third parties. This site uses Google Analytics for example, which is one of the most widespread and trusted analytics solutions on the web for helping us to understand how you use the site.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
