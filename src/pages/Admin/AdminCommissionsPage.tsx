import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  FileCheck2,
  FileX2,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ShoppingBag,
  Eye,
  X,
  Download,
} from 'lucide-react';
import type { CommissionRequest } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ResilientImage } from '../../components/common/ResilientImage';

export const AdminCommissionsPage: React.FC = () => {
  const {
    commissions,
    allOrders,
    updateCommissionStatus,
    approveCustomOrderByAdmin,
    createContinuousOrderFromCustomRequest,
  } = useStore();

  const [quoteEdits, setQuoteEdits] = useState<Record<string, string>>({});
  const [noteEdits, setNoteEdits] = useState<Record<string, string>>({});
  const [orderModalComm, setOrderModalComm] = useState<CommissionRequest | null>(null);
  const [shipFullName, setShipFullName] = useState('');
  const [shipEmail, setShipEmail] = useState('');
  const [shipPhone, setShipPhone] = useState('');
  const [shipAddress, setShipAddress] = useState('');
  const [shipCity, setShipCity] = useState('');
  const [shipState, setShipState] = useState('');
  const [shipPostal, setShipPostal] = useState('');
  const [shipCountry, setShipCountry] = useState('India');
  const [shipPayMethod, setShipPayMethod] = useState<'razorpay' | 'stripe'>('razorpay');
  const [shipPayRef, setShipPayRef] = useState('');
  const [shipError, setShipError] = useState('');

  const openPlaceOrderModal = (comm: CommissionRequest) => {
    const prevOrder = allOrders.find(
      (o) =>
        (comm.customerId && o.customerId === comm.customerId) ||
        o.customerEmail?.toLowerCase() === comm.email.toLowerCase()
    );
    setOrderModalComm(comm);
    setShipFullName(prevOrder?.shippingAddress.fullName || comm.customerName);
    setShipEmail(comm.email);
    setShipPhone(prevOrder?.shippingAddress.phone || comm.phone);
    setShipAddress(prevOrder?.shippingAddress.addressLine || '');
    setShipCity(prevOrder?.shippingAddress.city || '');
    setShipState(prevOrder?.shippingAddress.state || '');
    setShipPostal(prevOrder?.shippingAddress.postalCode || '');
    setShipCountry(prevOrder?.shippingAddress.country || 'India');
    setShipPayMethod('razorpay');
    setShipPayRef('');
    setShipError('');
  };

  const handleConfirmPlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderModalComm) return;
    if (
      !shipFullName.trim() ||
      !shipEmail.trim() ||
      !shipPhone.trim() ||
      !shipAddress.trim() ||
      !shipCity.trim() ||
      !shipState.trim() ||
      !shipPostal.trim()
    ) {
      setShipError('All customer delivery & contact fields are required before placing the order.');
      return;
    }
    const created = createContinuousOrderFromCustomRequest(orderModalComm.id, {
      shippingAddress: {
        fullName: shipFullName.trim(),
        phone: shipPhone.trim(),
        addressLine: shipAddress.trim(),
        city: shipCity.trim(),
        state: shipState.trim(),
        postalCode: shipPostal.trim(),
        country: shipCountry.trim() || 'India',
      },
      customerEmail: shipEmail.trim(),
      customerName: shipFullName.trim(),
      paymentMethod: shipPayMethod,
      paymentReference: shipPayRef.trim() || undefined,
    });
    if (created) {
      setOrderModalComm(null);
    }
  };
  const [previewPhoto, setPreviewPhoto] = useState<{
    url: string;
    fileName: string;
    idea: string;
    requestId: string;
  } | null>(null);

  return (
    <AdminLayout title="Custom Orders & Waiting List">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#6D1836]" />
            <span className="text-xs font-medium text-[#7A655C]">
              {commissions.length} custom order requests in studio queue
            </span>
          </div>
          <span className="text-xs text-[#7A655C]">
            Approve requests after verifying uploaded photos to unlock customer confirmation &amp;
            continuous orders.
          </span>
        </div>

        <div className="space-y-4">
          {commissions.map((comm) => {
            const quoteVal =
              quoteEdits[comm.id] ??
              String(comm.quotedPrice ?? comm.predictedPrice ?? 1499);
            const noteVal = noteEdits[comm.id] ?? comm.internalNotes ?? '';

            return (
              <div
                key={comm.id}
                className="bg-white border border-[#E7C7CC] rounded-2xl p-5 shadow-warm/40 space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {comm.referenceImageData ? (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewPhoto({
                            url: comm.referenceImageData!,
                            fileName: comm.referenceImageName || `${comm.id}-photo.jpg`,
                            idea: comm.customIdea || comm.artworkType,
                            requestId: comm.id,
                          })
                        }
                        className="relative group w-20 h-20 rounded-xl overflow-hidden border border-[#C9A66B] shrink-0 bg-[#F8EFEA]"
                        title="Click to open full photo preview"
                      >
                        <ResilientImage
                          src={comm.referenceImageData}
                          alt={comm.referenceImageName || comm.customIdea}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute inset-0 bg-[#3E2F27]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#FFF9F5]">
                          <Eye className="w-5 h-5" />
                        </span>
                      </button>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-[#F8EFEA] border border-[#E7C7CC] flex flex-col items-center justify-center text-[#7A655C] shrink-0 text-[10px] px-1 text-center">
                        {comm.hasUploadedFile ? (
                          <>
                            <FileCheck2 className="w-5 h-5 text-[#C9A66B] mb-0.5" />
                            <span>No Preview</span>
                          </>
                        ) : (
                          <>
                            <FileX2 className="w-5 h-5 opacity-50 mb-0.5" />
                            <span>No Photo</span>
                          </>
                        )}
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-[#6D1836]">
                          {comm.id}
                        </span>
                        <span className="text-xs text-[#7A655C]">·</span>
                        <span className="text-xs font-medium text-[#3E2F27]">
                          {comm.categoryLabel}
                        </span>
                      </div>
                      <h2 className="font-display text-lg font-medium text-[#3E2F27]">
                        {comm.customIdea || comm.artworkType}
                      </h2>
                      <p className="text-xs text-[#7A655C]">
                        {comm.customerName} · {comm.email} · {comm.phone}
                      </p>
                    </div>
                  </div>

                  {/* Tracking Badges + Photo Preview Action */}
                  <div className="flex flex-wrap items-center gap-2">
                    {comm.referenceImageData && (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewPhoto({
                            url: comm.referenceImageData!,
                            fileName: comm.referenceImageName || `${comm.id}-photo.jpg`,
                            idea: comm.customIdea || comm.artworkType,
                            requestId: comm.id,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-[#FFF9F5] border border-[#6D1836]/40 text-[#6D1836] hover:bg-[#6D1836] hover:text-[#FFF9F5] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview Photo</span>
                      </button>
                    )}

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                        comm.hasUploadedFile
                          ? 'bg-[#C9A66B]/15 border-[#C9A66B]/50 text-[#3E2F27]'
                          : 'bg-[#F8EFEA] border-[#E7C7CC] text-[#7A655C]'
                      }`}
                    >
                      {comm.hasUploadedFile ? (
                        <FileCheck2 className="w-3.5 h-3.5 text-[#8C6B3F]" />
                      ) : (
                        <FileX2 className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {comm.hasUploadedFile
                          ? `File Uploaded (${comm.referenceImageName ?? 'photo'})`
                          : 'No File Uploaded'}
                      </span>
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                        comm.adminApproved
                          ? 'bg-[#6D1836] border-[#6D1836] text-[#FFF9F5]'
                          : 'bg-[#F8EFEA] border-[#E7C7CC] text-[#6D1836]'
                      }`}
                    >
                      {comm.adminApproved ? (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      <span>{comm.adminApproved ? 'Admin Approved' : 'Waiting List'}</span>
                    </span>

                    {comm.orderCreated && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#C9A66B]/25 text-[#3E2F27]">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#6D1836]" />
                        <span>Order Created</span>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#3E2F27] bg-[#FFF9F5] border border-[#E7C7CC]/70 rounded-xl p-3">
                  <strong className="text-[#7A655C]">Customer Notes:</strong> {comm.description}{' '}
                  <span className="text-[#7A655C]">
                    ({comm.approximateSize} ·{' '}
                    {comm.isCustomPrice
                      ? `Custom Budget: ${formatINR(comm.predictedPrice ?? 0)}`
                      : comm.budgetRange}
                    )
                  </span>
                </p>

                {/* Admin Quote & Approval Controls */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end pt-1">
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-medium text-[#7A655C] mb-1">
                      Quoted Price (₹)
                    </label>
                    <input
                      type="number"
                      value={quoteVal}
                      onChange={(e) =>
                        setQuoteEdits((prev) => ({ ...prev, [comm.id]: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-xs font-semibold text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-[11px] font-medium text-[#7A655C] mb-1">
                      Studio Notes for Customer
                    </label>
                    <input
                      type="text"
                      value={noteVal}
                      onChange={(e) =>
                        setNoteEdits((prev) => ({ ...prev, [comm.id]: e.target.value }))
                      }
                      placeholder="Timeline, framing notes, photo quality check..."
                      className="w-full px-3 py-2 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-xs text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-medium text-[#7A655C] mb-1">
                      Status
                    </label>
                    <select
                      value={comm.status}
                      onChange={(e) =>
                        updateCommissionStatus(
                          comm.id,
                          e.target.value as CommissionRequest['status'],
                          Number(quoteVal) || undefined,
                          noteVal
                        )
                      }
                      aria-label="Update custom order status"
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-[#E7C7CC] text-xs font-medium text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
                    >
                      <option value="Waiting List">Waiting List</option>
                      <option value="Reviewing">Reviewing</option>
                      <option value="Admin Approved">Admin Approved</option>
                      <option value="Customer Approved">Customer Approved</option>
                      <option value="Order Created">Order Created</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="md:col-span-3 flex flex-wrap gap-2 justify-end">
                    {!comm.adminApproved && (
                      <button
                        type="button"
                        onClick={() =>
                          approveCustomOrderByAdmin(
                            comm.id,
                            Number(quoteVal) || undefined,
                            noteVal
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-xs font-medium transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Request</span>
                      </button>
                    )}

                    {comm.orderCreated ? (
                      <Link
                        to="/admin/orders"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C9A66B]/25 hover:bg-[#C9A66B]/40 text-[#3E2F27] text-xs font-semibold transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#6D1836]" />
                        <span>View Created Order →</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openPlaceOrderModal(comm)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C9A66B] hover:bg-[#b59155] text-[#3E2F27] text-xs font-semibold transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Place Order (Verify Info)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Required Delivery & Payment Collection Modal for Admin Place Order */}
      {orderModalComm && (
        <div
          className="fixed inset-0 z-50 bg-[#3E2F27]/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOrderModalComm(null)}
        >
          <form
            noValidate
            onSubmit={handleConfirmPlaceOrder}
            className="bg-[#FFF9F5] border border-[#E7C7CC] rounded-3xl max-w-xl w-full max-h-[88vh] overflow-y-auto p-6 space-y-4 shadow-warm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#E7C7CC] pb-3">
              <div>
                <p className="text-xs font-mono font-semibold text-[#6D1836]">
                  {orderModalComm.id} · Complete Required Info
                </p>
                <h3 className="font-display text-xl font-medium text-[#3E2F27]">
                  Verify Delivery Address &amp; Payment
                </h3>
                <p className="text-xs text-[#7A655C] mt-0.5">
                  {orderModalComm.customIdea || orderModalComm.artworkType} —{' '}
                  <strong>{formatINR(orderModalComm.quotedPrice ?? orderModalComm.predictedPrice ?? 1499)}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOrderModalComm(null)}
                className="p-2 rounded-full bg-white border border-[#E7C7CC] text-[#3E2F27]"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {shipError && (
              <p className="text-xs font-medium text-[#6D1836] bg-[#6D1836]/10 border border-[#6D1836]/25 rounded-xl px-3.5 py-2.5">
                {shipError}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#7A655C] mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  value={shipFullName}
                  onChange={(e) => setShipFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7C7CC] text-xs text-[#3E2F27]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#7A655C] mb-1">
                  Customer Email *
                </label>
                <input
                  type="email"
                  value={shipEmail}
                  onChange={(e) => setShipEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7C7CC] text-xs text-[#3E2F27]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#7A655C] mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={shipPhone}
                  onChange={(e) => setShipPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7C7CC] text-xs text-[#3E2F27]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#7A655C] mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  value={shipCountry}
                  onChange={(e) => setShipCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7C7CC] text-xs text-[#3E2F27]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#7A655C] mb-1">
                Full Street Address *
              </label>
              <input
                type="text"
                value={shipAddress}
                onChange={(e) => setShipAddress(e.target.value)}
                placeholder="House / Flat No., Street, Landmark..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7C7CC] text-xs text-[#3E2F27]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#7A655C] mb-1">City *</label>
                <input
                  type="text"
                  value={shipCity}
                  onChange={(e) => setShipCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7C7CC] text-xs text-[#3E2F27]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#7A655C] mb-1">State *</label>
                <input
                  type="text"
                  value={shipState}
                  onChange={(e) => setShipState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7C7CC] text-xs text-[#3E2F27]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#7A655C] mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  value={shipPostal}
                  onChange={(e) => setShipPostal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7C7CC] text-xs text-[#3E2F27]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-[#7A655C] mb-1">
                  Payment Method
                </label>
                <select
                  value={shipPayMethod}
                  onChange={(e) => setShipPayMethod(e.target.value as 'razorpay' | 'stripe')}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7C7CC] text-xs text-[#3E2F27]"
                >
                  <option value="razorpay">Razorpay (UPI / Card / NetBanking)</option>
                  <option value="stripe">Stripe (Card / International)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#7A655C] mb-1">
                  Payment Ref / UTR (Optional)
                </label>
                <input
                  type="text"
                  value={shipPayRef}
                  onChange={(e) => setShipPayRef(e.target.value)}
                  placeholder="UTR / Transaction ID"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7C7CC] text-xs text-[#3E2F27]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOrderModalComm(null)}
                className="px-4 py-2 rounded-xl border border-[#E7C7CC] text-xs font-medium text-[#3E2F27]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-xs font-semibold"
              >
                Confirm Details &amp; Create Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customer Reference Photo Preview Lightbox */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-[#3E2F27]/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="bg-[#FFF9F5] border border-[#E7C7CC] rounded-3xl max-w-3xl w-full p-4 sm:p-6 space-y-4 shadow-warm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-mono font-semibold text-[#6D1836]">
                  {previewPhoto.requestId} · Customer Upload Preview
                </p>
                <h3 className="font-display text-xl font-medium text-[#3E2F27] truncate">
                  {previewPhoto.idea}
                </h3>
                <p className="text-xs text-[#7A655C] truncate">{previewPhoto.fileName}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewPhoto.url}
                  download={previewPhoto.fileName}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E7C7CC] hover:border-[#6D1836] text-xs font-medium text-[#3E2F27]"
                >
                  <Download className="w-3.5 h-3.5 text-[#6D1836]" />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(null)}
                  className="p-2 rounded-full bg-white border border-[#E7C7CC] text-[#3E2F27] hover:border-[#6D1836]"
                  aria-label="Close photo preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden bg-white border border-[#E7C7CC] max-h-[72vh] flex items-center justify-center">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.fileName}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
