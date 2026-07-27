import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileText, Plus, Search, Edit, Trash, X } from 'lucide-react';
import api from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/Table';

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  qty: z.coerce.number().min(1, "Quantity must be at least 1"),
  rate: z.coerce.number().min(0, "Rate must be positive"),
  amount: z.number().optional(),
});

const invoiceSchema = z.object({
  client: z.string().min(1, "Client is required"),
  project: z.string().min(1, "Project is required"),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']),
  dueDate: z.string().min(1, "Due date is required"),
});

const Invoices = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.get('/invoices').then(res => res.data.data),
  });

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.get('/clients').then(res => res.data.data),
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(res => res.data.data),
  });

  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { 
      status: 'draft', 
      items: [{ description: '', qty: 1, rate: 0, amount: 0 }] 
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  // Calculate amount per item and total dynamically
  const watchItems = watch("items");
  const total = watchItems?.reduce((sum, item) => sum + ((item.qty || 0) * (item.rate || 0)), 0) || 0;

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/invoices', { ...data, total }),
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices']);
      handleCloseModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/invoices/${editingInvoice._id}`, { ...data, total }),
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices']);
      handleCloseModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/invoices/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['invoices'])
  });

  const handleOpenModal = (invoice = null) => {
    if (invoice) {
      setEditingInvoice(invoice);
      const formattedDate = invoice.dueDate ? new Date(invoice.dueDate).toISOString().slice(0, 10) : '';
      reset({
        ...invoice,
        client: invoice.client?._id,
        project: invoice.project?._id,
        dueDate: formattedDate,
      });
    } else {
      setEditingInvoice(null);
      reset({ 
        status: 'draft', 
        client: '', 
        project: '', 
        dueDate: '',
        items: [{ description: '', qty: 1, rate: 0, amount: 0 }] 
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInvoice(null);
    reset();
  };

  const onSubmit = (data) => {
    // Ensure amount is calculated for each item before submitting
    const processedData = {
      ...data,
      items: data.items.map(item => ({
        ...item,
        amount: item.qty * item.rate
      }))
    };

    if (editingInvoice) {
      updateMutation.mutate(processedData);
    } else {
      createMutation.mutate(processedData);
    }
  };

  const filteredInvoices = invoices?.filter(invoice => 
    invoice.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.project?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">Manage billing and payments.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search invoices by client or project..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="py-8 text-center">Loading invoices...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices?.map(invoice => (
                    <TableRow key={invoice._id}>
                      <TableCell className="font-medium">{invoice.client?.name}</TableCell>
                      <TableCell>{invoice.project?.title}</TableCell>
                      <TableCell>${invoice.total.toLocaleString()}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'destructive' : 'default'} className="capitalize">
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(invoice)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                          if (window.confirm('Are you sure you want to delete this invoice?')) {
                            deleteMutation.mutate(invoice._id);
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-card z-10 border-b">
              <div>
                <CardTitle>{editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}</CardTitle>
                <CardDescription>Fill out the invoice details and line items below.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Client</label>
                    <select 
                      {...register('client')} 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select a client</option>
                      {clients?.map(client => (
                        <option key={client._id} value={client._id}>{client.name} {client.company ? `- ${client.company}` : ''}</option>
                      ))}
                    </select>
                    {errors.client && <p className="text-xs text-destructive">{errors.client.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project</label>
                    <select 
                      {...register('project')} 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select a project</option>
                      {projects?.map(project => (
                        <option key={project._id} value={project._id}>{project.title}</option>
                      ))}
                    </select>
                    {errors.project && <p className="text-xs text-destructive">{errors.project.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Date</label>
                    <Input type="date" {...register('dueDate')} />
                    {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select 
                      {...register('status')} 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>

                {/* Line Items Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-semibold text-sm">Line Items</h4>
                  </div>
                  
                  {fields.map((field, index) => {
                    const qty = watchItems?.[index]?.qty || 0;
                    const rate = watchItems?.[index]?.rate || 0;
                    const amount = qty * rate;

                    return (
                      <div key={field.id} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-1">
                          <Input placeholder="Description" {...register(`items.${index}.description`)} />
                          {errors.items?.[index]?.description && <p className="text-[10px] text-destructive">{errors.items[index].description.message}</p>}
                        </div>
                        <div className="w-20 space-y-1">
                          <Input type="number" placeholder="Qty" {...register(`items.${index}.qty`)} />
                          {errors.items?.[index]?.qty && <p className="text-[10px] text-destructive">{errors.items[index].qty.message}</p>}
                        </div>
                        <div className="w-24 space-y-1">
                          <Input type="number" step="0.01" placeholder="Rate" {...register(`items.${index}.rate`)} />
                          {errors.items?.[index]?.rate && <p className="text-[10px] text-destructive">{errors.items[index].rate.message}</p>}
                        </div>
                        <div className="w-24 pt-2 text-right text-sm font-medium">
                          ${amount.toFixed(2)}
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive mt-0"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                  
                  <div className="flex justify-between items-center pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => append({ description: '', qty: 1, rate: 0, amount: 0 })}
                    >
                      <Plus className="mr-2 h-3 w-3" /> Add Item
                    </Button>
                    <div className="text-lg font-bold">
                      Total: ${total.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Invoice'}
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

export default Invoices;
