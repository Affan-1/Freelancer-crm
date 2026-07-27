import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Edit, Trash, X, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/Table';

const Team = () => {
  const queryClient = useQueryClient();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [inviteData, setInviteData] = useState({ name: '', email: '', role: 'member' });
  const [editData, setEditData] = useState({ name: '', role: '' });
  const [inviteResult, setInviteResult] = useState(null);

  // Fetch team members
  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ['team'],
    queryFn: () => api.get('/team').then(res => res.data.data),
  });

  // Fetch pending invitations
  const { data: invitations, isLoading: invitationsLoading } = useQuery({
    queryKey: ['invitations'],
    queryFn: () => api.get('/team/invitations').then(res => res.data.data),
  });

  // Invite mutation
  const inviteMutation = useMutation({
    mutationFn: (data) => api.post('/team/invite', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['invitations']);
      queryClient.invalidateQueries(['team']);
      setInviteResult(res.data);
      setInviteData({ name: '', email: '', role: 'member' });
    }
  });

  // Update member mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/team/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['team']);
      setIsEditOpen(false);
      setEditingMember(null);
    }
  });

  // Remove member mutation
  const removeMutation = useMutation({
    mutationFn: (id) => api.delete(`/team/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['team']),
  });

  // Cancel invitation mutation
  const cancelInviteMutation = useMutation({
    mutationFn: (id) => api.delete(`/team/invitation/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['invitations']),
  });

  const handleInvite = (e) => {
    e.preventDefault();
    if (inviteData.name && inviteData.email) {
      setInviteResult(null);
      inviteMutation.mutate(inviteData);
    }
  };

  const handleOpenEdit = (member) => {
    setEditingMember(member);
    setEditData({ name: member.name, role: member.role });
    setIsEditOpen(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateMutation.mutate({ id: editingMember._id, data: editData });
  };

  const statusBadge = (status) => {
    if (status === 'pending') return <Badge variant="warning" className="capitalize"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    if (status === 'accepted') return <Badge variant="success" className="capitalize"><CheckCircle className="h-3 w-3 mr-1" /> Accepted</Badge>;
    if (status === 'rejected') return <Badge variant="destructive" className="capitalize"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
    return <Badge variant="secondary" className="capitalize">{status}</Badge>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Team</h2>
          <p className="text-muted-foreground">Manage your team members, roles, and invitations.</p>
        </div>
        <Button onClick={() => { setIsInviteOpen(true); setInviteResult(null); }}>
          <Plus className="mr-2 h-4 w-4" /> Invite Member
        </Button>
      </div>

      {/* ── Team Members Table ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {teamLoading ? (
            <div className="py-8 text-center">Loading team...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No team members yet.</TableCell>
                  </TableRow>
                ) : (
                  team?.map(member => (
                    <TableRow key={member._id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(member.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(member)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                          if (window.confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
                            removeMutation.mutate(member._id);
                          }
                        }}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Pending Invitations Table ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Invitations</CardTitle>
          <CardDescription>Track the status of all sent invitations.</CardDescription>
        </CardHeader>
        <CardContent>
          {invitationsLoading ? (
            <div className="py-8 text-center">Loading invitations...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No invitations sent yet.</TableCell>
                  </TableRow>
                ) : (
                  invitations?.map(inv => (
                    <TableRow key={inv._id}>
                      <TableCell className="font-medium">{inv.name}</TableCell>
                      <TableCell>{inv.email}</TableCell>
                      <TableCell className="capitalize">{inv.role}</TableCell>
                      <TableCell>{statusBadge(inv.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        {inv.status === 'pending' && (
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                            if (window.confirm('Cancel this invitation?')) {
                              cancelInviteMutation.mutate(inv._id);
                            }
                          }}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Invite Modal ── */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Invite Team Member</CardTitle>
                <CardDescription>An invitation email will be sent to this person.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setIsInviteOpen(false); setInviteResult(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input value={inviteData.name} onChange={e => setInviteData({...inviteData, name: e.target.value})} placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" value={inviteData.email} onChange={e => setInviteData({...inviteData, email: e.target.value})} placeholder="john@example.com" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={inviteData.role} 
                    onChange={e => setInviteData({...inviteData, role: e.target.value})}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Success result */}
                {inviteResult && (
                  <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-4 text-sm space-y-2">
                    <p className="font-medium text-green-700 dark:text-green-400">✓ Invitation sent successfully!</p>
                    {inviteResult.previewUrl && (
                      <p className="text-xs text-muted-foreground">
                        📧 <a href={inviteResult.previewUrl} target="_blank" rel="noopener noreferrer" className="underline text-primary">
                          Preview email (Ethereal)
                        </a>
                      </p>
                    )}
                  </div>
                )}

                {/* Error */}
                {inviteMutation.isError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
                    {inviteMutation.error?.response?.data?.message || 'Failed to send invitation.'}
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setIsInviteOpen(false); setInviteResult(null); }}>Close</Button>
                  <Button type="submit" disabled={inviteMutation.isPending}>
                    {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Edit Member Modal ── */}
      {isEditOpen && editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Edit Member</CardTitle>
                <CardDescription>Update member name or role.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsEditOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={editData.role} 
                    onChange={e => setEditData({...editData, role: e.target.value})}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {updateMutation.isError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
                    {updateMutation.error?.response?.data?.message || 'Failed to update member.'}
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Team;
