import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const auth = new JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export async function getMembers() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'All Members!A2:B',
  });
  // Return array of { name, role }
  return (response.data.values || []).map(row => ({
    name: row[0],
    role: row[1] || '',
  }));
}

export async function appendCheckIn(name: string) {
  const now = new Date();
  const date = now.toLocaleDateString('en-US', { timeZone: 'Asia/Bangkok' });
  const time = now.toLocaleTimeString('en-US', { 
    timeZone: 'Asia/Bangkok',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Check-in!A:C',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[name, date, time]],
    },
  });
} 