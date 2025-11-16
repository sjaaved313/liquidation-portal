// src/app/admin/page.tsx
'use client';

import { useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase.client';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [propEmail, setPropEmail] = useState('');
  const [propName, setPropName] = useState('');
  const [addingProp, setAddingProp] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualNif, setManualNif] = useState('');
  const [manualPass, setManualPass] = useState('');
  const [addingManual, setAddingManual] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createSupabaseClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const handleInvite = async () => {
    if (!email) return;
    setInviting(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/owner/dashboard` },
    });
    setMessage(error ? 'Error: ' + error.message : `Invitation sent to ${email}!`);
    setInviting(false);
  };

  const addProperty = async () => {
    if (!propEmail || !propName) return;
    setAddingProp(true);
    setMessage('');
    const res = await fetch('/api/add-property', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner_email: propEmail, property_name: propName }),
    });
    const result = await res.json();
    setMessage(result.error || `Property added: ${propName}`);
    setAddingProp(false);
  };

  const addOwnerManually = async () => {
    if (!manualEmail || !manualName || !manualNif || !manualPass) return;
    setAddingManual(true);
    setMessage('');
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: manualEmail, name: manualName, nif_id: manualNif, password: manualPass, role: 'owner' }),
    });
    const result = await res.json();
    setMessage(result.error || result.message || 'Unknown error');
    setAddingManual(false);
  };

  const addAdmin = async () => {
    if (!adminEmail || !adminName || !adminPass) return;
    setAddingAdmin(true);
    setMessage('');
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, name: adminName, password: adminPass, role: 'admin' }),
    });
    const result = await res.json();
    setMessage(result.error || result.message || 'Unknown error');
    setAddingAdmin(false);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setMessage('Uploading...');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload-csv', {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();
    setMessage(result.message || result.error || 'Done!');
    setUploading(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Logout
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Invite Owner</h2>
        <input placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} className="block w-full p-3 border rounded-lg mb-4" />
        <button onClick={handleInvite} disabled={!email || inviting} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {inviting ? 'Sending...' : 'Send Invitation'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Add Owner Manually</h2>
        <input placeholder="Email *" value={manualEmail} onChange={e => setManualEmail(e.target.value)} className="block w-full p-3 border rounded-lg mb-2" />
        <input placeholder="Name *" value={manualName} onChange={e => setManualName(e.target.value)} className="block w-full p-3 border rounded-lg mb-2" />
        <input placeholder="NIF ID *" value={manualNif} onChange={e => setManualNif(e.target.value)} className="block w-full p-3 border rounded-lg mb-2" />
        <input placeholder="Password *" type="password" value={manualPass} onChange={e => setManualPass(e.target.value)} className="block w-full p-3 border rounded-lg mb-2" />
        <button onClick={addOwnerManually} disabled={!manualEmail || !manualName || !manualNif || !manualPass || addingManual} className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 disabled:opacity-50">
          {addingManual ? 'Creating...' : 'Create Owner'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Add Admin</h2>
        <input placeholder="Email *" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="block w-full p-3 border rounded-lg mb-2" />
        <input placeholder="Name *" value={adminName} onChange={e => setAdminName(e.target.value)} className="block w-full p-3 border rounded-lg mb-2" />
        <input placeholder="Password *" type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} className="block w-full p-3 border rounded-lg mb-2" />
        <button onClick={addAdmin} disabled={!adminEmail || !adminName || !adminPass || addingAdmin} className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50">
          {addingAdmin ? 'Adding...' : 'Add Admin'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Add Property</h2>
        <input placeholder="Owner Email *" value={propEmail} onChange={e => setPropEmail(e.target.value)} className="block w-full p-3 border rounded-lg mb-2" />
        <input placeholder="Property Name *" value={propName} onChange={e => setPropName(e.target.value)} className="block w-full p-3 border rounded-lg mb-2" />
        <button onClick={addProperty} disabled={!propEmail || !propName || addingProp} className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50">
          {addingProp ? 'Adding...' : 'Add Property'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Upload Detail Sales CSV</h2>
        <input type="file" accept=".csv" onChange={e => setFile(e.target.files?.[0] || null)} className="block w-full p-3 border rounded-lg mb-4" />
        <button onClick={handleUpload} disabled={!file || uploading} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50">
          {uploading ? 'Processing...' : 'Upload & Insert'}
        </button>
      </div>

      {message && <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">{message}</div>}
    </div>
  );
}