import React from 'react';
import { CheckCircle } from 'lucide-react'; // Optional: Add an icon for visual flair

const Features: React.FC = () => {
  const featuresList = [
    {
      title: "Verifiable Randomness",
      description: "Utilizes a custom Verifiable Random Function (VRF) approach, ensuring that generated numbers are truly random and their generation process can be cryptographically verified on-chain.",
      icon: <CheckCircle className="text-teal-400" />
    },
    {
      title: "On-Chain Generation & Verification",
      description: "Random numbers are requested and their validity confirmed directly through smart contracts on the Scroll Sepolia Testnet, providing transparency and trust.",
      icon: <CheckCircle className="text-teal-400" />
    },
    {
      title: "Enhanced Security via ECDSA",
      description: "The off-chain oracle uses ECDSA signatures to sign the generated random numbers, preventing tampering and ensuring the integrity of the randomness delivered to the smart contract.",
      icon: <CheckCircle className="text-teal-400" />
    },
    {
      title: "Decentralized & Transparent",
      description: "Leverages blockchain technology for a decentralized process. All requests and verifications are recorded on-chain, making the system transparent and auditable.",
      icon: <CheckCircle className="text-teal-400" />
    },
    {
      title: "Simple User Interface",
      description: "Provides a clean React-based frontend allowing users to easily request random numbers and view the results without needing deep technical knowledge.",
      icon: <CheckCircle className="text-teal-400" />
    },
    {
      title: "Testnet Deployment",
      description: "Currently deployed on the Scroll Sepolia Testnet, allowing for experimentation and demonstration without real-world costs.",
      icon: <CheckCircle className="text-teal-400" />
    }
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-teal-400 text-center">RandomizeX Features</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-300">
        {featuresList.map((feature, index) => (
          <div key={index} className="bg-navy-800/50 p-6 rounded-lg shadow-md border border-gray-700 hover:border-teal-500 transition-colors duration-300">
            <div className="flex items-center mb-3">
              {feature.icon && <span className="mr-3">{feature.icon}</span>}
              <h2 className="text-xl font-semibold text-teal-500">{feature.title}</h2>
            </div>
            <p className="leading-relaxed text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;