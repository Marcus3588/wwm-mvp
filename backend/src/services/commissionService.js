

const platformConfig = require('../config/platform');


async function calculateBookingBreakdown(totalAmountCents) {
  const commissionCfg = await platformConfig.getConfig('commission');
  const serviceFeeCfg = await platformConfig.getConfig('service_fee');

  const pct = commissionCfg?.percentage ?? 15;
  const minCents = commissionCfg?.min_cents ?? 5000;
  const feePct = serviceFeeCfg?.percentage ?? 2.5;
  const feeFlat = serviceFeeCfg?.flat_cents ?? 0;

  
  const commissionCents = Math.max(minCents, Math.round((totalAmountCents * pct) / 100));
  const serviceFeeCents = Math.round((totalAmountCents * feePct) / 100) + feeFlat;
  const vendorPayoutCents = Math.max(0, totalAmountCents - commissionCents);

  return {
    totalCents: totalAmountCents,
    serviceFeeCents,
    subtotalCents: totalAmountCents,
    commissionCents,
    vendorPayoutCents,
  };
}


async function getCancellationPenalty(eventDate, cancelDate, totalAmountCents) {
  const cfg = await platformConfig.getConfig('cancellation');
  const hoursBefore = (new Date(eventDate) - new Date(cancelDate)) / (1000 * 60 * 60);

  let penaltyPct = 0;
  if (hoursBefore < 24) penaltyPct = cfg?.within_24h_penalty_pct ?? 100;
  else if (hoursBefore < 48) penaltyPct = cfg?.within_48h_penalty_pct ?? 50;
  else if (hoursBefore < 168) penaltyPct = cfg?.within_7d_penalty_pct ?? 25; 

  const penaltyCents = Math.round((totalAmountCents * penaltyPct) / 100);
  const refundCents = totalAmountCents - penaltyCents;

  return {
    penaltyPct,
    penaltyCents,
    refundCents: Math.max(0, refundCents),
  };
}


async function getServiceFeeForDisplay(subtotalCents) {
  const cfg = await platformConfig.getConfig('service_fee');
  const pct = cfg?.percentage ?? 2.5;
  const flat = cfg?.flat_cents ?? 0;
  return Math.round((subtotalCents * pct) / 100) + flat;
}

module.exports = {
  calculateBookingBreakdown,
  getCancellationPenalty,
  getServiceFeeForDisplay,
};
