interface PageTitleProps {
  title: string;
  highlight: string;
  subtitle?: string;
  gradient?: string;
}

const PageTitle = ({ 
  title, 
  highlight, 
  subtitle,
  gradient = 'from-blue-400 to-purple-600'
}: PageTitleProps) => {
  return (
    <div className="text-center mb-6">
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">
        {title}{' '}
        <span className={`text-transparent bg-clip-text bg-linear-to-r ${gradient}`}>
          {highlight}
        </span>
      </h1>
      {subtitle && (
        <p className="text-zinc-500 text-lg">{subtitle}</p>
      )}
    </div>
  );
};

export default PageTitle;

