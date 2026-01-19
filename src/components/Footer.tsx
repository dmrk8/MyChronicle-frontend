import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    browse: [
      { label: 'Anime', path: '/anime/search' },
      { label: 'Manga', path: '/manga/search' },
      { label: 'Movies', path: '/movie/search' },
      { label: 'TV Shows', path: '/tv/search' },
    ],
    company: [
      { label: 'Features', path: '/about' },
      { label: 'Roadmap', path: '/contact' },
      { label: 'Changelog', path: '/blog' },
      { label: 'FAQ', path: '/careers' },
    ],
    support: [
      { label: 'Help Center', path: '/help' },
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'FAQ', path: '/faq' },
    ],
  };

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2 mb-4 cursor-pointer"
            >
              
              <span className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-600">
                MyChronicle
              </span>
            </div>
            <p className="text-zinc-400 text-sm mb-4 max-w-sm">
              Your all-in-one companion for tracking anime, manga, movies, and
              TV shows. Discover, organize, and enjoy more.
            </p>
          </div>

          {/* Browse Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Browse</h3>
            <ul className="space-y-2">
              {footerLinks.browse.map((link) => (
                <li key={link.path}>
                  <span
                    onClick={() => {
                      navigate(link.path);
                      window.scrollTo(0, 0);
                    }}
                    className="text-zinc-400 hover:text-white text-sm transition-colors duration-200 cursor-pointer"
                  >
                    {link.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          {/*
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <span
                    onClick={() => navigate(link.path)}
                    className="text-zinc-400 hover:text-white text-sm transition-colors duration-200 cursor-pointer"
                  >
                    {link.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          */}

          {/* Support Links */}
          {/*
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <span
                    onClick={() => navigate(link.path)}
                    className="text-zinc-400 hover:text-white text-sm transition-colors duration-200 cursor-pointer"
                  >
                    {link.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          */}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-zinc-500 text-sm text-center md:text-left">
              © {currentYear} MyChronicle.
            </p>
            {/*
            <div className="flex items-center gap-6">
              <span
                onClick={() => navigate('/privacy')}
                className="text-zinc-500 hover:text-white text-sm transition-colors duration-200 cursor-pointer"
              >
                Privacy
              </span>
              <span
                onClick={() => navigate('/terms')}
                className="text-zinc-500 hover:text-white text-sm transition-colors duration-200 cursor-pointer"
              >
                Terms
              </span>
              <span
                onClick={() => navigate('/cookies')}
                className="text-zinc-500 hover:text-white text-sm transition-colors duration-200 cursor-pointer"
              >
                Cookies
              </span>
            </div>
            */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
