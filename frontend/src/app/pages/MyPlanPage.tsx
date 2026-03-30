import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useApp, PricingPlan } from "../context/AppContext";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { PaymentCheckout } from "../components/PaymentCheckout";
import { toast } from "sonner";

export const MyPlanPage = () => {
  const { user, isAuthenticated, pricingPlans, upgradePlan } = useApp();
  const navigate = useNavigate();
  const [upgradeTarget, setUpgradeTarget] = useState<PricingPlan | null>(null);
  const [showPaymentCheckout, setShowPaymentCheckout] = useState(false);
  const [subscriptionCarouselIndex, setSubscriptionCarouselIndex] = useState(0);
  const [onetimeCarouselIndex, setOnetimeCarouselIndex] = useState(0);

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const displayPlans = pricingPlans.sort((a, b) => a.price - b.price);
  const subscriptionPlans = displayPlans.filter(
    (p) => p.planType === "subscription",
  );
  const onetimePlans = displayPlans.filter((p) => p.planType === "onetime");

  const currentPlanName = user?.plan?.toLowerCase() || "free";

  const handlePlanCTA = (plan: PricingPlan) => {
    if (currentPlanName === plan.name.toLowerCase()) {
      toast.info("You are already on this plan");
      return;
    }
    setUpgradeTarget(plan);
    setShowPaymentCheckout(true);
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    if (!upgradeTarget) return;

    // Convert plan name to lowercase to match QUOTA_LIMITS keys (business, enterprise, etc)
    const normalizedPlanName = upgradeTarget.name.toLowerCase().trim();

    await upgradePlan(normalizedPlanName as any, {
      amount: upgradeTarget.price,
      transactionId: paymentData.paymentId,
    });

    setShowPaymentCheckout(false);
    setUpgradeTarget(null);
    toast.success("Plan upgraded successfully!");
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 overflow-hidden max-w-7xl mx-auto">
      {/* Header */}
      <div data-aos="fade-down">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">My Plan</h1>
        <p className="text-gray-600">
          Manage your subscription and explore available plans to upgrade your
          experience.
        </p>
      </div>

      {/* Current Plan Display */}
      {user && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl">Your Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 uppercase font-bold mb-1">
                  Plan Name
                </p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {user.plan}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase font-bold mb-1">
                  Monthly Quota
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.monthlyQuota.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase font-bold mb-1">
                  Used This Month
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.usedQuota.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Usage Progress</span>
                <span>
                  {Math.round((user.usedQuota / user.monthlyQuota) * 100)}%
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                  style={{
                    width: `${Math.min(100, (user.usedQuota / user.monthlyQuota) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {(user.monthlyQuota - user.usedQuota).toLocaleString()} credits
                remaining
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans Section */}
      {subscriptionPlans.length > 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              📅 Subscription Plans
            </h2>
            <p className="text-gray-600">
              Monthly recurring plans with daily credits. Perfect for consistent
              users.
            </p>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => {
              const isCurrentPlan = currentPlanName === plan.name.toLowerCase();

              return (
                <Card
                  key={plan.id}
                  className={`border-2 transition-all duration-300 flex flex-col ${
                    plan.popular
                      ? "border-green-500 shadow-xl bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <CardHeader className="pb-3 relative">
                    <CardTitle className="text-xl font-bold text-gray-900">
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
                      onClick={() => !isCurrentPlan && handlePlanCTA(plan)}
                    >
                      {isCurrentPlan
                        ? "✓ Current Plan"
                        : "Upgrade to this plan"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden space-y-6">
            {subscriptionPlans.length > 0 && (
              <div className="space-y-4">
                <div
                  className="relative"
                  onTouchStart={(e) => {
                    (e.currentTarget as any).touchStart =
                      e.targetTouches[0].clientX;
                  }}
                  onTouchEnd={(e) => {
                    const touchStart = (e.currentTarget as any).touchStart;
                    const touchEnd = e.changedTouches[0].clientX;
                    const distance = touchStart - touchEnd;

                    if (distance > 50) {
                      setSubscriptionCarouselIndex(
                        (prev) => (prev + 1) % subscriptionPlans.length,
                      );
                    } else if (distance < -50) {
                      setSubscriptionCarouselIndex(
                        (prev) =>
                          (prev - 1 + subscriptionPlans.length) %
                          subscriptionPlans.length,
                      );
                    }
                  }}
                >
                  {(() => {
                    const plan = subscriptionPlans[subscriptionCarouselIndex];
                    const isCurrentPlan =
                      currentPlanName === plan.name.toLowerCase();

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
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                              Daily Credits
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                              {plan.dailyCredits?.toLocaleString() ||
                                plan.quota?.toLocaleString()}
                            </p>
                          </div>

                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                              Monthly Cost
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              ₹{plan.price.toLocaleString()}
                            </p>
                          </div>

                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                              Monthly Quota
                            </p>
                            <p className="text-2xl font-bold text-purple-600">
                              {(plan.quota || 0).toLocaleString()}
                            </p>
                          </div>

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
                            {isCurrentPlan ? "✓ Current Plan" : "Upgrade"}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })()}
                </div>

                {/* Navigation Controls */}
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
              </div>
            )}
          </div>
        </div>
      )}

      {/* One-Time Plans Section */}
      {onetimePlans.length > 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🚀 One-Time Top-ups
            </h2>
            <p className="text-gray-600">
              Need extra credits? Purchase one-time top-ups that never expire.
            </p>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-6">
            {onetimePlans.map((plan) => {
              return (
                <Card
                  key={plan.id}
                  className={`border-2 transition-all duration-300 flex flex-col ${
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
                  <CardHeader className="pb-3 relative">
                    <CardTitle className="text-xl font-bold text-gray-900">
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
                        plan.popular
                          ? "bg-orange-600 hover:bg-orange-700 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                      onClick={() => handlePlanCTA(plan)}
                    >
                      Purchase Now
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden space-y-6">
            {onetimePlans.length > 0 && (
              <div className="space-y-4">
                <div
                  className="relative"
                  onTouchStart={(e) => {
                    (e.currentTarget as any).touchStart =
                      e.targetTouches[0].clientX;
                  }}
                  onTouchEnd={(e) => {
                    const touchStart = (e.currentTarget as any).touchStart;
                    const touchEnd = e.changedTouches[0].clientX;
                    const distance = touchStart - touchEnd;

                    if (distance > 50) {
                      setOnetimeCarouselIndex(
                        (prev) => (prev + 1) % onetimePlans.length,
                      );
                    } else if (distance < -50) {
                      setOnetimeCarouselIndex(
                        (prev) =>
                          (prev - 1 + onetimePlans.length) %
                          onetimePlans.length,
                      );
                    }
                  }}
                >
                  {(() => {
                    const plan = onetimePlans[onetimeCarouselIndex];

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
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                              Total Credits
                            </p>
                            <p className="text-2xl font-bold text-orange-600">
                              {plan.quota.toLocaleString()}
                            </p>
                          </div>

                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                              One-Time Price
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              ₹{plan.price.toLocaleString()}
                            </p>
                          </div>

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

                          <Button
                            className={`w-full py-3 text-sm font-bold mt-auto transition-all duration-300 ${
                              plan.popular
                                ? "bg-orange-600 hover:bg-orange-700 text-white"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                            onClick={() => handlePlanCTA(plan)}
                          >
                            Purchase
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })()}
                </div>

                {/* Navigation Controls */}
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
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Checkout Modal */}
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
