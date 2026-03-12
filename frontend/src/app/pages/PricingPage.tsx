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
  const [onetimeCarouselIndex, setOnetimeCarouselIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Swipe handler
  const handleSwipe = (isSubscription: boolean) => {
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      if (isSubscription) {
        setSubscriptionCarouselIndex((prev) => {
          const subscriptionPlans = displayPlans.filter(
            (p) => p.planType === "subscription",
          );
          return (prev + 1) % subscriptionPlans.length;
        });
      } else {
        setOnetimeCarouselIndex((prev) => {
          const onetimePlans = displayPlans.filter(
            (p) => p.planType === "onetime",
          );
          return (prev + 1) % onetimePlans.length;
        });
      }
    }
    if (isRightSwipe) {
      if (isSubscription) {
        setSubscriptionCarouselIndex((prev) => {
          const subscriptionPlans = displayPlans.filter(
            (p) => p.planType === "subscription",
          );
          return (
            (prev - 1 + subscriptionPlans.length) % subscriptionPlans.length
          );
        });
      } else {
        setOnetimeCarouselIndex((prev) => {
          const onetimePlans = displayPlans.filter(
            (p) => p.planType === "onetime",
          );
          return (prev - 1 + onetimePlans.length) % onetimePlans.length;
        });
      }
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
                    {plan.popular && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                        ⭐ MOST POPULAR
                      </div>
                    )}
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
                    handleSwipe(true);
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

        {/* On-Demand Top-ups Section */}
        <div className="mb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              🚀 Top-ups - Pay As You Go
            </h2>
            <p className="text-gray-600">
              No strings attached. Purchase credits only when you need them.
              These credits stay in your account until used.
            </p>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-5 gap-6">
            {displayPlans
              .filter((p) => p.planType === "onetime")
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
                    {plan.popular && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                        ⭐ BEST VALUE
                      </div>
                    )}
                    <Card
                      className={`h-full border-2 transition-colors duration-300 flex flex-col ${
                        plan.popular
                          ? "border-orange-500 shadow-xl bg-orange-50"
                          : "border-gray-200 hover:border-orange-300"
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
                        {/* Total Credits */}
                        <div className="bg-white p-3 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                            Total Credits
                          </p>
                          <p className="text-2xl font-bold text-orange-600">
                            {plan.quota.toLocaleString()}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="bg-white p-3 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                            One-Time Price
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            ₹{plan.price.toLocaleString()}
                          </p>
                        </div>

                        {/* Cost Per Credit */}
                        <div className="bg-white p-3 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                            Cost Per Credit
                          </p>
                          <p className="text-2xl font-bold text-blue-600">
                            ₹{(plan.price / plan.quota).toFixed(2)}
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
                                ? "bg-orange-600 hover:bg-orange-700 text-white"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                          onClick={() => !isCurrentPlan && handlePlanCTA(plan)}
                        >
                          {isCurrentPlan ? "✓ Current Plan" : `Purchase Now`}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden">
            {displayPlans.filter((p) => p.planType === "onetime").length > 0 ? (
              <div className="space-y-6">
                {/* Carousel Card */}
                <div
                  className="relative"
                  onTouchStart={(e) =>
                    setTouchStart(e.targetTouches[0].clientX)
                  }
                  onTouchEnd={(e) => {
                    setTouchEnd(e.changedTouches[0].clientX);
                    handleSwipe(false);
                  }}
                >
                  {(() => {
                    const onetimePlans = displayPlans.filter(
                      (p) => p.planType === "onetime",
                    );
                    const plan = onetimePlans[onetimeCarouselIndex];
                    const isCurrentPlan =
                      isAuthenticated &&
                      user?.plan?.toLowerCase() === plan.name.toLowerCase();

                    return (
                      <Card
                        className={`border-2 transition-all duration-300 flex flex-col cursor-grab active:cursor-grabbing ${
                          plan.popular
                            ? "border-orange-500 shadow-xl bg-orange-50"
                            : "border-gray-200"
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                            ⭐ BEST VALUE
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
                          {/* Total Credits */}
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                              Total Credits
                            </p>
                            <p className="text-2xl font-bold text-orange-600">
                              {plan.quota.toLocaleString()}
                            </p>
                          </div>

                          {/* Price */}
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                              One-Time Price
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              ₹{plan.price.toLocaleString()}
                            </p>
                          </div>

                          {/* Cost Per Credit */}
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                              Cost Per Credit
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                              ₹{(plan.price / plan.quota).toFixed(2)}
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
                                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                                  : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                            onClick={() =>
                              !isCurrentPlan && handlePlanCTA(plan)
                            }
                          >
                            {isCurrentPlan ? "✓ Current Plan" : `Purchase Now`}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })()}
                </div>

                {/* Navigation Controls */}
                {(() => {
                  const onetimePlans = displayPlans.filter(
                    (p) => p.planType === "onetime",
                  );
                  return (
                    <>
                      {/* Arrow Buttons - Modern Style */}
                      <div className="flex gap-6 justify-center items-center">
                        <button
                          onClick={() =>
                            setOnetimeCarouselIndex(
                              (prev) =>
                                (prev - 1 + onetimePlans.length) %
                                onetimePlans.length,
                            )
                          }
                          className="p-2 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 transition-all duration-300 hover:scale-110"
                          aria-label="Previous plan"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>

                        {/* Dots Indicator */}
                        <div className="flex gap-2">
                          {onetimePlans.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setOnetimeCarouselIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                idx === onetimeCarouselIndex
                                  ? "bg-orange-600 w-6"
                                  : "bg-gray-300"
                              }`}
                              aria-label={`Go to plan ${idx + 1}`}
                            />
                          ))}
                        </div>

                        <button
                          onClick={() =>
                            setOnetimeCarouselIndex(
                              (prev) => (prev + 1) % onetimePlans.length,
                            )
                          }
                          className="p-2 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 transition-all duration-300 hover:scale-110"
                          aria-label="Next plan"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </div>

                      {/* Counter & Swipe Hint */}
                      <div className="text-center space-y-2">
                        <p className="text-sm text-gray-500">
                          {onetimeCarouselIndex + 1} of {onetimePlans.length}
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

        {/* Comparison Table */}
        <div className="mb-20 bg-white rounded-lg border border-gray-200 p-4 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Plan Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 md:py-4 px-2 md:px-4 font-bold text-gray-900">
                    Feature
                  </th>
                  <th className="text-center py-3 md:py-4 px-2 md:px-4 font-bold text-blue-600">
                    Subscription
                  </th>
                  <th className="text-center py-3 md:py-4 px-2 md:px-4 font-bold text-orange-600">
                    One-Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feature: "Monthly Commitment",
                    subscription: "✓ Required",
                    onetime: "✗ None",
                  },
                  {
                    feature: "Best For",
                    subscription: "Consistent Users",
                    onetime: "Occasional Users",
                  },
                  {
                    feature: "Credits Refresh",
                    subscription: "Daily @ Midnight",
                    onetime: "One-Time",
                  },
                  {
                    feature: "Unused Credits",
                    subscription: "Lost after month",
                    onetime: "Never Expire",
                  },
                  {
                    feature: "Cost Per Credit",
                    subscription: "Lowest Rate",
                    onetime: "Higher Rate",
                  },
                  {
                    feature: "Billing",
                    subscription: "Monthly Auto-Renew",
                    onetime: "One Payment",
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="py-3 md:py-4 px-2 md:px-4 font-semibold text-gray-900">
                      {row.feature}
                    </td>
                    <td className="text-center py-3 md:py-4 px-2 md:px-4 text-gray-600">
                      {row.subscription}
                    </td>
                    <td className="text-center py-3 md:py-4 px-2 md:px-4 text-gray-600">
                      {row.onetime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
