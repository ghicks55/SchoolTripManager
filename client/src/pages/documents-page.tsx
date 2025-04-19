import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Upload, FileText, File, Trash2, Download } from "lucide-react";
import type { Group, Document } from "@shared/schema";

export default function DocumentsPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  
  // Fetch group details
  const { data: group, isLoading: groupLoading } = useQuery<Group>({
    queryKey: ['/api/groups', parseInt(groupId)],
    enabled: !!groupId
  });
  
  // Fetch documents
  const { data: documents, isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ['/api/groups', parseInt(groupId), 'documents'],
    enabled: !!groupId
  });
  
  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file || !documentType) {
        throw new Error("File and document type are required");
      }
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('groupId', groupId);
      formData.append('documentType', documentType);
      formData.append('description', description || "");
      formData.append('uploadedBy', user?.id.toString() || "");
      
      const response = await fetch('/api/upload/document', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to upload document");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document uploaded",
        description: "Your document was uploaded successfully",
      });
      setUploadDialogOpen(false);
      resetUploadForm();
      queryClient.invalidateQueries({ queryKey: ['/api/groups', parseInt(groupId), 'documents'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete document");
      }
    },
    onSuccess: () => {
      toast({
        title: "Document deleted",
        description: "Document was removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/groups', parseInt(groupId), 'documents'] });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const resetUploadForm = () => {
    setFile(null);
    setDocumentType("");
    setDescription("");
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  const documentTypeOptions = [
    { value: "waiver", label: "Waiver Form" },
    { value: "itinerary", label: "Itinerary" },
    { value: "invoice", label: "Invoice" },
    { value: "contract", label: "Contract" },
    { value: "guide", label: "Travel Guide" },
    { value: "insurance", label: "Insurance Information" },
    { value: "roster", label: "Roster" },
    { value: "other", label: "Other" },
  ];
  
  const getDocumentTypeLabel = (type: string) => {
    const option = documentTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };
  
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="h-5 w-5 text-blue-500" />;
    if (fileType.includes('sheet') || fileType.includes('excel')) return <FileText className="h-5 w-5 text-green-500" />;
    if (fileType.includes('image')) return <FileText className="h-5 w-5 text-purple-500" />;
    return <File className="h-5 w-5" />;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  if (groupLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{group?.schoolName} Documents</h1>
          <p className="text-muted-foreground">{group?.groupName} - {group?.destination}</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
              <DialogDescription>
                Upload documents related to this group trip.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="file">File</Label>
                <Input id="file" type="file" onChange={handleFileChange} />
                {file && <p className="text-sm text-muted-foreground">{file.name} ({formatBytes(file.size)})</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="documentType">Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add a description for this document"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                onClick={() => uploadMutation.mutate()}
                disabled={!file || !documentType || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Group Documents</CardTitle>
          <CardDescription>
            Manage documents related to this group's trip
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : documents && documents.length > 0 ? (
            <Table>
              <TableCaption>A list of all documents for this group.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      {getFileIcon(doc.fileType)}
                      <span className="truncate max-w-[200px]">{doc.fileName}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getDocumentTypeLabel(doc.documentType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {doc.description || "-"}
                    </TableCell>
                    <TableCell>{formatDate(doc.createdAt.toString())}</TableCell>
                    <TableCell>{formatBytes(doc.fileSize)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" asChild>
                          <a href={doc.filePath} target="_blank" rel="noopener noreferrer" download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the document "{doc.fileName}".
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteMutation.mutate(doc.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {deleteMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">No documents</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This group doesn't have any documents yet.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setUploadDialogOpen(true)}
              >
                Upload your first document
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}