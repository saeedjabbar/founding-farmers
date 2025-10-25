import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Chronicle Timeline',
  description: 'Investigative timeline experience with dynamic themes and storytelling.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
