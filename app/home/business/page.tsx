'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { IBusiness } from '@/interfaces/business.interface';
import { format } from 'date-fns';
import Image from 'next/image';

const initialForm = {
  name: '',
  logo: '',
  address: '',
  email: '',
};

type BusinessFormProps = {
  onSuccess?: () => void;
};

function BusinessForm({ onSuccess }: BusinessFormProps) {
  const [form, setForm] = useState(initialForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadLogo = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    let logoUrl = form.logo;
    if (logoFile) {
      logoUrl = await uploadLogo(logoFile);
    }
    const res = await fetch('/api/business', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, logo: logoUrl }),
    });
    if (res.ok) {
      setForm(initialForm);
      setLogoFile(null);
      setLogoPreview(null);
      onSuccess && onSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-6 bg-white rounded-xl shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Tên doanh nghiệp</label>
          <input
            required
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Tên doanh nghiệp"
            className="input px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Email</label>
          <input
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="Email"
            className="input px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
          />
        </div>
        <div className="flex flex-col md:col-span-2">
          <label className="mb-2 font-medium text-gray-700">Địa chỉ</label>
          <input
            required
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            placeholder="Nhập địa chỉ đầy đủ"
            className="input px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
          />
        </div>
        <div className="flex flex-col md:col-span-2 mt-2">
          <div className="flex flex-col md:flex-row md:items-center md:gap-4">
            <label className="mb-2 md:mb-0 font-medium text-gray-700 md:min-w-[80px]">Logo</label>
            <div className="flex-grow">
              <div className="flex items-center mb-2">
                <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg border border-blue-200 transition-colors shadow-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Chọn logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setLogoFile(e.target.files[0]);
                        setLogoPreview(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                    className="hidden"
                  />
                </label>
                {logoFile && (
                  <span className="ml-3 text-sm text-blue-700 font-medium bg-blue-50 rounded-lg px-3 py-1.5 border border-blue-200 shadow-sm max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                    {logoFile.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {logoPreview && (
            <div className="flex flex-col items-center justify-center mt-4 mb-2">
              <span className="text-xs text-gray-500 mb-2">Xem trước logo</span>
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4 flex items-center justify-center w-36 h-36 mx-auto">
                <img
                  src={logoPreview}
                  alt="Xem trước logo"
                  className="object-contain max-h-32 max-w-full rounded-xl drop-shadow"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <button
        type="submit"
        className="mt-6 w-full py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition duration-200 text-base shadow-md flex items-center justify-center"
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang lưu...
          </>
        ) : 'Thêm doanh nghiệp'}
      </button>
    </form>
  );
}

function BusinessPage() {
  const [businesses, setBusinesses] = useState<IBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Upload state
  const [selectedBusiness, setSelectedBusiness] = useState<IBusiness | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const reload = () => {
    // Gọi lại fetchBusinesses hoặc set flag để reload danh sách
    setIsLoading(true);
    fetch('/api/business')
      .then(res => res.json())
      .then(data => {
        setBusinesses(data);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    reload();
  }, []);

  // Upload logo(s) lên Cloudinary
  const handleUploadLogo = async (e: ChangeEvent<HTMLInputElement>, business: IBusiness) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const files = Array.from(e.target.files);
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      return data.url;
    });
    const urls = (await Promise.all(uploadPromises)).filter(Boolean);
    // Gọi API cập nhật business (giả sử PATCH)
    const updated = await fetch(`/api/business/${business._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logo_links: [...(business.logo_links || []), ...urls] }),
    });
    if (updated.ok) {
      setBusinesses(bs => bs.map(b => b._id === business._id ? { ...b, logo_links: [...(b.logo_links || []), ...urls] } : b));
    }
    setUploading(false);
  };

  // Xóa ảnh Cloudinary
  const handleDeleteLogo = async (business: IBusiness, index: number) => {
    const urlToDelete = business.logo_links?.[index];
    if (!urlToDelete) return;
    await fetch('/api/upload-image', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlToDelete }),
    });
    // Gọi API cập nhật business (giả sử PATCH)
    const newLinks = business.logo_links?.filter((_, i) => i !== index) || [];
    const updated = await fetch(`/api/business/${business._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logo_links: newLinks }),
    });
    if (updated.ok) {
      setBusinesses(bs => bs.map(b => b._id === business._id ? { ...b, logo_links: newLinks } : b));
    }
  };

  // Filter, search, paginate
  const filtered = businesses.filter(b =>
    (!searchTerm || b.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!emailFilter || (b.email && b.email.toLowerCase().includes(emailFilter.toLowerCase())))
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="h-full w-full px-6 py-5 bg-gray-50">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 uppercase tracking-wide text-center">Quản lý doanh nghiệp</h1>
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <button
          className="btn flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg shadow-md transition-all"
          onClick={() => setShowModal(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Thêm nhà cung cấp
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-red-500 font-bold"
              onClick={() => setShowModal(false)}
              aria-label="Đóng"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-center text-blue-600 uppercase tracking-wide">Thêm nhà cung cấp</h2>
            <BusinessForm
              onSuccess={() => {
                setShowModal(false);
                reload();
              }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 items-center mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex-1 min-w-[280px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm tên doanh nghiệp</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Nhập tên doanh nghiệp..."
              className="block w-full pl-10 pr-3 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 min-w-[280px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Lọc theo email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Nhập email..."
              className="block w-full pl-10 pr-3 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
              value={emailFilter}
              onChange={e => setEmailFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setSearchTerm('');
              setEmailFilter('');
              setCurrentPage(1);
            }}
            className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 flex items-center gap-2 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Đặt lại
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl shadow-lg border border-gray-200 bg-white">
        {isLoading ? (
          <div className="text-center py-10 text-lg text-gray-500">Đang tải dữ liệu...</div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-10 text-lg text-gray-500">Không có doanh nghiệp nào phù hợp.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600">
              <tr>
                <th className="px-6 py-3 text-center text-lg font-medium text-white uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-lg font-medium text-white uppercase tracking-wider">Tên doanh nghiệp</th>
                <th className="px-6 py-3 text-center text-lg font-medium text-white uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-center text-lg font-medium text-white uppercase tracking-wider">Địa chỉ</th>
                <th className="px-6 py-3 text-center text-lg font-medium text-white uppercase tracking-wider">Ngày tạo</th>
                <th className="px-6 py-3 text-center text-lg font-medium text-white uppercase tracking-wider">Logo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginated.map((b, idx) => (
                <tr key={b._id} className="hover:bg-blue-50 transition-all duration-200">
                  <td className="px-6 py-4 text-center font-medium text-gray-900 text-lg">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-900">{b.name}</td>
                  <td className="px-6 py-4 text-center text-lg text-gray-700">{b.email}</td>
                  <td className="px-6 py-4 text-center text-lg text-gray-700">
                    {typeof b.address === 'string'
                      ? b.address
                      : b.address
                        ? `${b.address.number || ''} ${b.address.street || ''} ${b.address.ward || ''} ${b.address.district || ''} ${b.address.city || ''} ${b.address.country || ''}`.trim()
                        : ''}
                  </td>
                  <td className="px-6 py-4 text-center text-lg text-gray-700">{format(new Date(b.created_at), 'dd/MM/yyyy')}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-wrap gap-2 justify-center items-center">
                      {Array.isArray(b.logo_links) && b.logo_links.length > 0 ? (
                        b.logo_links.map((img, i) => (
                          <div key={i} className="relative group">
                            <Image
                              src={img}
                              alt="logo"
                              width={56}
                              height={56}
                              className="object-contain rounded border max-h-[56px] max-w-[56px]"
                            />
                            <button
                              onClick={() => handleDeleteLogo(b, i)}
                              className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 text-red-600 shadow hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100"
                              title="Xóa ảnh"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))
                      ) : b.logo ? (
                        <div className="relative group">
                          <Image
                            src={b.logo}
                            alt="logo"
                            width={56}
                            height={56}
                            className="object-contain rounded border max-h-[56px] max-w-[56px]"
                          />
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-lg font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-300"
            >
              Đầu
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (currentPage <= 3 || totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`relative inline-flex items-center px-4 py-2 border text-lg ${currentPage === pageNumber
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 font-medium'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 font-medium'
                    } transition-colors duration-300`}
                >
                  {pageNumber}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-lg font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-300"
            >
              Cuối
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

export default BusinessPage;
