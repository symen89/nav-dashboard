import '../globals.css';

export const metadata = {
  title: 'A-DAM Capital - NAV Dashboard',
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body style={{ margin: 0, padding: 0, background: '#0f151b' }}>
        {children}
      </body>
    </html>
  );
}
