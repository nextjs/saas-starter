export default function EmbedLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    // This layout overrides the main dashboard layout to provide a chromeless view
    // suitable for embedding in an iframe.
    // The root layout (app/layout.tsx) still provides the <html>, <body>,
    // and ThemeProvider.
    return <>{children}</>;
}