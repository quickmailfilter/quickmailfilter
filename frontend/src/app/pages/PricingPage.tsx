import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { useApp, PricingPlan } from "../context/AppContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { PaymentCheckout } from "../components/PaymentCheckout";

export const PricingPage = () => {
  const { user, isAuthenticated, upgradePlan, pricingPlans } = useApp();
  const navigate = useNavigate();
  const [upgradeTarget, setUpgradeTarget] = useState<PricingPlan | null>(null);
  const [showPaymentCheckout, setShowPaymentCheckout] = useState(false);

  // Carousel state for mobile
  const [subscriptionCarouselIndex, setSubscriptionCarouselIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Swipe handler
  const handleSwipe = () => {
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setSubscriptionCarouselIndex((prev) => {
        const subscriptionPlans = displayPlans.filter(
          (p) => p.planType === "subscription",
        );
        return (prev + 1) % subscriptionPlans.length;
      });
    }
    if (isRightSwipe) {
      setSubscriptionCarouselIndex((prev) => {
        const subscriptionPlans = displayPlans.filter(
          (p) => p.planType === "subscription",
        );
        return (prev - 1 + subscriptionPlans.length) % subscriptionPlans.length;
      });
    }
  };

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
    setShowPaymentCheckout(true);
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    if (!upgradeTarget) return;

    // Update user plan in context
    await upgradePlan(upgradeTarget.name as any, {
      amount: upgradeTarget.price,
      transactionId: paymentData.paymentId,
    });

    setShowPaymentCheckout(false);
    setUpgradeTarget(null);
    navigate("/dashboard");
  };

  const displayPlans = (
    pricingPlans.length > 0
      ? pricingPlans
      : [
          {
            id: "static-free",
            name: "Free Trial",
            price: 0,
            currency: "₹",
            description: "Perfect for testing our service",
            quota: 50,
            features: [
              "50 monthly verifications",
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
            currency: "₹",
            description: "For growing businesses",
            quota: 50000,
            features: [
              "50,000 monthly verifications",
              "Bulk list cleaning",
              "Advanced filtering",
              "Priority support",
              "API access",
              "Custom integrations",
            ],
            popular: true,
            active: true,
          },
          {
            id: "static-ent",
            name: "Enterprise",
            price: 16599,
            currency: "₹",
            description: "For large organizations",
            quota: 150000,
            features: [
              "150,000 monthly verifications",
              "24/7 premium support",
              "Custom integrations",
              "SLA guarantee",
              "Dedicated account manager",
              "Advanced reporting",
            ],
            popular: false,
            active: true,
          },
        ]
  ).sort((a, b) => a.price - b.price);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F8FAFC] py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16" data-aos="fade-down">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your email verification needs. All plans
            include our core features with no hidden fees.
          </p>
        </div>

        {/* Daily Allowance Plans Section */}
        <div className="mb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              📅 Daily Allowance Plans
            </h2>
            <p className="text-gray-600">
              Best for consistent, daily users who want the lowest cost per
              credit.
            </p>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-5 gap-6">
            {displayPlans
              .filter((p) => p.planType === "subscription")
              .map((plan, index) => {
                const isCurrentPlan =
                  isAuthenticated &&
                  user?.plan?.toLowerCase() === plan.name.toLowerCase();
                return (
                  <div
                    key={plan.id}
                    className={`relative group h-full transform transition-all duration-300 hover:scale-[1.02] ${
                      plan.popular ? "scale-105 z-10 -mt-4" : ""
                    }`}
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <Card
                      className={`h-full border-2 transition-colors duration-300 flex flex-col ${
                        plan.popular
                          ? "border-green-500 shadow-xl bg-green-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold text-gray-900">
                          {plan.name}
                        </CardTitle>
                        <p className="text-xs text-gray-500 mt-1 h-8 line-clamp-2">
                          {plan.description}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4 flex-1 flex flex-col">
                        {/* Daily Credits */}
                        <div className="bg-white p-3 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                            Daily Credits
                          </p>
                          <p className="text-2xl font-bold text-blue-600">
                            {plan.dailyCredits?.toLocaleString() ||
                              plan.quota?.toLocaleString()}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="bg-white p-3 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                            Monthly Cost
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            ₹{plan.price.toLocaleString()}
                          </p>
                        </div>

                        {/* Monthly Quota */}
                        <div className="bg-white p-3 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                            Monthly Quota
                          </p>
                          <p className="text-2xl font-bold text-purple-600">
                            {(plan.quota || 0).toLocaleString()}
                          </p>
                        </div>

                        {/* Features */}
                        <ul className="space-y-2 text-sm">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                              <span className="text-gray-600 text-xs">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA Button */}
                        <Button
                          className={`w-full py-3 text-sm font-bold mt-auto transition-all duration-300 ${
                            isCurrentPlan
                              ? "bg-gray-100 text-gray-500 cursor-default"
                              : plan.popular
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                          onClick={() => !isCurrentPlan && handlePlanCTA(plan)}
                        >
                          {isCurrentPlan ? "✓ Current Plan" : `Get Started`}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden">
            {displayPlans.filter((p) => p.planType === "subscription").length >
            0 ? (
              <div className="space-y-6">
                {/* Carousel Card */}
                <div
                  className="relative"
                  onTouchStart={(e) =>
                    setTouchStart(e.targetTouches[0].clientX)
                  }
                  onTouchEnd={(e) => {
                    setTouchEnd(e.changedTouches[0].clientX);
                    handleSwipe();
                  }}
                >
                  {(() => {
                    const subscriptionPlans = displayPlans.filter(
                      (p) => p.planType === "subscription",
                    );
                    const plan = subscriptionPlans[subscriptionCarouselIndex];
                    const isCurrentPlan =
                      isAuthenticated &&
                      user?.plan?.toLowerCase() === plan.name.toLowerCase();

                    return (
                      <Card
                        className={`border-2 transition-all duration-300 flex flex-col cursor-grab active:cursor-grabbing ${
                          plan.popular
                            ? "border-green-500 shadow-xl bg-green-50"
                            : "border-gray-200"
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                            ⭐ MOST POPULAR
                          </div>
                        )}
                        <CardHeader className="pb-3">
                          <CardTitle className="text-2xl font-bold text-gray-900">
                            {plan.name}
                          </CardTitle>
                          <p className="text-sm text-gray-500 mt-2">
                            {plan.description}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-1 flex flex-col">
                          {/* Daily Credits */}
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                              Daily Credits
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                              {plan.dailyCredits?.toLocaleString() ||
                                plan.quota?.toLocaleString()}
                            </p>
                          </div>

                          {/* Price */}
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                              Monthly Cost
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              ₹{plan.price.toLocaleString()}
                            </p>
                          </div>

                          {/* Monthly Quota */}
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                              Monthly Quota
                            </p>
                            <p className="text-2xl font-bold text-purple-600">
                              {(plan.quota || 0).toLocaleString()}
                            </p>
                          </div>

                          {/* Features */}
                          <ul className="space-y-2 text-sm">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-gray-600 text-xs">
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>

                          {/* CTA Button */}
                          <Button
                            className={`w-full py-3 text-sm font-bold mt-auto transition-all duration-300 ${
                              isCurrentPlan
                                ? "bg-gray-100 text-gray-500 cursor-default"
                                : plan.popular
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                            onClick={() =>
                              !isCurrentPlan && handlePlanCTA(plan)
                            }
                          >
                            {isCurrentPlan ? "✓ Current Plan" : `Get Started`}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })()}
                </div>

                {/* Navigation Controls */}
                {(() => {
                  const subscriptionPlans = displayPlans.filter(
                    (p) => p.planType === "subscription",
                  );
                  return (
                    <>
                      {/* Arrow Buttons - Modern Style */}
                      <div className="flex gap-6 justify-center items-center">
                        <button
                          onClick={() =>
                            setSubscriptionCarouselIndex(
                              (prev) =>
                                (prev - 1 + subscriptionPlans.length) %
                                subscriptionPlans.length,
                            )
                          }
                          className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-all duration-300 hover:scale-110"
                          aria-label="Previous plan"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>

                        {/* Dots Indicator */}
                        <div className="flex gap-2">
                          {subscriptionPlans.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSubscriptionCarouselIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                idx === subscriptionCarouselIndex
                                  ? "bg-green-600 w-6"
                                  : "bg-gray-300"
                              }`}
                              aria-label={`Go to plan ${idx + 1}`}
                            />
                          ))}
                        </div>

                        <button
                          onClick={() =>
                            setSubscriptionCarouselIndex(
                              (prev) => (prev + 1) % subscriptionPlans.length,
                            )
                          }
                          className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-all duration-300 hover:scale-110"
                          aria-label="Next plan"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </div>

                      {/* Counter & Swipe Hint */}
                      <div className="text-center space-y-2">
                        <p className="text-sm text-gray-500">
                          {subscriptionCarouselIndex + 1} of{" "}
                          {subscriptionPlans.length}
                        </p>
                        <p className="text-xs text-gray-400">
                          💡 Swipe or use arrows to navigate
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : null}
          </div>
        </div>

        {/* Pay As You Go Plans Section */}
        <div className="mb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              💳 Pay As You Go Plans
            </h2>
            <p className="text-gray-600">
              Perfect for occasional users. No recurring charges, use credits
              whenever you need them.
            </p>
          </div>

          {displayPlans.filter((p) => p.planType === "onetime").length > 0 ? (
            <>
              {/* Desktop Grid */}
              <div className="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayPlans
                  .filter((p) => p.planType === "onetime")
                  .map((plan, index) => (
                    <div
                      key={plan.id}
                      className="relative group h-full transform transition-all duration-300 hover:scale-105"
                      data-aos="fade-up"
                      data-aos-delay={index * 100}
                    >
                      <Card className="h-full border-2 border-amber-200 hover:border-amber-400 transition-colors duration-300 flex flex-col bg-gradient-to-br from-amber-50 to-white">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg font-bold text-gray-900">
                            {plan.name}
                          </CardTitle>
                          <p className="text-xs text-gray-500 mt-1 h-10 line-clamp-2">
                            {plan.description}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-1 flex flex-col">
                          {/* One-Time Price */}
                          <div className="bg-white p-3 rounded-lg border border-amber-100">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                              One-Time Price
                            </p>
                            <p className="text-2xl font-bold text-amber-600">
                              ₹{plan.price.toLocaleString()}
                            </p>
                          </div>

                          {/* Credit Amount */}
                          <div className="bg-white p-3 rounded-lg border border-amber-100">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                              Credits Included
                            </p>
                            <p className="text-2xl font-bold text-orange-600">
                              {(
                                plan.creditAmount ||
                                plan.quota ||
                                0
                              ).toLocaleString()}
                            </p>
                          </div>

                          {/* Features */}
                          <ul className="space-y-2 text-sm">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <span className="text-gray-600 text-xs">
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>

                          {/* CTA Button */}
                          <Button
                            className="w-full py-3 text-sm font-bold mt-auto bg-amber-600 hover:bg-amber-700 text-white transition-all duration-300"
                            onClick={() => handlePlanCTA(plan)}
                          >
                            Get Credits Now
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
              </div>

              {/* Mobile Grid */}
              <div className="md:hidden grid grid-cols-2 gap-4">
                {displayPlans
                  .filter((p) => p.planType === "onetime")
                  .map((plan) => (
                    <Card
                      key={plan.id}
                      className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white flex flex-col"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-gray-900">
                          {plan.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 flex-1 flex flex-col">
                        <div className="bg-white p-2 rounded border border-amber-100">
                          <p className="text-xs text-gray-400 uppercase font-bold">
                            Price
                          </p>
                          <p className="text-xl font-bold text-amber-600">
                            ₹{plan.price.toLocaleString()}
                          </p>
                        </div>

                        <div className="bg-white p-2 rounded border border-amber-100">
                          <p className="text-xs text-gray-400 uppercase font-bold">
                            Credits
                          </p>
                          <p className="text-lg font-bold text-orange-600">
                            {(
                              plan.creditAmount ||
                              plan.quota ||
                              0
                            ).toLocaleString()}
                          </p>
                        </div>

                        <Button
                          className="w-full py-2 text-xs font-bold mt-auto bg-amber-600 hover:bg-amber-700 text-white"
                          onClick={() => handlePlanCTA(plan)}
                        >
                          Buy Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                No pay-as-you-go plans available at the moment.
              </p>
            </div>
          )}
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mb-20">
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
                a: "Additional verifications are available at ₹0.42 per verification. You can also upgrade to a higher plan for better rates.",
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

        {/* CTA Section */}
        <div
          className="mt-16 text-center bg-blue-50 rounded-lg p-12"
          data-aos="fade-up"
        >
          <p className="text-gray-600 mb-4 text-lg">
            Need a custom plan or have questions?
          </p>
          <Button
            onClick={() => navigate("/contact")}
            variant="outline"
            size="lg"
            className="border-blue-600 text-blue-600 hover:bg-blue-100"
          >
            Contact Sales Team
          </Button>
        </div>
      </div>

      <Dialog
        open={!!upgradeTarget && !showPaymentCheckout}
        onOpenChange={() => setUpgradeTarget(null)}
      >
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Ready to Upgrade?</DialogTitle>
            <DialogDescription>
              Proceed to secure payment with Razorpay to activate your{" "}
              <strong>{upgradeTarget?.name}</strong> plan.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Selected Plan:</span>
              <span className="font-bold">{upgradeTarget?.name}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Monthly Cost:</span>
              <span className="font-bold text-xl text-blue-600">
                ₹{upgradeTarget?.price.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-500 text-center">
              You will be redirected to secure payment gateway powered by
              Razorpay.
            </p>
          </div>

          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => setUpgradeTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowPaymentCheckout(true)}
            >
              Continue to Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {upgradeTarget && (
        <PaymentCheckout
          isOpen={showPaymentCheckout}
          planName={upgradeTarget.name}
          amount={upgradeTarget.price}
          userEmail={user?.email || ""}
          onSuccess={handlePaymentSuccess}
          onClose={() => {
            setShowPaymentCheckout(false);
            setUpgradeTarget(null);
          }}
        />
      )}
    </div>
  );
};
