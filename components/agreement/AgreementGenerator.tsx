'use client';

import React, { useState } from 'react';
import { Property, RentAgreement } from '../../lib/types';
import { t } from '../../lib/i18n';
import { generateId } from '../../lib/utils';

interface AgreementGeneratorProps {
  property: Property;
  onBack: () => void;
}

export default function AgreementGenerator({ property, onBack }: AgreementGeneratorProps) {
  const [formData, setFormData] = useState({
    tenantName: '',
    tenantPhone: '',
    ownerName: property.ownerName,
    ownerPhone: property.ownerPhone,
    monthlyRent: property.price.toString(),
    securityDeposit: '',
    duration: '11',
    startDate: '',
    terms: [
      'Rent to be paid by 5th of every month',
      'Security deposit to be refunded within 30 days of vacating',
      'Tenant shall not sublet the premises without written consent',
      'Electricity and water bills to be paid by the tenant',
      'Notice period of 2 months required for termination',
    ],
  });

  const [agreement, setAgreement] = useState<RentAgreement | null>(null);
  const [generated, setGenerated] = useState(false);

  const updateForm = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = () => {
    const newAgreement: RentAgreement = {
      id: generateId(),
      propertyId: property.id,
      propertyAddress: `${property.address}, ${property.locality}, ${property.city} - ${property.pincode}`,
      tenantName: formData.tenantName,
      tenantPhone: formData.tenantPhone,
      ownerName: formData.ownerName,
      ownerPhone: formData.ownerPhone,
      monthlyRent: Number(formData.monthlyRent),
      securityDeposit: Number(formData.securityDeposit),
      startDate: formData.startDate,
      endDate: new Date(
        new Date(formData.startDate).getTime() + Number(formData.duration) * 30 * 24 * 60 * 60 * 1000
      ).toISOString().split('T')[0],
      terms: formData.terms,
      createdAt: new Date().toISOString(),
    };
    setAgreement(newAgreement);
    setGenerated(true);
  };

  if (generated && agreement) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
        <div className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">←</button>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t('agreement.title')}</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-6 space-y-5 shadow-sm">
            <div className="text-center border-b border-zinc-200 dark:border-zinc-700 pb-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">RENT AGREEMENT</h2>
              <p className="text-xs text-zinc-500 mt-1">This agreement is entered into on {new Date().toLocaleDateString('en-IN')}</p>
            </div>

            <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
              <p><strong>PARTIES:</strong></p>
              <p><strong>Owner:</strong> {agreement.ownerName} (Ph: {agreement.ownerPhone})</p>
              <p><strong>Tenant:</strong> {agreement.tenantName} (Ph: {agreement.tenantPhone})</p>

              <p><strong>PROPERTY:</strong></p>
              <p>{agreement.propertyAddress}</p>

              <p><strong>TERMS:</strong></p>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                  <p className="text-xs text-zinc-500">Monthly Rent</p>
                  <p className="text-lg font-bold text-blue-600">₹{agreement.monthlyRent.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                  <p className="text-xs text-zinc-500">Security Deposit</p>
                  <p className="text-lg font-bold text-emerald-600">₹{agreement.securityDeposit.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <p><strong>Duration:</strong> {new Date(agreement.startDate).toLocaleDateString('en-IN')} to {new Date(agreement.endDate).toLocaleDateString('en-IN')}</p>

              <p className="mt-3"><strong>CONDITIONS:</strong></p>
              <ol className="list-decimal list-inside space-y-1.5">
                {agreement.terms.map((term, i) => (
                  <li key={i} className="text-xs leading-relaxed">{term}</li>
                ))}
              </ol>

              <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-between">
                <div className="text-center">
                  <div className="border-t border-zinc-400 w-32 mt-8 pt-1 text-xs">Owner Signature</div>
                </div>
                <div className="text-center">
                  <div className="border-t border-zinc-400 w-32 mt-8 pt-1 text-xs">Tenant Signature</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              This is a draft agreement generated for reference purposes. For legal validity, please print on stamp paper and get it registered at the nearest sub-registrar office.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex gap-3">
          <button
            onClick={() => setGenerated(false)}
            className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold rounded-xl"
          >
            Edit
          </button>
          <button
            onClick={() => {
              const content = document.querySelector('.bg-white.border')?.textContent || '';
              const blob = new Blob([content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Rent-Agreement-${agreement.tenantName || 'Draft'}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/25"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1 -mt-0.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> {t('agreement.download')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
      <div className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">←</button>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t('agreement.title')}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Property Info */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
          <p className="text-xs text-zinc-500">Property</p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{property.title}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{property.address}, {property.locality}</p>
        </div>

        {/* Form */}
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">{t('agreement.tenant')}</label>
          <input
            type="text"
            value={formData.tenantName}
            onChange={(e) => updateForm('tenantName', e.target.value)}
            placeholder="Tenant's full name"
            className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 outline-none border border-zinc-200 dark:border-zinc-700 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">Tenant Phone</label>
          <input
            type="tel"
            value={formData.tenantPhone}
            onChange={(e) => updateForm('tenantPhone', e.target.value)}
            placeholder="+91 XXXXX XXXXX"
            className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 outline-none border border-zinc-200 dark:border-zinc-700 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">{t('agreement.rent')} (₹)</label>
            <input
              type="number"
              value={formData.monthlyRent}
              onChange={(e) => updateForm('monthlyRent', e.target.value)}
              className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 outline-none border border-zinc-200 dark:border-zinc-700 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">{t('agreement.deposit')} (₹)</label>
            <input
              type="number"
              value={formData.securityDeposit}
              onChange={(e) => updateForm('securityDeposit', e.target.value)}
              placeholder="e.g. 50000"
              className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 outline-none border border-zinc-200 dark:border-zinc-700 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">{t('agreement.startDate')}</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => updateForm('startDate', e.target.value)}
              className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 outline-none border border-zinc-200 dark:border-zinc-700 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">{t('agreement.duration')}</label>
            <select
              value={formData.duration}
              onChange={(e) => updateForm('duration', e.target.value)}
              className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 outline-none border border-zinc-200 dark:border-zinc-700"
            >
              {[11, 12, 24, 36, 60].map((m) => (
                <option key={m} value={m}>{m} months ({(m / 12).toFixed(1)} years)</option>
              ))}
            </select>
          </div>
        </div>

        {/* Terms */}
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">Terms & Conditions</label>
          <div className="space-y-2">
            {formData.terms.map((term, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs text-zinc-400 mt-1">{i + 1}.</span>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => {
                    const newTerms = [...formData.terms];
                    newTerms[i] = e.target.value;
                    setFormData((prev) => ({ ...prev, terms: newTerms }));
                  }}
                  className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 outline-none border border-zinc-200 dark:border-zinc-700 focus:border-blue-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
        <button
          onClick={handleGenerate}
          disabled={!formData.tenantName || !formData.startDate || !formData.securityDeposit}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/25"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1 -mt-0.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> {t('agreement.generate')}
        </button>
      </div>
    </div>
  );
}
