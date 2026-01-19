import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  explore: [
    { label: 'All Rooms', href: '/rooms' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Blog', href: '/blog' },
    { label: 'About Us', href: '/about' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'FAQs', href: '/faqs' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Cancellation Policy', href: '/policies/cancellation' },
  ],
  policies: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Refund Policy', href: '/policies/refund' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-gold-dark flex items-center justify-center">
                <span className="text-xl font-display font-bold text-white">S</span>
              </div>
              <span className="text-xl font-display font-semibold">Staycation</span>
            </Link>
            
            <p className="text-primary-foreground/70 mb-6 max-w-sm">
              Premium hourly hotel rooms for your perfect moments. Book by the hour, stay on your terms.
            </p>

            <div className="space-y-3">
              <a href="tel:+911234567890" className="flex items-center gap-3 text-primary-foreground/80 hover:text-accent transition-colors">
                <Phone className="w-4 h-4" />
                +91 123 456 7890
              </a>
              <a href="mailto:hello@staycation.com" className="flex items-center gap-3 text-primary-foreground/80 hover:text-accent transition-colors">
                <Mail className="w-4 h-4" />
                hello@staycation.com
              </a>
              <div className="flex items-start gap-3 text-primary-foreground/80">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>123 Business Bay, Mumbai, Maharashtra 400001</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Explore</h4>
            <ul className="space-y-3">
              {footerLinks.explore.map(link => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map(link => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Policies</h4>
            <ul className="space-y-3">
              {footerLinks.policies.map(link => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © {new Date().getFullYear()} Staycation. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            {socialLinks.map(social => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
