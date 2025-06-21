export async function validateEasySlipApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch('https://developer.easyslip.com/api/v1/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      return { valid: true };
    } else if (response.status === 401) {
      return { valid: false, error: 'API Key ไม่ถูกต้องหรือหมดอายุ' };
    } else {
      return { valid: false, error: 'ไม่สามารถตรวจสอบ API Key ได้' };
    }
  } catch (error) {
    console.error('Error validating EasySlip API key:', error);
    return { valid: false, error: 'เกิดข้อผิดพลาดในการตรวจสอบ API Key' };
  }
}

export async function validateTelegramBotToken(botToken: string): Promise<{ valid: boolean; error?: string; botInfo?: { name: string; username: string } }> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`, {
      method: 'GET'
    });

    const result = await response.json();

    if (response.ok && result.ok) {
      return { 
        valid: true, 
        botInfo: {
          name: result.result.first_name,
          username: result.result.username
        }
      };
    } else {
      return { valid: false, error: 'Bot Token ไม่ถูกต้อง' };
    }
  } catch (error) {
    console.error('Error validating Telegram bot token:', error);
    return { valid: false, error: 'เกิดข้อผิดพลาดในการตรวจสอบ Bot Token' };
  }
} 