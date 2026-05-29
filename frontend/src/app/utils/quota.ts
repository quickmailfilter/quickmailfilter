const DAY_MS = 24 * 60 * 60 * 1000;

type QuotaUser = {
  planType?: "subscription" | "onetime";
  billingPeriod?: "monthly" | "daily" | "one-time";
  monthlyQuota: number;
  usedQuota: number;
  dailyCredits?: number;
  dailyUsedQuota?: number;
  lastDailyReset?: Date;
  quotaPeriodStartedAt?: Date;
  createdAt?: Date;
};

const startOfUtcDay = (date: Date) =>
  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

export const isSameUtcDay = (a?: Date, b = new Date()) => {
  if (!a || Number.isNaN(a.getTime())) return false;
  return startOfUtcDay(a) === startOfUtcDay(b);
};

export const isDailyQuotaStale = (lastDailyReset?: Date) =>
  !isSameUtcDay(lastDailyReset);

export const getQuotaStatus = (user: QuotaUser) => {
  const isOneTimePlan =
    user.planType === "onetime" || user.billingPeriod === "one-time";
  const monthlyQuota = user.monthlyQuota || 0;
  const usedQuota = user.usedQuota || 0;
  const dailyCredits = isOneTimePlan ? 0 : user.dailyCredits || 0;
  const dailyUsedQuota = isDailyQuotaStale(user.lastDailyReset)
    ? 0
    : user.dailyUsedQuota || 0;
  const monthlyRemaining = Math.max(0, monthlyQuota - usedQuota);

  if (dailyCredits <= 0) {
    return {
      monthlyQuota,
      usedQuota,
      monthlyRemaining,
      effectiveMonthlyRemaining: monthlyRemaining,
      dailyCredits: 0,
      dailyUsedQuota: 0,
      dailyRemaining: monthlyRemaining,
      daysRemaining: 0,
      periodDays: 0,
      dailyLimitReached: false,
      monthlyLimitReached: monthlyRemaining <= 0,
    };
  }

  const periodDays = Math.max(1, Math.ceil(monthlyQuota / dailyCredits));
  const periodStart =
    user.quotaPeriodStartedAt || user.lastDailyReset || user.createdAt || new Date();
  const elapsedDays = Math.max(
    0,
    Math.floor((startOfUtcDay(new Date()) - startOfUtcDay(periodStart)) / DAY_MS),
  );
  const daysRemaining = Math.max(0, periodDays - elapsedDays);
  const dailyRemaining = Math.max(0, dailyCredits - dailyUsedQuota);
  const futureDailyCredits = Math.max(0, daysRemaining - 1) * dailyCredits;
  const scheduledRemaining =
    daysRemaining > 0 ? dailyRemaining + futureDailyCredits : 0;
  const effectiveMonthlyRemaining = Math.min(
    monthlyRemaining,
    scheduledRemaining,
  );

  return {
    monthlyQuota,
    usedQuota,
    monthlyRemaining,
    effectiveMonthlyRemaining,
    dailyCredits,
    dailyUsedQuota,
    dailyRemaining,
    daysRemaining,
    periodDays,
    dailyLimitReached: daysRemaining <= 0 || dailyRemaining <= 0,
    monthlyLimitReached: monthlyRemaining <= 0 || effectiveMonthlyRemaining <= 0,
  };
};
