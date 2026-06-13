import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MigrateIQ — AI-Powered Data Migration',
  description: 'Zero-friction enterprise data migration from SQL databases to Databricks and Microsoft Fabric. Orchestrated by AI agents.',
  keywords: ['databricks', 'microsoft fabric', 'data migration', 'ETL', 'delta lake', 'SQL migration'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
