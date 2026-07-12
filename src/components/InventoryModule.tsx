/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InventoryItem, Employee, Project } from '../types';
import { Box, Check, RefreshCw, AlertCircle, Trash2, Camera, Laptop, Activity } from 'lucide-react';

interface InventoryModuleProps {
  inventory: InventoryItem[];
  employees: Employee[];
  projects: Project[];
  checkoutItem: (itemId: string, employeeId: string, projectId: string) => void;
  checkinItem: (itemId: string) => void;
  updateItemStatus: (itemId: string, status: InventoryItem['status']) => void;
  addItem: (item: Omit<InventoryItem, 'id' | 'status'>) => void;
}

export default function InventoryModule({
  inventory,
  employees,
  projects,
  checkoutItem,
  checkinItem,
  updateItemStatus,
  addItem
}: InventoryModuleProps) {
  // Add item states
  const [showAddForm, setShowAddForm] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<'Camera' | 'Lighting' | 'Audio' | 'Decor' | 'Workstation'>('Camera');
  const [itemSerial, setItemSerial] = useState('');

  // Checkout states
  const [selectedCheckoutItemId, setSelectedCheckoutItemId] = useState<string | null>(null);
  const [checkoutEmployeeId, setCheckoutEmployeeId] = useState(employees[0]?.id || '');
  const [checkoutProjectId, setCheckoutProjectId] = useState(projects[0]?.id || '');

  // Handle Add Item Submit
  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemSerial) return;

    addItem({
      name: itemName,
      category: itemCategory,
      serialNumber: itemSerial
    });

    setItemName('');
    setItemSerial('');
    setShowAddForm(false);
  };

  // Handle Checkout Submit
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCheckoutItemId || !checkoutEmployeeId || !checkoutProjectId) return;

    checkoutItem(selectedCheckoutItemId, checkoutEmployeeId, checkoutProjectId);
    setSelectedCheckoutItemId(null);
  };

  return (
    <div className="space-y-6" id="inventory-module-root">
      {/* Action Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="font-sans font-bold tracking-tight text-gray-900 text-lg">Physical Gear & Assets Inventory</h2>
          <p className="text-xs text-gray-500">Track and dispatch critical production gear (FX3, Aputure kits, workstations, and backdrops).</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gray-950 hover:bg-gray-800 rounded-lg transition-all self-start sm:self-center"
          id="btn-trigger-add-gear"
        >
          <Box className="h-4 w-4" />
          Add Asset Item
        </button>
      </div>

      {/* Add Asset Form drawer */}
      {showAddForm && (
        <form onSubmit={handleAddItemSubmit} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4" id="add-asset-form">
          <div className="sm:col-span-3 text-xs font-mono text-gray-500 border-b border-gray-200 pb-1 uppercase tracking-wider">
            Asset Inventory Entry
          </div>
          <div>
            <label htmlFor="asset-name" className="block text-xs font-medium text-gray-700 mb-1">Asset Model Name</label>
            <input
              id="asset-name"
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Sony FX3 Cinema Camera"
              className="w-full text-xs font-sans px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-950 bg-white"
            />
          </div>
          <div>
            <label htmlFor="asset-cat-select" className="block text-xs font-medium text-gray-700 mb-1">Asset Category</label>
            <select
              id="asset-cat-select"
              value={itemCategory}
              onChange={(e) => setItemCategory(e.target.value as any)}
              className="w-full text-xs font-sans px-3 py-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="Camera">Camera Gear</option>
              <option value="Lighting">Lighting Packages</option>
              <option value="Audio">A/V & Audio Capture</option>
              <option value="Decor">Decor & Backdrops</option>
              <option value="Workstation">Editing Workstations</option>
            </select>
          </div>
          <div>
            <label htmlFor="asset-serial" className="block text-xs font-medium text-gray-700 mb-1">Serial Number / Asset Tag</label>
            <input
              id="asset-serial"
              type="text"
              required
              value={itemSerial}
              onChange={(e) => setItemSerial(e.target.value)}
              placeholder="SN-FX3-9901"
              className="w-full text-xs font-sans px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-950 bg-white"
            />
          </div>
          <div className="sm:col-span-3 flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-950 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-gray-950 hover:bg-gray-800 rounded-lg"
            >
              Register Asset Tag
            </button>
          </div>
        </form>
      )}

      {/* Asset Checkout drawer */}
      {selectedCheckoutItemId && (
        <form onSubmit={handleCheckoutSubmit} className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 grid grid-cols-1 sm:grid-cols-3 gap-4" id="asset-checkout-form">
          <div className="sm:col-span-3 text-xs font-mono text-amber-900 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Activity className="h-4 w-4 animate-pulse" />
            Asset Dispatch Checkout Protocol
          </div>
          <div>
            <label htmlFor="checkout-asset" className="block text-xs font-medium text-gray-700 mb-1">Asset ID Selected</label>
            <input
              id="checkout-asset"
              type="text"
              disabled
              value={inventory.find(i => i.id === selectedCheckoutItemId)?.name || ''}
              className="w-full text-xs font-sans px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500"
            />
          </div>
          <div>
            <label htmlFor="checkout-staff" className="block text-xs font-medium text-gray-700 mb-1 font-sans">Dispatch Member</label>
            <select
              id="checkout-staff"
              value={checkoutEmployeeId}
              onChange={(e) => setCheckoutEmployeeId(e.target.value)}
              className="w-full text-xs font-sans px-3 py-2 border border-gray-200 rounded-lg bg-white"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="checkout-proj" className="block text-xs font-medium text-gray-700 mb-1 font-sans">Project Event Allocation</label>
            <select
              id="checkout-proj"
              value={checkoutProjectId}
              onChange={(e) => setCheckoutProjectId(e.target.value)}
              className="w-full text-xs font-sans px-3 py-2 border border-gray-200 rounded-lg bg-white"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3 flex justify-end gap-2 pt-2 border-t border-amber-200">
            <button
              type="button"
              onClick={() => setSelectedCheckoutItemId(null)}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-950 rounded-lg"
            >
              Cancel Dispatch
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
            >
              Verify & Issue Asset
            </button>
          </div>
        </form>
      )}

      {/* Roster list representation of physical assets */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-sans font-semibold text-gray-950 text-sm">Active Asset Ledger</h3>
          <p className="text-xs text-gray-500">List of physical gear with ongoing dispatch status and tracking.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left" id="assets-roster-table">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Asset Tag & Serial</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Allocation Status</th>
                <th className="py-3 px-4">Dispatched To</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
              {inventory.map((item) => {
                const isAvailable = item.status === 'Available';
                const isCheckedOut = item.status === 'Checked Out';
                const isMaintenance = item.status === 'Maintenance';

                return (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4">
                      <div className="font-sans font-semibold text-gray-900 flex items-center gap-1.5">
                        {item.category === 'Camera' && <Camera className="h-3.5 w-3.5 text-gray-400" />}
                        {item.category === 'Workstation' && <Laptop className="h-3.5 w-3.5 text-gray-400" />}
                        {item.name}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">Asset Ref: {item.serialNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-medium rounded">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase ${
                        isAvailable ? 'text-emerald-600' : isCheckedOut ? 'text-blue-600' : 'text-amber-600'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          isAvailable ? 'bg-emerald-500' : isCheckedOut ? 'bg-blue-500' : 'bg-amber-500'
                        }`} />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {isCheckedOut ? (
                        <div>
                          <div className="font-sans font-semibold text-gray-900">{item.checkedOutName}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[200px]" title={item.projectName}>
                            For: {item.projectName}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 font-sans italic">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      {isAvailable && (
                        <>
                          <button
                            onClick={() => setSelectedCheckoutItemId(item.id)}
                            className="px-2 py-1 bg-gray-950 hover:bg-gray-800 text-[10px] font-semibold text-white rounded-md"
                          >
                            Dispatch (Checkout)
                          </button>
                          <button
                            onClick={() => updateItemStatus(item.id, 'Maintenance')}
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-[10px] font-medium text-gray-700 rounded-md"
                          >
                            Flag Maintenance
                          </button>
                        </>
                      )}
                      {isCheckedOut && (
                        <button
                          onClick={() => checkinItem(item.id)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-[10px] font-semibold text-white rounded-md inline-flex items-center gap-0.5"
                        >
                          <Check className="h-3 w-3" />
                          Check-In (Return)
                        </button>
                      )}
                      {isMaintenance && (
                        <button
                          onClick={() => updateItemStatus(item.id, 'Available')}
                          className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-[10px] font-semibold text-emerald-800 rounded-md"
                        >
                          Restore Online
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
