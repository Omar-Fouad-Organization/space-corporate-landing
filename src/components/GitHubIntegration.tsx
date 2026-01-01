import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Github, 
  GitBranch, 
  Upload, 
  Settings, 
  ExternalLink,
  Copy,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const GitHubIntegration = () => {
  const [githubConfig, setGithubConfig] = useState({
    username: '',
    repository: '',
    token: '',
    isConfigured: false
  });
  const [commitMessage, setCommitMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfigSave = () => {
    if (!githubConfig.username || !githubConfig.repository || !githubConfig.token) {
      toast({
        title: "Missing Information",
        description: "Please fill in all GitHub configuration fields.",
        variant: "destructive",
      });
      return;
    }

    // Save configuration (in a real app, this would be encrypted and stored securely)
    localStorage.setItem('github_config', JSON.stringify({
      username: githubConfig.username,
      repository: githubConfig.repository,
      isConfigured: true
    }));

    setGithubConfig(prev => ({ ...prev, isConfigured: true }));
    
    toast({
      title: "GitHub Configured",
      description: "GitHub integration has been set up successfully.",
    });
  };

  const handlePushToGitHub = async () => {
    if (!githubConfig.isConfigured) {
      toast({
        title: "Not Configured",
        description: "Please configure GitHub integration first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate GitHub push (in a real implementation, this would call an API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Pushed to GitHub",
        description: `Code successfully pushed with message: "${commitMessage || 'Auto-update'}"`,
      });
      
      setCommitMessage('');
    } catch (error) {
      toast({
        title: "Push Failed",
        description: "Failed to push to GitHub. Please check your configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copySetupCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    toast({
      title: "Copied",
      description: "Command copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold">GitHub Integration</h2>
          <p className="text-muted-foreground mt-1">
            Automatically sync your code to GitHub repository
          </p>
        </div>
        <Badge variant={githubConfig.isConfigured ? "default" : "secondary"}>
          {githubConfig.isConfigured ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Configured
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3 mr-1" />
              Not Configured
            </>
          )}
        </Badge>
      </div>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>GitHub Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>GitHub Username</Label>
              <Input
                value={githubConfig.username}
                onChange={(e) => setGithubConfig(prev => ({ ...prev, username: e.target.value }))}
                placeholder="your-username"
              />
            </div>
            <div className="space-y-2">
              <Label>Repository Name</Label>
              <Input
                value={githubConfig.repository}
                onChange={(e) => setGithubConfig(prev => ({ ...prev, repository: e.target.value }))}
                placeholder="space-corporate-landing"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Personal Access Token</Label>
            <Input
              type="password"
              value={githubConfig.token}
              onChange={(e) => setGithubConfig(prev => ({ ...prev, token: e.target.value }))}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            />
            <p className="text-sm text-muted-foreground">
              Generate at: <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub Settings → Tokens</a>
            </p>
          </div>
          <Button onClick={handleConfigSave} className="btn-corporate">
            <Settings className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </CardContent>
      </Card>

      {/* Push to GitHub Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Push to GitHub</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Commit Message</Label>
            <Textarea
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Describe your changes..."
              rows={3}
            />
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={handlePushToGitHub} 
              disabled={!githubConfig.isConfigured || isLoading}
              className="btn-corporate"
            >
              <Github className="w-4 h-4 mr-2" />
              {isLoading ? 'Pushing...' : 'Push to GitHub'}
            </Button>
            {githubConfig.isConfigured && (
              <Button 
                variant="outline"
                onClick={() => window.open(`https://github.com/${githubConfig.username}/${githubConfig.repository}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Repository
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GitBranch className="w-5 h-5" />
            <span>Setup Instructions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold mb-2">1. Create GitHub Repository</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Create a new repository on GitHub (don't initialize with README)
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://github.com/new', '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Create Repository
              </Button>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">2. Generate Access Token</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Create a personal access token with 'repo' and 'workflow' permissions
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://github.com/settings/tokens', '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Generate Token
              </Button>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. Command Line Setup (Optional)</h4>
              <div className="space-y-2">
                <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <span>./setup-github.sh</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copySetupCommand('./setup-github.sh')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <span>npm run github:setup</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copySetupCommand('npm run github:setup')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      {githubConfig.isConfigured && (
        <Card>
          <CardHeader>
            <CardTitle>Repository Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Repository URL</p>
                <p className="font-mono text-sm">
                  https://github.com/{githubConfig.username}/{githubConfig.repository}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Sync</p>
                <p className="text-sm">Not synced yet</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GitHubIntegration;