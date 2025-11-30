export const wrap = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  overflow: "hidden",
  bgcolor: "#1f2024",
};

export const toolbarRow = {
  display: "flex",
  alignItems: "center",
  gap: 0.25,
  px: 0.5,
  py: 0.5,
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

export const iconBtn = {
  width: 32,
  height: 32,
  bgcolor: "transparent",
  "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
};

export const icon = { fontSize: 18, color: "#BEBFC5" };

export const editorArea = {
  color: "#EDEDED",
  px: 1.25,
  py: 1,
  outline: "none",
  "&:focus": { boxShadow: "0 0 0 1px #886FFF inset" },
  "& p": { margin: "0 0 8px 0" },
  "& img": { maxWidth: "100%", borderRadius: 6 },
  "& a": { color: "#8AB4F8", textDecoration: "underline" },
};
