import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Settings } from 'lucide-react';

const AdminLogin = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Check if user has admin privileges
      const { data: adminUser } = await supabase
        .from('admin_users_2026_01_01_12_00')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .single();

      if (adminUser) {
        window.location.href = '/#/admin/dashboard';
      }
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user has admin privileges
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users_2026_01_01_12_00')
        .select('*')
        .eq('user_id', data.user.id)
        .eq('is_active', true)
        .single();

      if (adminError || !adminUser) {
        await supabase.auth.signOut();
        throw new Error('You do not have admin privileges.');
      }

      // Update last login
      await supabase
        .from('admin_users_2026_01_01_12_00')
        .update({ last_login: new Date().toISOString() })
        .eq('user_id', data.user.id);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${adminUser.full_name || adminUser.email}!`,
      });

      window.location.href = '/#/admin/dashboard';

    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials or insufficient privileges.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, check if this is the first user (super admin setup)
      const { data: existingAdmins } = await supabase
        .from('admin_users_2026_01_01_12_00')
        .select('id')
        .limit(1);

      const isFirstUser = !existingAdmins || existingAdmins.length === 0;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Add to admin_users table
        const { error: adminError } = await supabase
          .from('admin_users_2026_01_01_12_00')
          .insert({
            user_id: data.user.id,
            email: email,
            role: isFirstUser ? 'super_admin' : 'editor', // First user becomes super admin
            full_name: fullName,
            is_active: true
          });

        if (adminError) throw adminError;

        toast({
          title: "Account Created",
          description: isFirstUser 
            ? "Super admin account created successfully! Please check your email to verify your account."
            : "Account created successfully! Please check your email to verify your account.",
        });

        if (isFirstUser) {
          setIsSignUp(false);
        }
      }

    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "Failed to create account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Settings className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-heading font-bold uppercase">SPACE</h1>
              <p className="text-sm text-muted-foreground">Admin Portal</p>
            </div>
          </div>
          <CardTitle className="text-xl">
            {isSignUp ? 'Create Admin Account' : 'Admin Login'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full btn-corporate" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setEmail('');
                setPassword('');
                setFullName('');
              }}
              className="text-sm"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : 'Need to create the first admin account? Sign up'
              }
            </Button>
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => window.location.href = '/'}
              className="text-sm text-muted-foreground"
            >
              ← Back to Website
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;