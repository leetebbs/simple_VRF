import React from 'react';
import { Mail, Github, Send } from 'lucide-react'; // Import icons

const Contact: React.FC = () => {
  // Replace placeholders with your actual information
  const contactEmail = "tebbouk@gmail.com"; // Updated email
  const githubRepoUrl = "https://github.com/leetebbs/simple_VRF"; // Updated GitHub repo URL

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-teal-400 text-center">Contact Us</h1>

      <div className="space-y-8 text-gray-300">
        <section className="bg-navy-800/50 p-6 rounded-lg shadow-md border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-teal-500 flex items-center">
            <Mail className="mr-3 h-6 w-6" /> Get in Touch
          </h2>
          <p className="leading-relaxed mb-4">
            Have questions, feedback, or want to collaborate? Feel free to reach out.
          </p>
          <a
            href={`mailto:${contactEmail}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-900 focus:ring-teal-500 transition-colors"
          >
            <Send className="mr-2 h-4 w-4" /> Send Email
          </a>
          <p className="mt-4 text-sm text-gray-400">
            Or email me directly at: <a href={`mailto:${contactEmail}`} className="text-teal-400 hover:underline">{contactEmail}</a>
          </p>
        </section>

        <section className="bg-navy-800/50 p-6 rounded-lg shadow-md border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-teal-500 flex items-center">
            <Github className="mr-3 h-6 w-6" /> Project Repository
          </h2>
          <p className="leading-relaxed mb-4">
            Check out the source code, report issues, or contribute to the project on GitHub.
          </p>
          <a
            href={githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-900 focus:ring-gray-500 transition-colors"
          >
            <Github className="mr-2 h-4 w-4" /> View on GitHub
          </a>
        </section>

        {/* Add more sections here for Twitter, Discord, etc. if needed */}
        {/* 
        <section className="bg-navy-800/50 p-6 rounded-lg shadow-md border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-teal-500 flex items-center">
             <Icon className="mr-3 h-6 w-6" /> Other Links 
          </h2>
           <p>...</p> 
           <a href="..." >...</a> 
        </section> 
        */}

      </div>
    </div>
  );
};

export default Contact;