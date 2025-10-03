import './global.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Test Tailwind Setup',
    description: 'Checking Tailwind in Next.js',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="bg-gray-100 text-gray-900">{children}</body>
        </html>
    );
}
