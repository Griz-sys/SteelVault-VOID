import { create } from 'zustand';

const useDrawingStore = create((set, get) => ({
  // ===== Existing Fields =====
  projectName: '',
  projectNo: '',
  selectedClientId: null,
  approvedDrawings: [],
  approvedExtras: [],
  approvedModels: [],
  drawings: [],
  extras: [],
  models: [],
  selectedDrawings: [],

  // ===== Zip Name Fields =====
  sequenceNo: '',
  subItem1: '',
  subItem2: '',
  zipName: '',

  // ===== Log Name Fields =====
  transmittalName: '',
  submittalName: '',

  // ===== Setters =====
  setProjectDetails: (name, no) => set({ projectName: name, projectNo: no }),
  setSelectedClientId: (clientId) => set({ selectedClientId: clientId }),
  setApprovedDrawings: (drawings) => set({ approvedDrawings: drawings }),
  setApprovedExtras: (extras) => set({ approvedExtras: extras }),
  setApprovedModels: (models) => set({ approvedModels: models }),
  setDrawings: (drawings) => set({ drawings }),
  setExtras: (extras) => set({ extras }),
  setModels: (models) => set({ models }),
  setSelectedDrawings: (drawings) => set({ selectedDrawings: drawings }),

  // ===== Zip Name Logic =====
  setSequenceNo: (val) => {
    set({ sequenceNo: val });
    get().updateZipName();
  },
  setSubItem1: (val) => {
    set({ subItem1: val });
    get().updateZipName();
  },
  setSubItem2: (val) => {
    set({ subItem2: val });
    get().updateZipName();
  },

  setZipName: (zip) => set({ zipName: zip }),

  updateZipName: () => {
    const { projectName, sequenceNo, subItem1, subItem2 } = get();
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yy = String(today.getFullYear()).slice(-2);
    const dateStr = `${dd}${mm}${yy}`;

    const zip = `${dateStr}_${projectName}_${sequenceNo || ''}_${subItem1 || ''}_${subItem2 || ''}`;
    set({ zipName: zip });
  },

  // ===== Log Name Logic =====
  setTransmittalName: (name) => set({ transmittalName: name }),
  setSubmittalName: (name) => set({ submittalName: name }),

  generateLogName: (type) => {
    const { projectName } = get();
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yy = String(today.getFullYear()).slice(-2);
    const dateStr = `${dd}${mm}${yy}`;

    if (type === 'transmittal') {
      set({ transmittalName: `${dateStr}_${projectName}_DrawingTransmittalLog` });
    } else if (type === 'submittal') {
      set({ submittalName: `${dateStr}_${projectName}_DrawingSubmittalLog` });
    }
  },

  clearLogName: (type) => {
    if (type === 'transmittal') {
      set({ transmittalName: '' });
    } else if (type === 'submittal') {
      set({ submittalName: '' });
    }
  },

  // ===== Drawing Void Logic =====
  voidItems: (drgNos) =>
    set((state) => ({
      drawings: (state.drawings || []).map((d) =>
        drgNos.includes(d.drgNo) ? { ...d, void: true } : d
      ),
    })),

  unvoidItems: (drgNos) =>
    set((state) => ({
      drawings: (state.drawings || []).map((d) =>
        drgNos.includes(d.drgNo) ? { ...d, void: false } : d
      ),
    })),

  updateFromExcel: (excelData) => {
    set((state) => {
      const updatedDrawings = state.drawings.map((d) => {
        // Try to match drawing number using multiple field names
        const excelRow = excelData.find((row) => {
          const drgNo = (d.drgNo || "").toString().trim().toLowerCase();
          return (
            (row["drg no"] && row["drg no"].toString().trim().toLowerCase() === drgNo) ||
            (row["drawing no"] && row["drawing no"].toString().trim().toLowerCase() === drgNo) ||
            (row["drgname"] && row["drgname"].toString().trim().toLowerCase() === drgNo)
          );
        });

        if (!excelRow) return d;

        // Normalize all keys (trim, lowercase)
        const normalizedRow = Object.keys(excelRow).reduce((acc, key) => {
          acc[key.toLowerCase().trim()] = excelRow[key];
          return acc;
        }, {});

        // Handle both straight and curly apostrophes
        const sheetSize =
          normalizedRow["drg'size"] ||
          normalizedRow["drg’size"] || // ← curly apostrophe
          normalizedRow["drg size"] ||
          normalizedRow["sheet size"] ||
          normalizedRow["sheetsize"] ||
          normalizedRow["size"] ||
          d.sheetSize ||
          "";

        return {
          ...d,
          finish: normalizedRow["finish"] || d.finish || "",
          modBy: normalizedRow["mod by"] || normalizedRow["modeler"] || d.modBy || "",
          revRemarks: normalizedRow["rev remarks"] || normalizedRow["remarks"] || d.revRemarks || "",
          sheetSize,
        };
      });

      return {
        drawings: updatedDrawings,
        approvedDrawings: updatedDrawings,
      };
    });
  },
}));

export default useDrawingStore;
