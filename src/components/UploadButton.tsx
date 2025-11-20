'use client';

import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UploadButton() {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const file = e.target.files[0];
    const { error } = await supabase.storage
      .from('excels')
      .upload(`uploads/${Date.now()}_${file.name}`, file);
    setUploading(false);
    if (!error) alert('Uploaded successfully!');
    else alert('Error: ' + error.message);
  };

  return (
    <div className="mt-10">
      <label className="cursor-pointer rounded-lg bg-indigo-600 px-8 py-6 text-2xl font-bold text-white shadow-lg hover:bg-indigo-700 transition">
        {uploading ? 'Uploading...' : 'Upload Excel File'}
        <input type="file" accept=".xlsx,.xls" onChange={handleUpload} className="hidden" />
      </label>
    </div>
  );
}