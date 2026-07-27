import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const InvitationResponse = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const action = searchParams.get('action');

  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || !action) {
      setStatus('error');
      setMessage('Invalid invitation link. Missing token or action.');
      return;
    }

    const respond = async () => {
      try {
        const res = await api.post('/team/invitation/respond', { token, action });
        setStatus('success');
        setMessage(res.data.message);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Something went wrong.');
      }
    };

    respond();
  }, [token, action]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500/10 via-background to-blue-500/10 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {status === 'processing' && '⏳ Processing...'}
            {status === 'success' && action === 'accept' && '🎉 Welcome to the Team!'}
            {status === 'success' && action === 'reject' && '👋 Invitation Declined'}
            {status === 'error' && '⚠️ Something Went Wrong'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">{message || 'Please wait while we process your response...'}</p>

          {status === 'success' && action === 'accept' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Your account has been created with a temporary password: <code className="bg-muted px-2 py-1 rounded text-xs font-mono">ChangeMe123!</code>
              </p>
              <p className="text-sm text-muted-foreground">
                Please log in and change your password as soon as possible.
              </p>
              <Link to="/login">
                <Button className="w-full mt-4">Go to Login</Button>
              </Link>
            </div>
          )}

          {status === 'success' && action === 'reject' && (
            <p className="text-sm text-muted-foreground">You have declined the invitation. No account was created.</p>
          )}

          {status === 'error' && (
            <Link to="/login">
              <Button variant="outline" className="mt-4">Go to Login</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationResponse;
