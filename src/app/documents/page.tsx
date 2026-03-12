'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, Image, File, Trash2, Download, CheckCircle, AlertCircle, Clock, FolderOpen, Search, Filter } from 'lucide-react';

interface DocItem {
  id: string; name: string; type: string; size: string;
  category: string; uploadDate: string; status: 'verified' | 'pending' | 'rejected';
}

const sampleDocs: DocItem[] = [
  { id: '1', name: 'DD-214.pdf', type: 'application/pdf', size: '2.4 MB', category: 'Military Records', uploadDate: '2024-01-15', status: 'verified' },
  { id: '2', name: 'VA_Disability_Letter.pdf', type: 'application/pdf', size: '1.1 MB', category: 'VA Documents', uploadDate: '2024-01-20', status: 'verified' },
  { id: '3', name: 'Property_Tax_Bill.pdf', type: 'application/pdf', size: '856 KB', category: 'Tax Documents', uploadDate: '2024-02-01', status: 'pending' },
  { id: '4', name: 'Drivers_License.jpg', type: 'image/jpeg', size: '3.2 MB', category: 'Identification', uploadDate: '2024-02-05', status: 'verified' },
  { id: '5', name: 'Marriage_Certificate.pdf', type: 'application/pdf', size: '1.8 MB', category: 'Personal Documents', uploadDate: '2024-02-10', status: 'rejected' },
];

const categories = ['All Documents','Military Records','VA Documents','Tax Documents','Identification','Personal Documents','Medical Records','Financial Documents'];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocItem[]>(sampleDocs);
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Documents');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files);
  };

  const handleFiles = (files: FileList) => {
    setUploading(true);
    setTimeout(() => {
      const newDocs: DocItem[] = Array.from(files).map((file, i) => ({
        id: 'new-' + Date.now() + '-' + i, name: file.name, type: file.type,
        size: file.size < 1048576 ? (file.size/1024).toFixed(1)+' KB' : (file.size/1048576).toFixed(1)+' MB',
        category: 'Personal Documents', uploadDate: new Date().toISOString().split('T')[0], status: 'pending' as const,
      }));
      setDocuments(p => [...newDocs, ...p]);
      setUploading(false); setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }, 1500);
  };

  const deleteDocument = (id: string) => setDocuments(p => p.filter(d => d.id !== id));

  const getFileIcon = (t: string) => {
    if (t.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (t === 'application/pdf') return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const getStatusBadge = (status: DocItem['status']) => {
    const cfg: Record<string, {bg:string;icon:React.ReactNode;label:string}> = {
      verified: { bg:'bg-green-100 text-green-800', icon:<CheckCircle className="w-3 h-3"/>, label:'Verified' },
      pending: { bg:'bg-yellow-100 text-yellow-800', icon:<Clock className="w-3 h-3"/>, label:'Pending Review' },
      rejected: { bg:'bg-red-100 text-red-800', icon:<AlertCircle className="w-3 h-3"/>, label:'Needs Resubmission' },
    };
    const s = cfg[status];
    return <span className={'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ' + s.bg}>{s.icon} {s.label}</span>;
  };

  const filtered = documents.filter(d => {
    const matchCat = selectedCategory === 'All Documents' || d.category === selectedCategory;
    return matchCat && d.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Document Center</h1>
          <p className="text-xl text-blue-100 max-w-3xl">Securely upload and manage your documents for benefit applications.</p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-[var(--primary)]" /> Upload Documents
          </h2>
          <div className={'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ' + (dragActive ? 'border-[var(--primary)] bg-blue-50' : 'border-gray-300 hover:border-gray-400')}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary)] mb-4" />
                <p className="text-gray-600">Uploading your documents...</p>
              </div>
            ) : uploadSuccess ? (
              <div className="flex flex-col items-center">
                <CheckCircle className="w-10 h-10 text-green-500 mb-4" />
                <p className="text-green-600 font-medium">Documents uploaded successfully!</p>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 mb-2">Drag and drop files here, or{' '}
                  <label className="text-[var(--primary)] font-medium cursor-pointer hover:underline">browse
                    <input type="file" multiple className="hidden" onChange={handleFileInput} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                  </label>
                </p>
                <p className="text-sm text-gray-400">Accepted: PDF, JPG, PNG, DOC, DOCX (Max 10MB)</p>
              </>
            )}
          </div>
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-[var(--primary)] mb-2">Commonly Required Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
              {['DD-214 (Discharge Papers)','VA Disability Rating Letter','MA ID or Driver License','Proof of Residency','Income Verification','Marriage Certificate'].map(d => (
                <div key={d} className="flex items-center gap-2"><FileText className="w-4 h-4 text-[var(--accent)]" />{d}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search documents..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent" />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent appearance-none bg-white">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-[var(--primary)]" /> Your Documents ({filtered.length})
            </h2>
          </div>
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No documents found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filtered.map(doc => (
                <div key={doc.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[var(--primary)]">{getFileIcon(doc.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span>{doc.category}</span><span>&middot;</span><span>{doc.size}</span><span>&middot;</span><span>{doc.uploadDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(doc.status)}
                    <button className="p-2 text-gray-400 hover:text-[var(--primary)] transition-colors" title="Download"><Download className="w-4 h-4" /></button>
                    <button onClick={() => deleteDocument(doc.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-800">Your Documents Are Secure</h3>
            <p className="text-sm text-green-700 mt-1">All uploaded documents are encrypted using AES-256 and stored on secure servers. Only authorized Veterans Services staff can access your documents.</p>
          </div>
        </div>
      </div>
    </main>
  );
}