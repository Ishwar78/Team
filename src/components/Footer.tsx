import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-card/50">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground text-xs">W</div>
            <span className="font-bold text-foreground">WEBMOK</span>
          </div>
          <p className="text-sm text-muted-foreground">Enterprise employee monitoring & productivity platform.</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-3 text-sm">Product</h4>
          <div className="flex flex-col gap-2">
            <Link to="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/download" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Download</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-3 text-sm">Solutions</h4>
          <div className="flex flex-col gap-2">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Workforce Analytics</Link>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Time Reporting</Link>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Productivity</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-3 text-sm">Company</h4>
          <div className="flex flex-col gap-2">
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Login</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border mt-8 pt-6 text-center text-xs text-muted-foreground">
        © 2026 WEBMOK. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
