import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export const PricingPage = () => {
  const plans = [
    {
      name: 'Free Trial',
      price: '₹0',
      period: '/month',
      description: 'Perfect for testing our service',
      quota: '1,000 verifications/month',
      features: [
        '1,000 monthly verifications',
        'Format validation',
        'Domain & MX checks',
        'Disposable detection',
        'Basic support',
        'Email reports',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Business',
      price: '₹4,099',
      period: '/month',
      description: 'For growing businesses',
      quota: '25,000 verifications/month',
      features: [
        '25,000 monthly verifications',
        'All Free features',
        'Bulk list cleaning',
        'Advanced filtering',
        'Priority support',
        'API access',
        'Custom exports',
        'Advanced analytics',
      ],
      cta: 'Start Business Plan',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '₹16,599',
      period: '/month',
      description: 'For large organizations',
      quota: '150,000 verifications/month',
      features: [
        '150,000 monthly verifications',
        'All Business features',
        'Dedicated account manager',
        '24/7 premium support',
        'Custom integrations',
        'SLA guarantee',
        'Advanced security',
        'White-label options',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F8FAFC] py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16" data-aos="fade-down">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your email verification needs. All plans include our core features with no hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative border-2 ${
                plan.popular
                  ? 'border-[#2563EB] shadow-2xl shadow-blue-500/20 scale-105 z-10'
                  : 'border-[#E5E7EB] hover:shadow-lg'
              } transition-all`}
              data-aos={index === 0 ? "fade-right" : index === 1 ? "fade-up" : "fade-left"}
              data-aos-delay={index * 100}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#2563EB] to-[#1E3A8A] text-white px-4 py-1 rounded-full text-sm font-medium animate-bounce">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </CardTitle>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <p className="text-sm text-[#2563EB] font-medium">{plan.quota}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className="block">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-[#2563EB] hover:bg-[#1E3A8A]'
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12" data-aos="fade-up">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I change my plan later?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
              },
              {
                q: 'What happens if I exceed my monthly quota?',
                a: 'Additional verifications are available at ₹0.42 per verification. You can also upgrade to a higher plan for better rates.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'Yes, we offer a 30-day money-back guarantee for all paid plans. No questions asked.',
              },
              {
                q: 'Is my data secure?',
                a: 'Absolutely. We use enterprise-grade encryption and comply with GDPR, SOC 2, and other security standards.',
              },
            ].map((faq, index) => (
              <Card key={index} className="border-[#E5E7EB]" data-aos="zoom-in-up" data-aos-delay={index * 100}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center" data-aos="fade-up">
          <p className="text-gray-600 mb-4">
            Need a custom plan or have questions?
          </p>
          <Button variant="outline" size="lg" className="border-[#2563EB] text-[#2563EB] hover:bg-blue-50">
            Contact Sales Team
          </Button>
        </div>
      </div>
    </div>
  );
};
