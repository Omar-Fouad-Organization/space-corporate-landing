import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, 
  Calendar, 
  Users, 
  MapPin, 
  Award, 
  ArrowRight, 
  Menu, 
  X,
  Building2,
  Target,
  Handshake,
  Ruler,
  Zap,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Star,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Instagram
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Performance optimization: Memoized components
const MemoizedServiceCard = React.memo(({ service, index }: { service: any, index: number }) => (
  <Card className="card-corporate group">
    <CardContent className="p-8 text-center space-y-4">
      <div className="mb-6 flex justify-center">
        <div className={`p-4 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-lg border border-gray-100 group-hover:shadow-xl transition-all duration-300 ${service.color}`}>
          <service.icon className="w-8 h-8" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="text-xl font-heading font-bold uppercase tracking-wide text-foreground">
        {service.title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        {service.description}
      </p>
    </CardContent>
  </Card>
));

const MemoizedProjectCard = React.memo(({ project, index }: { project: any, index: number }) => (
  <Card className="card-corporate group">
    <CardContent className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <Badge variant="outline" className="text-xs">
          {project.category}
        </Badge>
        <div className="flex items-center space-x-1 text-yellow-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-current" />
          ))}
        </div>
      </div>
      <h3 className="text-lg font-heading font-bold text-foreground">
        {project.name}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {project.description}
      </p>
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>2024</span>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
          View Details
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </CardContent>
  </Card>
));

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [contentData, setContentData] = useState<any>({});
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Performance optimization: Memoized content loading
  const loadContent = useCallback(async () => {
    try {
      // Load content sections
      const { data: content } = await supabase
        .from('content_sections_2026_01_01_12_00')
        .select('*')
        .eq('is_published', true);
      
      if (content) {
        const contentMap: any = {};
        content.forEach((section: any) => {
          contentMap[section.section_key] = section.content;
        });
        setContentData(contentMap);
      }
      
      // Load site settings
      const { data: settings } = await supabase
        .from('site_settings_2026_01_01_12_00')
        .select('*');
      
      if (settings) {
        const settingsMap: any = {};
        settings.forEach((setting: any) => {
          settingsMap[setting.setting_key] = setting.setting_value;
        });
        setSiteSettings(settingsMap);
      }
      
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load content from database
  useEffect(() => {
    loadContent();
    
    // Set up interval to refresh settings every 30 seconds
    const interval = setInterval(() => {
      loadContent();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadContent]);

  // Enhanced scroll handling with performance optimization
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollPosition = window.scrollY;
          setIsScrolled(scrollPosition > 50);
          
          // Update active section
          const sections = ['home', 'about', 'services', 'work', 'green-life-expo', 'contact'];
          const scrollPos = scrollPosition + 100;

          for (const section of sections) {
            const element = document.getElementById(section);
            if (element) {
              const { offsetTop, offsetHeight } = element;
              if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
                setActiveSection(section);
                break;
              }
            }
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Memoized services data
  const services = useMemo(() => [
    {
      title: "Exhibition Organizing",
      description: "End-to-end exhibition planning and execution with precision and scale.",
      icon: Building2,
      color: "text-blue-600"
    },
    {
      title: "Conference Management",
      description: "Strategic conference planning from concept to completion.",
      icon: Target,
      color: "text-emerald-600"
    },
    {
      title: "Sponsorship Planning",
      description: "Comprehensive sponsorship strategies that deliver measurable results.",
      icon: Handshake,
      color: "text-purple-600"
    },
    {
      title: "Venue & Layout Design",
      description: "Innovative space design optimized for engagement and flow.",
      icon: Ruler,
      color: "text-orange-600"
    },
    {
      title: "On-ground Execution",
      description: "Flawless event execution with dedicated project management.",
      icon: Zap,
      color: "text-red-600"
    }
  ], []);

  // Memoized projects data
  const projects = useMemo(() => [
    {
      name: "Tech Innovation Summit 2024",
      category: "Conference",
      description: "3-day technology conference with 500+ attendees and 50+ speakers."
    },
    {
      name: "Green Energy Expo",
      category: "Exhibition",
      description: "Sustainable energy showcase featuring 200+ exhibitors and 10,000+ visitors."
    },
    {
      name: "Healthcare Leadership Forum",
      category: "Conference",
      description: "Executive healthcare summit with industry leaders and policy makers."
    },
    {
      name: "Smart Cities Exhibition",
      category: "Exhibition",
      description: "Urban innovation showcase with cutting-edge smart city solutions."
    }
  ], []);

  // Enhanced scroll to section function
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  }, []);

  // Enhanced menu toggle
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading SPACE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header with scroll effects */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md shadow-lg border-b border-border/50' 
          : 'bg-transparent'
      }`}>
        <div className="container-corporate">
          <div className="flex items-center justify-between py-4">
            {/* Enhanced Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src={siteSettings.general?.logoUrl || "/images/space_logo_20260101_120021.png"} 
                  alt="SPACE Logo" 
                  className="h-40 w-auto transition-all duration-300 hover:scale-105"
                  loading="eager"
                />
              </div>
            </div>

            {/* Enhanced Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {[
                { id: 'home', label: 'Home' },
                { id: 'about', label: 'About' },
                { id: 'services', label: 'Services' },
                { id: 'work', label: 'Our Work' },
                { id: 'green-life-expo', label: 'Green Life Expo', isExternal: true },
                { id: 'contact', label: 'Contact' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.isExternal) {
                      window.open('https://greenlife-expo.com', '_blank');
                    } else {
                      scrollToSection(item.id);
                    }
                  }}
                  className={`nav-link transition-all duration-300 relative group ${
                    activeSection === item.id ? 'text-primary' : 'text-foreground hover:text-primary'
                  }`}
                >
                  {item.label}
                  {item.isExternal && <ExternalLink className="inline w-3 h-3 ml-1" />}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300 ${
                    activeSection === item.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}></span>
                </button>
              ))}
            </nav>

            {/* Enhanced Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Enhanced Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
              <nav className="flex flex-col space-y-4">
                {[
                  { id: 'home', label: 'Home' },
                  { id: 'about', label: 'About' },
                  { id: 'services', label: 'Services' },
                  { id: 'work', label: 'Our Work' },
                  { id: 'green-life-expo', label: 'Green Life Expo', isExternal: true },
                  { id: 'contact', label: 'Contact' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.isExternal) {
                        window.open('https://greenlife-expo.com', '_blank');
                      } else {
                        scrollToSection(item.id);
                      }
                    }}
                    className={`text-left py-2 px-4 rounded-lg transition-all duration-200 flex items-center ${
                      activeSection === item.id 
                        ? 'text-primary bg-primary/10' 
                        : 'text-foreground hover:text-primary hover:bg-muted'
                    }`}
                  >
                    {item.label}
                    {item.isExternal && <ExternalLink className="w-4 h-4 ml-2" />}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with parallax effect */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero_background_20260101_120022.png" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-30"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/70"></div>
        </div>
        
        {/* Animated diagonal divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <img 
            src="/images/diagonal_divider_20260101_120021.png" 
            alt="Diagonal Divider" 
            className="w-full h-auto opacity-80"
            loading="lazy"
          />
        </div>

        <div className="container-corporate relative z-10 text-center space-y-8">
          <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
            <h1 className="heading-hero text-foreground leading-tight">
              {contentData.hero?.title || "Organizing Exhibitions & Conferences"}
            </h1>
            <p className="text-corporate text-xl max-w-3xl mx-auto leading-relaxed">
              {contentData.hero?.subtitle || "Premium event management solutions that deliver exceptional experiences and measurable results for your business."}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in-50 slide-in-from-bottom-4 duration-1000 delay-300">
            <Button 
              onClick={() => scrollToSection('contact')}
              className="btn-corporate px-8 py-6 text-lg group"
            >
              Get in Touch
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => scrollToSection('services')}
              className="btn-corporate-outline px-8 py-6 text-lg"
            >
              View Services
            </Button>
          </div>

          {/* Enhanced Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 animate-in fade-in-50 slide-in-from-bottom-4 duration-1000 delay-500">
            {[
              { number: "500+", label: "Events Organized" },
              { number: "50K+", label: "Attendees" },
              { number: "200+", label: "Happy Clients" },
              { number: "15+", label: "Years Experience" }
            ].map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-3xl md:text-4xl font-heading font-bold text-primary">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced About Section */}
      <section id="about" className="section-padding">
        <div className="container-corporate">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="heading-section text-foreground">
                  {contentData.about?.title || "About SPACE"}
                </h2>
                <p className="text-corporate leading-relaxed">
                  {contentData.about?.description || "We are a premier event management company specializing in exhibitions and conferences. With over 15 years of experience, we have successfully organized more than 500 events, bringing together industry leaders and creating meaningful connections."}
                </p>
              </div>
              
              {/* Enhanced Features List */}
              <div className="space-y-4">
                {[
                  "15+ Years of Industry Experience",
                  "500+ Successful Events Delivered",
                  "50,000+ Satisfied Attendees",
                  "Award-Winning Event Solutions"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => scrollToSection('contact')}
                className="btn-corporate group"
              >
                Learn More About Us
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-muted rounded-2xl overflow-hidden">
                <img 
                  src={contentData.about?.featured_image || "/images/hero_background_20260101_120022.png"} 
                  alt="About SPACE" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-secondary/10 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Services Section */}
      <section id="services" className="section-padding bg-muted/30">
        <div className="container-corporate">
          <div className="text-center space-y-4 mb-16">
            <h2 className="heading-section text-foreground">
              Our Capabilities
            </h2>
            <p className="text-corporate max-w-2xl mx-auto">
              Comprehensive event solutions designed to exceed expectations and deliver measurable results.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <MemoizedServiceCard key={index} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Work Section */}
      <section id="work" className="section-padding">
        <div className="container-corporate">
          <div className="text-center space-y-4 mb-16">
            <h2 className="heading-section text-foreground">
              Our Work
            </h2>
            <p className="text-corporate max-w-2xl mx-auto">
              Showcasing our recent successful events and the impact we've created for our clients.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <MemoizedProjectCard key={index} project={project} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Green Life Expo Section */}
      <section id="green-life-expo" className="section-padding bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
        <div className="container-corporate text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
                Featured Event
              </Badge>
              <h2 className="heading-section text-foreground">
                Green Life Expo 2024
              </h2>
              <p className="text-corporate text-lg leading-relaxed">
                Join us at the premier sustainability event of the year. Discover innovative green technologies, 
                connect with industry leaders, and be part of the sustainable future.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 my-12">
              {[
                { icon: Calendar, label: "March 15-17, 2024" },
                { icon: MapPin, label: "Dubai World Trade Centre" },
                { icon: Users, label: "10,000+ Expected Attendees" }
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center space-y-3">
                  <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900">
                    <item.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-muted-foreground text-center">{item.label}</span>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={() => window.open('https://greenlife-expo.com', '_blank')}
              className="btn-corporate px-8 py-6 text-lg group"
            >
              Visit Green Life Expo
              <ExternalLink className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section id="contact" className="section-padding bg-muted/30">
        <div className="container-corporate">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="heading-section text-foreground">
                  Get in Touch
                </h2>
                <p className="text-corporate leading-relaxed">
                  Ready to create an exceptional event experience? Contact our team of experts 
                  to discuss your requirements and get a customized solution.
                </p>
              </div>
              
              {/* Enhanced Contact Information */}
              <div className="space-y-6">
                {[
                  { icon: Phone, label: "Phone", value: "+971 4 123 4567" },
                  { icon: Mail, label: "Email", value: "info@space-events.com" },
                  { icon: MapPin, label: "Address", value: "Dubai, United Arab Emirates" },
                  { icon: Clock, label: "Hours", value: "Sun-Thu: 9AM-6PM" }
                ].map((contact, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <contact.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{contact.label}</div>
                      <div className="text-muted-foreground">{contact.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Media Links */}
              <div className="space-y-4">
                <h3 className="font-heading font-semibold text-foreground">Follow Us</h3>
                <div className="flex space-x-4">
                  {[
                    { icon: Linkedin, href: "#", label: "LinkedIn" },
                    { icon: Twitter, href: "#", label: "Twitter" },
                    { icon: Facebook, href: "#", label: "Facebook" },
                    { icon: Instagram, href: "#", label: "Instagram" }
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Enhanced Contact Form */}
            <Card className="card-corporate">
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">First Name</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Last Name</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Event Type</label>
                    <select className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200">
                      <option>Select event type</option>
                      <option>Exhibition</option>
                      <option>Conference</option>
                      <option>Corporate Event</option>
                      <option>Other</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Message</label>
                    <textarea 
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Tell us about your event requirements..."
                    ></textarea>
                  </div>
                  
                  <Button className="w-full btn-corporate py-3 group">
                    Send Message
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-foreground text-background py-16">
        <div className="container-corporate">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <img 
                src={siteSettings.general?.logoUrl || "/images/space_logo_20260101_120021.png"} 
                alt="SPACE Logo" 
                className="h-28 w-auto brightness-0 invert"
                loading="lazy"
              />
              <p className="text-background/80 text-sm leading-relaxed">
                Premier event management company specializing in exhibitions and conferences.
              </p>
            </div>
            
            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-heading font-semibold">Quick Links</h3>
              <div className="space-y-2">
                {['About', 'Services', 'Our Work', 'Contact'].map((link) => (
                  <button
                    key={link}
                    onClick={() => scrollToSection(link.toLowerCase().replace(' ', '-'))}
                    className="block text-background/80 hover:text-background transition-colors duration-200 text-sm"
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Services */}
            <div className="space-y-4">
              <h3 className="font-heading font-semibold">Services</h3>
              <div className="space-y-2">
                {['Exhibition Organizing', 'Conference Management', 'Sponsorship Planning', 'Venue Design'].map((service) => (
                  <div key={service} className="text-background/80 text-sm">
                    {service}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="font-heading font-semibold">Contact</h3>
              <div className="space-y-2 text-sm">
                <div className="text-background/80">Dubai, UAE</div>
                <div className="text-background/80">+971 4 123 4567</div>
                <div className="text-background/80">info@space-events.com</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-background/20 mt-12 pt-8 text-center">
            <p className="text-background/60 text-sm">
              © 2026 SPACE - Organizing Exhibitions & Conferences. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;