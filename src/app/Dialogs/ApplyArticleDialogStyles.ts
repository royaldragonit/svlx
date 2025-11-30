
export const paper = {
  bgcolor: "#252527",
  color: "#EDEDED",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.08)",
  width: "min(720px, 92vw)",
};

export const titleBar = {
  px: 2,
  py: 1.25,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "none",
};

export const contentBox = {
  px: 2,
  pt: 1,
  pb: 0,
  display: "grid",
  gap: 1.25,
};

export const titleInput = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#1f2024",
    color: "#EDEDED",
    borderRadius: "10px",
    "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.16)" },
    "&.Mui-focused fieldset": { borderColor: "#886FFF" },
  },
};

export const editorGroup = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  overflow: "hidden",
  bgcolor: "#1f2024",
};
export const rteReset = {
  "& > *": {
    border: "none !important",
    borderRadius: 0,
    bgcolor: "transparent",
  },
};
export const attachInRich = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  px: 1,
  py: 0.75,
  bgcolor: "#2f2c3c",
};

export const tagsInput = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#1f2024",
    color: "#EDEDED",
    borderRadius: "10px",
    "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.16)" },
    "&.Mui-focused fieldset": { borderColor: "#886FFF" },
  },
};

export const publishBlock = {
  p: 1,
  borderRadius: "10px",
  bgcolor: "#1f2024",
  border: "1px solid rgba(255,255,255,0.08)",
};
export const publishRow = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 112px",
  gap: 1,
  alignItems: "center",
};

export const commonInput = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#26272b",
    color: "#EDEDED",
    borderRadius: "10px",
    "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.16)" },
    "&.Mui-focused fieldset": { borderColor: "#886FFF" },
  },
};

export const dateInput = { ...commonInput };
export const timeInput = { ...commonInput };
export const ampmSelect = { minWidth: 112, ...commonInput };

export const scheduleRow = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  mt: 0.5,
};

export const actionsBox = {
  px: 2,
  py: 1.25,
  display: "flex",
  justifyContent: "flex-end",
  gap: 1,
};

export const previewBtn = {
  textTransform: "none",
  borderColor: "rgba(136,111,255,0.4)",
  color: "#9A86FF",
  "&:hover": {
    borderColor: "rgba(136,111,255,0.7)",
    background: "rgba(136,111,255,0.08)",
  },
};

export const publishBtn = {
  textTransform: "none",
  bgcolor: "#886FFF",
  color: "#fff",
  "&:hover": { bgcolor: "#775BFF" },
};
