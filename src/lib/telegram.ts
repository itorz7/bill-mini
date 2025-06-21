interface TelegramMessage {
  botToken: string;
  chatId: string;
  message: string;
  parseMode?: 'HTML' | 'Markdown';
}

export async function sendTelegramNotification({
  botToken,
  chatId,
  message,
  parseMode = 'HTML'
}: {
  botToken: string;
  chatId: string;
  message: string;
  parseMode?: 'HTML' | 'Markdown';
}): Promise<boolean> {
  if (!botToken || !chatId) {
    console.log('Missing bot token or chat ID');
    return false;
  }

  return sendTelegramMessage({ botToken, chatId, message, parseMode });
}

export async function sendTelegramPhoto({
  botToken,
  chatId,
  photo,
  caption,
  parseMode = 'HTML'
}: {
  botToken: string;
  chatId: string;
  photo: File;
  caption?: string;
  parseMode?: 'HTML' | 'Markdown';
}): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', photo);
    if (caption) {
      formData.append('caption', caption);
      formData.append('parse_mode', parseMode);
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Telegram photo API error:', result);
      return false;
    }

    return result.ok;
  } catch (error) {
    console.error('Error sending Telegram photo:', error);
    return false;
  }
}

export async function sendTelegramMessage({
  botToken,
  chatId,
  message,
  parseMode = 'HTML'
}: TelegramMessage): Promise<boolean> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: parseMode,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Telegram API error:', result);
      return false;
    }

    return result.ok;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}

export function formatNewTransactionMessage(transaction: {
  id: string;
  recipientNameTh: string | null;
  recipientNameEn: string | null;
  paymentType: string;
  target: string;
  amount: string;
  createdAt: string;
}): string {
  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(num);
  };

  const formatTarget = (target: string, type: string) => {
    if (type === 'MSISDN') {
      return target.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    } else {
      return target.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-$2-$3-$4-$5');
    }
  };

  const paymentTypeText = transaction.paymentType === 'MSISDN' ? 'เบอร์โทรศัพท์' : 'เลขบัตรประชาชน';
  
  return `🆕 <b>รายการใหม่!</b>

💰 <b>จำนวนเงิน:</b> ${formatAmount(transaction.amount)}
👤 <b>ผู้รับเงิน:</b> ${transaction.recipientNameTh || 'ไม่ระบุ'}
📱 <b>${paymentTypeText}:</b> ${formatTarget(transaction.target, transaction.paymentType)}
🆔 <b>รหัสรายการ:</b> ${transaction.id.slice(0, 8)}
🕐 <b>เวลา:</b> ${new Date(transaction.createdAt).toLocaleString('th-TH')}

✅ รอลูกค้าชำระเงินและอัพโหลดสลิป`;
}

export function formatSlipVerifiedMessage(transaction: {
  id: string;
  recipientNameTh: string | null;
  recipientNameEn: string | null;
  amount: string;
  target: string;
  paymentType: string;
}): string {
  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(num);
  };

  const formatTarget = (target: string, type: string) => {
    if (type === 'MSISDN') {
      return target.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    } else {
      return target.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-$2-$3-$4-$5');
    }
  };

  const paymentTypeText = transaction.paymentType === 'MSISDN' ? 'เบอร์โทรศัพท์' : 'เลขบัตรประชาชน';

  return `✅ <b>ได้รับชำระเงินแล้ว!</b>

💰 <b>จำนวนเงิน:</b> ${formatAmount(transaction.amount)}
👤 <b>ผู้รับเงิน:</b> ${transaction.recipientNameTh || 'ไม่ระบุ'}
📱 <b>${paymentTypeText}:</b> ${formatTarget(transaction.target, transaction.paymentType)}
🆔 <b>รหัสรายการ:</b> ${transaction.id.slice(0, 8)}
🕐 <b>เวลายืนยัน:</b> ${new Date().toLocaleString('th-TH')}

🎉 สลิปถูกตรวจสอบและยืนยันเรียบร้อยแล้ว!`;
} 