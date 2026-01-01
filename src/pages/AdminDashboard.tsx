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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
  Users,
  UserPlus,
  UserX,
  Edit,
  History,
  LogOut,
  Shield,
  Crown,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor';
  full_name?: string;
  avatar_url?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

interface ContentSection {
  id: string;
  section_key: string;
  section_name: string;
  content: any;
  is_published: boolean;
  version: number;
  updated_at: string;
  updated_by?: string;
}

interface MediaAsset {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  alt_text?: string;
  category: string;
  is_active: boolean;
  created_at: string;
  uploaded_by?: string;
}

interface SiteSettings {
  id: string;
  setting_key: string;
  setting_value: any;
  updated_at: string;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');

  // Data states
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings[]>([]);

  // Form states
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'editor'>('editor');
  const [newUserName, setNewUserName] = useState('');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [isEditContentDialogOpen, setIsEditContentDialogOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Check authentication and load user data
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirect to login
        window.location.href = '/#/admin/login';
        return;
      }

      setUser(session.user);

      // Check if user is admin
      const { data: adminUser, error } = await supabase
        .from('admin_users_2026_01_01_12_00')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .single();

      if (error || !adminUser) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        window.location.href = '/#/admin/login';
        return;
      }

      setCurrentAdminUser(adminUser);
      await loadData();
    } catch (error) {
      console.error('Auth check error:', error);
      toast({
        title: "Authentication Error",
        description: "Please try logging in again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      // Load admin users
      const { data: users } = await supabase
        .from('admin_users_2026_01_01_12_00')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (users) setAdminUsers(users);

      // Load content sections
      const { data: content } = await supabase
        .from('content_sections_2026_01_01_12_00')
        .select('*')
        .order('section_key');
      
      if (content) setContentSections(content);

      // Load media assets
      const { data: media } = await supabase
        .from('media_assets_2026_01_01_12_00')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (media) setMediaAssets(media);

      // Load site settings
      const { data: settings } = await supabase
        .from('site_settings_2026_01_01_12_00')
        .select('*');
      
      if (settings) setSiteSettings(settings);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const addNewUser = async () => {
    if (!newUserEmail || !newUserName || !newUserPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including password.",
        variant: "destructive",
      });
      return;
    }

    if (newUserPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create auth user via admin API (this would typically be done server-side)
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUserEmail,
        password: newUserPassword,
        email_confirm: true
      });

      if (error) throw error;

      // Add to admin_users table
      const { error: adminError } = await supabase
        .from('admin_users_2026_01_01_12_00')
        .insert({
          user_id: data.user.id,
          email: newUserEmail,
          role: newUserRole,
          full_name: newUserName,
          created_by: user?.id
        });

      if (adminError) throw adminError;

      toast({
        title: "User Added Successfully",
        description: `${newUserName} has been added as ${newUserRole}.`,
      });

      // Reset form and reload data
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      setNewUserRole('editor');
      setIsAddUserDialogOpen(false);
      await loadData();

    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        title: "Error Adding User",
        description: error.message || "Failed to add new user.",
        variant: "destructive",
      });
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_users_2026_01_01_12_00')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "User Status Updated",
        description: `User has been ${!currentStatus ? 'activated' : 'deactivated'}.`,
      });

      await loadData();
    } catch (error: any) {
      toast({
        title: "Error Updating User",
        description: error.message || "Failed to update user status.",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string, userEmail: string) => {
    try {
      // First deactivate the admin user
      const { error: adminError } = await supabase
        .from('admin_users_2026_01_01_12_00')
        .delete()
        .eq('id', userId);

      if (adminError) throw adminError;

      toast({
        title: "User Deleted",
        description: `${userEmail} has been removed from admin access.`,
      });

      await loadData();
    } catch (error: any) {
      toast({
        title: "Error Deleting User",
        description: error.message || "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  const updateContent = async (sectionKey: string, newContent: any) => {
    try {
      const { error } = await supabase
        .from('content_sections_2026_01_01_12_00')
        .update({ 
          content: newContent,
          updated_by: user?.id,
          version: contentSections.find(s => s.section_key === sectionKey)?.version + 1 || 1
        })
        .eq('section_key', sectionKey);

      if (error) throw error;

      // Add to content history
      await supabase
        .from('content_history_2026_01_01_12_00')
        .insert({
          section_key: sectionKey,
          content: newContent,
          version: contentSections.find(s => s.section_key === sectionKey)?.version + 1 || 1,
          action: 'update',
          created_by: user?.id
        });

      toast({
        title: "Content Updated",
        description: "Content has been saved successfully.",
      });

      await loadData();
    } catch (error: any) {
      toast({
        title: "Error Updating Content",
        description: error.message || "Failed to update content.",
        variant: "destructive",
      });
    }
  };

  const updateSiteSettings = async (settingKey: string, newValue: any) => {
    try {
      const { error } = await supabase
        .from('site_settings_2026_01_01_12_00')
        .update({ 
          setting_value: newValue,
          updated_by: user?.id
        })
        .eq('setting_key', settingKey);

      if (error) throw error;

      toast({
        title: "Settings Updated",
        description: "Site settings have been saved successfully.",
      });

      await loadData();
    } catch (error: any) {
      toast({
        title: "Error Updating Settings",
        description: error.message || "Failed to update settings.",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const canManageUser = (targetRole: string) => {
    if (!currentAdminUser) return false;
    
    if (currentAdminUser.role === 'super_admin') return true;
    if (currentAdminUser.role === 'admin' && targetRole === 'editor') return true;
    
    return false;
  };

  // File upload function
  const handleFileUpload = async (file: File, category: string = 'general') => {
    if (!file) return null;

    setUploadingFile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${category}/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('space-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('space-media')
        .getPublicUrl(filePath);

      // Add to media_assets table
      const { data: assetData, error: assetError } = await supabase
        .from('media_assets_2026_01_01_12_00')
        .insert({
          file_name: file.name,
          file_path: publicUrl,
          file_type: file.type,
          file_size: file.size,
          category: category,
          uploaded_by: user?.id
        })
        .select()
        .single();

      if (assetError) throw assetError;

      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });

      await loadData();
      return assetData;

    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  // Simple content editor
  const openContentEditor = (section: ContentSection) => {
    setEditingContent({
      ...section,
      contentString: JSON.stringify(section.content, null, 2)
    });
    setIsEditContentDialogOpen(true);
  };

  const saveContentChanges = async () => {
    if (!editingContent) return;

    try {
      const parsedContent = JSON.parse(editingContent.contentString);
      await updateContent(editingContent.section_key, parsedContent);
      setIsEditContentDialogOpen(false);
      setEditingContent(null);
    } catch (error: any) {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON syntax and try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
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
                <p className="text-sm text-muted-foreground">
                  Welcome, {currentAdminUser?.full_name || currentAdminUser?.email}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {getRoleIcon(currentAdminUser?.role || '')}
                    <span className="ml-1 capitalize">{currentAdminUser?.role?.replace('_', ' ')}</span>
                  </Badge>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => window.open('/', '_blank')}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Live Site
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Users</span>
            </TabsTrigger>
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
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>

          {/* User Management */}
          <TabsContent value="users" className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-heading font-bold">User Management</h2>
              {(currentAdminUser?.role === 'super_admin' || currentAdminUser?.role === 'admin') && (
                <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-corporate">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add New User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Admin User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input
                          type="email"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input
                          type="password"
                          value={newUserPassword}
                          onChange={(e) => setNewUserPassword(e.target.value)}
                          placeholder="Enter password (min 6 characters)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={newUserRole} onValueChange={(value: 'admin' | 'editor') => setNewUserRole(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currentAdminUser?.role === 'super_admin' && (
                              <SelectItem value="admin">Admin</SelectItem>
                            )}
                            <SelectItem value="editor">Editor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={addNewUser} className="btn-corporate">
                          Add User
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="grid gap-6">
              {adminUsers.map((adminUser) => (
                <Card key={adminUser.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          {getRoleIcon(adminUser.role)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {adminUser.full_name || adminUser.email}
                          </h3>
                          <p className="text-muted-foreground">{adminUser.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={adminUser.is_active ? "default" : "secondary"}>
                              {adminUser.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {adminUser.role.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {canManageUser(adminUser.role) && adminUser.user_id !== user?.id && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserStatus(adminUser.id, adminUser.is_active)}
                          >
                            {adminUser.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <UserX className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {adminUser.full_name || adminUser.email}? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser(adminUser.id, adminUser.email)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Content Management */}
          <TabsContent value="content" className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-heading font-bold">Content Management</h2>
              <Button onClick={() => loadData()} variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Refresh Content
              </Button>
            </div>

            <div className="grid gap-8">
              {contentSections.map((section) => (
                <Card key={section.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {section.section_name}
                      <Badge variant={section.is_published ? "default" : "secondary"}>
                        {section.is_published ? "Published" : "Draft"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm overflow-auto max-h-40">
                        {JSON.stringify(section.content, null, 2)}
                      </pre>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Version {section.version} • Last updated: {new Date(section.updated_at).toLocaleString()}
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openContentEditor(section)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant={section.is_published ? "secondary" : "default"}
                          size="sm"
                          onClick={async () => {
                            const { error } = await supabase
                              .from('content_sections_2026_01_01_12_00')
                              .update({ is_published: !section.is_published })
                              .eq('id', section.id);
                            
                            if (!error) {
                              toast({
                                title: section.is_published ? "Content Unpublished" : "Content Published",
                                description: `${section.section_name} has been ${section.is_published ? 'unpublished' : 'published'}.`,
                              });
                              await loadData();
                            }
                          }}
                        >
                          {section.is_published ? "Unpublish" : "Publish"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Media Management */}
          <TabsContent value="media" className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-heading font-bold">Media Management</h2>
              <div className="flex space-x-2">
                <input
                  type="file"
                  id="media-upload"
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, 'general');
                    }
                  }}
                />
                <Button 
                  className="btn-corporate"
                  onClick={() => document.getElementById('media-upload')?.click()}
                  disabled={uploadingFile}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingFile ? 'Uploading...' : 'Upload Media'}
                </Button>
                <input
                  type="file"
                  id="logo-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, 'logos');
                    }
                  }}
                />
                <Button 
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  disabled={uploadingFile}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {mediaAssets.map((asset) => (
                <Card key={asset.id}>
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                      {asset.file_type.startsWith('image/') ? (
                        <img 
                          src={asset.file_path} 
                          alt={asset.alt_text || asset.file_name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Image className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <h4 className="font-semibold text-sm truncate">{asset.file_name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {(asset.file_size / 1024).toFixed(1)} KB
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <Badge variant="outline" className="text-xs">
                        {asset.category}
                      </Badge>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          const { error } = await supabase
                            .from('media_assets_2026_01_01_12_00')
                            .update({ is_active: false })
                            .eq('id', asset.id);
                          
                          if (!error) {
                            toast({
                              title: "Media Deleted",
                              description: "Media file has been removed.",
                            });
                            await loadData();
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Design Settings */}
          <TabsContent value="design" className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-heading font-bold">Design Settings</h2>
              <Button onClick={() => loadData()} className="btn-corporate">
                <Save className="w-4 h-4 mr-2" />
                Save Design
              </Button>
            </div>

            <div className="grid gap-8">
              {siteSettings.filter(s => s.setting_key === 'colors').map((setting) => (
                <Card key={setting.id}>
                  <CardHeader>
                    <CardTitle>Brand Colors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Primary Color</Label>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-10 h-10 rounded border"
                            style={{ backgroundColor: setting.setting_value.primary }}
                          ></div>
                          <Input
                            value={setting.setting_value.primary}
                            onChange={(e) => {
                              const newValue = { ...setting.setting_value, primary: e.target.value };
                              updateSiteSettings('colors', newValue);
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Secondary Color</Label>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-10 h-10 rounded border"
                            style={{ backgroundColor: setting.setting_value.secondary }}
                          ></div>
                          <Input
                            value={setting.setting_value.secondary}
                            onChange={(e) => {
                              const newValue = { ...setting.setting_value, secondary: e.target.value };
                              updateSiteSettings('colors', newValue);
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Accent Color</Label>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-10 h-10 rounded border"
                            style={{ backgroundColor: setting.setting_value.accent }}
                          ></div>
                          <Input
                            value={setting.setting_value.accent}
                            onChange={(e) => {
                              const newValue = { ...setting.setting_value, accent: e.target.value };
                              updateSiteSettings('colors', newValue);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* SEO Settings */}
          <TabsContent value="seo" className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-heading font-bold">SEO Settings</h2>
              <Button onClick={() => loadData()} className="btn-corporate">
                <Save className="w-4 h-4 mr-2" />
                Save SEO
              </Button>
            </div>

            {siteSettings.filter(s => s.setting_key === 'seo').map((setting) => (
              <Card key={setting.id}>
                <CardHeader>
                  <CardTitle>Meta Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Page Title</Label>
                    <Input
                      value={setting.setting_value.title}
                      onChange={(e) => {
                        const newValue = { ...setting.setting_value, title: e.target.value };
                        updateSiteSettings('seo', newValue);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Meta Description</Label>
                    <Textarea
                      value={setting.setting_value.description}
                      onChange={(e) => {
                        const newValue = { ...setting.setting_value, description: e.target.value };
                        updateSiteSettings('seo', newValue);
                      }}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Keywords</Label>
                    <Input
                      value={setting.setting_value.keywords}
                      onChange={(e) => {
                        const newValue = { ...setting.setting_value, keywords: e.target.value };
                        updateSiteSettings('seo', newValue);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Content History */}
          <TabsContent value="history" className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-heading font-bold">Content History</h2>
              <Button onClick={() => loadData()} variant="outline">
                <History className="w-4 h-4 mr-2" />
                Refresh History
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Content history will be displayed here showing all recent changes made to the website.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Content Editor Dialog */}
      <Dialog open={isEditContentDialogOpen} onOpenChange={setIsEditContentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Content: {editingContent?.section_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Content (JSON Format)</Label>
              <Textarea
                value={editingContent?.contentString || ''}
                onChange={(e) => setEditingContent({
                  ...editingContent,
                  contentString: e.target.value
                })}
                rows={20}
                className="font-mono text-sm"
                placeholder="Enter content in JSON format..."
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Tip:</strong> Edit the JSON content above. Make sure to maintain valid JSON syntax.</p>
              <p><strong>Common fields:</strong> title, description, subtitle, items (for lists), etc.</p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditContentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveContentChanges} className="btn-corporate">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;