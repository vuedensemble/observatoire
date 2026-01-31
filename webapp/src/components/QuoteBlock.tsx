interface QuoteBlockProps {
  children: React.ReactNode;
}

export default function QuoteBlock({ children }: QuoteBlockProps) {
  return (
    <div className="quote-block">
      {children}
    </div>
  );
}
