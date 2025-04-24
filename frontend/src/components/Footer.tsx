import React from 'react';
import { Github, Twitter, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const githubUrl = "https://github.com/leetebbs/simple_VRF"; // Your GitHub repo
  const twitterUrl = "https://x.com/LTebbs2"; // Your Twitter profile
  const emailAddress = "tebbouk@gmail.com"; // Your email

  return (
    <footer className="bg-navy-950 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-slate-400 text-sm">
              © {currentYear} RandomizeX. All rights reserved.
            </p>
          </div>
          
          <div className="flex space-x-6">
            <a 
              href={githubUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-400 hover:text-teal-400 transition-colors" 
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
            <a 
              href={twitterUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-400 hover:text-teal-400 transition-colors" 
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </a>
            <a 
              href={`mailto:${emailAddress}`} 
              className="text-slate-400 hover:text-teal-400 transition-colors" 
              aria-label="Email"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;