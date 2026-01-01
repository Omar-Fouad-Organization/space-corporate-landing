import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, Users, MapPin, Award, ArrowRight, Menu, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [contentData, setContentData] = useState<any>({});
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  // Load content from database
  useEffect(() => {
    loadContent();
    
    // Set up interval to refresh settings every 30 seconds
    const interval = setInterval(() => {
      loadContent();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadContent = async () => {
    try {
      // Load content sections
      const { data: content } = await supabase
        .from('content_sections_2026_01_01_12_00')
        .select('*')
        .eq('is_published', true);
      
      if (content) {
        const contentMap: any = {};
        content.forEach(section => {
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
        settings.forEach(setting => {
          settingsMap[setting.setting_key] = setting.setting_value;
        });
        console.log('Loaded site settings:', settingsMap); // Debug log
        setSiteSettings(settingsMap);
      }

    } catch (error) {
      console.error('Error loading content:', error);
      // Fallback to default content if database fails
      setContentData({
        hero: {
          title: "We Create the Space for Impact",
          subtitle: "Exhibitions Built with Precision and Scale",
          description: "We transform concepts into powerful experiences that drive business results and create lasting connections.",
          ctaPrimary: "Start Your Event",
          ctaSecondary: "View Our Work"
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      setIsMenuOpen(false);
    }
  };

  // Handle scroll for active section highlighting
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'services', 'work', 'green-life-expo', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    {
      title: "Exhibition Organizing",
      description: "End-to-end exhibition planning and execution with precision and scale.",
      icon: "🏢"
    },
    {
      title: "Conference Management",
      description: "Strategic conference planning from concept to completion.",
      icon: "🎯"
    },
    {
      title: "Sponsorship Planning",
      description: "Comprehensive sponsorship strategies that deliver measurable results.",
      icon: "🤝"
    },
    {
      title: "Venue & Layout Design",
      description: "Innovative space design optimized for engagement and flow.",
      icon: "📐"
    },
    {
      title: "On-ground Execution",
      description: "Flawless event execution with dedicated project management.",
      icon: "⚡"
    }
  ];

  const projects = [
    {
      name: "Tech Innovation Summit 2024",
      category: "Conference",
      description: "3-day technology conference with 500+ attendees and 50+ speakers."
    },
    {
      name: "Healthcare Expo Middle East",
      category: "Exhibition",
      description: "Regional healthcare exhibition featuring 200+ exhibitors."
    },
    {
      name: "Sustainable Energy Forum",
      category: "Conference",
      description: "Executive forum on renewable energy with industry leaders."
    },
    {
      name: "Digital Marketing Expo",
      category: "Exhibition",
      description: "Interactive exhibition showcasing latest marketing technologies."
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading SPACE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container-corporate">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              {(() => {
                console.log('Site settings:', siteSettings);
                console.log('Logo URL:', siteSettings.general?.logoUrl);
                return siteSettings.general?.logoUrl ? (
                  <img 
                    src={siteSettings.general.logoUrl} 
                    alt="SPACE Logo" 
                    className="h-24 w-auto"
                  />
                ) : (
                  <img 
                    src="./images/space_logo_20260101_120021.png" 
                    alt="SPACE Logo" 
                    className="h-24 w-auto"
                  />
                );
              })()}
            </div>

            {/* Desktop Navigation */}
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
                  className={`text-sm font-semibold uppercase tracking-wide transition-colors duration-300 hover:text-primary ${
                    activeSection === item.id ? 'text-primary' : 'text-foreground'
                  } ${item.isExternal ? 'flex items-center space-x-1' : ''}`}
                >
                  <span>{item.label}</span>
                  {item.isExternal && <ExternalLink className="w-3 h-3" />}
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border">
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
                    className={`text-left text-sm font-semibold uppercase tracking-wide transition-colors duration-300 hover:text-primary ${
                      activeSection === item.id ? 'text-primary' : 'text-foreground'
                    } ${item.isExternal ? 'flex items-center space-x-2' : ''}`}
                  >
                    <span>{item.label}</span>
                    {item.isExternal && <ExternalLink className="w-4 h-4" />}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="section-padding bg-gradient-hero relative overflow-hidden">
        <div className="container-corporate">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="heading-hero text-foreground">
                  {contentData.hero?.title || "We Create the Space for Impact"}
                </h1>
                <p className="text-corporate max-w-lg">
                  {contentData.hero?.description || "Exhibitions built with precision and scale. We transform concepts into powerful experiences that drive business results and create lasting connections."}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => scrollToSection('contact')}
                  className="btn-corporate px-8 py-6 text-lg"
                >
                  {contentData.hero?.ctaPrimary || "Start Your Event"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => scrollToSection('work')}
                  className="btn-corporate-outline px-8 py-6 text-lg"
                >
                  View Our Work
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1565262353342-6e919eab5b58?w=800&auto=format&fit=crop&q=80" 
                alt="Modern Exhibition Hall" 
                className="rounded-lg shadow-elegant w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section-padding">
        <div className="container-corporate">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="heading-section text-foreground">
              About SPACE
            </h2>
            <div className="space-y-6">
              <p className="text-corporate text-xl leading-relaxed">
                We are the architects of exceptional experiences. With unwavering focus on <strong>planning</strong>, <strong>precision</strong>, and <strong>execution</strong>, SPACE delivers events at any <strong>scale</strong>.
              </p>
              <p className="text-corporate">
                From intimate executive forums to large-scale international exhibitions, we create the perfect environment for meaningful connections and business growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
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
              <Card key={index} className="card-corporate group">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-heading font-bold uppercase tracking-wide text-foreground">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Work Section */}
      <section id="work" className="section-padding">
        <div className="container-corporate">
          <div className="text-center space-y-4 mb-16">
            <h2 className="heading-section text-foreground">
              Our Work
            </h2>
            <p className="text-corporate max-w-2xl mx-auto">
              Proven track record of delivering exceptional events that build trust and drive results.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <Card key={index} className="card-corporate group">
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-heading font-bold text-foreground">
                        {project.name}
                      </h3>
                      <Badge variant="secondary" className="uppercase text-xs font-semibold">
                        {project.category}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Green Life Expo - Featured Project */}
      <section id="green-life-expo" className="section-padding bg-secondary text-secondary-foreground">
        <div className="container-corporate">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold uppercase">
                  Featured Project
                </Badge>
                <h2 className="heading-section text-secondary-foreground">
                  Green Life Expo
                </h2>
                <h3 className="text-2xl font-heading font-semibold text-primary">
                  Go Green & Healthy Living Expo
                </h3>
                <div className="space-y-4">
                  <p className="text-lg text-secondary-foreground/90 leading-relaxed">
                    Our flagship sustainability exhibition connecting eco-conscious brands with health-focused consumers. A strategic platform driving the green economy forward.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>Annual Event</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span>10,000+ Visitors</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>Regional Focus</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-primary" />
                      <span>Industry Leading</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => window.open('https://greenlife-expo.com', '_blank')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-semibold uppercase tracking-wide"
              >
                Visit Green Life Expo Website
                <ExternalLink className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1482739627503-c2cb4fc17328?w=800&auto=format&fit=crop&q=80" 
                alt="Green Life Expo" 
                className="rounded-lg shadow-elegant w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Divider */}
      <section className="py-20 bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-32 bg-gradient-to-r from-primary/20 via-primary to-primary/20 transform -skew-y-2"></div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="contact" className="section-padding bg-gradient-hero">
        <div className="container-corporate">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <h2 className="heading-section text-foreground">
              Let's Build Your Next Event
              <span className="text-primary block">the Right Way</span>
            </h2>
            <p className="text-corporate text-xl">
              Ready to create an exceptional experience? Let's discuss how SPACE can bring your vision to life with precision, scale, and impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="btn-corporate px-8 py-6 text-lg">
                Get in Touch
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => scrollToSection('services')}
                className="btn-corporate-outline px-8 py-6 text-lg"
              >
                View Services
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-12">
        <div className="container-corporate">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center">
                {siteSettings.general?.logoUrl ? (
                  <img 
                    src={siteSettings.general.logoUrl} 
                    alt="SPACE Logo" 
                    className="h-16 w-auto filter brightness-0 invert"
                  />
                ) : (
                  <img 
                    src="./images/space_logo_20260101_120021.png" 
                    alt="SPACE Logo" 
                    className="h-16 w-auto filter brightness-0 invert"
                  />
                )}
              </div>
              <p className="text-secondary-foreground/80">
                Creating exceptional experiences through precision planning and flawless execution.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-heading font-bold uppercase tracking-wide">Contact</h4>
              <div className="space-y-2 text-secondary-foreground/80">
                <p>info@space-events.com</p>
                <p>+971 4 XXX XXXX</p>
                <p>Dubai, UAE</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-heading font-bold uppercase tracking-wide">Services</h4>
              <div className="space-y-2 text-secondary-foreground/80">
                <p>Exhibition Organizing</p>
                <p>Conference Management</p>
                <p>Event Planning</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center">
            <p className="text-secondary-foreground/60">
              © 2024 SPACE. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
