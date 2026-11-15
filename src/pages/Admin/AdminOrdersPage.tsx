import React, { useState } from 'react';
import {
  ShoppingCart,
  Sparkles,
  Eye,
  X,
  MapPin,
  CreditCard,
  PackageCheck,
  Check,
  Copy,
} from 'lucide-react';
import type { Order, OrderStatus } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatDate, formatINR } from '../../utils/format';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ResilientImage } from '../../components/common/ResilientImage';

const STATUS_OPTIONS: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
  'Refunded',
];

export const AdminOrdersPage: React.FC = () => {
  const { allOrders, commissions, updateOrderStatus, addToast } = useStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingEdit, setTrackingEdit] = useState('');
  const [copiedAddr, setCopiedAddr] = useState(false);

  const filtered = allOrders.filter(
    (o) => filterStatus === 'all' || o.orderStatus === filterStatus
  );

  const openOrderModal = (ord: Order) => {
    setSelectedOrder(ord);
    setTrackingEdit(ord.trackingCode ?? '');
    setCopiedAddr(false);
  };

  const handleSaveTracking = () => {
    if (!selectedOrder) return;
    updateOrderStatus(selectedOrder.id, selectedOrder.orderStatus, trackingEdit.trim());
    setSelectedOrder({ ...selectedOrder, trackingCode: trackingEdit.trim() });
  };

  const handleCopyAddress = (ord: Order) => {
    const a = ord.shippingAddress;
    const text = [
      a.fullName,
      a.addressLine,
      `${a.city}, ${a.state} ${a.postalCode}`,
      a.country,
      `Phone: ${a.phone}`,
      ord.customerEmail ? `Email: ${ord.customerEmail}` : '',
    ]
      .filter(Boolean)
      .join('\n');
    void navigator.clipboard?.writeText(text);
    setCopiedAddr(true);
    addToast('Delivery slip copied', `${a.fullName} — ${a.city}`, 'info');
    window.setTimeout(() => setCopiedAddr(false), 1800);
  };

  const linkedCustomRequest = selectedOrder?.customRequestId
    ? commissions.find((c) => c.id === selectedOrder.customRequestId)
    : undefined;

  return (
    <AdminLayout title="Order Fulfillment Management">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#6D1836]" />
            <span className="text-xs font-medium text-[#7A655C]">
              {allOrders.length} total orders recorded — click any order for full delivery &amp; item details
            </span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            aria-label="Filter orders by status"
            className="px-3.5 py-2.5 rounded-xl bg-white border border-[#E7C7CC] text-sm text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
          >
            <option value="all">All Order Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white border border-[#E7C7CC] rounded-2xl shadow-warm/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E7C7CC]/60 bg-[#F8EFEA]/60 text-xs text-[#7A655C]">
                  <th className="py-3.5 px-4 font-medium">Order #</th>
                  <th className="py-3.5 px-4 font-medium">Ordered Creations</th>
                  <th className="py-3.5 px-4 font-medium">Recipient &amp; Delivery Address</th>
                  <th className="py-3.5 px-4 font-medium">Total &amp; Payment</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-4 font-medium text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7C7CC]/50">
                {filtered.map((ord) => {
                  const addr = ord.shippingAddress;
                  const firstItem = ord.items[0];
                  return (
                    <tr key={ord.id} className="hover:bg-[#FFF9F5] align-top">
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-[#3E2F27]">{ord.orderNumber}</span>
                          <span className="text-[11px] text-[#7A655C]">{ord.date}</span>
                          {ord.isCustomOrder && (
                            <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-md bg-[#E7C7CC]/50 text-[#6D1836] text-[10px] font-semibold">
                              <Sparkles className="w-3 h-3" />
                              <span>Custom</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* What was ordered */}
                      <td className="py-3.5 px-4 max-w-[260px]">
                        {firstItem ? (
                          <div className="flex items-start gap-2.5">
                            <ResilientImage
                              src={firstItem.image}
                              alt={firstItem.name}
                              className="w-11 h-11 rounded-lg object-cover border border-[#E7C7CC] shrink-0"
                            />
                            <div className="min-w-0 space-y-0.5">
                              {ord.items.map((item, idx) => (
                                <p
                                  key={`${item.productId}-${idx}`}
                                  className="text-xs font-medium text-[#3E2F27] leading-snug"
                                >
                                  {item.name}{' '}
                                  <span className="text-[#6D1836] font-semibold">× {item.quantity}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-[#7A655C]">No item details recorded</span>
                        )}
                      </td>

                      {/* Full Delivery Details */}
                      <td className="py-3.5 px-4 max-w-[250px]">
                        <p className="font-medium text-[#3E2F27] text-xs">{addr.fullName}</p>
                        <p className="text-[11px] text-[#6D1836] font-medium">{addr.phone}</p>
                        <p className="text-[11px] text-[#7A655C] leading-snug mt-0.5">
                          {addr.addressLine}, {addr.city}, {addr.state} {addr.postalCode}
                        </p>
                        {ord.customerEmail && (
                          <p className="text-[11px] text-[#7A655C] truncate">{ord.customerEmail}</p>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#3E2F27] tabular-nums">
                          {formatINR(ord.total)}
                        </p>
                        <p className="text-[11px] text-[#8C6B3F] font-medium mt-0.5">
                          {ord.paymentStatus} · {ord.paymentMethod}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => {
                            const nextStatus = e.target.value as OrderStatus;
                            updateOrderStatus(ord.id, nextStatus);
                            if (selectedOrder?.id === ord.id) {
                              setSelectedOrder({ ...selectedOrder, orderStatus: nextStatus });
                            }
                          }}
                          aria-label="Update order fulfillment status"
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#E7C7CC] text-xs font-medium text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
                        >
                          {STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openOrderModal(ord)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF9F5] border border-[#E7C7CC] hover:border-[#6D1836] text-xs font-medium text-[#3E2F27] transition-colors whitespace-nowrap"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#6D1836]" />
                          <span>Full Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Full Order & Delivery Slip Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-[#3E2F27]/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-[#FFF9F5] border border-[#E7C7CC] rounded-3xl max-w-3xl w-full max-h-[88vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-warm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#E7C7CC] pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-[#6D1836]">
                    {selectedOrder.orderNumber}
                  </span>
                  {selectedOrder.isCustomOrder && (
                    <span className="px-2 py-0.5 rounded bg-[#E7C7CC]/60 text-[#6D1836] text-[10px] font-semibold">
                      Custom Order {selectedOrder.customRequestId ? `(${selectedOrder.customRequestId})` : ''}
                    </span>
                  )}
                  <span className="text-xs text-[#7A655C]">
                    · Placed {formatDate(selectedOrder.date)}
                  </span>
                </div>
                <h2 className="font-display text-2xl font-medium text-[#3E2F27] mt-1">
                  Order Items &amp; Delivery Slip
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full bg-white border border-[#E7C7CC] text-[#3E2F27] hover:border-[#6D1836]"
                aria-label="Close order details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ordered Items List */}
            <div className="bg-white border border-[#E7C7CC] rounded-2xl p-5 space-y-4">
              <h3 className="font-display text-base font-medium text-[#3E2F27]">
                Items to Craft &amp; Pack ({selectedOrder.items.length})
              </h3>
              <div className="divide-y divide-[#E7C7CC]/60">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={`${item.productId}-${idx}`}
                    className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <ResilientImage
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover border border-[#E7C7CC] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#3E2F27] truncate">{item.name}</p>
                        <p className="text-xs text-[#7A655C]">
                          Qty: <strong>{item.quantity}</strong> · Unit Price:{' '}
                          <span className="tabular-nums">{formatINR(item.price)}</span>
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-[#3E2F27] tabular-nums shrink-0">
                      {formatINR(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {linkedCustomRequest && (
                <div className="mt-3 pt-3 border-t border-[#E7C7CC]/70 text-xs text-[#7A655C] space-y-1">
                  <p className="font-semibold text-[#6D1836]">
                    Linked Custom Request Specification ({linkedCustomRequest.id}):
                  </p>
                  <p>
                    {linkedCustomRequest.categoryLabel} · {linkedCustomRequest.approximateSize}
                  </p>
                  <p className="text-[#3E2F27]">{linkedCustomRequest.description}</p>
                </div>
              )}

              <div className="border-t border-[#E7C7CC] pt-3 space-y-1 text-xs text-[#7A655C]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatINR(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="tabular-nums">
                    {selectedOrder.shippingFee === 0 ? 'Complimentary' : formatINR(selectedOrder.shippingFee)}
                  </span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-[#8C6B3F]">
                    <span>Discount</span>
                    <span className="tabular-nums">-{formatINR(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold text-[#3E2F27] pt-1">
                  <span>Total</span>
                  <span className="tabular-nums text-[#6D1836]">{formatINR(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address + Payment + Tracking */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white border border-[#E7C7CC] rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3E2F27]">
                    <MapPin className="w-4 h-4 text-[#6D1836]" />
                    <span>Delivery Address</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopyAddress(selectedOrder)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6D1836] hover:underline"
                  >
                    {copiedAddr ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAddr ? 'Copied' : 'Copy Address'}</span>
                  </button>
                </div>

                <div className="text-xs text-[#3E2F27] leading-relaxed space-y-0.5">
                  <p className="font-semibold text-sm">{selectedOrder.shippingAddress.fullName}</p>
                  <p>{selectedOrder.shippingAddress.addressLine}</p>
                  <p>
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                    {selectedOrder.shippingAddress.postalCode}
                  </p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                  <p className="pt-1 text-[#6D1836] font-medium">
                    Phone: {selectedOrder.shippingAddress.phone}
                  </p>
                  {selectedOrder.customerEmail && (
                    <p className="text-[#7A655C]">Email: {selectedOrder.customerEmail}</p>
                  )}
                </div>
              </div>

              <div className="bg-white border border-[#E7C7CC] rounded-2xl p-5 space-y-4">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3E2F27] mb-1.5">
                    <CreditCard className="w-4 h-4 text-[#C9A66B]" />
                    <span>Payment Information</span>
                  </p>
                  <div className="text-xs text-[#7A655C] space-y-0.5">
                    <p>
                      Status: <strong className="text-[#3E2F27]">{selectedOrder.paymentStatus}</strong>
                    </p>
                    <p>
                      Gateway:{' '}
                      <strong className="text-[#3E2F27] uppercase">{selectedOrder.paymentMethod}</strong>
                    </p>
                    {selectedOrder.paymentReference && (
                      <p>
                        Reference: <strong className="text-[#3E2F27]">{selectedOrder.paymentReference}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E7C7CC]/70 space-y-2">
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3E2F27]">
                    <PackageCheck className="w-4 h-4 text-[#6D1836]" />
                    <span>Courier Tracking Code</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={trackingEdit}
                      onChange={(e) => setTrackingEdit(e.target.value)}
                      placeholder="e.g. BD-IN-998120"
                      className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-xs text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
                    />
                    <button
                      type="button"
                      onClick={handleSaveTracking}
                      className="px-3.5 py-2 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-xs font-medium transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
