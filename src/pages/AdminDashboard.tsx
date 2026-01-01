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
  const [editingMedia, setEditingMedia] = useState<MediaAsset | null>(null);
  const [isEditMediaDialogOpen, setIsEditMediaDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLogoManagementOpen, setIsLogoManagementOpen] = useState(false);
  const [currentLogo, setCurrentLogo] = useState<string>('');

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

  // User-friendly content editor
  const openContentEditor = (section: ContentSection) => {
    setEditingContent({
      ...section,
      formData: { ...section.content }
    });
    setIsEditContentDialogOpen(true);
  };

  const saveContentChanges = async () => {
    if (!editingContent) return;

    try {
      await updateContent(editingContent.section_key, editingContent.formData);
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

  // User-friendly form update functions
  const updateFormField = (field: string, value: any) => {
    setEditingContent({
      ...editingContent,
      formData: {
        ...editingContent.formData,
        [field]: value
      }
    });
  };

  const updateNestedField = (parentField: string, childField: string, value: any) => {
    setEditingContent({
      ...editingContent,
      formData: {
        ...editingContent.formData,
        [parentField]: {
          ...editingContent.formData[parentField],
          [childField]: value
        }
      }
    });
  };

  const updateArrayItem = (arrayField: string, index: number, field: string, value: any) => {
    const updatedArray = [...editingContent.formData[arrayField]];
    updatedArray[index] = {
      ...updatedArray[index],
      [field]: value
    };
    setEditingContent({
      ...editingContent,
      formData: {
        ...editingContent.formData,
        [arrayField]: updatedArray
      }
    });
  };

  // Logo management functions
  const openLogoManagement = async () => {
    const logoSetting = siteSettings.find(s => s.setting_key === 'general');
    if (logoSetting) {
      setCurrentLogo(logoSetting.setting_value.logoUrl || '');
    }
    setIsLogoManagementOpen(true);
  };

  const updateLogo = async (newLogoUrl: string) => {
    try {
      const generalSettings = siteSettings.find(s => s.setting_key === 'general');
      if (generalSettings) {
        const updatedSettings = {
          ...generalSettings.setting_value,
          logoUrl: newLogoUrl,
          logoWhiteUrl: newLogoUrl
        };
        await updateSiteSettings('general', updatedSettings);
        setCurrentLogo(newLogoUrl);
        
        toast({
          title: "Logo Updated",
          description: "Website logo has been updated successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update logo.",
        variant: "destructive",
      });
    }
  };

  const uploadNewLogo = async (file: File) => {
    const logoAsset = await handleFileUpload(file, 'logos');
    if (logoAsset) {
      await updateLogo(logoAsset.file_path);
    }
  };

  // Media editing functions
  const openMediaEditor = (asset: MediaAsset) => {
    setEditingMedia(asset);
    setIsEditMediaDialogOpen(true);
  };

  const saveMediaChanges = async () => {
    if (!editingMedia) return;

    try {
      const { error } = await supabase
        .from('media_assets_2026_01_01_12_00')
        .update({
          file_name: editingMedia.file_name,
          alt_text: editingMedia.alt_text,
          category: editingMedia.category
        })
        .eq('id', editingMedia.id);

      if (error) throw error;

      toast({
        title: "Media Updated",
        description: "Media information has been updated successfully.",
      });

      setIsEditMediaDialogOpen(false);
      setEditingMedia(null);
      await loadData();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update media.",
        variant: "destructive",
      });
    }
  };

  const replaceMediaFile = async (newFile: File, assetId: string) => {
    setUploadingFile(true);
    try {
      const fileExt = newFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `replacements/${fileName}`;

      // Upload new file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('space-media')
        .upload(filePath, newFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('space-media')
        .getPublicUrl(filePath);

      // Update media asset record
      const { error: updateError } = await supabase
        .from('media_assets_2026_01_01_12_00')
        .update({
          file_name: newFile.name,
          file_path: publicUrl,
          file_type: newFile.type,
          file_size: newFile.size
        })
        .eq('id', assetId);

      if (updateError) throw updateError;

      toast({
        title: "File Replaced",
        description: "Media file has been replaced successfully.",
      });

      await loadData();
    } catch (error: any) {
      toast({
        title: "Replace Failed",
        description: error.message || "Failed to replace file.",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const deleteMediaAsset = async (assetId: string, fileName: string) => {
    try {
      const { error } = await supabase
        .from('media_assets_2026_01_01_12_00')
        .update({ is_active: false })
        .eq('id', assetId);

      if (error) throw error;

      toast({
        title: "Media Deleted",
        description: `${fileName} has been removed.`,
      });

      await loadData();
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete media.",
        variant: "destructive",
      });
    }
  };

  const getFilteredMedia = () => {
    if (selectedCategory === 'all') {
      return mediaAssets;
    }
    return mediaAssets.filter(asset => asset.category === selectedCategory);
  };

  const getUniqueCategories = () => {
    const categories = ['all', ...new Set(mediaAssets.map(asset => asset.category))];
    return categories;
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
          <TabsList className="grid w-full grid-cols-7">
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
            <TabsTrigger value="logo" className="flex items-center space-x-2">
              <Image className="w-4 h-4" />
              <span>Logo</span>
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
              <div>
                <h2 className="text-3xl font-heading font-bold">Content Management</h2>
                <p className="text-muted-foreground mt-1">
                  Edit website content with user-friendly forms
                </p>
              </div>
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
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        <strong>Section:</strong> {section.section_key}
                      </div>
                      {/* Preview key fields */}
                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        {section.content.title && (
                          <div><strong>Title:</strong> {section.content.title}</div>
                        )}
                        {section.content.description && (
                          <div><strong>Description:</strong> {section.content.description.substring(0, 100)}...</div>
                        )}
                        {section.content.items && (
                          <div><strong>Items:</strong> {section.content.items.length} items</div>
                        )}
                      </div>
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
              <div>
                <h2 className="text-3xl font-heading font-bold">Media Management</h2>
                <p className="text-muted-foreground mt-1">
                  Manage all website images, logos, and media files
                </p>
              </div>
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

            {/* Category Filter */}
            <div className="flex items-center space-x-4">
              <Label>Filter by Category:</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getUniqueCategories().map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline">
                {getFilteredMedia().length} files
              </Badge>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {getFilteredMedia().map((asset) => (
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
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm truncate" title={asset.file_name}>
                        {asset.file_name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {(asset.file_size / 1024).toFixed(1)} KB • {asset.file_type}
                      </p>
                      {asset.alt_text && (
                        <p className="text-xs text-muted-foreground italic truncate" title={asset.alt_text}>
                          {asset.alt_text}
                        </p>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <Badge variant="outline" className="text-xs">
                        {asset.category}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openMediaEditor(asset)}
                          title="Edit media info"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <input
                          type="file"
                          id={`replace-${asset.id}`}
                          className="hidden"
                          accept={asset.file_type.startsWith('image/') ? 'image/*' : '*'}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              replaceMediaFile(file, asset.id);
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById(`replace-${asset.id}`)?.click()}
                          disabled={uploadingFile}
                          title="Replace file"
                        >
                          <Upload className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMediaAsset(asset.id, asset.file_name)}
                          title="Delete media"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
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

          {/* Logo Management */}
          <TabsContent value="logo" className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-heading font-bold">Logo Management</h2>
                <p className="text-muted-foreground mt-1">
                  Manage website logo for header and footer
                </p>
              </div>
              <Button onClick={openLogoManagement} className="btn-corporate">
                <Settings className="w-4 h-4 mr-2" />
                Manage Logo
              </Button>
            </div>

            <div className="grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Current Logo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                      {currentLogo ? (
                        <img 
                          src={currentLogo} 
                          alt="Current Logo" 
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-center">
                          <Image className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No logo set</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Logo Actions</h3>
                        <div className="flex space-x-2">
                          <input
                            type="file"
                            id="new-logo-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                uploadNewLogo(file);
                              }
                            }}
                          />
                          <Button 
                            onClick={() => document.getElementById('new-logo-upload')?.click()}
                            disabled={uploadingFile}
                            className="btn-corporate"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {uploadingFile ? 'Uploading...' : 'Upload New Logo'}
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={openLogoManagement}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Choose from Media
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p><strong>Recommended:</strong> PNG or SVG format</p>
                        <p><strong>Size:</strong> 200x60px or similar ratio</p>
                        <p><strong>Background:</strong> Transparent preferred</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Logo Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Header Logo</h4>
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {currentLogo && (
                            <img src={currentLogo} alt="Header Logo" className="h-8 w-auto" />
                          )}
                          <span className="font-heading font-black uppercase tracking-wider">SPACE</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">Logo appears in the website header navigation</p>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold">Footer Logo</h4>
                      <div className="bg-secondary p-4 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {currentLogo && (
                            <img src={currentLogo} alt="Footer Logo" className="h-6 w-auto filter brightness-0 invert" />
                          )}
                          <span className="font-heading font-black uppercase tracking-wider text-white">SPACE</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">Logo appears in the website footer (inverted for dark background)</p>
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
          <div className="space-y-6">
            {editingContent && (
              <>
                {/* Hero Section Form */}
                {editingContent.section_key === 'hero' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Main Title</Label>
                      <Input
                        value={editingContent.formData?.title || ''}
                        onChange={(e) => updateFormField('title', e.target.value)}
                        placeholder="Enter main title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subtitle</Label>
                      <Input
                        value={editingContent.formData?.subtitle || ''}
                        onChange={(e) => updateFormField('subtitle', e.target.value)}
                        placeholder="Enter subtitle"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={editingContent.formData?.description || ''}
                        onChange={(e) => updateFormField('description', e.target.value)}
                        placeholder="Enter description"
                        rows={3}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Primary Button Text</Label>
                        <Input
                          value={editingContent.formData?.ctaPrimary || ''}
                          onChange={(e) => updateFormField('ctaPrimary', e.target.value)}
                          placeholder="Primary button text"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Secondary Button Text</Label>
                        <Input
                          value={editingContent.formData?.ctaSecondary || ''}
                          onChange={(e) => updateFormField('ctaSecondary', e.target.value)}
                          placeholder="Secondary button text"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* About Section Form */}
                {editingContent.section_key === 'about' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Section Title</Label>
                      <Input
                        value={editingContent.formData?.title || ''}
                        onChange={(e) => updateFormField('title', e.target.value)}
                        placeholder="Enter section title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Main Description</Label>
                      <Textarea
                        value={editingContent.formData?.description || ''}
                        onChange={(e) => updateFormField('description', e.target.value)}
                        placeholder="Enter main description"
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subtitle</Label>
                      <Textarea
                        value={editingContent.formData?.subtitle || ''}
                        onChange={(e) => updateFormField('subtitle', e.target.value)}
                        placeholder="Enter subtitle"
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {/* Services Section Form */}
                {editingContent.section_key === 'services' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Section Title</Label>
                      <Input
                        value={editingContent.formData?.title || ''}
                        onChange={(e) => updateFormField('title', e.target.value)}
                        placeholder="Enter section title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Section Description</Label>
                      <Textarea
                        value={editingContent.formData?.description || ''}
                        onChange={(e) => updateFormField('description', e.target.value)}
                        placeholder="Enter section description"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-4">
                      <Label>Service Items</Label>
                      {editingContent.formData?.items?.map((item: any, index: number) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">Service {index + 1}</h4>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Service Title</Label>
                                <Input
                                  value={item.title || ''}
                                  onChange={(e) => updateArrayItem('items', index, 'title', e.target.value)}
                                  placeholder="Service title"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Icon (Emoji)</Label>
                                <Input
                                  value={item.icon || ''}
                                  onChange={(e) => updateArrayItem('items', index, 'icon', e.target.value)}
                                  placeholder="🏢"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Service Description</Label>
                              <Textarea
                                value={item.description || ''}
                                onChange={(e) => updateArrayItem('items', index, 'description', e.target.value)}
                                placeholder="Service description"
                                rows={2}
                              />
                            </div>
                          </div>
                        </Card>
                      )) || []}
                    </div>
                  </div>
                )}

                {/* Contact Section Form */}
                {editingContent.section_key === 'contact' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Section Title</Label>
                      <Input
                        value={editingContent.formData?.title || ''}
                        onChange={(e) => updateFormField('title', e.target.value)}
                        placeholder="Enter section title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={editingContent.formData?.description || ''}
                        onChange={(e) => updateFormField('description', e.target.value)}
                        placeholder="Enter description"
                        rows={3}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Primary Button Text</Label>
                        <Input
                          value={editingContent.formData?.ctaPrimary || ''}
                          onChange={(e) => updateFormField('ctaPrimary', e.target.value)}
                          placeholder="Primary button text"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Secondary Button Text</Label>
                        <Input
                          value={editingContent.formData?.ctaSecondary || ''}
                          onChange={(e) => updateFormField('ctaSecondary', e.target.value)}
                          placeholder="Secondary button text"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Section Form */}
                {editingContent.section_key === 'footer' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Company Description</Label>
                      <Textarea
                        value={editingContent.formData?.description || ''}
                        onChange={(e) => updateFormField('description', e.target.value)}
                        placeholder="Enter company description"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-4">
                      <Label>Contact Information</Label>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            value={editingContent.formData?.contact?.email || ''}
                            onChange={(e) => updateNestedField('contact', 'email', e.target.value)}
                            placeholder="Email address"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input
                            value={editingContent.formData?.contact?.phone || ''}
                            onChange={(e) => updateNestedField('contact', 'phone', e.target.value)}
                            placeholder="Phone number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Address</Label>
                          <Input
                            value={editingContent.formData?.contact?.address || ''}
                            onChange={(e) => updateNestedField('contact', 'address', e.target.value)}
                            placeholder="Address"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Green Life Expo Section Form */}
                {editingContent.section_key === 'green_life_expo' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Project Title</Label>
                      <Input
                        value={editingContent.formData?.title || ''}
                        onChange={(e) => updateFormField('title', e.target.value)}
                        placeholder="Enter project title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subtitle</Label>
                      <Input
                        value={editingContent.formData?.subtitle || ''}
                        onChange={(e) => updateFormField('subtitle', e.target.value)}
                        placeholder="Enter subtitle"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={editingContent.formData?.description || ''}
                        onChange={(e) => updateFormField('description', e.target.value)}
                        placeholder="Enter description"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Website URL</Label>
                      <Input
                        value={editingContent.formData?.url || ''}
                        onChange={(e) => updateFormField('url', e.target.value)}
                        placeholder="https://greenlife-expo.com"
                      />
                    </div>
                  </div>
                )}

                {/* Generic form for other sections */}
                {!['hero', 'about', 'services', 'contact', 'footer', 'green_life_expo'].includes(editingContent.section_key) && (
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Advanced Editing:</strong> This section uses a custom structure.
                      </p>
                      <Textarea
                        value={JSON.stringify(editingContent.formData, null, 2)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            setEditingContent({
                              ...editingContent,
                              formData: parsed
                            });
                          } catch (error) {
                            // Invalid JSON, don't update
                          }
                        }}
                        rows={15}
                        className="font-mono text-sm"
                        placeholder="JSON content..."
                      />
                    </div>
                  </div>
                )}
              </>
            )}
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

      {/* Media Editor Dialog */}
      <Dialog open={isEditMediaDialogOpen} onOpenChange={setIsEditMediaDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Media: {editingMedia?.file_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingMedia && (
              <>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                  {editingMedia.file_type.startsWith('image/') ? (
                    <img 
                      src={editingMedia.file_path} 
                      alt={editingMedia.alt_text || editingMedia.file_name}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <Image className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">{editingMedia.file_type}</p>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>File Name</Label>
                    <Input
                      value={editingMedia.file_name}
                      onChange={(e) => setEditingMedia({
                        ...editingMedia,
                        file_name: e.target.value
                      })}
                      placeholder="Enter file name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={editingMedia.category} 
                      onValueChange={(value) => setEditingMedia({
                        ...editingMedia,
                        category: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="logos">Logos</SelectItem>
                        <SelectItem value="backgrounds">Backgrounds</SelectItem>
                        <SelectItem value="exhibitions">Exhibitions</SelectItem>
                        <SelectItem value="conferences">Conferences</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="graphics">Graphics</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Alt Text / Description</Label>
                  <Textarea
                    value={editingMedia.alt_text || ''}
                    onChange={(e) => setEditingMedia({
                      ...editingMedia,
                      alt_text: e.target.value
                    })}
                    placeholder="Enter description for accessibility and SEO"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div>
                    <strong>File Size:</strong><br />
                    {(editingMedia.file_size / 1024).toFixed(1)} KB
                  </div>
                  <div>
                    <strong>File Type:</strong><br />
                    {editingMedia.file_type}
                  </div>
                  <div>
                    <strong>Uploaded:</strong><br />
                    {new Date(editingMedia.created_at).toLocaleDateString()}
                  </div>
                </div>
              </>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditMediaDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveMediaChanges} className="btn-corporate">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logo Selection Dialog */}
      <Dialog open={isLogoManagementOpen} onOpenChange={setIsLogoManagementOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose Logo from Media Library</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mediaAssets
                .filter(asset => asset.category === 'logos' || asset.file_type.startsWith('image/'))
                .map((asset) => (
                <Card 
                  key={asset.id} 
                  className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
                    currentLogo === asset.file_path ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setCurrentLogo(asset.file_path)}
                >
                  <CardContent className="p-3">
                    <div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center">
                      <img 
                        src={asset.file_path} 
                        alt={asset.alt_text || asset.file_name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <p className="text-xs text-center truncate" title={asset.file_name}>
                      {asset.file_name}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {currentLogo && (
              <div className="border-t pt-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                    <img 
                      src={currentLogo} 
                      alt="Selected Logo" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">Selected Logo</p>
                    <p className="text-sm text-muted-foreground">{currentLogo}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsLogoManagementOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (currentLogo) {
                    updateLogo(currentLogo);
                    setIsLogoManagementOpen(false);
                  }
                }} 
                className="btn-corporate"
                disabled={!currentLogo}
              >
                <Save className="w-4 h-4 mr-2" />
                Set as Logo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;