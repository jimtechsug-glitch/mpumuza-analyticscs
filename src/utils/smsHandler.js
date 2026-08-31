/**
 * Africa's Talking SMS API Gateway Integration Simulator for Mpumuza Analytics
 */

export function formatResultSMS(studentName, lin, schoolName, term, summaryText, feeBalance, parentPhone) {
  const formattedBalance = feeBalance > 0 
    ? `Fee Bal: UGX ${Number(feeBalance).toLocaleString()}` 
    : 'Fees: Cleared (UGX 0)';

  return `[${schoolName.substring(0, 20)}] Dear Parent, ${studentName} (${lin}) End of ${term} results: ${summaryText}. ${formattedBalance}. Next Term Opens: 14/09/2026. Portal: mpumuza.ac.ug/p/${lin}`;
}

export function sendSMSBroadcast(recipientsList, messageTemplate) {
  // recipientsList = [{ id, name, phone, message }, ...]
  const logs = [];
  let totalCostUGX = recipientsList.length * 50; // 50 UGX per SMS credit in Uganda

  recipientsList.forEach(rec => {
    logs.push({
      id: `sms-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      recipientName: rec.name,
      phone: rec.phone || '0770000000',
      message: rec.message || messageTemplate,
      status: 'DELIVERED',
      cost: '50 UGX',
      timestamp: new Date().toISOString()
    });
  });

  return {
    success: true,
    sentCount: recipientsList.length,
    totalCostUGX,
    logs
  };
}
