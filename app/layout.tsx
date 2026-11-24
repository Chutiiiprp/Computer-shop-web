import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BYTEFORGE | Gaming & Tech Store',
  description: 'ร้านคอมพิวเตอร์และอุปกรณ์ไอทีสำหรับเกมเมอร์และคนทำงาน',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body>{children}</body></html>;
}
