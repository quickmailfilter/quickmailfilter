import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useApp, PricingPlan } from "../context/AppContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";

export const PricingPage = () => {
  const { user, isAuthenticated, upgradePlan, pricingPlans } = useApp();
  const navigate = useNavigate();
  const [upgradeTarget, setUpgradeTarget] = useState<PricingPlan | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  const handlePlanCTA = (plan: PricingPlan) => {
    if (plan.price === 0) {
      if (isAuthenticated) {
        navigate("/dashboard");
      } else {
        navigate("/signup");
      }
      return;
    }
    if (!isAuthenticated) {
      navigate("/signup");
      return;
    }
    const currentPlanName = user?.plan || "free";
    if (currentPlanName.toLowerCase() === plan.name.toLowerCase()) return;
    setUpgradeTarget(plan);
  };

  const confirmUpgrade = async () => {
    if (!upgradeTarget) return;
    setUpgrading(true);
    await upgradePlan(upgradeTarget.name as any, {
      amount: upgradeTarget.price,
      transactionId: `txn-${Date.now()}`,
    });
    setUpgrading(false);
    setUpgradeTarget(null);
    navigate("/dashboard/settings");
  };

  const displayPlans =
    pricingPlans.length > 0
      ? pricingPlans
      : [
          {
            id: "static-free",
            name: "Free Trial",
            price: 0,
            currency: "?",
            description: "Perfect for testing our service",
            quota: 1000,
            features: [
              "1,000 monthly verifications",
              "Format validation",
              "Domain & MX checks",
              "Disposable detection",
            ],
            popular: false,
            active: true,
          },
          {
            id: "static-biz",
            name: "Business",
            price: 4099,
            currency: "?",
            description: "For growing businesses",
            quota: 50000,
            features: [
              "50,000 monthly verifications",
              "Bulk list cleaning",
              "Advanced filtering",
              "Priority support",
            ],
            popular: true,
            active: true,
          },
          {
            id: "static-ent",
            name: "Enterprise",
            price: 16599,
            currency: "?",
            description: "For large organizations",
            quota: 150000,
            features: [
              "150,000 monthly verifications",
              "24/7 premium support",
              "Custom integrations",
              "SLA guarantee",
            ],
            popular: false,
            active: true,
          },
        ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F8FAFC] py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" data-aos="fade-down">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your email verification needs. All plans
            include our core features with no hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {displayPlans.map((plan, index) => {
            const isCurrentPlan =
              isAuthenticated &&
              user?.plan?.toLowerCase() === plan.name.toLowerCase();
            return (
              <div
                key={plan.id}
                className={`relative group h-full transform transition-all duration-300 hover:scale-[1.03] ${
                  plan.popular ? "scale-105 z-10" : ""
                }`}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    MOST POPULAR
                  </div>
                )}
                <Card
                  className={`h-full border-2 transition-colors duration-300 ${
                    plan.popular
                      ? "border-blue-600 shadow-xl"
                      : "border-gray-100 hover:border-blue-200"
                  }`}
                >
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {plan.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-2">
                      {plan.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-4xl font-bold text-gray-900">
                          {plan.currency}
                          {plan.price.toLocaleString()}
                        </span>
                        <span className="text-gray-500">/month</span>
                      </div>
                      <p className="text-sm font-semibold text-blue-600 mt-2">
                        {plan.quota.toLocaleString()} verifications/mo
                      </p>
                    </div>

                    <ul className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-gray-600 text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full py-6 text-lg font-bold transition-all duration-300 ${
                        isCurrentPlan
                          ? "bg-gray-100 text-gray-500 cursor-default"
                          : plan.popular
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-200"
                            : "bg-gray-900 hover:bg-black text-white"
                      }`}
                      onClick={() => !isCurrentPlan && handlePlanCTA(plan)}
                    >
                      {isCurrentPlan
                        ? "Current Plan"
                        : plan.price === 0
                          ? "Start Trial"
                          : `Upgrade to ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        <div className="max-w-3xl mx-auto pt-16">
          <h2
            className="text-3xl font-bold text-gray-900 text-center mb-12"
            data-aos="fade-up"
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I change my plan later?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
              },
              {
                q: "What happens if I exceed my monthly quota?",
                a: "Additional verifications are available at ?0.42 per verification. You can also upgrade to a higher plan for better rates.",
              },
              {
                q: "Do you offer refunds?",
                a: "Yes, we offer a 30-day money-back guarantee for all paid plans. No questions asked.",
              },
              {
                q: "Is my data secure?",
                a: "Absolutely. We use enterprise-grade encryption and comply with GDPR, SOC 2, and other security standards.",
              },
            ].map((faq, index) => (
              <Card
                key={index}
                className="border-[#E5E7EB]"
                data-aos="zoom-in-up"
                data-aos-delay={index * 100}
              >
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center" data-aos="fade-up">
          <p className="text-gray-600 mb-4">
            Need a custom plan or have questions?
          </p>
          <Button
            variant="outline"
            size="lg"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Contact Sales Team
          </Button>
        </div>
      </div>

      <Dialog
        open={!!upgradeTarget}
        onOpenChange={() => !upgrading && setUpgradeTarget(null)}
      >
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Confirm Plan Upgrade</DialogTitle>
            <DialogDescription>
              Are you sure you want to upgrade to the{" "}
              <strong>{upgradeTarget?.name}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Selected Plan:</span>
              <span className="font-bold">{upgradeTarget?.name}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total Due Today:</span>
              <span className="font-bold text-xl text-blue-600">
                {upgradeTarget?.currency}
                {upgradeTarget?.price.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-400 text-center italic">
              By confirming, your account quota will be updated immediately.
            </p>
          </div>

          <div className="flex gap-3 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setUpgradeTarget(null)}
              disabled={upgrading}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={confirmUpgrade}
              disabled={upgrading}
            >
              {upgrading ? "Processing..." : "Confirm & Pay"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
