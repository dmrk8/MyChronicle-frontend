interface PageHolderProps {
  children: React.ReactNode;
  className?: string;
}

const PageHolder = ({ children, className }: PageHolderProps) => (
  <div
    className={`min-h-screen bg-linear-to-b from-zinc-950 via-black to-zinc-950 ${className ?? ''}`}
  >
    {children}
  </div>
);

export default PageHolder;
