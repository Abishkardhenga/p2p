import { Link } from "react-router-dom";
import { Twitter, Github, MessageSquare } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background/60 backdrop-blur-md ">
  <div className="m-10">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; 2025 Sui Prompt Marketplace. All rights reserved.
          </p>
        </div>
    </footer>
  );
};

export default Footer;
