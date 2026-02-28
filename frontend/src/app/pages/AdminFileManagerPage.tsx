import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Upload, Trash2, Download, File, Folder, Search, Filter } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export const AdminFileManagerPage = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [searchTerm, setSearchTerm] = useState('');
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'Documents',
      type: 'folder',
      size: 0,
      uploadedAt: '2026-02-10',
      uploadedBy: 'Admin',
    },
    {
      id: '2',
      name: 'Reports',
      type: 'folder',
      size: 0,
      uploadedAt: '2026-02-10',
      uploadedBy: 'Admin',
    },
    {
      id: '3',
      name: 'System_Backup_2026.zip',
      type: 'file',
      size: 2048,
      uploadedAt: '2026-02-09',
      uploadedBy: 'Admin',
    },
    {
      id: '4',
      name: 'Email_List_Jan.csv',
      type: 'file',
      size: 512,
      uploadedAt: '2026-02-08',
      uploadedBy: 'User_123',
    },
  ]);

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles) {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const newFile: FileItem = {
          id: Date.now().toString() + i,
          name: file.name,
          type: 'file',
          size: Math.round(file.size / 1024),
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: 'Admin',
        };
        setFiles(prev => [...prev, newFile]);
      }
      toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
    }
  };

  const handleDelete = (id: string) => {
    const fileName = files.find(f => f.id === id)?.name;
    setFiles(prev => prev.filter(f => f.id !== id));
    toast.success(`${fileName} deleted successfully`);
  };

  const handleDownload = (fileName: string) => {
    toast.success(`Downloading ${fileName}...`);
  };

  const formatFileSize = (sizeKB: number) => {
    if (sizeKB > 1024) {
      return `${(sizeKB / 1024).toFixed(2)} MB`;
    }
    return `${sizeKB} KB`;
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">File Manager</h1>
        <p className="text-gray-600">Manage system files and user uploads</p>
      </div>

      {/* Upload Section */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-8 text-center hover:border-[#2563EB] transition-colors">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <Label htmlFor="fileInput" className="cursor-pointer">
              <p className="text-lg font-medium text-gray-900 mb-1">Drop files here or click to select</p>
              <p className="text-sm text-gray-600">Maximum file size: 100 MB</p>
              <Input
                id="fileInput"
                type="file"
                multiple
                onChange={handleUpload}
                className="hidden"
              />
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* File List Section */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Files & Folders</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Current path: <span className="font-mono font-medium text-gray-900">{currentPath}</span>
          </p>
        </CardHeader>
        <CardContent>
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <File className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No files found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Size</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Uploaded By</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="border-b border-[#E5E7EB] hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {file.type === 'folder' ? (
                            <Folder className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          ) : (
                            <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                          <span className="font-medium text-gray-900">{file.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 capitalize">{file.type}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {file.type === 'folder' ? '-' : formatFileSize(file.size)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{file.uploadedBy}</td>
                      <td className="py-3 px-4 text-gray-600">{file.uploadedAt}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {file.type === 'file' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(file.name)}
                              className="text-[#2563EB] hover:text-[#1E3A8A]"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(file.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Info */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle>Storage Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB]">
              <p className="text-sm text-gray-600 mb-2">Total Files</p>
              <p className="text-3xl font-bold text-gray-900">{files.filter(f => f.type === 'file').length}</p>
            </div>
            <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB]">
              <p className="text-sm text-gray-600 mb-2">Total Folders</p>
              <p className="text-3xl font-bold text-gray-900">{files.filter(f => f.type === 'folder').length}</p>
            </div>
            <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB]">
              <p className="text-sm text-gray-600 mb-2">Total Size</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatFileSize(files.filter(f => f.type === 'file').reduce((acc, f) => acc + f.size, 0))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
