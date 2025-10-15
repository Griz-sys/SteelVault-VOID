'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import useDrawingStore from '../../../../stores/useDrawingStore';
import { useRouter } from 'next/navigation';

const HybridPublishDrawings = () => {
  const { approvedDrawings, projectName, projectNo, setSelectedDrawings, sequenceNo, subItem1, subItem2, setSequenceNo, setSubItem1, setSubItem2 } = useDrawingStore();
  const [mappedDrawings, setMappedDrawings] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [voidedRows, setVoidedRows] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [modalFiles, setModalFiles] = useState([]);
  const [selectedModalFiles, setSelectedModalFiles] = useState(new Set());
  const selectAllRef = useRef(null);

  const router = useRouter();

  const handleNextClick = () => {
  // 🚨 Check if any row is selected
  if (selectedRows.size === 0) {
    alert("Please select at least one drawing before proceeding.");
    return; // ⛔ Stop routing
  }

  // 🚨 Check if selected drawings have missing PDF attachments
  const missingPdf = Array.from(selectedRows)
    .map((idx) => mappedDrawings[idx])
    .filter((row) => !row.attachedPdfs || row.attachedPdfs.length === 0);

  if (missingPdf.length > 0) {
    alert(
      "Please attach PDF file(s) for the following drawing(s):\n\n" +
        missingPdf.map((r) => `- ${r.drawingNo || r.drgNo}`).join("\n")
    );
    return; // ⛔ Stop routing if PDFs missing
  }

  // ✅ Prepare selected drawings
  const selected = Array.from(selectedRows).map((idx) => {
    const row = mappedDrawings[idx];
    return {
      ...row,
      void: voidedRows.has(idx),
    };
  });

  // ✅ Save selected drawings and continue
  setSelectedDrawings(selected);
  router.push(
    "/dashboard/project/project/publish_drawings/hybrid_publish_drawings/transmittal_form"
  );
};

  const toggleRowSelection = useCallback((index) => {
    setSelectedRows((prev) => {
      const updated = new Set(prev);
      if (updated.has(index)) updated.delete(index);
      else updated.add(index);
      return updated;
    });
  }, []);

  const allSelected = mappedDrawings.length > 0 && selectedRows.size === mappedDrawings.length;

  const toggleSelectAll = useCallback(() => {
    setSelectedRows((prev) => {
      const total = mappedDrawings.length;
      if (prev.size === total) {
        return new Set();
      }
      return new Set(Array.from({ length: total }, (_, i) => i));
    });
  }, [mappedDrawings.length]);

  const selectAllRows = useCallback(() => {
    const total = mappedDrawings.length;
    setSelectedRows(new Set(Array.from({ length: total }, (_, i) => i)));
  }, [mappedDrawings.length]);

  const clearSelection = useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  const [formData, setFormData] = useState({
    approvalDate: '',
    bfaDate: '',
    fabDate: '',
    revision: '',
    sheetSize: '',
    sequenceNo: '',
    subItem1: '',
    subItem2: '',
  });

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleFieldUpdate = useCallback((field, value) => {
    setMappedDrawings((prev) =>
      prev.map((row, idx) =>
        selectedRows.has(idx)
          ? { ...row, [field]: value }
          : row
      )
    );
  }, [selectedRows]);

  const openModal = useCallback((row) => {
    if (!row.attachedPdfs || row.attachedPdfs.length === 0) {
      alert(`No PDF attached for drawing ${row.drawingNo || row.drgNo}`);
      return;
    }
    setModalFiles(row.attachedPdfs);
    setSelectedModalFiles(new Set(row.attachedPdfs.map(f => f.name)));
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalFiles([]);
    setSelectedModalFiles(new Set());
  }, []);

  const handleModalCheckboxChange = useCallback((fileName) => {
    setSelectedModalFiles(prev => {
      const updated = new Set(prev);
      if (updated.has(fileName)) updated.delete(fileName);
      else updated.add(fileName);
      return updated;
    });
  }, []);

  const handleSelectAllModal = useCallback((e) => {
    if (e.target.checked) {
      setSelectedModalFiles(new Set(modalFiles.map((f) => f.name)));
    } else {
      setSelectedModalFiles(new Set());
    }
  }, [modalFiles]);

  const handleDownloadSelected = useCallback(() => {
    if (!selectedModalFiles.size) return alert("Please select files to download.");
    modalFiles.forEach((file) => {
      if (selectedModalFiles.has(file.name)) {
        const blobOrFile = file.file || file;
        if (blobOrFile) {
          const url = URL.createObjectURL(blobOrFile);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          console.warn(`File object not found for ${file.name}`);
        }
      }
    });
  }, [modalFiles, selectedModalFiles]);

  const handleRemoveModalFile = useCallback((fileName) => {
    setModalFiles(prev => prev.filter((f) => f.name !== fileName));
    setSelectedModalFiles(prev => {
      const updated = new Set(prev);
      updated.delete(fileName);
      return updated;
    });
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const enrichedDrawings = approvedDrawings.map((d) => {
      const rev = d.rev || '';
      const isNumericRev = /^\d+$/.test(rev);
      const isAlphaRev = /^[a-zA-Z]+$/.test(rev);

      return {

        itemName: d.item || '-',
        drawingNo: d.drgNo || '-',
        dateSentForFab: isNumericRev ? today : (d.fabDate || ''),
        dateSentForApproval: isAlphaRev ? today : (d.approvalDate || ''),
        bfaDate: d.bfaDate || '',
        rev: rev,
        sheetSize: d.sheetSize || '',
        finish: d.finish || '-',
        modBy: d.modBy || d.modeler || '-',
        revRemarks: d.revRemarks || d.status || '-',
        detailer: d.detailer || '-',
        checker: d.checker || '-',
        attachedPdfs: d.attachedPdfs || [],
      };
    });
    console.log("Approved Drawings with sheetSize:", approvedDrawings);
    setMappedDrawings(enrichedDrawings);
  }, [approvedDrawings]);

  useEffect(() => {
    if (!selectAllRef.current) return;
    const total = mappedDrawings.length;
    const count = selectedRows.size;
    selectAllRef.current.indeterminate = count > 0 && count < total;
  }, [mappedDrawings.length, selectedRows]);

  const tableHeaders = useMemo(() => [
    'Select',
    'Item Name',
    'Drawing No',
    'Date Sent for Approval',
    'Date Sent for Fab/Field',
    'BFA Date',
    'Rev.',
    'Sheet Size',
    'Detailer',
    'Checker',
    'Attachment',
  ], []);

  return (
    <div className="p-6 bg-white text-gray-800 max-w-screen-xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-teal-700">
        Hybrid Publish Drawings
      </h2>

      <div className="grid md:grid-cols-2 gap-y-6 mb-8">
        {/* Left Column */}
        <div className="space-y-4 mx-20">
          <div>
            <label className="block font-medium mb-1">Project Name :</label>
            <input type="text" className="input bg-gray-200" value={projectName} readOnly />
          </div>

          <div>
            <label className="block font-medium mb-1">Date Send For Approval :</label>
            <div className="flex gap-2">
              <input
                type="date"
                className="input"
                value={formData.approvalDate}
                onChange={(e) => handleChange('approvalDate', e.target.value)}
              />
              <button className="btn-primary" type="button" onClick={() => handleFieldUpdate('dateSentForApproval', formData.approvalDate)}>Update</button>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">BFA Date:</label>
            <div className="flex gap-2">
              <input
                type="date"
                className="input"
                value={formData.bfaDate}
                onChange={(e) => handleChange('bfaDate', e.target.value)}
              />
              <button className="btn-primary" type="button" onClick={() => handleFieldUpdate('bfaDate', formData.bfaDate)}>Update</button>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Date Send for Fab/Field :</label>
            <div className="flex gap-2">
              <input
                type="date"
                className="input"
                value={formData.fabDate}
                onChange={(e) => handleChange('fabDate', e.target.value)}
              />
              <button className="btn-primary" type="button" onClick={() => handleFieldUpdate('dateSentForFab', formData.fabDate)}>Update</button>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Revision :</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input bg-gray-200 flex-grow"
                value={formData.revision}
                onChange={(e) => handleChange('revision', e.target.value)}
              />
              <button className="bg-teal-800 text-white px-4 py-2 rounded text-sm" type="button" onClick={() => handleFieldUpdate('rev', formData.revision)}>Update</button>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Sheet size :</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input bg-gray-200 flex-grow"
                value={formData.sheetSize}
                onChange={(e) => handleChange('sheetSize', e.target.value)}
              />
              <button className="bg-teal-800 text-white px-4 py-2 rounded text-sm" type="button" onClick={() => handleFieldUpdate('sheetSize', formData.sheetSize)}>Update</button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4 mx-20">
          <div>
            <label className="block font-medium mb-1">Project No. :</label>
            <input type="text" className="input bg-gray-200" value={projectNo} readOnly />
          </div>

          <div>
            <label className="block font-medium mb-1">Client Name. :</label>
            <input type="text" className="input bg-gray-200" value="Clint Darnell" readOnly />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block font-medium mb-1">SEQUENCE NO :</label>
              <input
                type="text"
                className="input bg-gray-200"
                value={sequenceNo}
                onChange={(e) => {
                  setSequenceNo(e.target.value);
                  useDrawingStore.getState().updateZipName();
                }}
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Submittal Send for :</label>
              <textarea
                className="input bg-gray-200 resize-none h-8 w-full"
                rows={1}
                value={subItem1}
                onChange={(e) => {
                  setSubItem1(e.target.value);
                  useDrawingStore.getState().updateZipName();
                }}
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Submittal Item Name :</label>
              <textarea
                className="input bg-gray-200 resize-none h-8 w-full"
                rows={1}
                value={subItem2}
                onChange={(e) => {
                  setSubItem2(e.target.value);
                  useDrawingStore.getState().updateZipName();
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex pt-2 gap-2 mb-4 flex-wrap items-center">
        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm" type="button" onClick={selectAllRows}>Select All</button>
        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm" type="button" onClick={clearSelection}>Clear Selection</button>
        <button className="bg-teal-800 text-white px-4 py-2 rounded text-sm" onClick={() => setVoidedRows(prev => {
          const updated = new Set(prev);
          selectedRows.forEach(idx => updated.add(idx));
          return updated;
        })}>Void Item</button>
        <button className="bg-teal-800 text-white px-4 py-2 rounded text-sm" onClick={() => setVoidedRows(prev => {
          const updated = new Set(prev);
          selectedRows.forEach(idx => updated.delete(idx));
          return updated;
        })}>Unvoid Item</button>
        <span className="ml-auto text-sm text-gray-600">
          Selected: <span className="font-semibold text-gray-800">{selectedRows.size}</span> / {mappedDrawings.length}
        </span>
      </div>

      {/* Drawing Table */}
      <div className="overflow-x-auto border rounded mb-6">
        {/* Scrollable container for vertical scroll */}
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-cyan-800 text-white text-left">
              <tr>
                {tableHeaders.map((heading, i) => (
                  <th key={i} className="p-2 sticky top-0 z-10 bg-cyan-800">
                    {i === 0 ? (
                      <div className="flex items-center justify-center">
                        <input
                          ref={selectAllRef}
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleSelectAll}
                          title="Select/Deselect all"
                          className="h-4 w-4 cursor-pointer accent-teal-700"
                        />
                      </div>
                    ) : (
                      heading
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mappedDrawings.map((drawing, index) => (
                <tr key={index} className={`${voidedRows.has(index) ? 'bg-red-50' : ''} even:bg-gray-50`}>
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(index)}
                      onChange={() => toggleRowSelection(index)}
                      className="h-4 w-4 accent-teal-700"
                    />
                  </td>
                  <td className="p-2">
                    {drawing.itemName}
                    {voidedRows.has(index) && (
                      <span className="px-2 py-0.5 rounded bg-red-400 text-white text-xs font-bold">
                        [VOID]
                      </span>
                    )}
                  </td>
                  <td className="p-2">{drawing.drawingNo}</td>
                  <td className="p-1">
                    <input
                      value={drawing.dateSentForApproval ? new Date(drawing.dateSentForApproval).toISOString().slice(0, 10) : ''}
                      readOnly
                    />
                  </td>
                  <td className="p-2">
                    <input
                      value={drawing.dateSentForFab ? new Date(drawing.dateSentForFab).toISOString().slice(0, 10) : ''}
                      readOnly
                    />
                  </td>
                  <td className="p-1">
                    <input type="date" className="input" />
                  </td>
                  <td className="p-2 text-center">{drawing.rev}</td>
                  <td className="p-2">{drawing.sheetSize}</td>
                  <td className="p-2">{drawing.detailer}</td>
                  <td className="p-2">{drawing.checker}</td>
                  <td className="p-2 text-blue-600 text-center underline cursor-pointer" onClick={() => openModal(drawing)}>View</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* Footer Buttons */}
      <div className="flex justify-between mt-6">
        <button className="btn-primary" onClick={handleNextClick}>Next</button>
        <button className="btn-secondary" onClick={() => router.push("/dashboard/project/project/publish_drawings")}>Back To TL</button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white border rounded-md w-[600px] p-4 shadow-lg relative">
            <button onClick={closeModal} className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 text-xs rounded-bl-md">✕</button>
            <table className="w-full border">
              <thead>
                <tr className="bg-cyan-800 text-white text-sm">
                  <th className="p-2 text-left">
                    <input
                      type="checkbox"
                      checked={selectedModalFiles.size === modalFiles.length && modalFiles.length > 0}
                      onChange={handleSelectAllModal}
                    />
                    <span className="ml-2 font-semibold">Select All</span>
                  </th>
                  <th className="p-2 text-left font-semibold">Name</th>
                  <th className="p-2 text-left font-semibold">Description</th>
                  <th className="p-2 text-left font-semibold">Remove</th>
                </tr>
              </thead>
              <tbody>
                {modalFiles.map((file, idx) => (
                  <tr key={file.name || idx} className="border-t text-sm">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedModalFiles.has(file.name)}
                        onChange={() => handleModalCheckboxChange(file.name)}
                      />
                    </td>
                    <td className="p-2">{file.name}</td>
                    <td className="p-2">
                      <textarea className="border w-full px-1 py-1 text-xs" value={file.name} readOnly />
                    </td>
                    <td className="p-2 text-blue-600 cursor-pointer" onClick={() => handleRemoveModalFile(file.name)}>Remove</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4 gap-2">
              <button onClick={handleDownloadSelected} className="bg-blue-700 text-white px-4 py-1 text-sm rounded">Download</button>
              <button onClick={closeModal} className="bg-gray-400 text-white px-4 py-1 text-sm rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HybridPublishDrawings;
