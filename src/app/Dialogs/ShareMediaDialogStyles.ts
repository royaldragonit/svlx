// ShareMediaDialogStyles.ts

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

export const dropZone = {
  position: "relative" as const,
  borderRadius: "12px",
  bgcolor: "#1f2024",
  border: "1px solid rgba(255,255,255,0.08)",
  height: 260,
  cursor: "pointer",
  overflow: "hidden",
};

export const dropInner = {
  position: "absolute" as const,
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const inputBase = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#1f2024",
    color: "#EDEDED",
    borderRadius: "10px",
    "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.16)" },
    "&.Mui-focused fieldset": { borderColor: "#886FFF" },
  },
};

export const captionInput = { ...inputBase };

export const tagsInput = {
  ...inputBase,
  "& .MuiInputBase-input::placeholder": { color: "#fff", opacity: 1 },
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

const deepInput = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#26272b",
    color: "#EDEDED",
    borderRadius: "10px",
    "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.16)" },
    "&.Mui-focused fieldset": { borderColor: "#886FFF" },
  },
};

export const dateInput = { ...deepInput };
export const timeInput = { ...deepInput };
export const ampmSelect = { minWidth: 112, ...deepInput };

export const actionsBox = {
  px: 2,
  py: 1.25,
  display: "flex",
  justifyContent: "flex-end",
  gap: 1,
};

export const schedulePill = {
  height: 40,
  display: "flex",
  alignItems: "center",
  gap: 1,
  px: 1,
  borderRadius: "12px",
  bgcolor: "#1f2024",
  border: "1px solid rgba(255,255,255,0.08)",
  mr: "auto",
};

export const scheduleSwitch = {
  transform: "scale(1.05)",
  mr: 0.5,
};

export const previewBtn = {
  textTransform: "none",
  borderColor: "rgba(136,111,255,0.4)",
  color: "#9A86FF",
  minHeight: 40,
  "&:hover": {
    borderColor: "rgba(136,111,255,0.7)",
    background: "rgba(136,111,255,0.08)",
  },
};

export const publishBtn = {
  textTransform: "none",
  bgcolor: "#886FFF",
  color: "#fff",
  minHeight: 40,
  "&:hover": { bgcolor: "#775BFF" },
};
