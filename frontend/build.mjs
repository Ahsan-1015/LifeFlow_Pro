import { build } from "vite";
import react from "@vitejs/plugin-react";

await build({
  configFile: false,
  cacheDir: ".vite-taskflow",
  plugins: [react()],
  optimizeDeps: {
    include: ["firebase/app", "firebase/auth"],
  },
});
