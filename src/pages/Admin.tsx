import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Image, 
  Type, 
  Palette, 
  Globe, 
  Save, 
  Eye, 
  Upload, 
  Trash2, 
  Plus,
  Monitor,
  Moon,
  Sun
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContentData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  about: {
    title: string;
    description: string;
    subtitle: string;
  };
  services: {
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  work: {
    title: string;
    description: string;
    projects: Array<{
      name: string;
      category: string;
      description: string;
    }>;
  };
  greenLifeExpo: {
    title: string;
    subtitle: string;
    description: string;
    url: string;
    stats: Array<{
      icon: string;
      label: string;
    }>;
  };
  contact: {
    title: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  footer: {
    description: string;
    contact: {
      email: string;
      phone: string;
      address: string;
    };
  };
}

interface SiteSettings {
  siteName: string;
  logoUrl: string;
  logoWhiteUrl: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  language: string;
  darkMode: boolean;
}

const Admin = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('content');
  const [previewMode, setPreviewMode] = useState(false);

  // Default content data
  const [contentData, setContentData] = useState<ContentData>({
    hero: {
      title: "We Create the Space for Impact",
      subtitle: "Exhibitions Built with Precision and Scale",
      description: "We transform concepts into powerful experiences that drive business results and create lasting connections.",
      ctaPrimary: "Start Your Event",
      ctaSecondary: "View Our Work"
    },
    about: {
      title: "About SPACE",
      description: "We are the architects of exceptional experiences. With unwavering focus on planning, precision, and execution, SPACE delivers events at any scale.",
      subtitle: "From intimate executive forums to large-scale international exhibitions, we create the perfect environment for meaningful connections and business growth."
    },
    services: {
      title: "Our Capabilities",
      description: "Comprehensive event solutions designed to exceed expectations and deliver measurable results.",
      items: [
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
      ]
    },
    work: {
      title: "Our Work",
      description: "Proven track record of delivering exceptional events that build trust and drive results.",
      projects: [
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
      ]
    },
    greenLifeExpo: {
      title: "Green Life Expo",
      subtitle: "Go Green & Healthy Living Expo",
      description: "Our flagship sustainability exhibition connecting eco-conscious brands with health-focused consumers. A strategic platform driving the green economy forward.",
      url: "https://greenlife-expo.com",
      stats: [
        { icon: "📅", label: "Annual Event" },
        { icon: "👥", label: "10,000+ Visitors" },
        { icon: "📍", label: "Regional Focus" },
        { icon: "🏆", label: "Industry Leading" }
      ]
    },
    contact: {
      title: "Let's Build Your Next Event the Right Way",
      description: "Ready to create an exceptional experience? Let's discuss how SPACE can bring your vision to life with precision, scale, and impact.",
      ctaPrimary: "Get in Touch",
      ctaSecondary: "View Services"
    },
    footer: {
      description: "Creating exceptional experiences through precision planning and flawless execution.",
      contact: {
        email: "info@space-events.com",
        phone: "+971 4 XXX XXXX",
        address: "Dubai, UAE"
      }
    }
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: "SPACE",
    logoUrl: "./images/space_logo_20260101_120021.png",
    logoWhiteUrl: "./images/space_logo_20260101_120021.png",
    colors: {
      primary: "#00BFFF",
      secondary: "#000000",
      accent: "#00BFFF"
    },
    fonts: {
      heading: "Montserrat",
      body: "Inter"
    },
    seo: {
      title: "SPACE - Organizing Exhibitions & Conferences",
      description: "Premium exhibition and conference organizing company. We create exceptional experiences through precision planning and flawless execution.",
      keywords: "exhibitions, conferences, events, Dubai, UAE, event management, corporate events"
    },
    language: "en",
    darkMode: false
  });

  // Authentication
  const handleLogin = () => {
    if (password === 'space2024admin') {
      setIsAuthenticated(true);
      toast({
        title: "Login Successful",
        description: "Welcome to SPACE Admin Dashboard",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid password. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Save functions
  const saveContent = () => {
    localStorage.setItem('spaceContentData', JSON.stringify(contentData));
    toast({
      title: "Content Saved",
      description: "All content changes have been saved successfully.",
    });
  };

  const saveSettings = () => {
    localStorage.setItem('spaceSiteSettings', JSON.stringify(siteSettings));
    toast({
      title: "Settings Saved",
      description: "Site settings have been updated successfully.",
    });
  };

  // Load saved data on component mount
  useEffect(() => {
    const savedContent = localStorage.getItem('spaceContentData');
    const savedSettings = localStorage.getItem('spaceSiteSettings');
    
    if (savedContent) {
      setContentData(JSON.parse(savedContent));
    }
    if (savedSettings) {
      setSiteSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-heading font-bold uppercase">
              SPACE Admin
            </CardTitle>
            <p className="text-muted-foreground">Enter password to access dashboard</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter admin password"
              />
            </div>
            <Button onClick={handleLogin} className="w-full btn-corporate">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Settings className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-heading font-bold uppercase">SPACE Admin</h1>
                <p className="text-sm text-muted-foreground">Content Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>{previewMode ? 'Edit Mode' : 'Preview Mode'}</span>
              </Button>
              <Button
                onClick={() => window.open('/', '_blank')}
                className="btn-corporate"
              >
                View Live Site
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="content" className="flex items-center space-x-2">
              <Type className="w-4 h-4" />
              <span>Content</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center space-x-2">
              <Image className="w-4 h-4" />
              <span>Media</span>
            </TabsTrigger>
            <TabsTrigger value="design" className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Design</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>SEO</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Content Management */}
          <TabsContent value="content" className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-heading font-bold">Content Management</h2>
              <Button onClick={saveContent} className="btn-corporate">
                <Save className="w-4 h-4 mr-2" />
                Save Content
              </Button>
            </div>

            <div className="grid gap-8">
              {/* Hero Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Hero Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Main Title</Label>
                      <Input
                        value={contentData.hero.title}
                        onChange={(e) => setContentData({
                          ...contentData,
                          hero: { ...contentData.hero, title: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subtitle</Label>
                      <Input
                        value={contentData.hero.subtitle}
                        onChange={(e) => setContentData({
                          ...contentData,
                          hero: { ...contentData.hero, subtitle: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={contentData.hero.description}
                      onChange={(e) => setContentData({
                        ...contentData,
                        hero: { ...contentData.hero, description: e.target.value }
                      })}
                      rows={3}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary CTA Button</Label>
                      <Input
                        value={contentData.hero.ctaPrimary}
                        onChange={(e) => setContentData({
                          ...contentData,
                          hero: { ...contentData.hero, ctaPrimary: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary CTA Button</Label>
                      <Input
                        value={contentData.hero.ctaSecondary}
                        onChange={(e) => setContentData({
                          ...contentData,
                          hero: { ...contentData.hero, ctaSecondary: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* About Section */}
              <Card>
                <CardHeader>
                  <CardTitle>About Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={contentData.about.title}
                      onChange={(e) => setContentData({
                        ...contentData,
                        about: { ...contentData.about, title: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Main Description</Label>
                    <Textarea
                      value={contentData.about.description}
                      onChange={(e) => setContentData({
                        ...contentData,
                        about: { ...contentData.about, description: e.target.value }
                      })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Textarea
                      value={contentData.about.subtitle}
                      onChange={(e) => setContentData({
                        ...contentData,
                        about: { ...contentData.about, subtitle: e.target.value }
                      })}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Green Life Expo */}
              <Card>
                <CardHeader>
                  <CardTitle>Green Life Expo - Featured Project</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Project Title</Label>
                      <Input
                        value={contentData.greenLifeExpo.title}
                        onChange={(e) => setContentData({
                          ...contentData,
                          greenLifeExpo: { ...contentData.greenLifeExpo, title: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subtitle</Label>
                      <Input
                        value={contentData.greenLifeExpo.subtitle}
                        onChange={(e) => setContentData({
                          ...contentData,
                          greenLifeExpo: { ...contentData.greenLifeExpo, subtitle: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={contentData.greenLifeExpo.description}
                      onChange={(e) => setContentData({
                        ...contentData,
                        greenLifeExpo: { ...contentData.greenLifeExpo, description: e.target.value }
                      })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>External Website URL</Label>
                    <Input
                      value={contentData.greenLifeExpo.url}
                      onChange={(e) => setContentData({
                        ...contentData,
                        greenLifeExpo: { ...contentData.greenLifeExpo, url: e.target.value }
                      })}
                      placeholder="https://greenlife-expo.com"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Media Management */}
          <TabsContent value="media" className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-heading font-bold">Media Management</h2>
              <Button className="btn-corporate">
                <Upload className="w-4 h-4 mr-2" />
                Upload Images
              </Button>
            </div>

            <div className="grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Logo Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label>Primary Logo (Dark Backgrounds)</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <img 
                          src={siteSettings.logoUrl} 
                          alt="Primary Logo" 
                          className="h-16 mx-auto mb-4"
                        />
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Replace Logo
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label>White Logo (Dark Backgrounds)</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-secondary">
                        <img 
                          src={siteSettings.logoWhiteUrl} 
                          alt="White Logo" 
                          className="h-16 mx-auto mb-4 filter brightness-0 invert"
                        />
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Replace Logo
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Image Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Placeholder for uploaded images */}
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload Image</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Design Settings */}
          <TabsContent value="design" className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-heading font-bold">Design Settings</h2>
              <Button onClick={saveSettings} className="btn-corporate">
                <Save className="w-4 h-4 mr-2" />
                Save Design
              </Button>
            </div>

            <div className="grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Color (Blue/Cyan)</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={siteSettings.colors.primary}
                          onChange={(e) => setSiteSettings({
                            ...siteSettings,
                            colors: { ...siteSettings.colors, primary: e.target.value }
                          })}
                          className="w-16 h-10"
                        />
                        <Input
                          value={siteSettings.colors.primary}
                          onChange={(e) => setSiteSettings({
                            ...siteSettings,
                            colors: { ...siteSettings.colors, primary: e.target.value }
                          })}
                          placeholder="#00BFFF"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color (Black)</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={siteSettings.colors.secondary}
                          onChange={(e) => setSiteSettings({
                            ...siteSettings,
                            colors: { ...siteSettings.colors, secondary: e.target.value }
                          })}
                          className="w-16 h-10"
                        />
                        <Input
                          value={siteSettings.colors.secondary}
                          onChange={(e) => setSiteSettings({
                            ...siteSettings,
                            colors: { ...siteSettings.colors, secondary: e.target.value }
                          })}
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Accent Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={siteSettings.colors.accent}
                          onChange={(e) => setSiteSettings({
                            ...siteSettings,
                            colors: { ...siteSettings.colors, accent: e.target.value }
                          })}
                          className="w-16 h-10"
                        />
                        <Input
                          value={siteSettings.colors.accent}
                          onChange={(e) => setSiteSettings({
                            ...siteSettings,
                            colors: { ...siteSettings.colors, accent: e.target.value }
                          })}
                          placeholder="#00BFFF"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Typography</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Heading Font</Label>
                      <Select
                        value={siteSettings.fonts.heading}
                        onValueChange={(value) => setSiteSettings({
                          ...siteSettings,
                          fonts: { ...siteSettings.fonts, heading: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Poppins">Poppins</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Body Font</Label>
                      <Select
                        value={siteSettings.fonts.body}
                        onValueChange={(value) => setSiteSettings({
                          ...siteSettings,
                          fonts: { ...siteSettings.fonts, body: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SEO Settings */}
          <TabsContent value="seo" className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-heading font-bold">SEO Settings</h2>
              <Button onClick={saveSettings} className="btn-corporate">
                <Save className="w-4 h-4 mr-2" />
                Save SEO
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Meta Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Page Title</Label>
                  <Input
                    value={siteSettings.seo.title}
                    onChange={(e) => setSiteSettings({
                      ...siteSettings,
                      seo: { ...siteSettings.seo, title: e.target.value }
                    })}
                    placeholder="SPACE - Organizing Exhibitions & Conferences"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea
                    value={siteSettings.seo.description}
                    onChange={(e) => setSiteSettings({
                      ...siteSettings,
                      seo: { ...siteSettings.seo, description: e.target.value }
                    })}
                    rows={3}
                    placeholder="Premium exhibition and conference organizing company..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <Input
                    value={siteSettings.seo.keywords}
                    onChange={(e) => setSiteSettings({
                      ...siteSettings,
                      seo: { ...siteSettings.seo, keywords: e.target.value }
                    })}
                    placeholder="exhibitions, conferences, events, Dubai, UAE"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Settings */}
          <TabsContent value="settings" className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-heading font-bold">General Settings</h2>
              <Button onClick={saveSettings} className="btn-corporate">
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>

            <div className="grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Site Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Site Name</Label>
                    <Input
                      value={siteSettings.siteName}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        siteName: e.target.value
                      })}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select
                        value={siteSettings.language}
                        onValueChange={(value) => setSiteSettings({
                          ...siteSettings,
                          language: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar">Arabic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                      <Switch
                        checked={siteSettings.darkMode}
                        onCheckedChange={(checked) => setSiteSettings({
                          ...siteSettings,
                          darkMode: checked
                        })}
                      />
                      <Label>Dark Mode Available</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Admin Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline">
                      <Monitor className="w-4 h-4 mr-2" />
                      Preview Changes
                    </Button>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Export Settings
                    </Button>
                    <Button variant="outline">
                      <Save className="w-4 h-4 mr-2" />
                      Backup Content
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        localStorage.clear();
                        toast({
                          title: "Data Cleared",
                          description: "All saved data has been reset to defaults.",
                        });
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Reset to Defaults
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;